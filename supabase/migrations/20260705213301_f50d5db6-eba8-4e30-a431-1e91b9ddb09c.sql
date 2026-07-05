-- Helper: expressão de bairro genérico
-- (inline nas funções abaixo)

-- ---------------------------------------------------------------------------
-- 1) Preview de candidatos à publicação (não altera dados)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.preview_condo_publication_candidates(
  limit_count integer DEFAULT 200
)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  address text,
  neighborhood text,
  postal_code text,
  latitude double precision,
  longitude double precision,
  quantitative_fields_count integer,
  data_quality_status text,
  quality_score integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.slug,
    c.name,
    c.address,
    c.neighborhood,
    c.postal_code,
    c.latitude::double precision,
    c.longitude::double precision,
    (
      (CASE WHEN c.postal_code IS NOT NULL THEN 1 ELSE 0 END)
      + (CASE WHEN c.condo_fee_min_brl IS NOT NULL THEN 1 ELSE 0 END)
      + (CASE WHEN c.iptu_min_brl IS NOT NULL THEN 1 ELSE 0 END)
      + (CASE WHEN c.area_min_m2 IS NOT NULL OR c.area_max_m2 IS NOT NULL THEN 1 ELSE 0 END)
      + (CASE WHEN c.bedrooms_min IS NOT NULL OR c.bedrooms_max IS NOT NULL THEN 1 ELSE 0 END)
      + (CASE WHEN c.bathrooms_min IS NOT NULL OR c.bathrooms_max IS NOT NULL THEN 1 ELSE 0 END)
      + (CASE WHEN c.parking_spots_min IS NOT NULL OR c.parking_spots_max IS NOT NULL THEN 1 ELSE 0 END)
      + (CASE WHEN c.construction_year IS NOT NULL THEN 1 ELSE 0 END)
    )::integer AS quantitative_fields_count,
    c.data_quality_status,
    (
      (CASE WHEN c.latitude IS NOT NULL AND c.longitude IS NOT NULL THEN 8 ELSE 0 END)
      + (CASE WHEN c.postal_code IS NOT NULL THEN 7 ELSE 0 END)
      + (CASE WHEN array_length(c.amenities, 1) > 0 THEN 6 ELSE 0 END)
      + (CASE WHEN c.condo_fee_min_brl IS NOT NULL THEN 5 ELSE 0 END)
      + (CASE WHEN c.area_min_m2 IS NOT NULL OR c.area_max_m2 IS NOT NULL THEN 4 ELSE 0 END)
      + (CASE WHEN c.bedrooms_min IS NOT NULL OR c.bedrooms_max IS NOT NULL THEN 3 ELSE 0 END)
      + (CASE WHEN c.parking_spots_min IS NOT NULL OR c.parking_spots_max IS NOT NULL THEN 2 ELSE 0 END)
      + (CASE WHEN c.construction_year IS NOT NULL THEN 1 ELSE 0 END)
    )::integer AS quality_score
  FROM public.condominiums c
  WHERE c.is_active = false
    AND c.publication_status = 'draft'
    AND c.address IS NOT NULL AND c.address <> ''
    AND c.neighborhood IS NOT NULL AND c.neighborhood <> ''
    AND lower(public.strip_accents_pt(c.neighborhood)) <> 'florianopolis'
    AND c.city IS NOT NULL AND c.city <> ''
    AND c.data_quality_status IS DISTINCT FROM 'needs_review'
  ORDER BY quality_score DESC, quantitative_fields_count DESC, c.name ASC
  LIMIT GREATEST(limit_count, 0);
$$;

-- ---------------------------------------------------------------------------
-- 2) Publicação controlada em lote
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.publish_curated_condominiums(
  limit_count integer DEFAULT 200
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_published bigint := 0;
  v_by_neighborhood jsonb;
  v_with_postal bigint := 0;
  v_with_coords bigint := 0;
  v_with_fee bigint := 0;
  v_with_iptu bigint := 0;
  v_with_area bigint := 0;
  v_with_beds bigint := 0;
  v_with_parking bigint := 0;
  v_skipped_needs_review bigint := 0;
  v_skipped_no_addr bigint := 0;
  v_skipped_bad_nb bigint := 0;
BEGIN
  -- Contadores de ignorados (drafts que não passam no critério)
  SELECT
    count(*) FILTER (WHERE data_quality_status = 'needs_review'),
    count(*) FILTER (WHERE address IS NULL OR address = ''),
    count(*) FILTER (
      WHERE neighborhood IS NULL OR neighborhood = ''
        OR lower(public.strip_accents_pt(neighborhood)) = 'florianopolis'
    )
  INTO v_skipped_needs_review, v_skipped_no_addr, v_skipped_bad_nb
  FROM public.condominiums
  WHERE is_active = false AND publication_status = 'draft';

  -- Publica em lote
  WITH candidates AS (
    SELECT id FROM public.preview_condo_publication_candidates(limit_count)
  ),
  updated AS (
    UPDATE public.condominiums c
       SET is_active = true,
           publication_status = 'published',
           updated_at = now()
      FROM candidates
     WHERE c.id = candidates.id
    RETURNING c.*
  )
  SELECT
    count(*),
    count(*) FILTER (WHERE postal_code IS NOT NULL),
    count(*) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL),
    count(*) FILTER (WHERE condo_fee_min_brl IS NOT NULL),
    count(*) FILTER (WHERE iptu_min_brl IS NOT NULL),
    count(*) FILTER (WHERE area_min_m2 IS NOT NULL OR area_max_m2 IS NOT NULL),
    count(*) FILTER (WHERE bedrooms_min IS NOT NULL OR bedrooms_max IS NOT NULL),
    count(*) FILTER (WHERE parking_spots_min IS NOT NULL OR parking_spots_max IS NOT NULL),
    coalesce(
      jsonb_object_agg(neighborhood, cnt) FILTER (WHERE neighborhood IS NOT NULL),
      '{}'::jsonb
    )
  INTO v_published, v_with_postal, v_with_coords, v_with_fee, v_with_iptu,
       v_with_area, v_with_beds, v_with_parking, v_by_neighborhood
  FROM (
    SELECT neighborhood, postal_code, latitude, longitude,
           condo_fee_min_brl, iptu_min_brl, area_min_m2, area_max_m2,
           bedrooms_min, bedrooms_max, parking_spots_min, parking_spots_max,
           count(*) OVER (PARTITION BY neighborhood) AS cnt
    FROM (
      WITH candidates2 AS (
        SELECT id FROM public.condominiums
        WHERE is_active = true
          AND publication_status = 'published'
          AND updated_at >= now() - interval '5 seconds'
      )
      SELECT c.* FROM public.condominiums c
      JOIN candidates2 USING (id)
    ) recently
  ) r;

  RETURN jsonb_build_object(
    'total_published', v_published,
    'by_neighborhood', v_by_neighborhood,
    'with_postal_code', v_with_postal,
    'with_coordinates', v_with_coords,
    'with_condo_fee', v_with_fee,
    'with_iptu', v_with_iptu,
    'with_area', v_with_area,
    'with_bedrooms', v_with_beds,
    'with_parking', v_with_parking,
    'skipped_needs_review', v_skipped_needs_review,
    'skipped_no_address', v_skipped_no_addr,
    'skipped_invalid_neighborhood', v_skipped_bad_nb
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 3) Despublicar condomínios ativos de baixa qualidade
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.unpublish_low_quality_condominiums()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  WITH to_unpublish AS (
    SELECT
      id, slug,
      CASE
        WHEN address IS NULL OR address = '' THEN 'no_address'
        WHEN neighborhood IS NULL OR neighborhood = '' THEN 'no_neighborhood'
        WHEN lower(public.strip_accents_pt(neighborhood)) = 'florianopolis' THEN 'invalid_neighborhood'
        WHEN city IS NULL OR city = '' THEN 'no_city'
        WHEN data_quality_status = 'needs_review' THEN 'needs_review'
        ELSE 'other'
      END AS reason
    FROM public.condominiums
    WHERE is_active = true
      AND (
        address IS NULL OR address = ''
        OR neighborhood IS NULL OR neighborhood = ''
        OR lower(public.strip_accents_pt(neighborhood)) = 'florianopolis'
        OR city IS NULL OR city = ''
        OR data_quality_status = 'needs_review'
      )
  ),
  upd AS (
    UPDATE public.condominiums c
       SET is_active = false,
           publication_status = 'draft',
           updated_at = now()
      FROM to_unpublish t
     WHERE c.id = t.id
    RETURNING c.id
  )
  SELECT jsonb_build_object(
    'total_unpublished', (SELECT count(*) FROM upd),
    'by_reason', coalesce(
      (SELECT jsonb_object_agg(reason, cnt)
         FROM (SELECT reason, count(*) AS cnt FROM to_unpublish GROUP BY reason) g),
      '{}'::jsonb
    ),
    'slugs', coalesce(
      (SELECT jsonb_agg(slug ORDER BY slug) FROM to_unpublish),
      '[]'::jsonb
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ---------------------------------------------------------------------------
-- Segurança: restringir execução ao service_role
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.preview_condo_publication_candidates(integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.publish_curated_condominiums(integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.unpublish_low_quality_condominiums() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.preview_condo_publication_candidates(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.publish_curated_condominiums(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.unpublish_low_quality_condominiums() TO service_role;