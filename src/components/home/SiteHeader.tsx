import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { WHATSAPP_URL } from "@/lib/site-config";
import logoWhite from "@/assets/brand/logo-white.webp";
import logoDark from "@/assets/brand/logo-dark.webp";

const NAV_LINKS: Array<[string, string]> = [
  ["#top", "Início"],
  ["#imoveis", "Imóveis"],
  ["#regioes", "Regiões"],
  ["#sobre", "Sobre"],
  ["#contato", "Contato"],
];

/**
 * Header transparente sobre o hero + drawer mobile.
 * Estado de abertura é encapsulado aqui — o componente é autocontido.
 */
export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-30">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 flex items-center justify-between gap-3">
          <a href="#top" className="flex items-center min-w-0 shrink">
            <span className="sr-only">Michele dos Imóveis</span>
            <img
              src={logoWhite}
              alt="Michele dos Imóveis"
              width={640}
              height={237}
              fetchPriority="high"
              decoding="async"
              className="h-7 sm:h-9 md:h-10 w-auto max-w-[55vw] sm:max-w-none object-contain select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
              draggable={false}
            />
          </a>



          <nav className="hidden md:flex items-center gap-9 text-sm text-white/90">
            <a href="#top" className="hover:text-white transition">Início</a>
            <a href="#imoveis" className="hover:text-white transition">Imóveis</a>
            <a href="#regioes" className="hover:text-white transition">Regiões</a>
            <Link to="/anuncie" className="hover:text-white transition">Anuncie</Link>
            <a href="#sobre" className="hover:text-white transition">Sobre</a>
            <a href="#contato" className="hover:text-white transition">Contato</a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background pl-4 pr-2 py-2 text-sm font-medium shadow-lg hover:bg-foreground/90 transition"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              <span className="hidden sm:inline">Receber atendimento</span>
              <span className="sm:hidden">Atendimento</span>
              <span className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-background text-foreground group-hover:translate-x-0.5 transition">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur ring-1 ring-white/20 hover:bg-white/25 transition"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[82%] max-w-xs bg-background shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <img src={logoDark} alt="Michele dos Imóveis" width={640} height={237} loading="lazy" decoding="async" className="h-6 sm:h-7 w-auto max-w-[60%] object-contain" draggable={false} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-secondary hover:bg-secondary/70 transition"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-1 text-base">
              {NAV_LINKS.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 border-b border-border/60 hover:text-accent transition"
                >
                  {label}
                </a>
              ))}
              <Link
                to="/anuncie"
                onClick={() => setMobileOpen(false)}
                className="py-3 border-b border-border/60 hover:text-accent transition"
              >
                Anuncie seu imóvel
              </Link>
              <Link
                to="/buscar"
                onClick={() => setMobileOpen(false)}
                className="py-3 border-b border-border/60 hover:text-accent transition"
              >
                Buscar imóveis
              </Link>
            </nav>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="m-6 inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium hover:bg-foreground/90 transition"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
