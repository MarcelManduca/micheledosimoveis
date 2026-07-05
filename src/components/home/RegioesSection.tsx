import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { REGIOES } from "@/lib/site-config";

// BorderGlow (CSS+JS) só é carregado quando a seção fica próxima da viewport,
// mantendo o path crítico do mobile leve. Fallback = mesmo container sem efeito.
const BorderGlow = lazy(() => import("@/components/BorderGlow"));

function PlainCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="h-full rounded-[18px] bg-card ring-1 ring-black/5"
      style={{ borderRadius: 18 }}
    >
      {children}
    </div>
  );
}

function useNearViewport(rootMargin = "400px") {
  const ref = useRef<HTMLDivElement | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (near) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setNear(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, rootMargin]);
  return { ref, near };
}

export function RegioesSection() {
  const { ref, near } = useNearViewport("400px");
  const [expanded, setExpanded] = useState(false);
  const INITIAL_MOBILE = 6;
  return (
    <section id="regioes" ref={ref} className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-16 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Onde a Michele atua
            </div>
            <h2 className="mt-3 font-display font-light text-3xl sm:text-5xl tracking-tight">
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

        <ul className="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REGIOES.map((r, idx) => {
            const hiddenOnMobile = !expanded && idx >= INITIAL_MOBILE;
            const linkContent = (
              <Link
                to="/imoveis/$slug"
                params={{ slug: r.slug }}
                className="group flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 transition"
              >
                <span className="mt-0.5 grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 ring-1 ring-black/5">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-display text-base sm:text-lg tracking-tight">{r.nome}</span>
                  <span className="hidden sm:block text-xs text-muted-foreground mt-0.5">{r.desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 mt-1.5 sm:mt-2 shrink-0 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
              </Link>
            );
            return (
              <li
                key={r.slug}
                className={`h-full ${hiddenOnMobile ? "hidden sm:block" : ""}`}
              >
                {near ? (
                  <Suspense fallback={<PlainCard>{linkContent}</PlainCard>}>
                    <BorderGlow
                      className="h-full"
                      edgeSensitivity={18}
                      glowColor="38 55 60"
                      backgroundColor="hsl(var(--card))"
                      borderRadius={18}
                      glowRadius={14}
                      glowIntensity={0.55}
                      coneSpread={18}
                      colors={["#c8a96a", "#e8d3a8", "#8c6b3a"]}
                      fillOpacity={0.22}
                    >
                      {linkContent}
                    </BorderGlow>
                  </Suspense>
                ) : (
                  <PlainCard>{linkContent}</PlainCard>
                )}
              </li>
            );
          })}
        </ul>

        {REGIOES.length > INITIAL_MOBILE && (
          <div className="mt-5 flex justify-center sm:hidden">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full ring-1 ring-foreground/15 px-5 py-2.5 text-sm hover:bg-secondary transition"
            >
              {expanded
                ? "Ver menos bairros"
                : `Ver mais ${REGIOES.length - INITIAL_MOBILE} bairros`}
              <ArrowRight
                className={`h-4 w-4 transition-transform ${expanded ? "-rotate-90" : "rotate-90"}`}
              />
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            to="/imoveis"
            className="inline-flex items-center gap-2 rounded-full ring-1 ring-foreground/15 px-5 py-2.5 text-sm hover:bg-secondary transition"
          >
            Ver todos os bairros
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

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
