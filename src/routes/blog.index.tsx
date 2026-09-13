import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteFooter } from "@/components/home/SiteFooter";
import { ARTICLE_PATH } from "@/lib/blog/beira-mar-media";
import hero from "@/assets/hero-beiramar-1280.webp";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog | Michele dos Imóveis" },
      {
        name: "description",
        content: "Guias sobre condomínios, bairros e imóveis de alto padrão em Florianópolis.",
      },
    ],
    links: [{ rel: "canonical", href: "https://micheledosimoveis.com.br/blog" }],
  }),
  component: () => (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Michele dos Imóveis
        </Link>
        <p className="mt-16 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Guias & endereços
        </p>
        <h1 className="mt-4 font-display text-5xl">Um olhar sobre Florianópolis.</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Condomínios, arquitetura e critérios para encontrar seu próximo endereço.
        </p>
        <Link
          to={ARTICLE_PATH}
          className="group my-12 block overflow-hidden rounded-2xl border border-border"
        >
          <img
            src={hero}
            width="1280"
            height="853"
            alt="Beira-Mar Norte, Florianópolis"
            className="aspect-[16/7] w-full object-cover"
          />
          <div className="p-6 sm:p-9">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Condomínios · Florianópolis
            </p>
            <h2 className="mt-3 font-display text-3xl">
              Condomínios de luxo na Beira-Mar Norte e Agronômica
            </h2>
            <p className="mt-4 text-muted-foreground">
              La Perle, Acqua, Simphonia WOA e outros endereços para conhecer, com fotografias e
              critérios de comparação.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
              Explorar o guia <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
});
