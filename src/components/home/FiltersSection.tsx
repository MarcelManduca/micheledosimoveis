import { PropertyFilters } from "@/components/PropertyFilters";

export function FiltersSection() {
  return (
    <section id="filtros" className="mx-auto max-w-7xl px-6 sm:px-10 pt-20 sm:pt-28">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Pesquisa de imóveis
        </div>
        <h2 className="mt-3 font-display font-light text-3xl sm:text-4xl tracking-tight">
          Encontre o imóvel <span className="italic">ideal para você.</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Filtre por tipo, bairro, dormitórios e faixa de preço.
        </p>
      </div>
      <div className="mt-8">
        <PropertyFilters />
      </div>
    </section>
  );
}
