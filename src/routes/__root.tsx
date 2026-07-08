import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
// Preload the LATIN variable-font subsets that carry the LCP typography.
// Bundled locally as woff2 (self-hosted) — no third-party font CDN in the
// critical request chain. Vite emits hashed URLs.
import frauncesLatinWoff2 from "@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2?url";
import interTightLatinWoff2 from "@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

// Deferred: not needed for first paint. Cuts initial JS.
const ImageProtection = lazy(() =>
  import("../components/ImageProtection").then((m) => ({ default: m.ImageProtection })),
);
const CookieConsent = lazy(() =>
  import("../components/CookieConsent").then((m) => ({ default: m.CookieConsent })),
);

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
      { property: "og:image", content: "https://micheledosimoveis.com.br/michele-dos-imoveis-og.png" },
      { property: "og:image:secure_url", content: "https://micheledosimoveis.com.br/michele-dos-imoveis-og.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Michele dos Imóveis — imóveis de alto padrão em Florianópolis" },
      { name: "twitter:image", content: "https://micheledosimoveis.com.br/michele-dos-imoveis-og.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      // Preload self-hosted latin variable-font subsets (Fraunces + Inter Tight)
      // so the LCP typography lands in the first flight, without any third-party
      // font stylesheet in the critical chain.
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: frauncesLatinWoff2,
        crossOrigin: "anonymous",
      } as any,
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: interTightLatinWoff2,
        crossOrigin: "anonymous",
      } as any,
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Michele dos Imóveis",
          url: "https://micheledosimoveis.com.br",
          inLanguage: "pt-BR",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://micheledosimoveis.com.br/buscar?bairro={search_term_string}",
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
          name: "Michele Prietsch",
          alternateName: "Michele dos Imóveis",
          brand: { "@type": "Brand", name: "Michele dos Imóveis" },
          description:
            "Corretora de imóveis de alto padrão em Florianópolis. Atuação nos principais bairros e praias da Ilha: Centro/Beira Mar, Agronômica, Jurerê Tradicional, Jurerê Internacional, Praia Brava, João Paulo, Cacupé, Santo Antônio de Lisboa, Itacorubi, Trindade, Santa Mônica, Córrego Grande, Lagoa da Conceição, Canto da Lagoa, Campeche, Novo Campeche, Rio Tavares e Morro das Pedras.",
          url: "https://micheledosimoveis.com.br",
          telephone: "+55-48-99182-8828",
          email: "micheledosimoveis@gmail.com",
          image: "https://micheledosimoveis.com.br/michele-dos-imoveis-og.png",
          logo: "https://micheledosimoveis.com.br/michele-dos-imoveis-og.png",
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
            "Florianópolis","Jurerê Internacional","Beira-Mar Norte","Cacupé","João Paulo",
            "Campeche","Lagoa da Conceição","Praia Brava","Santo Antônio de Lisboa","Novo Campeche",
            "Centro - Florianópolis","Agronômica","Jurerê Tradicional","Itacorubi","Trindade",
            "Santa Mônica","Córrego Grande","Canto da Lagoa","Rio Tavares","Morro das Pedras",
          ].map((n) => ({ "@type": "Place", name: `${n}, Florianópolis - SC` })),
          knowsAbout: [
            "Imóveis de alto padrão","Apartamentos de luxo","Coberturas","Casas em condomínio fechado",
            "Lançamentos imobiliários","Imóveis frente mar","Imóveis off market","Investimento imobiliário em Florianópolis",
          ],
          identifier: [
            { "@type": "PropertyValue", name: "CRECI", value: "69502" },
            { "@type": "PropertyValue", name: "CRECI-J", value: "11463J" },
          ],
          memberOf: { "@type": "Organization", name: "Gralha Imóveis" },
          sameAs: ["https://www.instagram.com/micheledosimoveis", "https://www.youtube.com/@micheledosimoveis"],
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
      <Suspense fallback={null}>
        <ImageProtection />
      </Suspense>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Suspense fallback={null}>
        <CookieConsent />
      </Suspense>
    </QueryClientProvider>

  );
}
