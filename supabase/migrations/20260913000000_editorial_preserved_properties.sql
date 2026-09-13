-- Migração: editorial_preserved_properties
-- Finalidade: Registro editorial permanente para páginas de imóveis de acervo citados no blog,
-- permitindo acesso público seguro sem expor a tabela properties completa com published=false.

CREATE TABLE IF NOT EXISTS public.editorial_preserved_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  condo_name TEXT NOT NULL,
  condo_slug TEXT,
  article_slug TEXT NOT NULL DEFAULT 'condominios-luxo-beira-mar-norte-agronomica',
  title TEXT NOT NULL,
  property_type TEXT DEFAULT 'apartamento',
  neighborhood TEXT,
  city TEXT DEFAULT 'Florianópolis',
  state TEXT DEFAULT 'SC',
  address TEXT,
  area_m2 NUMERIC(10,2),
  bedrooms INT,
  suites INT,
  bathrooms INT,
  parking_spots INT,
  description TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  condo_features TEXT[] NOT NULL DEFAULT '{}',
  cover_image TEXT,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_preserved BOOLEAN NOT NULL DEFAULT true,
  is_admin_blocked BOOLEAN NOT NULL DEFAULT false,
  unavailable_notice TEXT NOT NULL DEFAULT 'Esta unidade não está disponível para venda no momento.',
  preserved_since TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Permissões
GRANT SELECT ON public.editorial_preserved_properties TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.editorial_preserved_properties TO authenticated;
GRANT ALL ON public.editorial_preserved_properties TO service_role;

-- RLS
ALTER TABLE public.editorial_preserved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view preserved editorial properties"
  ON public.editorial_preserved_properties FOR SELECT
  TO anon, authenticated
  USING (is_preserved = true AND is_admin_blocked = false);

CREATE POLICY "Admins can manage preserved editorial properties"
  ON public.editorial_preserved_properties FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE OR REPLACE TRIGGER set_editorial_preserved_updated_at
BEFORE UPDATE ON public.editorial_preserved_properties
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.editorial_preserved_properties IS 'Snapshot de acervo de imóveis referenciados em artigos editoriais, preservados mesmo após indisponibilidade comercial.';
