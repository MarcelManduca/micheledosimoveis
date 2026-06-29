import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { BIO_FULL } from "@/lib/site-config";

/**
 * Bio expansível: todo o texto renderiza no DOM para SEO, mas
 * apenas o primeiro parágrafo é visível até o usuário expandir.
 */
export function AboutBio() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-6">
      <div
        className={
          expanded
            ? "space-y-4 text-muted-foreground leading-relaxed"
            : "space-y-4 text-muted-foreground leading-relaxed [&>p:nth-child(n+2)]:hidden sm:[&>p:nth-child(n+2)]:hidden"
        }
      >
        {BIO_FULL.map((p, i) => (
          <p key={i}>
            {i === 0 ? (
              <>
                Sou <strong className="text-foreground font-medium">Michele Prietsch</strong>
                {p.slice("Sou Michele Prietsch".length)}
              </>
            ) : (
              p
            )}
          </p>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline transition"
      >
        {expanded ? "Mostrar menos" : "Ler mais sobre Michele"}
        <ArrowRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
    </div>
  );
}
