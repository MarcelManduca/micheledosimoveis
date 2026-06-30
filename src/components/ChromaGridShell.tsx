import { useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { gsap } from "gsap";
import "./ChromaGridShell.css";

/**
 * ChromaGrid (React Bits) — spotlight que segue o mouse e "revela" a cor
 * de cada card; fora do spotlight tudo fica em escala de cinza.
 * Wrapper sobre PropertyCard para preservar o carrossel "Ver mais fotos".
 */
const PALETTE = [
  { border: "#D4AF6E", gradient: "linear-gradient(145deg, #D4AF6E, #1a1a1a)" }, // dourado
  { border: "#6EA8D4", gradient: "linear-gradient(210deg, #6EA8D4, #0f1620)" }, // azul
  { border: "#D46E9E", gradient: "linear-gradient(165deg, #D46E9E, #1a0f15)" }, // rosa
  { border: "#8ED46E", gradient: "linear-gradient(195deg, #8ED46E, #0f1a10)" }, // verde
  { border: "#B48ED4", gradient: "linear-gradient(225deg, #B48ED4, #14101a)" }, // lilás
  { border: "#E0A65A", gradient: "linear-gradient(135deg, #E0A65A, #1a140a)" }, // âmbar
];

type Props = {
  children: ReactNode[];
  className?: string;
  radius?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
  colors?: { border: string; gradient: string }[];
};

export function ChromaGridShell({
  children,
  className = "",
  radius = 320,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
  colors,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<((v: number) => void) | null>(null);
  const setY = useRef<((v: number) => void) | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  const palette = colors && colors.length > 0 ? colors : PALETTE;
  const items = Array.isArray(children) ? children : [children];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, "--x", "px") as (v: number) => void;
    setY.current = gsap.quickSetter(el, "--y", "px") as (v: number) => void;
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = rootRef.current!.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, { opacity: 1, duration: fadeOut, overwrite: true });
  };

  return (
    <div
      ref={rootRef}
      className={`chroma-shell ${className}`}
      style={{ "--r": `${radius}px` } as CSSProperties}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {items.map((child, i) => {
        const c = palette[i % palette.length];
        return (
          <div
            key={i}
            className="chroma-cell"
            style={
              {
                "--card-border": c.border,
                "--card-gradient": c.gradient,
              } as CSSProperties
            }
          >
            {child}
          </div>
        );
      })}
      <div className="chroma-overlay" aria-hidden="true" />
      <div ref={fadeRef} className="chroma-fade" aria-hidden="true" />
    </div>
  );
}

export default ChromaGridShell;
