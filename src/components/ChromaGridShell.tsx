import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import "./ChromaGridShell.css";

/**
 * Wrapper que aplica o efeito ChromaGrid:
 * - Gradiente colorido (chroma) que segue o mouse sobre o grid inteiro
 * - Spotlight dourado por card + mute em escala de cinza nos vizinhos
 * Mantém o conteúdo original (PropertyCard + carrossel "Ver mais fotos") intacto.
 */
export function ChromaGridShell({
  children,
  className = "",
}: {
  children: ReactNode[];
  className?: string;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleShellMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = shellRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  const handleCellMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const items = Array.isArray(children) ? children : [children];

  return (
    <div
      ref={shellRef}
      className={`chroma-shell ${isHovering ? "is-hovering" : ""} ${className}`}
      onPointerMove={handleShellMove}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => {
        setIsHovering(false);
        setActiveIndex(null);
      }}
      style={{ "--x": "50%", "--y": "50%" } as CSSProperties}
    >
      <div className="chroma-shell__chroma" aria-hidden="true" />
      <div className="chroma-shell__fade" aria-hidden="true" />
      {items.map((child, i) => (
        <div
          key={i}
          className={`chroma-cell ${activeIndex === i ? "is-active" : ""} ${
            activeIndex !== null && activeIndex !== i ? "is-muted" : ""
          }`}
          onPointerEnter={() => setActiveIndex(i)}
          onPointerMove={handleCellMove}
          style={{ "--mouse-x": "50%", "--mouse-y": "50%" } as CSSProperties}
        >
          <span className="chroma-cell__spotlight" aria-hidden="true" />
          {child}
        </div>
      ))}
    </div>
  );
}

export default ChromaGridShell;
