-- Setup Completo do Ambiente de Homologação Isolado
-- Banco: michele_homolog

-- 1. Criação de Roles Supabase
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Schema Auth e funções de autenticação / autorização
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
BEGIN
  RETURN NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Tabelas Comerciais (properties e property_photos)
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  property_type TEXT DEFAULT 'apartamento',
  neighborhood TEXT,
  city TEXT DEFAULT 'Florianópolis',
  state TEXT DEFAULT 'SC',
  address TEXT,
  condo_name TEXT,
  price_brl NUMERIC(15,2),
  condo_fee_brl NUMERIC(10,2),
  iptu_brl NUMERIC(10,2),
  area_m2 NUMERIC(10,2),
  bedrooms INT,
  suites INT,
  bathrooms INT,
  parking_spots INT,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  condo_features TEXT[] DEFAULT '{}',
  cover_image TEXT,
  featured BOOLEAN DEFAULT false,
  is_launch BOOLEAN DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  source_url TEXT,
  last_check_status TEXT,
  unavailable_since TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.properties, public.property_photos TO anon, authenticated;
GRANT ALL ON public.properties, public.property_photos TO service_role;

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public properties select" ON public.properties FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Public photos select" ON public.property_photos FOR SELECT TO anon, authenticated USING (true);
