import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

export const BAIRROS = [
  "Centro / Beira Mar Norte",
  "Agronômica",
  "Jurerê Internacional",
  "Jurerê Tradicional",
  "Praia Brava",
  "João Paulo",
  "Cacupé",
  "Santo Antônio de Lisboa",
  "Itacorubi",
  "Trindade",
  "Santa Mônica",
  "Córrego Grande",
  "Lagoa da Conceição",
  "Canto da Lagoa",
  "Campeche",
  "Novo Campeche",
  "Rio Tavares",
  "Morro das Pedras",
];

export const TIPOS = ["Apartamento", "Cobertura", "Casa", "Terreno", "Comercial"];

export const PRECO_FAIXAS: Array<{ label: string; min?: number; max?: number }> = [
  { label: "Até R$ 1M", max: 1_000_000 },
  { label: "R$ 1M – R$ 3M", min: 1_000_000, max: 3_000_000 },
  { label: "R$ 3M – R$ 5M", min: 3_000_000, max: 5_000_000 },
  { label: "R$ 5M – R$ 10M", min: 5_000_000, max: 10_000_000 },
  { label: "Acima de R$ 10M", min: 10_000_000 },
];

export type FiltersValue = {
  tipo?: string;
  bairro?: string;
  dorms?: number;
  faixa?: number; // index in PRECO_FAIXAS
  code?: string;
};

export function PropertyFilters({
  initial,
  variant = "light",
}: {
  initial?: FiltersValue;
  variant?: "light" | "dark";
}) {
  const navigate = useNavigate();
  const [v, setV] = useState<FiltersValue>(initial ?? {});

  const isDark = variant === "dark";
  const fieldCls = `w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
    isDark
      ? "bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-white/30"
      : "bg-background border-border focus:ring-foreground/20"
  }`;
  const labelCls = `block text-[10px] uppercase tracking-[0.18em] mb-1.5 ${
    isDark ? "text-white/60" : "text-muted-foreground"
  }`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const search: Record<string, string | number> = {};
        if (v.tipo) search.tipo = v.tipo;
        if (v.bairro) search.bairro = v.bairro;
        if (v.dorms != null) search.dorms = v.dorms;
        if (v.faixa != null) search.faixa = v.faixa;
        navigate({ to: "/buscar", search });
      }}
      className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end p-4 sm:p-5 rounded-2xl ${
        isDark
          ? "bg-white/5 ring-1 ring-white/15 backdrop-blur"
          : "bg-card ring-1 ring-black/5 shadow-sm"
      }`}
    >
      <div>
        <label htmlFor="filtro-tipo" className={labelCls}>Tipo de imóvel</label>
        <select
          id="filtro-tipo"
          aria-label="Tipo de imóvel"
          className={fieldCls}
          value={v.tipo ?? ""}
          onChange={(e) => setV({ ...v, tipo: e.target.value || undefined })}
        >
          <option value="">Todos</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filtro-bairro" className={labelCls}>Bairro</label>
        <select
          id="filtro-bairro"
          aria-label="Bairro"
          className={fieldCls}
          value={v.bairro ?? ""}
          onChange={(e) => setV({ ...v, bairro: e.target.value || undefined })}
        >
          <option value="">Todos</option>
          {BAIRROS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filtro-dorms" className={labelCls}>Dormitórios</label>
        <select
          id="filtro-dorms"
          aria-label="Número de dormitórios"
          className={fieldCls}
          value={v.dorms ?? ""}
          onChange={(e) =>
            setV({ ...v, dorms: e.target.value === "" ? undefined : Number(e.target.value) })
          }
        >
          <option value="">Indiferente</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4+</option>
        </select>
      </div>

      <div>
        <label htmlFor="filtro-faixa" className={labelCls}>Faixa de preço</label>
        <select
          id="filtro-faixa"
          aria-label="Faixa de preço"
          className={fieldCls}
          value={v.faixa ?? ""}
          onChange={(e) =>
            setV({ ...v, faixa: e.target.value === "" ? undefined : Number(e.target.value) })
          }
        >
          <option value="">Qualquer</option>
          {PRECO_FAIXAS.map((f, i) => (
            <option key={f.label} value={i}>
              {f.label}
            </option>
          ))}
        </select>
      </div>


      <button
        type="submit"
        className={`group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
          isDark
            ? "bg-white text-foreground hover:bg-white/90"
            : "bg-foreground text-background hover:bg-foreground/90"
        }`}
      >
        <Search className="h-4 w-4" /> Buscar imóveis
      </button>
    </form>
  );
}
