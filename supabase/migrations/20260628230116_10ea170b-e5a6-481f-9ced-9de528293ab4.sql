UPDATE public.properties
SET title = regexp_replace(title, '\s+por\s+R\$\s*[\d\.,]+\s*$', '', 'i')
WHERE title ~* '\s+por\s+R\$';