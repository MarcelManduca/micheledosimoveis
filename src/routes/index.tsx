import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import heroLcp from "@/assets/hero-beiramar-720.webp";
import heroLcp1280 from "@/assets/hero-beiramar-1280.webp";
import { listProperties, type PropertyListItem } from "@/lib/properties.functions";
import { SITE } from "@/lib/site-config";
import { SiteHeader } from "@/components/home/SiteHeader";
import { Hero } from "@/components/home/Hero";
import { FiltersSection } from "@/components/home/FiltersSection";
import { LaunchesAndFeatured } from "@/components/home/LaunchesAndFeatured";
import { RegioesSection } from "@/components/home/RegioesSection";
import { AnuncieCTA } from "@/components/home/AnuncieCTA";
import { AboutSection } from "@/components/home/AboutSection";
import { ContactSection } from "@/components/home/ContactSection";
import { SiteFooter } from "@/components/home/SiteFooter";
import { FloatingWhatsApp } from "@/components/home/FloatingWhatsApp";

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
      { rel: "preload", as: "image", href: heroLcp, imagesrcset: `${heroLcp} 720w, ${heroLcp1280} 1280w`, imagesizes: "100vw", fetchpriority: "high" } as any,
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
      <SiteHeader />
      <Hero />
      <FiltersSection />
      <LaunchesAndFeatured items={items} />
      <RegioesSection />
      <AnuncieCTA />
      <AboutSection />
      <ContactSection />
      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
