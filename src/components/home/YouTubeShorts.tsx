import { Play, Youtube } from "lucide-react";
import { YOUTUBE_SHORTS } from "@/lib/youtube-shorts";
import { SITE } from "@/lib/site-config";

export function YouTubeShorts() {
  return (
    <section
      id="shorts"
      aria-labelledby="shorts-title"
      className="mx-auto max-w-7xl px-6 sm:px-10 py-16 sm:py-20"
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
            Toque em um card para assistir no YouTube.
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

      <ul
        className="mt-8 grid grid-flow-col auto-cols-[70%] sm:auto-cols-[42%] md:grid-flow-row md:grid-cols-4 md:auto-cols-auto gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-6 px-6 sm:mx-0 sm:px-0 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {YOUTUBE_SHORTS.map((s) => (
          <li key={s.id} className="snap-start">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Assistir no YouTube: ${s.title}`}
              className="group block relative overflow-hidden rounded-2xl bg-secondary ring-1 ring-black/5 aspect-[9/16]"
            >
              <img
                src={s.thumbnail}
                alt=""
                loading="lazy"
                decoding="async"
                width={480}
                height={854}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-foreground shadow-lg transition-transform group-hover:scale-110">
                  <Play className="h-5 w-5 translate-x-[1px] fill-current" />
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-xs text-white/90 line-clamp-2 leading-snug">
                  {s.title}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
