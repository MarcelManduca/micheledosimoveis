ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_launch boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS properties_featured_idx ON public.properties (featured) WHERE published = true;
CREATE INDEX IF NOT EXISTS properties_is_launch_idx ON public.properties (is_launch) WHERE published = true;