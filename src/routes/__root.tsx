import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ImageProtection } from "../components/ImageProtection";
import { CookieConsent } from "../components/CookieConsent";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Corretora Michele" },
      { name: "description", content: "Corretora de imóveis de alto padrão em Florianópolis. Apartamentos, casas e coberturas em Jurerê Internacional, Beira Mar Norte, Lagoa da Conceição, Campeche, Praia Brava e principais bairros e praias da Ilha." },
      { name: "author", content: "Michele Prietsch" },
      { name: "geo.region", content: "BR-SC" },
      { name: "geo.placename", content: "Florianópolis" },
      { name: "geo.position", content: "-27.5954;-48.5480" },
      { name: "ICBM", content: "-27.5954, -48.5480" },
      { property: "og:title", content: "Michele dos Imóveis — Alto padrão em Florianópolis | Jurerê, Beira Mar, Lagoa, Campeche" },
      { property: "og:description", content: "Corretora de imóveis de alto padrão em Florianópolis. Apartamentos, casas e coberturas em Jurerê Internacional, Beira Mar Norte, Lagoa da Conceição, Campeche, Praia Brava e principais bairros e praias da Ilha." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:site_name", content: "Michele dos Imóveis" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Michele dos Imóveis — Alto padrão em Florianópolis | Jurerê, Beira Mar, Lagoa, Campeche" },
      { name: "twitter:description", content: "Corretora de imóveis de alto padrão em Florianópolis. Apartamentos, casas e coberturas em Jurerê Internacional, Beira Mar Norte, Lagoa da Conceição, Campeche, Praia Brava e principais bairros e praias da Ilha." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c8e126ab-3240-48b5-ae94-fc4e6158a89d/id-preview-073693f9--90b99939-dc3d-44f4-af7a-21286ac534d2.lovable.app-1782680801811.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c8e126ab-3240-48b5-ae94-fc4e6158a89d/id-preview-073693f9--90b99939-dc3d-44f4-af7a-21286ac534d2.lovable.app-1782680801811.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Inter+Tight:wght@400;500;600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Michele dos Imóveis",
          url: "https://micheledosimoveis.lovable.app",
          inLanguage: "pt-BR",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://micheledosimoveis.lovable.app/buscar?bairro={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          name: "Michele dos Imóveis — Michele Prietsch",
          description:
            "Corretora de imóveis de alto padrão em Florianópolis. Atuação nos principais bairros e praias da Ilha: Centro/Beira Mar, Agronômica, Jurerê Tradicional, Jurerê Internacional, Praia Brava, João Paulo, Cacupé, Santo Antônio de Lisboa, Itacorubi, Trindade, Santa Mônica, Córrego Grande, Lagoa da Conceição, Canto da Lagoa, Campeche, Novo Campeche, Rio Tavares e Morro das Pedras.",
          url: "https://micheledosimoveis.lovable.app",
          telephone: "+55-48-99182-8828",
          email: "micheledosimoveis@gmail.com",
          image: "https://micheledosimoveis.lovable.app/og.jpg",
          priceRange: "$$$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: "R. Alves de Brito, 285",
            addressLocality: "Florianópolis",
            addressRegion: "SC",
            postalCode: "88015-440",
            addressCountry: "BR",
          },
          geo: { "@type": "GeoCoordinates", latitude: -27.5954, longitude: -48.548 },
          areaServed: [
            "Centro - Florianópolis","Beira Mar Norte","Agronômica","Jurerê Tradicional","Jurerê Internacional",
            "Praia Brava","João Paulo","Cacupé","Santo Antônio de Lisboa","Itacorubi","Trindade","Santa Mônica",
            "Córrego Grande","Lagoa da Conceição","Canto da Lagoa","Campeche","Novo Campeche","Rio Tavares","Morro das Pedras",
          ].map((n) => ({ "@type": "Place", name: `${n}, Florianópolis - SC` })),
          knowsAbout: [
            "Imóveis de alto padrão","Apartamentos de luxo","Coberturas","Casas em condomínio fechado",
            "Lançamentos imobiliários","Imóveis frente mar","Investimento imobiliário em Florianópolis",
          ],
          identifier: [
            { "@type": "PropertyValue", name: "CRECI", value: "69502" },
            { "@type": "PropertyValue", name: "CRECI-J", value: "11463J" },
          ],
          memberOf: { "@type": "Organization", name: "Gralha Imóveis" },
          sameAs: ["https://www.instagram.com/michele.prietsch"],
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ImageProtection />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <CookieConsent />
    </QueryClientProvider>
  );
}
