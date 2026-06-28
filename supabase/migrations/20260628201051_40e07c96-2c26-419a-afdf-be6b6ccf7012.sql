
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS last_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_check_status text,
  ADD COLUMN IF NOT EXISTS unavailable_since timestamptz;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
