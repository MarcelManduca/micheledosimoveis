import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Home, Sparkles } from "lucide-react";
import type { LaunchRelated } from "@/lib/launches-related";
import type { PublicDevelopmentCard } from "@/lib/launches-public";
import { LaunchCard } from "@/components/launches/LaunchCard";
import { brl } from "@/lib/format";

const cardBase =
  "group flex items-start gap-3 rounded-2xl bg-card ring-1 ring-black/5 px-5 py-4 hover:shadow-md hover:ring-black/10 transition";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-xl tracking-tight sm:text-2xl">{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Row({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string | null;
}) {
  return (
    <>
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 ring-1 ring-black/5">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block font-display text-lg tracking-tight">{title}</span>
        {desc ? <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span> : null}
      </span>
      <ArrowRight className="mt-2 h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
    </>
  );
}

export function LaunchRelatedSection({
  related,
  developerName,
}: {
  related: LaunchRelated;
  developerName?: string | null;
}) {
  const {
    bairro,
    typesInBairro,
    condominiums,
    neighborhoodLaunches,
    developerLaunches,
    properties,
  } = related;

  const hasAny =
    typesInBairro.length +
      condominiums.length +
      neighborhoodLaunches.length +
      developerLaunches.length +
      properties.length >
    0;
  if (!hasAny) return null;

  const launchList = (items: PublicDevelopmentCard[]) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <LaunchCard key={item.id} item={item} />
      ))}
    </div>
  );

  return (
    <section
      aria-label="Você também pode gostar"
      className="mt-16 border-t border-black/5 bg-secondary/30"
    >
      <div className="space-y-12 px-0 py-12">
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
          Você também pode gostar
        </h2>

        {typesInBairro.length > 0 && bairro ? (
          <Block title={`Imóveis à venda em ${bairro}`}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {typesInBairro.map((t) => (
                <li key={t.tipo}>
                  <a
                    href={`/buscar?tipo=${encodeURIComponent(t.tipo)}&bairro=${encodeURIComponent(t.bairro)}`}
                    className={cardBase}
                  >
                    <Row
                      icon={<Home className="h-4 w-4" />}
                      title={`${t.label} em ${bairro}`}
                      desc={`${t.count} ${t.count === 1 ? "opção disponível" : "opções disponíveis"}`}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </Block>
        ) : null}

        {condominiums.length > 0 ? (
          <Block title={`Condomínios ${bairro ? `em ${bairro}` : "relacionados"}`}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {condominiums.map((c) => (
                <li key={c.slug}>
                  <Link to="/condominio/$slug" params={{ slug: c.slug }} className={cardBase}>
                    <Row icon={<Building2 className="h-4 w-4" />} title={c.name} desc={c.address} />
                  </Link>
                </li>
              ))}
            </ul>
          </Block>
        ) : null}

        {neighborhoodLaunches.length > 0 ? (
          <Block title={`Outros lançamentos ${bairro ? `em ${bairro}` : "próximos"}`}>
            {launchList(neighborhoodLaunches)}
          </Block>
        ) : null}

        {developerLaunches.length > 0 ? (
          <Block title={`Empreendimentos ${developerName ? `da ${developerName}` : "da mesma construtora"}`}>
            {launchList(developerLaunches)}
          </Block>
        ) : null}

        {properties.length > 0 && bairro ? (
          <Block title={`Selecionados em ${bairro}`}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <li key={p.code}>
                  <Link to="/imovel/$code" params={{ code: p.code }} className={cardBase}>
                    <Row
                      icon={<Sparkles className="h-4 w-4" />}
                      title={p.title}
                      desc={[
                        p.bedrooms ? `${p.bedrooms} dorm.` : null,
                        p.area_m2 ? `${Math.round(p.area_m2)} m²` : null,
                        brl(p.price_brl),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Block>
        ) : null}
      </div>
    </section>
  );
}
