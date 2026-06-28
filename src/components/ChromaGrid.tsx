import { useState, type CSSProperties, type MouseEvent } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import "./ChromaGrid.css";

export type ChromaItem = {
  image: string;
  title: string;
  subtitle?: string;
  handle?: string;
  location?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
};

type Props = {
  items: ChromaItem[];
  className?: string;
  radius?: number;
  columns?: number;
  rows?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
};

export function ChromaGrid({
  items,
  className = "",
  columns = 3,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleCardClick = (url?: string) => {
    if (!url) return;
    if (url.startsWith("/")) window.location.assign(url);
    else window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCardMove = (e: MouseEvent<HTMLElement>) => {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      className={`chroma-grid ${activeIndex !== null ? "is-hovering" : ""} ${className}`}
      style={{
        ["--cols" as any]: columns,
      } as CSSProperties}
      onPointerLeave={() => setActiveIndex(null)}
    >
      {items.map((c, i) => (
        <article
          key={i}
          className={`chroma-card ${activeIndex === i ? "is-active" : ""} ${activeIndex !== null && activeIndex !== i ? "is-muted" : ""}`}
          onMouseEnter={() => setActiveIndex(i)}
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(c.url)}
          style={{
            ["--card-border" as any]: c.borderColor || "transparent",
            ["--card-gradient" as any]: c.gradient,
            cursor: c.url ? "pointer" : "default",
          } as CSSProperties}
        >
          <div className="chroma-img-wrapper">
            <img src={c.image} alt={c.title} loading="lazy" />
          </div>
          <footer className="chroma-info">
            <div className="chroma-meta-row">
              {c.handle && <span className="handle">{c.handle}</span>}
              <span className="chroma-cta" aria-hidden="true">
                <ArrowRight size={14} />
              </span>
            </div>
            <h3 className="name">{c.title}</h3>
            {c.subtitle && (
              <p className="role">
                <MapPin size={14} />
                <span>{c.subtitle}</span>
              </p>
            )}
            {c.location && (
              <div className="price-block">
                <span className="price-label">Valor</span>
                <span className="location">{c.location}</span>
              </div>
            )}
          </footer>
        </article>
      ))}
    </div>
  );
}

export default ChromaGrid;
