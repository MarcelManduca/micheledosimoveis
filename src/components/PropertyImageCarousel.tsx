import { useCallback, useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

type Props = {
  images: string[];
  alt: string;
  className?: string;
  /** Limita o carrossel às N primeiras fotos e mostra um CTA "Ver mais fotos" ao chegar na última. */
  lockAfter?: number;
  /** Rótulo do CTA exibido ao atingir o limite. */
  ctaLabel?: string;
};

/**
 * Carrossel de imagens com transição horizontal suave (translateX),
 * seta circular sobre a imagem e suporte a swipe no mobile.
 */
export function PropertyImageCarousel({ images, alt, className, lockAfter, ctaLabel = "Ver mais fotos" }: Props) {
  const filtered = images.filter(Boolean);
  const list = lockAfter ? filtered.slice(0, lockAfter) : filtered;
  const [index, setIndex] = useState(0);
  const total = list.length;
  const hasMany = total > 1;
  const atLockEnd = !!lockAfter && filtered.length > lockAfter && index === total - 1;
  const dragStartX = useRef<number | null>(null);
  const dragDelta = useRef(0);
  const dragStartX = useRef<number | null>(null);
  const dragDelta = useRef(0);

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!hasMany) return;
    dragStartX.current = e.clientX;
    dragDelta.current = 0;
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current == null) return;
    dragDelta.current = e.clientX - dragStartX.current;
  };
  const onPointerUp = () => {
    if (dragStartX.current == null) return;
    const delta = dragDelta.current;
    dragStartX.current = null;
    dragDelta.current = 0;
    if (Math.abs(delta) < 40) return;
    goTo(index + (delta < 0 ? 1 : -1));
  };

  if (total === 0) {
    return (
      <div className={`grid place-items-center bg-secondary text-xs text-muted-foreground ${className ?? ""}`}>
        Sem foto
      </div>
    );
  }

  return (
    <div
      className={`group/carousel relative overflow-hidden ${className ?? ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="flex h-full w-full touch-pan-y will-change-transform"
        style={{
          transform: `translateX(-${index * 100}%)`,
          transition: "transform 420ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {list.map((src, i) => (
          <div key={`${src}-${i}`} className="relative h-full w-full shrink-0 basis-full">
            <img
              src={src}
              alt={`${alt} — foto ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
              className="h-full w-full select-none object-cover"
            />
          </div>
        ))}
      </div>

      {/* Gradiente inferior para leitura dos textos sobrepostos */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

      {hasMany && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goTo(index - 1);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-black/5 bg-white text-foreground shadow-md transition hover:shadow-lg hover:scale-105 active:scale-95 opacity-90 sm:opacity-0 sm:group-hover/carousel:opacity-100 cursor-pointer focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goTo(index + 1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-black/5 bg-white text-foreground shadow-md transition hover:shadow-lg hover:scale-105 active:scale-95 opacity-90 sm:opacity-0 sm:group-hover/carousel:opacity-100 cursor-pointer focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </>
      )}

      {hasMany && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {list.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/55"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
