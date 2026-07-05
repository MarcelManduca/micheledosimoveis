
CREATE TABLE IF NOT EXISTS public.condo_import_staging (
  ns text PRIMARY KEY,
  sr text NOT NULL,
  n  text NOT NULL,
  er boolean NOT NULL DEFAULT false,
  pc text,
  cf numeric,
  ip numeric,
  a1 numeric,
  a2 numeric,
  b1 integer,
  b2 integer,
  h1 integer,
  h2 integer,
  p1 integer,
  p2 integer,
  y  integer,
  loaded_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.condo_import_staging TO service_role;
ALTER TABLE public.condo_import_staging ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.strip_accents_pt(s text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT translate(
    coalesce(s,''),
    'áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇñÑ',
    'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUCnN'
  )
$$;

CREATE OR REPLACE FUNCTION public.normalize_condo_slug(s text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT regexp_replace(
    regexp_replace(
      regexp_replace(
        lower(public.strip_accents_pt(coalesce(s,''))),
        '^condominio-', ''
      ),
      '[^a-z0-9-]+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
$$;

CREATE OR REPLACE FUNCTION public.merge_condos_from_staging()
RETURNS TABLE(
  total_staged bigint,
  updated_count bigint,
  inserted_count bigint,
  skipped_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_upd bigint := 0;
  v_ins bigint := 0;
  v_skip bigint := 0;
  v_total bigint;
BEGIN
  SELECT count(*) INTO v_total FROM public.condo_import_staging;

  WITH matched AS (
    SELECT s.*, c.id AS existing_id
    FROM public.condo_import_staging s
    JOIN public.condominiums c
      ON public.normalize_condo_slug(c.slug) = s.ns
  ),
  upd AS (
    UPDATE public.condominiums c SET
      postal_code       = COALESCE(c.postal_code,       m.pc),
      condo_fee_min_brl = COALESCE(c.condo_fee_min_brl, m.cf),
      iptu_min_brl      = COALESCE(c.iptu_min_brl,      m.ip),
      area_min_m2       = COALESCE(c.area_min_m2,       m.a1),
      area_max_m2       = COALESCE(c.area_max_m2,       m.a2),
      bedrooms_min      = COALESCE(c.bedrooms_min,      m.b1),
      bedrooms_max      = COALESCE(c.bedrooms_max,      m.b2),
      bathrooms_min     = COALESCE(c.bathrooms_min,     m.h1),
      bathrooms_max     = COALESCE(c.bathrooms_max,     m.h2),
      parking_spots_min = COALESCE(c.parking_spots_min, m.p1),
      parking_spots_max = COALESCE(c.parking_spots_max, m.p2),
      construction_year = COALESCE(c.construction_year, m.y),
      reference_updated_at = now(),
      updated_at = now()
    FROM matched m
    WHERE c.id = m.existing_id
    RETURNING c.id
  )
  SELECT count(*) INTO v_upd FROM upd;

  WITH unmatched AS (
    SELECT s.*
    FROM public.condo_import_staging s
    WHERE NOT EXISTS (
      SELECT 1 FROM public.condominiums c
      WHERE public.normalize_condo_slug(c.slug) = s.ns
    )
  ),
  ins AS (
    INSERT INTO public.condominiums (
      slug, name, normalized_name, city, state,
      postal_code, condo_fee_min_brl, iptu_min_brl,
      area_min_m2, area_max_m2,
      bedrooms_min, bedrooms_max, bathrooms_min, bathrooms_max,
      parking_spots_min, parking_spots_max, construction_year,
      is_active, publication_status, data_quality_status,
      reference_updated_at
    )
    SELECT
      u.ns,
      u.n,
      lower(public.strip_accents_pt(u.n)),
      'Florianópolis', 'SC',
      u.pc, u.cf, u.ip, u.a1, u.a2,
      u.b1, u.b2, u.h1, u.h2, u.p1, u.p2, u.y,
      false, 'draft',
      CASE WHEN u.er THEN 'needs_review' ELSE NULL END,
      now()
    FROM unmatched u
    ON CONFLICT (slug) DO NOTHING
    RETURNING id
  )
  SELECT count(*) INTO v_ins FROM ins;

  v_skip := GREATEST(v_total - v_upd - v_ins, 0);
  RETURN QUERY SELECT v_total, v_upd, v_ins, v_skip;
END;
$$;

GRANT EXECUTE ON FUNCTION public.merge_condos_from_staging() TO service_role;
GRANT EXECUTE ON FUNCTION public.normalize_condo_slug(text) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.strip_accents_pt(text) TO authenticated, anon, service_role;
