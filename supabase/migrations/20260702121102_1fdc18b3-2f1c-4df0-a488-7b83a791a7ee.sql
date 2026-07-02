
-- Table to hold internal cron auth tokens accessible only via service_role.
CREATE TABLE IF NOT EXISTS public.cron_secrets (
  name TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.cron_secrets TO service_role;

ALTER TABLE public.cron_secrets ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated → table is only reachable via service_role.

CREATE TRIGGER cron_secrets_set_updated_at
BEFORE UPDATE ON public.cron_secrets
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed a random token that pg_cron and the sync webhook will share.
INSERT INTO public.cron_secrets (name, token)
VALUES ('sync', encode(gen_random_bytes(32), 'hex'))
ON CONFLICT (name) DO NOTHING;
