import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ArticleGallery({
  photos,
  name,
  code,
}: {
  photos: readonly string[];
  name: string;
  code: string;
}) {
  const [index, setIndex] = useState(0);
  return (
    <figure className="my-7">
      <div className="relative overflow-hidden rounded-2xl bg-secondary">
        <img
          src={photos[index]}
          alt={`Foto ${index + 1} de imóvel no ${name}, código ${code}, do acervo de Michele dos Imóveis`}
          width="1280"
          height="960"
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full object-cover"
        />
        {photos.length > 1 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-background/95 p-1 shadow-sm">
            <button
              type="button"
              aria-label={`Foto anterior de ${name}`}
              onClick={() => setIndex((index + photos.length - 1) % photos.length)}
              className="rounded-full p-2 hover:bg-secondary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-10 text-center text-xs" aria-live="polite">
              {index + 1} / {photos.length}
            </span>
            <button
              type="button"
              aria-label={`Próxima foto de ${name}`}
              onClick={() => setIndex((index + 1) % photos.length)}
              className="rounded-full p-2 hover:bg-secondary"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Imóvel no {name} · acervo do site Michele dos Imóveis · código {code}. As imagens retratam
        uma unidade específica; acabamentos, vista e disponibilidade variam.
      </figcaption>
    </figure>
  );
}
