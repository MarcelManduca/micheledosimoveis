import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Rocket } from "lucide-react";
import { ExpandableProperties } from "@/components/properties/ExpandableProperties";
import { listLaunches, type PropertyListItem } from "@/lib/properties.functions";

export function LaunchesAndFeatured({ items }: { items: PropertyListItem[] }) {
  const launches = useQuery({
    queryKey: ["launches-home"],
    queryFn: () => listLaunches(),
    initialData: [] as PropertyListItem[],
  });
  const launchItems = launches.data ?? [];

  return (
    <>
      <section id="imoveis" className="mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Imóveis em destaque
            </div>
            <h2 className="mt-3 font-display font-light text-4xl sm:text-5xl tracking-tight">
              Uma seleção <span className="italic">para morar bem em Floripa.</span>
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground">
            Apartamentos, coberturas, casas e lançamentos selecionados pela
            curadoria de Michele dos Imóveis.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum imóvel marcado como destaque no momento. Veja todos os imóveis na{" "}
            <Link to="/buscar" className="underline">pesquisa</Link>.
          </p>
        ) : (
          <ExpandableProperties items={items} viewAllHref="/buscar" />
        )}
      </section>

      {launchItems.length > 0 && (
        <section id="lancamentos" className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-24">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-700">
                  <Rocket className="h-3.5 w-3.5" /> Lançamentos imobiliários
                </div>
                <h2 className="mt-3 font-display font-light text-4xl sm:text-5xl tracking-tight">
                  Novos empreendimentos em <span className="italic">Florianópolis.</span>
                </h2>
              </div>
              <p className="max-w-sm text-muted-foreground">
                Empreendimentos contemporâneos e oportunidades de investimento em
                lançamentos selecionados nas regiões mais valorizadas da Ilha.
              </p>
            </div>
            <ExpandableProperties items={launchItems} viewAllHref="/buscar" />
          </div>
        </section>
      )}
    </>
  );
}
