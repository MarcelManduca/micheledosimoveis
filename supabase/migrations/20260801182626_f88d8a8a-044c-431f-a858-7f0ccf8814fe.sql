-- Construtoras: campos adicionais
ALTER TABLE public.developers
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS founded_year integer,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;

-- Lançamentos: campos adicionais
ALTER TABLE public.developments
  ADD COLUMN IF NOT EXISTS launch_date date,
  ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS brochure_url text,
  ADD COLUMN IF NOT EXISTS architecture text,
  ADD COLUMN IF NOT EXISTS landscaping text,
  ADD COLUMN IF NOT EXISTS interiors text;

-- Unidades: vínculo com imóvel existente
ALTER TABLE public.development_properties
  ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE;

ALTER TABLE public.development_properties
  ALTER COLUMN unit_name DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS development_properties_dev_prop_uniq
  ON public.development_properties (development_id, property_id)
  WHERE property_id IS NOT NULL;

-- Sugestões ignoradas
CREATE TABLE IF NOT EXISTS public.development_suggestion_dismissals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_key text NOT NULL UNIQUE,
  label text,
  dismissed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.development_suggestion_dismissals TO authenticated;
GRANT ALL ON public.development_suggestion_dismissals TO service_role;

ALTER TABLE public.development_suggestion_dismissals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage suggestion dismissals"
  ON public.development_suggestion_dismissals
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_updated_at_development_suggestion_dismissals
  BEFORE UPDATE ON public.development_suggestion_dismissals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();