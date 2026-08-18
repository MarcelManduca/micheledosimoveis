-- Migration SQL to create public.sync_runs table
-- This table stores history and real-time progress of the Gralha properties sync.

CREATE TABLE IF NOT EXISTS public.sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
    checked INTEGER DEFAULT 0 NOT NULL,
    total INTEGER DEFAULT 0 NOT NULL,
    available INTEGER DEFAULT 0 NOT NULL,
    refreshed INTEGER DEFAULT 0 NOT NULL,
    unpublished INTEGER DEFAULT 0 NOT NULL,
    errors INTEGER DEFAULT 0 NOT NULL,
    details JSONB DEFAULT '[]'::jsonb NOT NULL
);

-- Enable RLS for security, even though server functions bypass it using service role
ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;

-- If we ever need to allow direct reads from authenticated client dashboard, we can enable it:
CREATE POLICY "Allow authenticated read on sync_runs" 
ON public.sync_runs FOR SELECT 
TO authenticated 
USING (true);
