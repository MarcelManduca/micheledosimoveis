import { Link } from "@tanstack/react-router";
import { ShieldCheck, Instagram, Youtube } from "lucide-react";
import { SITE } from "@/lib/site-config";
import logoDark from "@/assets/brand/logo-dark.webp";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-12 grid gap-8 md:grid-cols-4 text-sm text-muted-foreground">
        <div>
          <img
            src={logoDark}
            alt={SITE.brandName}
            width={640}
            height={237}
            loading="lazy"
            decoding="async"
            className="h-8 sm:h-10 w-auto max-w-[220px] object-contain"
            draggable={false}
          />

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" /> Corretora associada · Gralha Imóveis
          </div>

          <div className="mt-5 flex items-center gap-3">
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Michele dos Imóveis"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/80 transition hover:text-foreground hover:border-foreground/40"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={SITE.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Canal do YouTube de Michele dos Imóveis"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/80 transition hover:text-foreground hover:border-foreground/40"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-foreground/70">Credenciais</div>
          <p className="mt-2 leading-relaxed">
            {SITE.brokerName}<br />
            {SITE.creci}
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-foreground/70">Endereço</div>
          <p className="mt-2 leading-relaxed">
            {SITE.address.street}<br />
            {SITE.address.district} · {SITE.address.cityState}
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-foreground/70">Guias e conteúdos</div>
          <ul className="mt-2 space-y-2 leading-relaxed">
            <li>
              <Link
                to="/guia-imoveis-alto-padrao-florianopolis"
                className="text-foreground/80 hover:text-foreground underline-offset-4 hover:underline transition"
              >
                Guia de imóveis de alto padrão em Florianópolis
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} {SITE.brokerName} · Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacidade" className="text-foreground/80 hover:text-foreground underline-offset-4 hover:underline transition">
              Privacidade & LGPD
            </Link>
            <Link to="/auth" className="text-foreground/70 hover:text-foreground underline-offset-4 hover:underline transition">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
