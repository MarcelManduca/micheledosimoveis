import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/site-config";
import logoDark from "@/assets/brand/logo-dark.png";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-12 grid gap-8 md:grid-cols-3 text-sm text-muted-foreground">
        <div>
          <img
            src={logoDark}
            alt={SITE.brandName}
            className="h-8 sm:h-10 w-auto max-w-[220px] object-contain"
            draggable={false}
          />

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" /> Corretora associada · Gralha Imóveis
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
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} {SITE.brokerName} · Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacidade" className="text-muted-foreground/80 hover:text-foreground transition">
              Privacidade & LGPD
            </Link>
            <Link to="/auth" className="text-muted-foreground/70 hover:text-foreground transition">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
