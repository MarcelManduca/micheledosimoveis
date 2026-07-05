CREATE TABLE IF NOT EXISTS public.condo_import_staging (
  slug text PRIMARY KEY,
  postal_code text,
  condo_fee_min_brl numeric,
  iptu_min_brl numeric,
  area_min_m2 numeric,
  area_max_m2 numeric,
  bedrooms_min integer,
  bedrooms_max integer,
  bathrooms_min integer,
  bathrooms_max integer,
  parking_spots_min integer,
  parking_spots_max integer,
  construction_year integer
);
GRANT ALL ON public.condo_import_staging TO service_role;
ALTER TABLE public.condo_import_staging ENABLE ROW LEVEL SECURITY;