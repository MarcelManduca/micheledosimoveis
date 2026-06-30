import { useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import "./ChromaGridShell.css";

/**
 * ChromaGrid shell — cada card recebe sua própria cor (paleta ciclada),
 * exibida como halo/spotlight colorido no hover + mute em escala de cinza
 * nos cards vizinhos. Mantém o conteúdo (PropertyCard + carrossel) intacto.
 */
const PALETTE = [
  "#D4AF6E", // dourado Michele
  "#6EA8D4", // azul oceano
  "#D46E9E", // rosa
  "#8ED46E", // verde
  "#B48ED4", // lilás
  "#E0A65A", // âmbar
];

export function ChromaGridShell({
  children,
  className = "",
  colors,
}: {
  children: ReactNode[];
  className?: string;
  colors?: string[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const palette = colors && colors.length > 0 ? colors : PALETTE;

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
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
      {items.map((child, i) => {
        const color = palette[i % palette.length];
        return (
          <div
            key={i}
            className={`chroma-cell ${activeIndex === i ? "is-active" : ""} ${
              activeIndex !== null && activeIndex !== i ? "is-muted" : ""
            }`}
            onPointerEnter={() => setActiveIndex(i)}
            onPointerMove={handleMove}
            style={
              {
                "--cell-color": color,
                "--mouse-x": "50%",
                "--mouse-y": "50%",
              } as CSSProperties
            }
          >
            <span className="chroma-cell__glow" aria-hidden="true" />
            <span className="chroma-cell__spotlight" aria-hidden="true" />
            {child}
          </div>
        );
      })}
    </div>
  );
}

export default ChromaGridShell;
