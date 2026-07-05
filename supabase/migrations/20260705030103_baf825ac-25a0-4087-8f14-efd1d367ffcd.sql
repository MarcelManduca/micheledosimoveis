
CREATE TABLE public.condominiums (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  normalized_name text NOT NULL,
  address text,
  neighborhood text,
  normalized_neighborhood text,
  bairro_slug text,
  city text NOT NULL DEFAULT 'Florianópolis',
  state text NOT NULL DEFAULT 'SC',
  latitude numeric,
  longitude numeric,
  amenities text[] NOT NULL DEFAULT '{}'::text[],
  description text,
  seo_title text,
  seo_description text,
  canonical_url text,
  is_active boolean NOT NULL DEFAULT false,
  publication_status text NOT NULL DEFAULT 'draft',
  source_reference_internal text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX condominiums_bairro_slug_idx ON public.condominiums (bairro_slug);
CREATE INDEX condominiums_is_active_idx ON public.condominiums (is_active);
CREATE INDEX condominiums_normalized_name_idx ON public.condominiums (normalized_name);

GRANT SELECT ON public.condominiums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.condominiums TO authenticated;
GRANT ALL ON public.condominiums TO service_role;

ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active condominiums"
  ON public.condominiums
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert condominiums"
  ON public.condominiums
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update condominiums"
  ON public.condominiums
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete condominiums"
  ON public.condominiums
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER condominiums_set_updated_at
  BEFORE UPDATE ON public.condominiums
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
