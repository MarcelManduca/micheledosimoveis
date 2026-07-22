CREATE TABLE public.vrsync_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  included_property_codes text[] NOT NULL DEFAULT '{}',
  excluded_property_codes text[] NOT NULL DEFAULT '{}',
  max_items integer,
  sort_by text NOT NULL DEFAULT 'recent',
  last_generated_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vrsync_feeds_slug_format
    CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' AND length(slug) BETWEEN 2 AND 80),
  CONSTRAINT vrsync_feeds_sort_by_valid
    CHECK (sort_by IN ('recent','price_desc','price_asc','featured_first','launch_first','code','manual')),
  CONSTRAINT vrsync_feeds_max_items_positive
    CHECK (max_items IS NULL OR max_items > 0)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vrsync_feeds TO authenticated;
GRANT SELECT ON public.vrsync_feeds TO anon;
GRANT ALL ON public.vrsync_feeds TO service_role;

ALTER TABLE public.vrsync_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage vrsync feeds"
  ON public.vrsync_feeds
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anon reads active vrsync feeds"
  ON public.vrsync_feeds
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE TRIGGER trg_vrsync_feeds_updated_at
  BEFORE UPDATE ON public.vrsync_feeds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX vrsync_feeds_active_slug_idx ON public.vrsync_feeds (slug) WHERE is_active = true;