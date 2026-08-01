CREATE TABLE public.developers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  website text,
  phone text,
  email text,
  logo_url text,
  description text,
  city text,
  state text DEFAULT 'SC',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.developers TO authenticated;
GRANT SELECT ON public.developers TO anon;
GRANT ALL ON public.developers TO service_role;
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active developers" ON public.developers FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert developers" ON public.developers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update developers" ON public.developers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete developers" ON public.developers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.developments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  developer_id uuid REFERENCES public.developers(id) ON DELETE SET NULL,
  stage text NOT NULL DEFAULT 'lancamento',
  address text,
  neighborhood text,
  city text NOT NULL DEFAULT 'Florianópolis',
  state text NOT NULL DEFAULT 'SC',
  postal_code text,
  latitude numeric,
  longitude numeric,
  price_min_brl numeric,
  price_max_brl numeric,
  area_min_m2 numeric,
  area_max_m2 numeric,
  bedrooms_min integer,
  bedrooms_max integer,
  parking_spots_min integer,
  parking_spots_max integer,
  units_count integer,
  towers_count integer,
  floors_count integer,
  delivery_estimate text,
  amenities text[] NOT NULL DEFAULT '{}'::text[],
  cover_image text,
  description text,
  seo_title text,
  seo_description text,
  is_published boolean NOT NULL DEFAULT false,
  publication_status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX developments_developer_id_idx ON public.developments(developer_id);
CREATE INDEX developments_published_idx ON public.developments(is_published);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.developments TO authenticated;
GRANT SELECT ON public.developments TO anon;
GRANT ALL ON public.developments TO service_role;
ALTER TABLE public.developments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published developments" ON public.developments FOR SELECT TO anon, authenticated USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert developments" ON public.developments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update developments" ON public.developments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete developments" ON public.developments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.development_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  development_id uuid NOT NULL REFERENCES public.developments(id) ON DELETE CASCADE,
  unit_name text NOT NULL,
  area_m2 numeric,
  bedrooms integer,
  suites integer,
  bathrooms integer,
  parking_spots integer,
  price_brl numeric,
  is_available boolean NOT NULL DEFAULT true,
  floor_plan_url text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX development_properties_development_id_idx ON public.development_properties(development_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.development_properties TO authenticated;
GRANT SELECT ON public.development_properties TO anon;
GRANT ALL ON public.development_properties TO service_role;
ALTER TABLE public.development_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view units of published developments" ON public.development_properties FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.developments d WHERE d.id = development_properties.development_id AND (d.is_published = true OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Admins can insert development units" ON public.development_properties FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update development units" ON public.development_properties FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete development units" ON public.development_properties FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER developers_set_updated_at BEFORE UPDATE ON public.developers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER developments_set_updated_at BEFORE UPDATE ON public.developments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER development_properties_set_updated_at BEFORE UPDATE ON public.development_properties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();