import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero-beiramar.jpg";
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
      { title: "Corretora Michele" },
      { name: "description", content: "Michele Prietsch, conhecida como Michele dos Imóveis, é corretora especializada em imóveis de alto padrão em Florianópolis, com atendimento personalizado para compra, venda e curadoria imobiliária." },
      { property: "og:title", content: "Michele Prietsch | Michele dos Imóveis em Florianópolis" },
      { property: "og:description", content: "Corretora especializada em imóveis de alto padrão em Florianópolis — curadoria, discrição e atendimento sob medida em Jurerê Internacional, Praia Brava, Cacupé, Lagoa da Conceição, Campeche e Beira-Mar Norte." },
      { property: "og:image", content: heroImg },
      { property: "og:url", content: SITE.publishedUrl },
    ],
    links: [
      { rel: "canonical", href: SITE.publishedUrl },
      { rel: "preload", as: "image", href: heroImg, fetchpriority: "high" } as any,
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
