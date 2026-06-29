import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { REGIOES } from "@/lib/site-config";

export function RegioesSection() {
  return (
    <section id="regioes" className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-24 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Onde a Michele atua
            </div>
            <h2 className="mt-3 font-display font-light text-4xl sm:text-5xl tracking-tight">
              Os melhores endereços de <span className="italic">Florianópolis.</span>
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Cobertura completa nos bairros e praias mais valorizados da Ilha de
              Santa Catarina — do Norte ao Sul, da orla à reserva. Conheço cada
              rua, cada empreendimento e cada vista. Selecione a região do seu
              interesse e receba opções sob medida.
            </p>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REGIOES.map((r) => (
            <li key={r.slug}>
              <Link
                to="/imoveis/$slug"
                params={{ slug: r.slug }}
                className="group flex items-start gap-4 rounded-2xl bg-card ring-1 ring-black/5 px-5 py-4 hover:shadow-lg hover:ring-black/10 transition"
              >
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 ring-1 ring-black/5">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="block font-display text-lg tracking-tight">{r.nome}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{r.desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 mt-2 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-muted-foreground text-center max-w-3xl mx-auto">
          Imóveis de alto padrão em Florianópolis: apartamentos frente mar,
          coberturas duplex, casas em condomínio fechado e lançamentos
          exclusivos em Jurerê Internacional, Jurerê Tradicional, Praia Brava,
          Beira Mar Norte, Agronômica, João Paulo, Cacupé, Santo Antônio de
          Lisboa, Itacorubi, Trindade, Santa Mônica, Córrego Grande, Lagoa da
          Conceição, Canto da Lagoa, Campeche, Novo Campeche, Rio Tavares e
          Morro das Pedras.
        </p>
      </div>
    </section>
  );
}
