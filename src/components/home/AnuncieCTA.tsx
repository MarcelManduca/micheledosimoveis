import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export function AnuncieCTA() {
  return (
    <section id="anuncie" className="mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-28">
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0b0b0b] text-background p-10 sm:p-16 ring-1 ring-[#C8A464]/30">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#C8A464]/15 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.4fr,1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C8A464]/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#E6C68A] ring-1 ring-[#C8A464]/30">
              <Sparkles className="h-3.5 w-3.5" /> Para proprietários
            </div>
            <h2 className="mt-5 font-display font-light text-3xl sm:text-5xl leading-[1.05] tracking-tight">
              Anuncie seu imóvel com <span className="italic text-[#E6C68A]">curadoria de alto padrão.</span>
            </h2>
            <p className="mt-5 max-w-xl text-background/75 leading-relaxed">
              Venda com estratégia, discrição e acesso aos compradores certos. Precificação,
              produção visual profissional, divulgação qualificada e a opção de venda{" "}
              <strong className="text-background font-medium">Off Market</strong> sigilosa.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
            <Link
              to="/anuncie"
              className="group inline-flex items-center justify-between gap-3 rounded-full bg-[#C8A464] text-black pl-6 pr-2 py-3 text-sm font-medium hover:bg-[#d4b478] transition"
            >
              Quero anunciar meu imóvel
              <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-[#E6C68A] group-hover:translate-x-0.5 transition">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link
              to="/anuncie"
              className="inline-flex items-center justify-center gap-2 rounded-full ring-1 ring-background/30 text-background/90 px-5 py-3 text-sm hover:bg-background/10 transition"
            >
              Saber mais sobre venda Off Market
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
