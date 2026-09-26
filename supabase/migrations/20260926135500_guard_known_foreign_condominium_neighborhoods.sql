-- A regional rectangle cannot distinguish São José from Florianópolis.
-- These neighborhood labels are in São José; the name of the first is misleading.
ALTER TABLE public.condominiums
  ADD CONSTRAINT published_condominium_not_in_known_foreign_neighborhood
  CHECK (
    NOT (is_active AND publication_status = 'published')
    OR lower(public.strip_accents_pt(coalesce(neighborhood, '')))
      NOT IN ('cidade jardim de florianopolis', 'serraria')
  );
