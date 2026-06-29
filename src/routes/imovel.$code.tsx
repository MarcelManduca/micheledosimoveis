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
  Send,
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
  const whatsapp = `https://api.whatsapp.com/send?phone=5548991828828&text=${whatsappText}`;
  const [scheduleOpen, setScheduleOpen] = useState(false);

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
          <button
            type="button"
            onClick={() => setScheduleOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/90 transition"
          >
            <CalendarCheck className="h-4 w-4" />
            Agendar visita
          </button>
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
              href="tel:+5548991828828"
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

      <ScheduleVisitDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        propertyCode={p.code}
        propertyTitle={p.title}
      />

      {/* Floating WhatsApp */}
      <a
        href={whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com Michele no WhatsApp"
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white pl-4 pr-5 py-3 text-sm font-medium shadow-2xl ring-1 ring-black/10 hover:bg-[#1ebe57] transition"
      >
        <span className="relative grid h-6 w-6 place-items-center">
          <span className="absolute inset-0 rounded-full bg-white/40 animate-ping" />
          <svg viewBox="0 0 32 32" className="relative h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M19.11 17.27c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47l-.52-.01c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.34.97 2.63 1.11 2.81.14.18 1.91 2.91 4.62 4.08.65.28 1.15.45 1.55.58.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32zM16.01 4C9.39 4 4 9.39 4 16.01c0 2.12.56 4.19 1.62 6.01L4 28l6.16-1.61a11.94 11.94 0 0 0 5.84 1.5h.01C22.62 27.89 28 22.5 28 15.88 28 9.27 22.63 4 16.01 4z" />
          </svg>
        </span>
        <span>WhatsApp</span>
      </a>
    </div>
  );
}

const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const PERIODS: Array<{ id: string; label: string; range: string }> = [
  { id: "manha", label: "Manhã", range: "09h–12h" },
  { id: "tarde", label: "Tarde", range: "13h–17h" },
  { id: "noite", label: "Noite", range: "18h–20h" },
];

function buildVisitDays(count = 14) {
  const days: Array<{ key: string; date: Date; weekday: string; day: number; month: string; isWeekend: boolean }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const wd = d.getDay();
    days.push({
      key: d.toISOString().slice(0, 10),
      date: d,
      weekday: WEEKDAYS_SHORT[wd],
      day: d.getDate(),
      month: MONTHS_SHORT[d.getMonth()],
      isWeekend: wd === 0 || wd === 6,
    });
  }
  return days;
}

function ScheduleVisitDialog({
  open,
  onOpenChange,
  propertyCode,
  propertyTitle,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  propertyCode: string;
  propertyTitle: string;
}) {
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [periodId, setPeriodId] = useState<string | null>(null);
  const days = buildVisitDays(14);
  const selectedDay = days.find((d) => d.key === dayKey) ?? null;
  const selectedPeriod = PERIODS.find((p) => p.id === periodId) ?? null;
  const canSend = !!(selectedDay && selectedPeriod);

  const sendHref = canSend
    ? `https://api.whatsapp.com/send?phone=5548991828828&text=${encodeURIComponent(
        `Olá Michele! Gostaria de agendar uma visita ao imóvel cód. ${propertyCode} — ${propertyTitle}.\n` +
          `Data: ${selectedDay!.weekday}, ${selectedDay!.day} de ${selectedDay!.month}.\n` +
          `Turno: ${selectedPeriod!.label} (${selectedPeriod!.range}).`,
      )}`
    : "#";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Agendar visita · Cód. {propertyCode}
          </div>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl tracking-tight">
            Escolha o melhor dia e turno
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A confirmação é feita diretamente com Michele pelo WhatsApp.
          </p>

          <div className="mt-6">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Dia
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {days.map((d) => {
                const selected = d.key === dayKey;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDayKey(d.key)}
                    className={`flex-shrink-0 w-16 rounded-2xl border px-2 py-3 text-center transition ${
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <div className={`text-[10px] uppercase tracking-wider ${selected ? "opacity-80" : "text-muted-foreground"}`}>
                      {d.weekday}
                    </div>
                    <div className="mt-1 font-display text-xl leading-none">{d.day}</div>
                    <div className={`mt-1 text-[10px] uppercase ${selected ? "opacity-80" : "text-muted-foreground"}`}>
                      {d.month}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Turno
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PERIODS.map((pr) => {
                const selected = pr.id === periodId;
                return (
                  <button
                    key={pr.id}
                    type="button"
                    onClick={() => setPeriodId(pr.id)}
                    className={`rounded-2xl border px-3 py-3 text-center transition ${
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <div className="text-sm font-medium">{pr.label}</div>
                    <div className={`text-[11px] ${selected ? "opacity-80" : "text-muted-foreground"}`}>
                      {pr.range}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {canSend
                ? `${selectedDay!.weekday}, ${selectedDay!.day} de ${selectedDay!.month} · ${selectedPeriod!.label}`
                : "Selecione dia e turno para continuar."}
            </div>
            <a
              href={sendHref}
              target={canSend ? "_blank" : undefined}
              rel="noreferrer"
              aria-disabled={!canSend}
              onClick={(e) => {
                if (!canSend) e.preventDefault();
                else onOpenChange(false);
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition ${
                canSend
                  ? "bg-[#25D366] text-white hover:bg-[#1ebe57]"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Send className="h-4 w-4" />
              Enviar pelo WhatsApp
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
