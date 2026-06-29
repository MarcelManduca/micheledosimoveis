import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { getPropertyByCode } from "@/lib/properties.functions";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CalendarCheck } from "lucide-react";

const LeafletMap = lazy(() => import("@/components/LeafletMap"));

type Photo = { url: string; position: number };
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
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
      : [{ title: "Imóvel · Michele Prietsch" }],
  }),
  component: PropertyPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-6 text-center">
      <div>
        <h1 className="font-display text-3xl">Imóvel não encontrado</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          O link pode ter expirado ou o imóvel foi removido.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm underline">
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen grid place-items-center px-6 text-center">
      <div>
        <h1 className="font-display text-3xl">Algo deu errado</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-6 text-sm underline">
          Tentar novamente
        </button>
      </div>
    </div>
  ),
});

function brl(n: number | null) {
  if (n == null) return "Sob consulta";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function PropertyPage() {
  const { property: p, photos } = Route.useLoaderData();
  const photoList = photos as Photo[];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const open = lightboxIndex !== null;

  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null ? i : (i - 1 + photoList.length) % photoList.length,
      ),
    [photoList.length],
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i + 1) % photoList.length)),
    [photoList.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  const whatsappText = encodeURIComponent(
    `Olá Michele! Tenho interesse no imóvel cód. ${p.code} — ${p.title}. ${typeof window !== "undefined" ? window.location.href : ""}`,
  );
  const whatsapp = `https://api.whatsapp.com/send?phone=5548999999999&text=${whatsappText}`;

  const mapQuery = [p.address, p.neighborhood, p.city, p.state]
    .filter(Boolean)
    .join(", ");
  const hasMap = mapQuery.length > 0;

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
        {photoList.length > 0 ? (
          <div className="relative grid gap-2 sm:grid-cols-4 sm:grid-rows-2 sm:aspect-[16/8] rounded-3xl overflow-hidden">
            <button
              type="button"
              onClick={() => setLightboxIndex(0)}
              className="sm:col-span-2 sm:row-span-2 h-full w-full overflow-hidden group"
              aria-label="Abrir galeria"
            >
              <img
                src={photoList[0]?.url ?? p.cover_image ?? ""}
                alt={p.title}
                className="h-full w-full object-cover aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500"
              />
            </button>
            {photoList.slice(1, 5).map((ph, i) => (
              <button
                type="button"
                key={ph.url}
                onClick={() => setLightboxIndex(i + 1)}
                className="h-full w-full overflow-hidden hidden sm:block group"
                aria-label={`Abrir foto ${i + 2}`}
              >
                <img
                  src={ph.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500"
                />
              </button>
            ))}
            {photoList.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(0)}
                className="absolute bottom-4 right-4 rounded-full bg-background/95 backdrop-blur px-4 py-2 text-xs font-medium shadow-md hover:bg-background transition"
              >
                Ver todas as {photoList.length} fotos
              </button>
            )}
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

      {/* CTAs */}
      <section className="mx-auto max-w-6xl px-6 sm:px-10 pt-6">
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://api.whatsapp.com/send?phone=5548991828828&text=${encodeURIComponent(
              `Olá Michele! Gostaria de agendar uma visita ao imóvel cód. ${p.code} — ${p.title}.`,
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/90 transition"
          >
            <CalendarCheck className="h-4 w-4" />
            Agendar visita
          </a>
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-secondary transition"
          >
            Tirar dúvidas no WhatsApp
          </a>
        </div>
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
                {(p.features as string[]).map((f: string) => (
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
                {(p.condo_features as string[]).map((f: string) => (
                  <li key={f} className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-foreground/70" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasMap && (
            <div className="mt-12">
              <h2 className="font-display text-2xl tracking-tight">Localização</h2>
              <p className="mt-2 text-sm text-muted-foreground">{mapQuery}</p>
              <div className="mt-4 overflow-hidden rounded-3xl ring-1 ring-black/5">
                <Suspense
                  fallback={
                    <div className="w-full h-[360px] sm:h-[420px] bg-secondary grid place-items-center text-sm text-muted-foreground">
                      Carregando mapa…
                    </div>
                  }
                >
                  <LeafletMap query={mapQuery} title={p.title} />
                </Suspense>
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

      {/* Lightbox */}
      <Dialog open={open} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-6xl w-[95vw] p-0 bg-black/95 border-none text-white">
          {lightboxIndex !== null && (
            <div className="flex flex-col">
              <div className="relative flex items-center justify-center h-[70vh] bg-black">
                <img
                  src={photoList[lightboxIndex].url}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                />
                {photoList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prev}
                      aria-label="Foto anterior"
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur p-3 transition"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      aria-label="Próxima foto"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur p-3 transition"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs bg-black/60 px-3 py-1 rounded-full">
                  {lightboxIndex + 1} / {photoList.length}
                </div>
              </div>
              {photoList.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3 bg-black/80">
                  {photoList.map((ph, i) => (
                    <button
                      type="button"
                      key={ph.url}
                      onClick={() => setLightboxIndex(i)}
                      aria-label={`Ver foto ${i + 1}`}
                      className={`flex-shrink-0 overflow-hidden rounded-md ring-2 transition ${
                        i === lightboxIndex ? "ring-white" : "ring-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={ph.url}
                        alt=""
                        loading="lazy"
                        className="h-16 w-24 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
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
