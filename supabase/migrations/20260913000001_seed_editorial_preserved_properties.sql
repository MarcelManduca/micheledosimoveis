-- Migração: seed_editorial_preserved_properties
-- Finalidade: Carga inicial aprovada e idempotente para a tabela editorial_preserved_properties.
-- Regra de Segurança: ON CONFLICT (code) DO NOTHING garante que revogações manuais ou
-- bloqueios administrativos existentes no banco de dados NUNCA sejam sobrescritos por reexecução.

INSERT INTO public.editorial_preserved_properties (
  code, condo_name, condo_slug, article_slug, title, property_type,
  neighborhood, city, state, address, area_m2, bedrooms, suites,
  bathrooms, parking_spots, description, features, condo_features,
  cover_image, photos, is_preserved, is_admin_blocked, unavailable_notice
) VALUES
(
  '34547', 'La Perle Beira Mar', NULL, 'condominios-luxo-beira-mar-norte-agronomica',
  'Apartamento em Agronômica com 3 dormitórios, 316m² — La Perle', 'apartamento',
  'Agronômica', 'Florianópolis', 'SC', 'Avenida Governador Irineu Bornhausen, 3600',
  316, 3, 3, 6, 4,
  'Apartamento à beira-mar em Florianópolis no condomínio La Perle. Três suítes espaçosas, quatro vagas de garagem, acabamentos de alto padrão e ampla área social integrada com vista panorâmica para a Baía Norte.',
  ARRAY['Elevador privativo', 'Vista Panorâmica', 'Vista Mar', 'Sacada Com Churrasqueira', 'Ar Condicionado', 'Alto Padrão', 'Água Quente'],
  ARRAY['Piscina Adulto', 'Piscina Infantil', 'Piscina Aquecida / Spa', 'Sala Fitness', 'Salão de Festas', 'Salão de Jogos', 'Sauna', 'Playground', 'Portaria 24h'],
  '/blog/beira-mar-norte/la-perle.webp',
  '[{"url":"/blog/beira-mar-norte/la-perle.webp","position":1},{"url":"/blog/beira-mar-norte/la-perle-2.webp","position":2}]'::jsonb,
  true, false, 'Esta unidade não está disponível para venda no momento.'
),
(
  '31776', 'Acqua', 'condominio-acqua-agronomica-florianopolis', 'condominios-luxo-beira-mar-norte-agronomica',
  'Apartamento em Agronômica com 4 dormitórios, 221m² — Acqua', 'apartamento',
  'Agronômica', 'Florianópolis', 'SC', 'Rua Frei Caneca, 17',
  221, 4, 4, 5, 4,
  'Apartamento no condomínio Acqua (CFL), na região da Praça Governador Celso Ramos. Planta ampla com 4 suítes, ambientes sociais integrados e lazer completo em localização nobre da Agronômica.',
  ARRAY['Elevador', 'Sacada Gourmet', 'Piscina no Condomínio', 'Academia', 'Salão de Festas', 'Segurança 24h'],
  ARRAY['Piscina de Raia', 'Deck Molhado', 'Academia Completa', 'Spa com Sauna', 'Lounge Gourmet', 'Brinquedoteca', 'Gerador de Energia', 'Portaria Blindada'],
  '/blog/beira-mar-norte/acqua.webp',
  '[{"url":"/blog/beira-mar-norte/acqua.webp","position":1}]'::jsonb,
  true, false, 'Esta unidade não está disponível para venda no momento.'
),
(
  '30870', 'Sonata Place', 'condominio-sonata-place-agronomica-florianopolis', 'condominios-luxo-beira-mar-norte-agronomica',
  'Apartamento em Agronômica com 3 dormitórios, 131m² — Sonata Place', 'apartamento',
  'Agronômica', 'Florianópolis', 'SC', 'Rua Comandante Constantino Nicolau Spyrides, 4152',
  131, 3, 3, 4, 2,
  'Apartamento no Sonata Place (Simphonia WOA Beiramar). 3 suítes, sacada com churrasqueira a carvão, acabamentos nobres e lazer privativo da torre a poucos metros da Beira-Mar Norte.',
  ARRAY['Sacada com Churrasqueira', 'Piso Porcelanato', 'Lavabo', 'Infraestrutura para Ar Split'],
  ARRAY['Piscina Adulto e Infantil', 'Espaço Fitness', 'Salão de Festas Gourmet', 'Playground', 'Guarita 24h'],
  '/blog/beira-mar-norte/sonata-place.webp',
  '[{"url":"/blog/beira-mar-norte/sonata-place.webp","position":1}]'::jsonb,
  true, false, 'Esta unidade não está disponível para venda no momento.'
),
(
  '22461', 'Jazz Club', 'condominio-jazz-club-agronomica-florianopolis', 'condominios-luxo-beira-mar-norte-agronomica',
  'Apartamento em Agronômica com 3 dormitórios, 107m² — Jazz Club', 'apartamento',
  'Agronômica', 'Florianópolis', 'SC', 'Servidão Paulo Zimmer, 101',
  107, 3, 3, 4, 2,
  'Apartamento contemporâneo no Jazz Club (Simphonia WOA Beiramar). 3 suítes, living integrado, sacada com churrasqueira e estrutura de lazer e segurança exclusiva da torre na Agronômica.',
  ARRAY['Sacada com Churrasqueira', 'Persianas Integradas', 'Espera para Split', 'Lavabo'],
  ARRAY['Piscina Aquecida', 'Fitness Center', 'Lounge Bar / Gourmet', 'Bicicletário', 'Portaria 24h'],
  '/blog/beira-mar-norte/jazz-club.webp',
  '[{"url":"/blog/beira-mar-norte/jazz-club.webp","position":1}]'::jsonb,
  true, false, 'Esta unidade não está disponível para venda no momento.'
),
(
  '44022', 'Soprano Hall', 'condominio-soprano-hall-agronomica-florianopolis', 'condominios-luxo-beira-mar-norte-agronomica',
  'Apartamento em Agronômica com 3 dormitórios, 168m² — Soprano Hall', 'apartamento',
  'Agronômica', 'Florianópolis', 'SC', 'Servidão Paulo Zimmer, 55',
  168, 3, 3, 4, 3,
  'Residência no Soprano Hall (Simphonia WOA Beiramar). 3 suítes amplas, acabamento de alto padrão, sacada generosa com churrasqueira e vista para a orla da Agronômica.',
  ARRAY['Living com 3 Ambientes', 'Lavabo', 'Churrasqueira', 'Área de Serviço Separada'],
  ARRAY['Piscina com Deck Molhado', 'Salão de Festas Climatizado', 'Fitness Center', 'Playground', 'Portaria 24h'],
  '/blog/beira-mar-norte/soprano-hall.webp',
  '[{"url":"/blog/beira-mar-norte/soprano-hall.webp","position":1}]'::jsonb,
  true, false, 'Esta unidade não está disponível para venda no momento.'
),
(
  '43575', 'Villa Celimontana', 'residencial-villa-celimontana-agronomica-florianopolis', 'condominios-luxo-beira-mar-norte-agronomica',
  'Apartamento em Agronômica com 2 dormitórios, 79m² — Villa Celimontana', 'apartamento',
  'Agronômica', 'Florianópolis', 'SC', 'Travessa Felipe Godinho e Silva, 30',
  79, 2, 1, 2, 1,
  'Apartamento no Residencial Villa Celimontana (Construtora Fontana), comunicado como pronto para morar em dezembro de 2023. Conceito home club na Agronômica com lazer completo para a família.',
  ARRAY['Sacada com Churrasqueira', 'Persianas Integradas', 'Piso Porcelanato', 'Espera para Split'],
  ARRAY['Piscinas Adulto e Infantil', 'Bar da Piscina', 'Academia', 'Espaço Gourmet', 'Espaço Teen e Kids', 'Pet Place', 'Portaria 24h'],
  '/blog/beira-mar-norte/villa-celimontana.webp',
  '[{"url":"/blog/beira-mar-norte/villa-celimontana.webp","position":1}]'::jsonb,
  true, false, 'Esta unidade não está disponível para venda no momento.'
)
ON CONFLICT (code) DO NOTHING;
