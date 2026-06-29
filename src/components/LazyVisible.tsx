import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Distance from viewport (in px) to start mounting children. */
  rootMargin?: string;
  /** Optional placeholder while not yet visible. */
  fallback?: ReactNode;
  /** Style/class for the wrapper element. */
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Mounts children only once they enter (or are near) the viewport.
 * Avoids running heavy code (GSAP/WebGL/3D scenes) on initial page load.
 */
export function LazyVisible({
  children,
  rootMargin = "300px",
  fallback = null,
  className,
  style,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className} style={style}>
      {visible ? children : fallback}
    </div>
  );
}
