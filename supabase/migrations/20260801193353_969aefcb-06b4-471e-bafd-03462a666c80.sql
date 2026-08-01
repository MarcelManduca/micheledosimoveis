ALTER TABLE public.developments
  ADD COLUMN IF NOT EXISTS cover_review_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS description_review_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS review_notes text;

ALTER TABLE public.developments
  ADD CONSTRAINT developments_cover_review_status_check
  CHECK (cover_review_status IN ('pending','approved','rejected'));

ALTER TABLE public.developments
  ADD CONSTRAINT developments_description_review_status_check
  CHECK (description_review_status IN ('pending','approved','rejected'));