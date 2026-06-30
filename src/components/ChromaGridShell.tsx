import { useState, type CSSProperties, type ReactNode } from "react";
import "./ChromaGridShell.css";

/**
 * ChromaGrid — cada card tem sua própria cor, sempre visível.
 * Ao passar o cursor por qualquer card, os demais ficam em escala de cinza
 * e o card sob o cursor ganha vinheta colorida suave cobrindo todo o card.
 */
const PALETTE = [
  { border: "#D4AF6E" }, // dourado
  { border: "#6EA8D4" }, // azul
  { border: "#D46E9E" }, // rosa
  { border: "#8ED46E" }, // verde
  { border: "#B48ED4" }, // lilás
  { border: "#E0A65A" }, // âmbar
];

type Props = {
  children: ReactNode[];
  className?: string;
  colors?: { border: string }[];
};

export function ChromaGridShell({ children, className = "", colors }: Props) {
  const [hovering, setHovering] = useState(false);
  const palette = colors && colors.length > 0 ? colors : PALETTE;
  const items = Array.isArray(children) ? children : [children];

  return (
    <div
      className={`chroma-shell ${hovering ? "is-hovering" : ""} ${className}`}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      {items.map((child, i) => {
        const c = palette[i % palette.length];
        return (
          <div
            key={i}
            className="chroma-cell"
            style={{ "--card-border": c.border } as CSSProperties}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

export default ChromaGridShell;
