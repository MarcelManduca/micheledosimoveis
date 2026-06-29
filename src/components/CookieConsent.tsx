import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, ShieldCheck, X } from "lucide-react";

const STORAGE_KEY = "mdi.cookieConsent.v1";

type ConsentValue = "all" | "essential" | null;

export function getCookieConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (getCookieConsent() === null) setOpen(true);
    }, 600);
    return () => window.clearTimeout(t);
  }, []);

  const save = (value: "all" | "essential") => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
      window.localStorage.setItem(`${STORAGE_KEY}.at`, new Date().toISOString());
    } catch {}
    setOpen(false);
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: value }));
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies e privacidade"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-6 sm:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-white/95 backdrop-blur-md shadow-2xl ring-1 ring-black/5">
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base text-foreground">
                Sua privacidade é prioridade
              </h2>
              <button
                aria-label="Fechar"
                onClick={() => save("essential")}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Usamos cookies essenciais para o funcionamento do site e, com sua autorização,
              cookies de análise para entender como melhorar a experiência. Em conformidade com a{" "}
              <Link to="/privacidade" className="underline underline-offset-2 hover:text-foreground">
                LGPD
              </Link>
              , você decide.
            </p>

            {showDetails && (
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    <strong className="text-foreground">Essenciais</strong> · necessários para
                    autenticação e navegação. Sempre ativos.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    <strong className="text-foreground">Analíticos</strong> · opcionais. Ajudam a
                    medir audiência de forma agregada.
                  </span>
                </li>
              </ul>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => save("all")}
                className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90"
              >
                Aceitar todos
              </button>
              <button
                onClick={() => save("essential")}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-5 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Apenas essenciais
              </button>
              <button
                onClick={() => setShowDetails((v) => !v)}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              >
                {showDetails ? "Ocultar detalhes" : "Personalizar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
