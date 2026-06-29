import { ArrowRight, MapPin, ShieldCheck, Star } from "lucide-react";
import heroImg from "@/assets/hero-beiramar.jpg";
import heroImg2 from "@/assets/hero-beiramar-2.jpg";
import heroImg3 from "@/assets/hero-beiramar-3.jpg";
import heroImg4 from "@/assets/hero-beiramar-4.jpg";
import portrait from "@/assets/michele-portrait.jpg";

/** Conjunto de imagens animadas (Ken Burns + cross-fade) do hero. */
const HERO_IMAGES = [
  { src: heroImg, alt: "Imóvel de alto padrão em Florianópolis com vista para o mar", anim: "animate-hero-fade-a", priority: true as const },
  { src: heroImg3, alt: "Skyline da Beira-Mar Norte ao entardecer", anim: "animate-hero-fade-b", priority: false as const },
  { src: heroImg4, alt: "Orla da Beira-Mar Norte com edifícios à beira da baía", anim: "animate-hero-fade-d", priority: false as const },
  { src: heroImg2, alt: "Vista aérea da Beira-Mar Norte em Florianópolis", anim: "animate-hero-fade-c", priority: false as const },
];

export function Hero() {
  return (
    <section id="top" className="relative px-3 sm:px-5 pt-3">
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px]">
        <div className="relative h-[78vh] min-h-[520px] sm:h-[88vh] sm:min-h-[600px] w-full overflow-hidden">
          {HERO_IMAGES.map((img, i) => (
            <img
              key={img.src}
              src={img.src}
              alt={i === 0 ? img.alt : ""}
              aria-hidden={i === 0 ? undefined : "true"}
              width={1920}
              height={1280}
              loading={img.priority ? undefined : "lazy"}
              fetchPriority={img.priority ? "high" : "low"}
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover origin-center ${img.anim} will-change-transform motion-reduce:animate-none ${i === 0 ? "" : "motion-reduce:opacity-0"}`}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/70" />

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
            <div className="max-w-2xl text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs uppercase tracking-[0.18em] ring-1 ring-white/20">
                <MapPin className="h-3.5 w-3.5" /> Florianópolis · Alto padrão
              </span>
              <h1 className="mt-6 font-display font-light leading-[0.95] tracking-tight text-[clamp(3rem,8vw,6.5rem)]">
                Michele<br />
                <span className="italic">dos Imóveis.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base sm:text-lg text-white/85">
                Imóveis de alto padrão nos melhores endereços de Florianópolis —
                de Jurerê Internacional à Lagoa da Conceição, da Beira Mar Norte
                ao Campeche. Curadoria, discrição e atendimento sob medida.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#imoveis"
                  className="group inline-flex items-center gap-3 rounded-full bg-white text-foreground pl-6 pr-2 py-2 text-sm font-medium hover:bg-white/95 transition"
                >
                  Explorar imóveis
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background group-hover:translate-x-0.5 transition">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
                <a
                  href="#sobre"
                  className="text-sm text-white/90 underline-offset-4 hover:underline px-2 py-2"
                >
                  Conheça a corretora
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Card flutuante da corretora */}
        <div className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 hidden sm:flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur px-4 py-3 shadow-2xl ring-1 ring-black/5">
          <img src={portrait} alt="Michele Prietsch" width={56} height={56} className="h-14 w-14 rounded-full object-cover" />
          <div>
            <div className="text-sm font-medium text-foreground">Michele Prietsch</div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <span className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </span>
              <span className="ml-1">5,0 · CRECI/SC</span>
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
              <ShieldCheck className="h-3 w-3" /> Corretora associada · Gralha Imóveis
            </div>
          </div>
        </div>
      </div>

      <TrustStrip />
    </section>
  );
}

function TrustStrip() {
  return (
    <div className="mx-auto max-w-7xl mt-8 sm:mt-10">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 rounded-2xl bg-secondary/60 ring-1 ring-black/5 px-6 py-5 text-center sm:text-left">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-600/20">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Atendimento Certificado</div>
          <div className="mt-1 font-display text-lg sm:text-xl tracking-tight">
            Corretora associada à <span className="italic">Gralha Imóveis</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground max-w-xl">
            Respaldo de uma das imobiliárias mais tradicionais de Florianópolis —
            segurança jurídica, curadoria e portfólio exclusivo.
          </p>
        </div>
      </div>
    </div>
  );
}
