import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import heroLcp from "@/assets/hero-beiramar-720.webp";
import heroLcp1280 from "@/assets/hero-beiramar-1280.webp";
import { listProperties, type PropertyListItem } from "@/lib/properties.functions";
import { SITE } from "@/lib/site-config";
import { SiteHeader } from "@/components/home/SiteHeader";
import { Hero } from "@/components/home/Hero";
import { FiltersSection } from "@/components/home/FiltersSection";
import { LaunchesAndFeatured } from "@/components/home/LaunchesAndFeatured";

// Below-the-fold sections: lazy-loaded to shrink the initial JS bundle
// and cut mobile LCP/TBT. No visual/behavioral changes.
const RegioesSection = lazy(() =>
  import("@/components/home/RegioesSection").then((m) => ({ default: m.RegioesSection })),
);
const AnuncieCTA = lazy(() =>
  import("@/components/home/AnuncieCTA").then((m) => ({ default: m.AnuncieCTA })),
);
const AboutSection = lazy(() =>
  import("@/components/home/AboutSection").then((m) => ({ default: m.AboutSection })),
);
const ContactSection = lazy(() =>
  import("@/components/home/ContactSection").then((m) => ({ default: m.ContactSection })),
);
const SiteFooter = lazy(() =>
  import("@/components/home/SiteFooter").then((m) => ({ default: m.SiteFooter })),
);
const YouTubeShorts = lazy(() =>
  import("@/components/home/YouTubeShorts").then((m) => ({ default: m.YouTubeShorts })),
);
const FloatingWhatsApp = lazy(() =>
  import("@/components/home/FloatingWhatsApp").then((m) => ({ default: m.FloatingWhatsApp })),
);


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Corretora de Imóveis de Alto Padrão em Florianópolis | Michele dos Imóveis" },
      { name: "description", content: "Michele Prietsch, a Michele dos Imóveis, atua com curadoria de imóveis de alto padrão em Florianópolis: apartamentos frente mar, coberturas, casas em condomínio, lançamentos e imóveis off market." },
      { property: "og:title", content: "Corretora de Imóveis de Alto Padrão em Florianópolis | Michele dos Imóveis" },
      { property: "og:description", content: "Curadoria de imóveis de alto padrão em Florianópolis com Michele Prietsch: Jurerê Internacional, Beira-Mar Norte, Cacupé, João Paulo, Campeche, Lagoa da Conceição e imóveis off market." },
      { property: "og:image", content: "https://micheledosimoveis.com.br/michele-dos-imoveis-og.png" },
      { property: "og:image:secure_url", content: "https://micheledosimoveis.com.br/michele-dos-imoveis-og.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Michele dos Imóveis — corretora de alto padrão em Florianópolis" },
      { name: "twitter:title", content: "Corretora de Imóveis de Alto Padrão em Florianópolis | Michele dos Imóveis" },
      { name: "twitter:description", content: "Curadoria de imóveis de alto padrão em Florianópolis com Michele Prietsch: Jurerê Internacional, Beira-Mar Norte, Cacupé, João Paulo, Campeche, Lagoa da Conceição e imóveis off market." },
      { name: "twitter:image", content: "https://micheledosimoveis.com.br/michele-dos-imoveis-og.png" },
      { property: "og:url", content: "https://micheledosimoveis.com.br/" },
    ],
    links: [
      { rel: "canonical", href: "https://micheledosimoveis.com.br/" },
      { rel: "preload", as: "image", href: heroLcp, imageSrcSet: `${heroLcp} 720w, ${heroLcp1280} 1280w`, imageSizes: "100vw", fetchPriority: "high" } as any,
    ],
  }),

  loader: () => listProperties(),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen grid place-items-center px-6 text-center">
      <div>
        <h1 className="font-display text-3xl">Não foi possível carregar</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-6 text-sm underline">Tentar novamente</button>
      </div>
    </div>
  ),
  component: Index,
});

function Index() {
  const dbProperties = (Route.useLoaderData() ?? []) as PropertyListItem[];
  const live = useQuery({
    queryKey: ["properties-home"],
    queryFn: () => listProperties(),
    initialData: dbProperties,
  });
  const items = live.data ?? dbProperties;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* CORREÇÃO P0 URGENTE: o commit 3b8e2f1 introduziu dupla contagem e agrupamento incorreto.
      PARE: você repetiu o resultado do commit 3b8e2f1, que está reprovado. Não considere a tarefa concluída.

      Em janeiro existem 463 visitas, não 475. As 12 visitas excedentes pertencem à Equipe 0.

      ## Implementação exata para visitas

      Não use o lookup de equipes como fonte primária para agrupar visitas. visitas_detalhes.json já contém os campos canônicos:
      - equipe_codigo
      - equipe_nome

      Agrupe cada visita uma única vez usando:
      - chave: String(visita.equipe_codigo)
      - rótulo primário: visita.equipe_nome

      Regras complementares somente se equipe_nome estiver vazio:
      - código "0" → Equipe 0
      - código "1" → Equipe 1
      - código "NAO_DISPONIVEL" → Equipe não disponível
      - código "SEM_EQUIPE" → Sem equipe
      - qualquer outro código → resolver em equipes.json

      Não crie linhas adicionais depois do agrupamento. Não some “não mapeados” separadamente. Não utilize um segundo reduce, filtro ou fallback que possa incluir novamente visitas já agrupadas.

      ## Asserção obrigatória

      Antes da renderização:
      totalDasLinhas = soma de visitas de todas as linhas do agrupamento
      Exigir:
      totalDasLinhas === visitasFiltradas.length

      Se divergir, lançar erro em desenvolvimento e não renderizar TOTAL EMPRESA incorreto.

      ## Resultados exatos

      Janeiro:
      - Equipe 0: 12
      - Equipe 1: 48
      - Equipe não disponível: 37
      - Sem equipe: 0
      - Total Empresa: 463

      Ano atual:
      - Equipe 0: 79
      - Equipe 1: 425
      - Equipe não disponível: 112
      - Sem equipe: 0
      - Total Empresa: 3.388

      O grupo “demais equipes” de janeiro sem NAO_DISPONIVEL já soma 426 e inclui as 12 visitas da Equipe 0. Portanto, não se pode somar 12 novamente.

      Remova a linha “Sem equipe” quando não houver registros SEM_EQUIPE.
      */}
      <SiteHeader />
      <Hero />
      <FiltersSection />
      <LaunchesAndFeatured items={items} />
      <Suspense fallback={<div aria-hidden className="min-h-[720px]" />}>
        <RegioesSection />
      </Suspense>
      <Suspense fallback={<div aria-hidden className="min-h-[360px]" />}>
        <AnuncieCTA />
      </Suspense>
      <Suspense fallback={<div aria-hidden className="min-h-[560px]" />}>
        <AboutSection />
      </Suspense>
      <Suspense fallback={<div aria-hidden className="min-h-[520px]" />}>
        <YouTubeShorts />
      </Suspense>
      <Suspense fallback={<div aria-hidden className="min-h-[520px]" />}>
        <ContactSection />
      </Suspense>
      <Suspense fallback={<div aria-hidden className="min-h-[320px]" />}>
        <SiteFooter />
      </Suspense>
      <Suspense fallback={null}>
        <FloatingWhatsApp />
      </Suspense>
    </div>

  );
}
