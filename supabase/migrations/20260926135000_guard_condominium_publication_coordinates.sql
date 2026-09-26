-- This is a broad regional plausibility check, not a geocoding or municipal-boundary test.
-- Drafts remain editable while their addresses and coordinates are reviewed.
ALTER TABLE public.condominiums
  ADD CONSTRAINT published_condominium_coordinates_in_region
  CHECK (
    NOT (is_active AND publication_status = 'published')
    OR (latitude IS NULL AND longitude IS NULL)
    OR (
      latitude IS NOT NULL AND longitude IS NOT NULL
      AND latitude BETWEEN -27.9 AND -27.3
      AND longitude BETWEEN -48.7 AND -48.3
    )
  );

CREATE OR REPLACE FUNCTION public.preview_condo_publication_candidates(
  limit_count integer DEFAULT 200
)
RETURNS TABLE (
  id uuid, slug text, name text, address text, neighborhood text,
  postal_code text, latitude double precision, longitude double precision,
  quantitative_fields_count integer, data_quality_status text, quality_score integer
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    c.id, c.slug, c.name, c.address, c.neighborhood, c.postal_code,
    c.latitude::double precision, c.longitude::double precision,
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
    AND (
      (c.latitude IS NULL AND c.longitude IS NULL)
      OR (c.latitude IS NOT NULL AND c.longitude IS NOT NULL
          AND c.latitude BETWEEN -27.9 AND -27.3
          AND c.longitude BETWEEN -48.7 AND -48.3)
    )
  ORDER BY quality_score DESC, quantitative_fields_count DESC, c.name ASC
  LIMIT GREATEST(limit_count, 0);
$$;
