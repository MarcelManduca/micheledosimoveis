-- Harden public.cron_secrets: sensitive tokens must be reachable only by service_role.
-- RLS is already enabled with zero policies (fail-closed). Make the posture explicit
-- and add a defense-in-depth deny policy plus tight table-level grants.

REVOKE ALL ON TABLE public.cron_secrets FROM PUBLIC;
REVOKE ALL ON TABLE public.cron_secrets FROM anon;
REVOKE ALL ON TABLE public.cron_secrets FROM authenticated;
GRANT ALL ON TABLE public.cron_secrets TO service_role;

ALTER TABLE public.cron_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_secrets FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny all client access to cron_secrets" ON public.cron_secrets;
CREATE POLICY "Deny all client access to cron_secrets"
ON public.cron_secrets
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);