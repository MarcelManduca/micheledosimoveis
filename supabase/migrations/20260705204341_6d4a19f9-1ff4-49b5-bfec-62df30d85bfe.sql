
-- Make text helpers SECURITY INVOKER (they only transform text).
CREATE OR REPLACE FUNCTION public.strip_accents_pt(s text)
RETURNS text LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT translate(
    coalesce(s,''),
    'áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇñÑ',
    'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUCnN'
  )
$$;

CREATE OR REPLACE FUNCTION public.normalize_condo_slug(s text)
RETURNS text LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path = public AS $$
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

-- Lock down merge routine to service_role only.
REVOKE ALL ON FUNCTION public.merge_condos_from_staging() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.merge_condos_from_staging() TO service_role;

-- Add a permissive RLS policy so the migration linter is satisfied,
-- but scope reads to service_role only (no anon/authenticated access).
DROP POLICY IF EXISTS "Service role manages staging" ON public.condo_import_staging;
CREATE POLICY "Service role manages staging"
  ON public.condo_import_staging
  FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
