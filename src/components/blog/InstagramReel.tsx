import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";

export function instagramReelId(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      !["instagram.com", "www.instagram.com"].includes(url.hostname) ||
      url.port ||
      url.username ||
      url.password
    )
      return null;
    return /^\/reel\/([A-Za-z0-9_-]+)\/?$/.exec(url.pathname)?.[1] ?? null;
  } catch {
    return null;
  }
}

/** Click-to-load keeps Instagram requests out of the initial article load. */
export function InstagramReel({ url }: { url: string | null }) {
  const [loaded, setLoaded] = useState(false);
  const id = url ? instagramReelId(url) : null;
  if (!id) return null;
  const permalink = `https://www.instagram.com/reel/${id}/`;
  return (
    <section
      aria-labelledby="reel-title"
      className="my-8 rounded-2xl border border-border bg-secondary/30 p-5 sm:p-8"
    >
      <h3 id="reel-title" className="font-display text-2xl">
        La Perle com Michele
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Assista à apresentação publicada no Instagram da Michele dos Imóveis.
      </p>
      <div className="mx-auto mt-5 max-w-[400px] overflow-hidden rounded-xl bg-background">
        {loaded ? (
          <iframe
            src={`${permalink}embed/`}
            title="Michele apresenta o La Perle no Instagram"
            width="400"
            height="710"
            className="w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="flex min-h-48 w-full flex-col items-center justify-center gap-3 p-6 text-center focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <Play aria-hidden="true" className="h-10 w-10" />
            <span className="font-medium">Reproduzir apresentação</span>
            <span className="text-xs text-muted-foreground">
              Ao reproduzir, você carrega conteúdo do Instagram.
            </span>
          </button>
        )}
      </div>
      <a
        href={permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 text-sm underline underline-offset-4"
      >
        Abrir no Instagram <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    </section>
  );
}
