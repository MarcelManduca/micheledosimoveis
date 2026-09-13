import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// Radix Select não aceite value="" em Item — usamos sentinelas para as
// opções "sem filtro" (Todos / Indiferente / Qualquer) e convertemos
// de volta para undefined no estado.
const ALL = "__all__";

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
  const triggerCls = `w-full h-auto justify-between rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 ${
    isDark
      ? "bg-white/10 border-white/20 text-white data-[placeholder]:text-white/50 focus:ring-white/30 [&_svg]:text-white/70"
      : "bg-background border-border focus:ring-foreground/20"
  }`;
  const labelCls = `block text-[10px] uppercase tracking-[0.18em] mb-1.5 ${
    isDark ? "text-white/60" : "text-muted-foreground"
  }`;
  const fieldCls = `w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
    isDark
      ? "bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-white/30"
      : "bg-background border-border focus:ring-foreground/20"
  }`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmedCode = v.code?.trim();
        if (trimmedCode) {
          navigate({ to: "/imovel/$code", params: { code: trimmedCode } });
          return;
        }
        const search: Record<string, string | number> = {};
        if (v.tipo) search.tipo = v.tipo;
        if (v.bairro) search.bairro = v.bairro;
        if (v.dorms != null) search.dorms = v.dorms;
        if (v.faixa != null) search.faixa = v.faixa;
        navigate({ to: "/buscar", search });
      }}
      className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end p-4 sm:p-5 rounded-2xl ${
        isDark
          ? "bg-white/5 ring-1 ring-white/15 backdrop-blur"
          : "bg-card ring-1 ring-black/5 shadow-sm"
      }`}
    >
      <div>
        <label id="filtro-tipo-label" className={labelCls}>Tipo de imóvel</label>
        <Select
          value={v.tipo ?? ALL}
          onValueChange={(val) => setV({ ...v, tipo: val === ALL ? undefined : val })}
        >
          <SelectTrigger aria-labelledby="filtro-tipo-label" className={triggerCls}>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {TIPOS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label id="filtro-bairro-label" className={labelCls}>Bairro</label>
        <Select
          value={v.bairro ?? ALL}
          onValueChange={(val) => setV({ ...v, bairro: val === ALL ? undefined : val })}
        >
          <SelectTrigger aria-labelledby="filtro-bairro-label" className={triggerCls}>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {BAIRROS.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label id="filtro-dorms-label" className={labelCls}>Dormitórios</label>
        <Select
          value={v.dorms != null ? String(v.dorms) : ALL}
          onValueChange={(val) => setV({ ...v, dorms: val === ALL ? undefined : Number(val) })}
        >
          <SelectTrigger aria-labelledby="filtro-dorms-label" className={triggerCls}>
            <SelectValue placeholder="Indiferente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Indiferente</SelectItem>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label id="filtro-faixa-label" className={labelCls}>Faixa de preço</label>
        <Select
          value={v.faixa != null ? String(v.faixa) : ALL}
          onValueChange={(val) => setV({ ...v, faixa: val === ALL ? undefined : Number(val) })}
        >
          <SelectTrigger aria-labelledby="filtro-faixa-label" className={triggerCls}>
            <SelectValue placeholder="Qualquer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Qualquer</SelectItem>
            {PRECO_FAIXAS.map((f, i) => (
              <SelectItem key={f.label} value={String(i)}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="filtro-code" className={labelCls}>Código do imóvel</label>
        <input
          id="filtro-code"
          type="text"
          inputMode="text"
          autoComplete="off"
          aria-label="Código do imóvel"
          placeholder="Ex.: AP1234"
          className={fieldCls}
          value={v.code ?? ""}
          onChange={(e) => setV({ ...v, code: e.target.value || undefined })}
        />
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
