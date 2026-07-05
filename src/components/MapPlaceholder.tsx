import { MapPin } from "lucide-react";

type Props = {
  title: string;
  address?: string | null;
  onOpen?: () => void;
  canOpen?: boolean;
};

/**
 * Placeholder visual "cartográfico" leve para a área do mapa antes do
 * carregamento. Não usa imagens de terceiros nem tiles reais — apenas SVG
 * inline com padrão de grid + curvas orgânicas em tons neutros.
 */
export default function MapPlaceholder({ title, address, onOpen, canOpen = true }: Props) {
  return (
    <button
      type="button"
      onClick={() => canOpen && onOpen?.()}
      disabled={!canOpen}
      aria-label={
        canOpen ? `Ver mapa da localização do ${title}` : `Mapa indisponível para o ${title}`
      }
      className="group relative block h-[260px] w-full overflow-hidden text-left disabled:cursor-not-allowed"
    >
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="mp-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(38 30% 96%)" />
            <stop offset="100%" stopColor="hsl(35 20% 90%)" />
          </linearGradient>
          <pattern id="mp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="hsl(30 15% 78%)"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="800" height="400" fill="url(#mp-bg)" />
        <rect width="800" height="400" fill="url(#mp-grid)" />
        {/* Curvas orgânicas simulando vias/rios */}
        <path
          d="M -20 240 C 160 200 260 320 420 260 S 700 200 820 240"
          stroke="hsl(30 20% 70%)"
          strokeWidth="2.5"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M -20 140 C 120 180 300 100 460 160 S 720 220 820 180"
          stroke="hsl(30 20% 72%)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.55"
        />
        <path
          d="M 120 -20 C 180 100 100 220 200 320 S 280 460 240 520"
          stroke="hsl(30 20% 74%)"
          strokeWidth="1.2"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M 560 -20 C 620 120 540 240 640 340 S 700 460 660 520"
          stroke="hsl(30 20% 74%)"
          strokeWidth="1.2"
          fill="none"
          opacity="0.5"
        />
        {/* "quadras" sutis */}
        <g opacity="0.35" fill="hsl(30 25% 82%)">
          <rect x="80" y="60" width="90" height="60" rx="4" />
          <rect x="200" y="80" width="70" height="50" rx="4" />
          <rect x="520" y="280" width="120" height="70" rx="4" />
          <rect x="640" y="60" width="80" height="60" rx="4" />
          <rect x="300" y="300" width="90" height="55" rx="4" />
        </g>
      </svg>

      {/* Pin central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-background/70">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="mt-1 max-w-md rounded-lg bg-background/85 px-3 py-2 backdrop-blur-sm ring-1 ring-black/5">
          <div className="font-display text-sm tracking-tight text-foreground line-clamp-1">
            {title}
          </div>
          {address && (
            <div className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
              {address}
            </div>
          )}
        </div>
        {canOpen ? (
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-1 text-xs font-medium text-background transition group-hover:bg-foreground">
            <MapPin className="h-3.5 w-3.5" /> Ver mapa da localização
          </span>
        ) : (
          <span className="mt-1 text-[11px] text-muted-foreground">
            Coordenadas não disponíveis
          </span>
        )}
      </div>
    </button>
  );
}
