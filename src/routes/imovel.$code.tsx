import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPropertyByCode } from "@/lib/properties.functions";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Check,
  MapPin,
  Maximize,
  Car,
} from "lucide-react";

export const Route = createFileRoute("/imovel/$code")({
  loader: async ({ params }) => {
    const result = await getPropertyByCode({ data: { code: params.code } });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.property.title} · Michele Prietsch` },
          { name: "description", content: loaderData.property.description?.slice(0, 160) ?? "" },
          { property: "og:title", content: loaderData.property.title },
          { property: "og:image", content: loaderData.property.cover_image ?? "" },
        ]
      : [],
  }),
  component: PropertyPage,
});

function brl(n: number | null) {
  if (n == null) return "Sob consulta";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function PropertyPage() {
  const { property: p, photos } = Route.useLoaderData();
  const whatsappText = encodeURIComponent(
    `Olá Michele! Tenho interesse no imóvel cód. ${p.code} — ${p.title}. ${typeof window !== "undefined" ? window.location.href : ""}`,
  );
  const whatsapp = `https://api.whatsapp.com/send?phone=5548999999999&text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 py-5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar para Michele dos Imóveis
          </Link>
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium hover:bg-foreground/90 transition"
          >
            Falar com Michele
          </a>
        </div>
      </header>

      {/* Gallery */}
      <section className="mx-auto max-w-6xl px-6 sm:px-10 pt-6">
        {photos.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2 sm:aspect-[16/8] rounded-3xl overflow-hidden">
            <img
              src={photos[0]?.url ?? p.cover_image ?? ""}
              alt={p.title}
              className="sm:col-span-2 sm:row-span-2 h-full w-full object-cover aspect-[4/3]"
            />
            {photos.slice(1, 5).map((ph) => (
              <img
                key={ph.url}
                src={ph.url}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover aspect-[4/3] hidden sm:block"
              />
            ))}
          </div>
        ) : (
          p.cover_image && (
            <img
              src={p.cover_image}
              alt={p.title}
              className="w-full aspect-[16/9] object-cover rounded-3xl"
            />
          )
        )}
      </section>

      {/* Body */}
      <section className="mx-auto max-w-6xl px-6 sm:px-10 py-10 grid gap-12 lg:grid-cols-[1.7fr,1fr]">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Cód. {p.code}
            {p.property_type ? ` · ${p.property_type}` : ""}
          </div>
          <h1 className="mt-3 font-display font-light text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            {p.title}
          </h1>
          <div className="mt-4 flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {[p.neighborhood, p.city, p.state].filter(Boolean).join(", ")}
              {p.condo_name ? ` · ${p.condo_name}` : ""}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            {p.area_m2 != null && (
              <Spec icon={<Maximize className="h-4 w-4" />} label={`${p.area_m2} m²`} />
            )}
            {p.bedrooms != null && (
              <Spec
                icon={<BedDouble className="h-4 w-4" />}
                label={`${p.bedrooms} dorm.${p.suites ? ` (${p.suites} suítes)` : ""}`}
              />
            )}
            {p.bathrooms != null && (
              <Spec icon={<Bath className="h-4 w-4" />} label={`${p.bathrooms} banheiros`} />
            )}
            {p.parking_spots != null && (
              <Spec icon={<Car className="h-4 w-4" />} label={`${p.parking_spots} vagas`} />
            )}
          </div>

          {p.description && (
            <div className="mt-10">
              <h2 className="font-display text-2xl tracking-tight">Sobre este imóvel</h2>
              <p className="mt-4 whitespace-pre-line text-muted-foreground leading-relaxed">
                {p.description}
              </p>
            </div>
          )}

          {p.features.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl tracking-tight">Diferenciais do imóvel</h2>
              <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="inline-flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {p.condo_features.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl tracking-tight">Estrutura do condomínio</h2>
              <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
                {p.condo_features.map((f) => (
                  <li key={f} className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-foreground/70" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {photos.length > 5 && (
            <div className="mt-12">
              <h2 className="font-display text-2xl tracking-tight">Galeria completa</h2>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.slice(5).map((ph) => (
                  <img
                    key={ph.url}
                    src={ph.url}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover rounded-xl"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-8 self-start">
          <div className="rounded-3xl bg-card ring-1 ring-black/5 p-6 shadow-xl">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Valor de venda
            </div>
            <div className="mt-2 font-display text-4xl">{brl(p.price_brl)}</div>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              {p.condo_fee_brl != null && <div>Condomínio: {brl(p.condo_fee_brl)}/mês</div>}
              {p.iptu_brl != null && <div>IPTU: {brl(p.iptu_brl)}/mês</div>}
            </div>
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-6 block w-full text-center rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/90 transition"
            >
              Falar com Michele pelo WhatsApp
            </a>
            <a
              href="tel:+5548999999999"
              className="mt-3 block w-full text-center rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-secondary transition"
            >
              Ligar agora
            </a>
            {p.address && (
              <div className="mt-6 pt-6 border-t border-border text-sm">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Endereço
                </div>
                {p.address}
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-foreground">
      {icon}
      {label}
    </span>
  );
}
