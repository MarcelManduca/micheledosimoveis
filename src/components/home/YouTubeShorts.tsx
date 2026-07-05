import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Play, X, Youtube } from "lucide-react";
import { YOUTUBE_SHORTS, type YouTubeShort } from "@/lib/youtube-shorts";
import { SITE } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function YouTubeShorts() {
  const shorts = YOUTUBE_SHORTS;
  const total = shorts.length;
  const [active, setActive] = useState(0);
  const [playingInline, setPlayingInline] = useState(false);
  const [open, setOpen] = useState<YouTubeShort | null>(null);

  const go = useCallback(
    (dir: number) => {
      setPlayingInline(false);
      setActive((i) => (i + dir + total) % total);
    },
    [total],
  );

  const jumpTo = useCallback((i: number) => {
    setPlayingInline(false);
    setActive(i);
  }, []);

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

  // Pointer drag (mouse + touch) to change videos
  const dragRef = useRef<{ x: number; moved: boolean; id: number } | null>(null);
  const [dragDx, setDragDx] = useState(0);

  const onPointerDown = (e: React.PointerEvent) => {
    if (playingInline) return; // don't hijack drags while iframe is active
    dragRef.current = { x: e.clientX, moved: false, id: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    setDragDx(dx);
  };
  const endDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const moved = dragRef.current.moved;
    dragRef.current = null;
    setDragDx(0);
    if (moved && Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
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
        className="relative mt-10 select-none touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ cursor: playingInline ? "default" : "grab" }}
      >
        {/* Stage */}
        <div className="relative mx-auto h-[460px] sm:h-[520px] md:h-[560px] w-full">
          {shorts.map((s, i) => {
            let d = i - active;
            if (d > total / 2) d -= total;
            if (d < -total / 2) d += total;
            const abs = Math.abs(d);
            if (abs > 2) return null;

            const isCenter = d === 0;
            const offset = d * 240 + (isCenter ? 0 : dragDx * 0.15);
            const scale = isCenter ? 1 : abs === 1 ? 0.78 : 0.6;
            const opacity = isCenter ? 1 : abs === 1 ? 0.7 : 0.35;
            const z = 10 - abs;

            const handleClick = (e: React.MouseEvent) => {
              // Suppress click when drag actually moved
              if (dragRef.current?.moved) {
                e.preventDefault();
                return;
              }
              if (!isCenter) {
                jumpTo(i);
                return;
              }
              if (!playingInline) setPlayingInline(true);
            };

            return (
              <div
                key={s.id}
                role="button"
                tabIndex={isCenter ? 0 : -1}
                aria-label={
                  isCenter
                    ? playingInline
                      ? `Reproduzindo: ${s.title}`
                      : `Reproduzir Short: ${s.title}`
                    : `Ver Short: ${s.title}`
                }
                onClick={handleClick}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && isCenter) {
                    e.preventDefault();
                    if (!playingInline) setPlayingInline(true);
                  }
                }}
                className={cn(
                  "group absolute left-1/2 top-1/2",
                  "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 rounded-[28px]",
                )}
                style={{
                  transform: `translate(calc(-50% + ${offset}px), -50%) scale(${scale})`,
                  opacity,
                  zIndex: z,
                }}
              >
                <div
                  className={cn(
                    "relative overflow-hidden rounded-[28px] bg-secondary",
                    "aspect-[9/16] h-[440px] sm:h-[500px] md:h-[540px]",
                    isCenter
                      ? "shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/10"
                      : "shadow-xl ring-1 ring-black/5",
                  )}
                >
                  {isCenter && playingInline ? (
                    <>
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${s.youtubeId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
                        title={s.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                      {/* Expand button (over iframe) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(s);
                        }}
                        aria-label="Abrir em tela cheia"
                        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/70 text-white text-xs px-3 py-1.5 ring-1 ring-white/20 backdrop-blur hover:bg-black/85 transition"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        Expandir
                      </button>
                    </>
                  ) : (
                    <img
                      src={s.thumbnail}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}

                  {isCenter && !playingInline && (
                    <>
                      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
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
                  {!isCenter && (
                    <div className="absolute inset-0 bg-black/25" />
                  )}
                </div>
              </div>
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
              onClick={() => jumpTo(i)}
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
