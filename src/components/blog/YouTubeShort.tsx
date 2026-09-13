import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";

export function YouTubeShort({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;
  const url = `https://www.youtube.com/shorts/${videoId}`;
  return (
    <figure className="my-8 rounded-2xl border border-border bg-secondary/30 p-5 sm:p-8">
      <h3 className="font-display text-2xl">{title}</h3>
      <div className="relative mx-auto mt-5 aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-xl bg-black text-white">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1`}
            title={title}
            width="360"
            height="640"
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Reproduzir: ${title}`}
            className="absolute inset-0 flex w-full flex-col items-center justify-center gap-4 p-6 text-center focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white cursor-pointer hover:bg-black/80 transition-colors"
          >
            <Play aria-hidden="true" className="h-14 w-14" />
            <span className="font-medium">Assistir ao vídeo do La Perle</span>
            <span className="text-xs text-white/70">Ao reproduzir, você carrega conteúdo do YouTube.</span>
          </button>
        )}
      </div>
      <figcaption className="mt-4 text-sm text-muted-foreground">
        Conheça o La Perle em vídeo. As características mostradas se referem ao imóvel apresentado; consulte a disponibilidade atual.
      </figcaption>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 text-sm underline underline-offset-4"
      >
        Abrir no YouTube <ExternalLink aria-hidden="true" className="h-4 w-4" />
      </a>
    </figure>
  );
}
