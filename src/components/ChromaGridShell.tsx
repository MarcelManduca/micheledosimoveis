import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import "./ChromaGridShell.css";

/**
 * Wrapper que aplica o efeito ChromaGrid (spotlight + mute dos cards vizinhos)
 * sem substituir o conteúdo do card. Use envolvendo um grid de PropertyCard
 * para manter o carrossel "Ver mais fotos" funcionando por cima.
 */
export function ChromaGridShell({
  children,
  className = "",
}: {
  children: ReactNode[];
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const items = Array.isArray(children) ? children : [children];

  return (
    <div
      className={`chroma-shell ${activeIndex !== null ? "is-hovering" : ""} ${className}`}
      onPointerLeave={() => setActiveIndex(null)}
    >
      {items.map((child, i) => (
        <div
          key={i}
          className={`chroma-cell ${activeIndex === i ? "is-active" : ""} ${
            activeIndex !== null && activeIndex !== i ? "is-muted" : ""
          }`}
          onMouseEnter={() => setActiveIndex(i)}
          onMouseMove={handleMove}
          style={
            {
              "--mouse-x": "50%",
              "--mouse-y": "50%",
            } as CSSProperties
          }
        >
          <span className="chroma-cell__spotlight" aria-hidden="true" />
          {child}
        </div>
      ))}
    </div>
  );
}

export default ChromaGridShell;
