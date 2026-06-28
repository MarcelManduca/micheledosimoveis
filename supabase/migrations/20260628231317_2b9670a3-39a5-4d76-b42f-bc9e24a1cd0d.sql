UPDATE public.properties
SET
  price_brl = CASE code
    WHEN '42345' THEN 5750000
    WHEN '36102' THEN 18000000
    WHEN '29782' THEN 18000000
    WHEN '25335' THEN 18000000
    WHEN '43278' THEN 15800000
    ELSE price_brl
  END,
  title = btrim(regexp_replace(title, '\s+por\s+R\$\s*[0-9\.\,]+\s*$', '', 'i')),
  updated_at = now()
WHERE code IN ('42345', '36102', '29782', '25335', '43278');