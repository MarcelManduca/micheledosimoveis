import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X, Youtube } from "lucide-react";
import { YOUTUBE_SHORTS, type YouTubeShort } from "@/lib/youtube-shorts";
import { SITE } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function YouTubeShorts() {
  const shorts = YOUTUBE_SHORTS;
  const total = shorts.length;
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<YouTubeShort | null>(null);

  const go = useCallback(
    (dir: number) => setActive((i) => (i + dir + total) % total),
    [total],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // swipe
  const [touchX, setTouchX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    setTouchX(null);
  };

  return (
    <section
      id="shorts"
      aria-labelledby="shorts-title"
      className="mx-auto max-w-7xl px-6 sm:px-10 py-16 sm:py-24"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Canal no YouTube
          </div>
          <h2
            id="shorts-title"
            className="mt-2 font-display text-3xl sm:text-4xl tracking-tight"
          >
            Shorts de <span className="italic">Michele dos Imóveis</span>
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Recortes reais de imóveis apresentados por Michele em Florianópolis.
          </p>
        </div>
        <a
          href={SITE.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:border-foreground/40 transition"
        >
          <Youtube className="h-4 w-4" />
          Ver canal completo
        </a>
      </div>

      <div
        className="relative mt-12 select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Stage */}
        <div className="relative mx-auto h-[520px] sm:h-[560px] md:h-[600px] w-full overflow-hidden">
          {shorts.map((s, i) => {
            // signed distance on ring
            let d = i - active;
            if (d > total / 2) d -= total;
            if (d < -total / 2) d += total;
            const abs = Math.abs(d);
            if (abs > 2) return null;

            const isCenter = d === 0;
            // layout by distance
            const translate = d * 62; // % of half-width offset
            const scale = isCenter ? 1 : abs === 1 ? 0.72 : 0.55;
            const opacity = isCenter ? 1 : abs === 1 ? 0.55 : 0.25;
            const z = 10 - abs;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => (isCenter ? setOpen(s) : setActive(i))}
                aria-label={
                  isCenter ? `Abrir Short: ${s.title}` : `Ver Short: ${s.title}`
                }
                className={cn(
                  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                  "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 rounded-[28px]",
                )}
                style={{
                  transform: `translate(calc(-50% + ${translate}%), -50%) scale(${scale})`,
                  opacity,
                  zIndex: z,
                }}
                tabIndex={isCenter ? 0 : -1}
              >
                <div
                  className={cn(
                    "relative overflow-hidden rounded-[28px] bg-secondary",
                    "aspect-[9/16] h-[500px] sm:h-[540px] md:h-[580px]",
                    isCenter
                      ? "shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/10"
                      : "shadow-xl ring-1 ring-black/5",
                  )}
                >
                  <img
                    src={s.thumbnail}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
                  {isCenter && (
                    <>
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-foreground shadow-lg transition-transform group-hover:scale-110">
                          <Play className="h-6 w-6 translate-x-[2px] fill-current" />
                        </span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="text-sm text-white/95 line-clamp-2 leading-snug">
                          {s.title}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Arrows */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Anterior"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur ring-1 ring-black/10 shadow-lg hover:bg-white transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Próximo"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur ring-1 ring-black/10 shadow-lg hover:bg-white transition"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {shorts.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ir para Short ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active
                  ? "w-6 bg-foreground"
                  : "w-1.5 bg-foreground/25 hover:bg-foreground/50",
              )}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
          className="fixed inset-0 z-[100] grid place-items-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setOpen(null)}
        >
          <div
            className="relative w-full max-w-[420px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Fechar"
              className="absolute -top-12 right-0 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${open.youtubeId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
                title={open.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <p className="text-sm text-white/90 line-clamp-2 flex-1">
                {open.title}
              </p>
              <a
                href={open.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white/10 text-white text-xs px-3 py-2 ring-1 ring-white/20 hover:bg-white/20 transition"
              >
                <Youtube className="h-3.5 w-3.5" />
                Ver no YouTube
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
