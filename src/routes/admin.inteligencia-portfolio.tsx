import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  ScatterChart,
  Scatter,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import {
  adminPortfolioProperties,
  getMyAdminStatus,
} from "@/lib/properties.functions";
import {
  BEDROOM_GROUPS,
  MACRO_TYPES,
  PRICE_BANDS,
  STRATEGIC_NEIGHBORHOODS,
  brl,
  enrich,
  generatePortfolioInsights,
  heatmapCellColor,
  mean,
  median,
  neighborhoodStockStatus,
  type BedroomGroup,
  type EnrichedProperty,
  type Insight,
  type MacroType,
} from "@/lib/portfolio-intelligence";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Copy,
  MessageCircle,
  ChevronRight,
  Database,
  Filter,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin/inteligencia-portfolio")({
  head: () => ({
    meta: [
      { title: "Inteligência de Portfólio · Michele Prietsch" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PortfolioIntelligencePage,
});

const COLORS = ["#0f766e", "#0891b2", "#7c3aed", "#db2777", "#ea580c", "#65a30d", "#a16207"];

// ─────────── UI helpers ───────────

function KpiCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warn" | "critical" | "ok";
}) {
  const border =
    tone === "critical"
      ? "border-red-200"
      : tone === "warn"
        ? "border-amber-200"
        : tone === "ok"
          ? "border-emerald-200"
          : "border-border";
  return (
    <div className={`rounded-2xl border ${border} bg-card p-5`}>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl leading-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mt-10 mb-4">
      <h2 className="font-display text-xl tracking-tight">{children}</h2>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    Crítico: "bg-red-100 text-red-800 border-red-200",
    "Reforçar captação": "bg-orange-100 text-orange-800 border-orange-200",
    Monitorar: "bg-amber-100 text-amber-900 border-amber-200",
    Saudável: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${map[status] ?? "bg-secondary text-foreground border-border"}`}
    >
      {status}
    </span>
  );
}

function PriorityChip({ priority }: { priority: Insight["priority"] }) {
  const map: Record<string, string> = {
    Alta: "bg-red-100 text-red-800 border-red-200",
    Média: "bg-orange-100 text-orange-800 border-orange-200",
    Monitorar: "bg-amber-100 text-amber-900 border-amber-200",
    Baixa: "bg-secondary text-foreground border-border",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${map[priority] ?? map.Baixa}`}
    >
      {priority}
    </span>
  );
}

function downloadCsv(filename: string, rows: (string | number | null)[][]) {
  const esc = (v: string | number | null) => {
    if (v == null) return "";
    const s = String(v);
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const csv = rows.map((r) => r.map(esc).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function computeRowStatus(qty: number): string {
  if (qty <= 1) return "Crítico";
  if (qty === 2) return "Reforçar captação";
  if (qty <= 5) return "Monitorar";
  return "Saudável";
}
function computeRowAction(qty: number): string {
  if (qty <= 1) return "Captar urgente";
  if (qty === 2) return "Reforçar captação";
  if (qty <= 5) return "Monitorar";
  return "Manter";
}

// ─────────── Page ───────────

function PortfolioIntelligencePage() {
  const navigate = useNavigate();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) navigate({ to: "/auth" });
      else setSessionReady(true);
    });
    const sub = supabase.auth.onAuthStateChange((_e, sess) => {
      if (!sess) navigate({ to: "/auth" });
    });
    return () => {
      mounted = false;
      sub.data.subscription.unsubscribe();
    };
  }, [navigate]);

  const status = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => getMyAdminStatus(),
    enabled: sessionReady,
  });

  const portfolio = useQuery({
    queryKey: ["admin-portfolio"],
    queryFn: () => adminPortfolioProperties(),
    enabled: !!status.data?.isAdmin,
  });

  const notReady = !sessionReady || status.isLoading;
  const notAdmin = !!status.data && !status.data.isAdmin;

  const raw = portfolio.data ?? [];
  const enriched: EnrichedProperty[] = useMemo(() => enrich(raw), [raw]);
  const active = useMemo(() => enriched.filter((p) => p.active), [enriched]);

  // Data freshness
  const lastSync = useMemo(() => {
    let max = 0;
    for (const p of raw) {
      const t = Math.max(
        p.last_checked_at ? +new Date(p.last_checked_at) : 0,
        p.updated_at ? +new Date(p.updated_at) : 0,
      );
      if (t > max) max = t;
    }
    return max ? new Date(max) : null;
  }, [raw]);

  // Datasets
  const ativos = active.length;
  const byMacro = MACRO_TYPES.map((m) => ({ name: m, value: active.filter((p) => p.macro === m).length }));
  const byBedrooms = BEDROOM_GROUPS.map((b) => ({
    name: `${b} dorm.`,
    value: active.filter((p) => p.bedGroup === b).length,
  }));
  const byPrice = PRICE_BANDS.map((b) => ({ name: b, value: active.filter((p) => p.band === b).length }));

  const byNeighborhoodMap = new Map<string, number>();
  for (const p of active) byNeighborhoodMap.set(p.n_bairro, (byNeighborhoodMap.get(p.n_bairro) ?? 0) + 1);
  const topBairros = [...byNeighborhoodMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, value]) => ({ name, value }));

  const strategicCounts = STRATEGIC_NEIGHBORHOODS.map((n) => ({
    name: n,
    value: byNeighborhoodMap.get(n) ?? 0,
  })).sort((a, b) => a.value - b.value);

  const strategicLow = strategicCounts.filter((n) => n.value <= 5).slice(0, 10);

  const insights = useMemo(() => generatePortfolioInsights(enriched), [enriched]);

  const tipDom = [...byMacro].sort((a, b) => b.value - a.value)[0];
  const priceDom = [...byPrice].sort((a, b) => b.value - a.value)[0];
  const dormDom = [...byBedrooms].sort((a, b) => b.value - a.value)[0];
  const prices = active.map((p) => p.price_brl ?? 0).filter((v) => v > 0);
  const precoMed = mean(prices);
  const precoMediano = median(prices);
  const bairrosBaixa = strategicCounts.filter((n) => n.value > 0 && n.value <= 10).length;
  const combosCriticas = insights.filter((i) => i.quantidade <= 2).length;

  // Technical details
  const totalArquivo = enriched.length;
  const publicados = enriched.filter((p) => p.published).length;
  const confirmados = enriched.filter(
    (p) => (p.last_check_status ?? "").toLowerCase() === "available",
  ).length;
  const comErro = enriched.filter(
    (p) => (p.last_check_status ?? "").toLowerCase() === "error",
  ).length;
  const indisponiveis = enriched.filter(
    (p) =>
      !p.published ||
      p.unavailable_since ||
      ["not_found", "unavailable", "indisponivel"].includes(
        (p.last_check_status ?? "").toLowerCase(),
      ),
  ).length;

  // Heatmap bairro × macro (strategic only)
  const macroCols: MacroType[] = ["Apartamento", "Casa", "Cobertura", "Terreno", "Comercial/Especial"];
  const heatBairroMacro = STRATEGIC_NEIGHBORHOODS.map((b) => ({
    bairro: b,
    values: macroCols.map((m) => active.filter((p) => p.n_bairro === b && p.macro === m).length),
  }));

  const medianByBairro = STRATEGIC_NEIGHBORHOODS.map((b) => {
    const vals = active.filter((p) => p.n_bairro === b).map((p) => p.price_brl ?? 0).filter((v) => v > 0);
    return { name: b, value: vals.length >= 3 ? Math.round(median(vals)!) : 0 };
  })
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  const ppm2ByBairro = STRATEGIC_NEIGHBORHOODS.map((b) => {
    const vals = active
      .filter((p) => p.n_bairro === b && p.pricePerM2 != null)
      .map((p) => p.pricePerM2 as number);
    return { name: b, value: vals.length >= 3 ? Math.round(median(vals)!) : 0 };
  })
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  const scatterByMacro = MACRO_TYPES.map((m) => ({
    macro: m,
    data: active
      .filter((p) => p.macro === m && p.price_brl && p.area_m2 && p.area_m2 > 0)
      .map((p) => ({
        x: p.area_m2!,
        y: p.price_brl!,
        code: p.code,
        title: p.title,
        bairro: p.n_bairro,
        bedrooms: p.bedrooms,
      })),
  })).filter((s) => s.data.length > 0);

  // Opportunities table (dimensions: bairro × macro × dorms)
  type Row = {
    bairro: string;
    macro: MacroType;
    dorms: BedroomGroup;
    qty: number;
    pmin: number | null;
    pmed: number | null;
    pmediana: number | null;
    pmax: number | null;
    areaMedia: number | null;
    status: string;
    acao: string;
    items: EnrichedProperty[];
    isStrategic: boolean;
    score: number;
  };

  const table: Row[] = useMemo(() => {
    const map = new Map<string, EnrichedProperty[]>();
    for (const p of active) {
      const k = `${p.n_bairro}||${p.macro}||${p.bedGroup}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    }
    const rows: Row[] = [];
    for (const [k, list] of map) {
      const [bairro, macro, dorms] = k.split("||");
      const isStrategic = STRATEGIC_NEIGHBORHOODS.includes(bairro);
      const priceList = list.map((p) => p.price_brl ?? 0).filter((v) => v > 0);
      const areas = list.map((p) => p.area_m2 ?? 0).filter((v) => v > 0);
      const qty = list.length;
      const status = computeRowStatus(qty);
      const acao = computeRowAction(qty);
      // Simple opportunity score: strategic + low qty
      const score =
        (isStrategic ? 40 : 0) + (qty <= 1 ? 40 : qty === 2 ? 25 : qty <= 5 ? 10 : 0);
      rows.push({
        bairro,
        macro: macro as MacroType,
        dorms: dorms as BedroomGroup,
        qty,
        pmin: priceList.length ? Math.min(...priceList) : null,
        pmed: mean(priceList),
        pmediana: median(priceList),
        pmax: priceList.length ? Math.max(...priceList) : null,
        areaMedia: mean(areas),
        status,
        acao,
        items: list,
        isStrategic,
        score,
      });
    }
    return rows.sort((a, b) => b.score - a.score || a.qty - b.qty);
  }, [active]);

  // Filters
  const [filterBairro, setFilterBairro] = useState("");
  const [filterMacro, setFilterMacro] = useState("");
  const [filterDorm, setFilterDorm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [onlyStrategic, setOnlyStrategic] = useState(true);
  const [showHealthy, setShowHealthy] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  const filteredTable = useMemo(() => {
    return table.filter((r) => {
      if (onlyStrategic && !r.isStrategic) return false;
      if (!showHealthy && (r.status === "Saudável" || r.status === "Monitorar")) return false;
      if (filterBairro && r.bairro !== filterBairro) return false;
      if (filterMacro && r.macro !== filterMacro) return false;
      if (filterDorm && r.dorms !== filterDorm) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      return true;
    });
  }, [table, onlyStrategic, showHealthy, filterBairro, filterMacro, filterDorm, filterStatus]);

  const pagedTable = filteredTable.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredTable.length / pageSize));

  // Drawer state
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);

  // "Onde captar agora" — top strategic critical
  const captarAgora = useMemo(() => {
    const byBairro = new Map<string, Insight[]>();
    for (const i of insights) {
      if (i.quantidade > 2) continue;
      if (!STRATEGIC_NEIGHBORHOODS.includes(i.bairro)) continue;
      if (!byBairro.has(i.bairro)) byBairro.set(i.bairro, []);
      byBairro.get(i.bairro)!.push(i);
    }
    const result: { bairro: string; perfil: string; motivo: string; acao: string }[] = [];
    for (const [bairro, list] of byBairro) {
      const tipos = Array.from(new Set(list.map((i) => i.tipo))).slice(0, 2);
      const dorms = Array.from(new Set(list.map((i) => i.dorms))).slice(0, 3);
      const count = byNeighborhoodMap.get(bairro) ?? 0;
      result.push({
        bairro,
        perfil: `${tipos.join(" e ")} · ${dorms.join(", ")} dorm.`,
        motivo:
          count <= 5
            ? "Baixo estoque ativo em bairro estratégico."
            : "Combinações críticas com 1–2 unidades neste bairro.",
        acao: `Captar ${tipos[0]?.toLowerCase() ?? "imóveis"} de ${dorms.join("/") || "2 e 3"} dormitórios em ${bairro}.`,
      });
    }
    return result.slice(0, 5);
  }, [insights, byNeighborhoodMap]);

  // Top insights (unique bairro+tipo)
  const topInsights = useMemo(() => {
    const seen = new Set<string>();
    const out: Insight[] = [];
    for (const i of insights) {
      const k = `${i.bairro}||${i.tipo}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(i);
      if (out.length >= 9) break;
    }
    return out;
  }, [insights]);

  const [insightsOpen, setInsightsOpen] = useState(false);

  // Recommendations grouped by bairro
  const recomendacoes = useMemo(() => {
    const byBairro = new Map<string, string[]>();
    for (const i of insights.slice(0, 40)) {
      if (!STRATEGIC_NEIGHBORHOODS.includes(i.bairro)) continue;
      if (i.quantidade > 2) continue;
      if (!byBairro.has(i.bairro)) byBairro.set(i.bairro, []);
      const list = byBairro.get(i.bairro)!;
      const phrase = `Ampliar captação de ${i.tipo.toLowerCase()}s de ${i.dorms} dormitórios.`;
      if (!list.includes(phrase) && list.length < 3) list.push(phrase);
    }
    return Array.from(byBairro.entries()).slice(0, 8);
  }, [insights]);

  const resumoExecutivo = `Hoje o site possui ${ativos} imóveis ativos distribuídos em ${byNeighborhoodMap.size} bairros. O estoque está concentrado em ${tipDom?.name?.toLowerCase() ?? "—"}, com predominância de imóveis com ${dormDom?.name ?? "—"} e faixa de preço dominante ${priceDom?.name ?? "—"}. Os principais pontos de atenção estão em ${strategicCounts.filter((n) => n.value > 0 && n.value <= 10).slice(0, 5).map((n) => `${n.name} (${n.value})`).join(", ") || "nenhum bairro estratégico"}, onde há baixa quantidade de imóveis ativos ou combinações críticas. A recomendação é priorizar captação de apartamentos e coberturas em bairros estratégicos, especialmente perfis com apenas 1 ou 2 unidades disponíveis.`;

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* no-op */
    }
  }

  function exportInsightsCsv() {
    const rows: (string | number | null)[][] = [
      ["Prioridade", "Score", "Bairro", "Tipo", "Dormitórios", "Quantidade", "Preço mediano", "Diagnóstico", "Ação"],
      ...insights.map((i) => [
        i.priority,
        i.score,
        i.bairro,
        i.tipo,
        i.dorms,
        i.quantidade,
        i.precoRef ?? "",
        i.diagnostico,
        i.acao,
      ]),
    ];
    downloadCsv(`insights-portfolio-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }
  function exportTableCsv() {
    const rows: (string | number | null)[][] = [
      ["Bairro", "Tipo", "Dormitórios", "Quantidade", "Preço mediano", "Status", "Ação"],
      ...filteredTable.map((r) => [r.bairro, r.macro, r.dorms, r.qty, r.pmediana, r.status, r.acao]),
    ];
    downloadCsv(`oportunidades-portfolio-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }
  function exportRecomendacoesTxt() {
    const text = recomendacoes
      .map(([bairro, items]) => `${bairro}\n${items.map((i) => `- ${i}`).join("\n")}`)
      .join("\n\n");
    copyText(text);
  }

  if (notReady) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Carregando painel...
      </div>
    );
  }
  if (notAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-2xl">Acesso restrito</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sua conta não tem permissão de administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Painel
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-display text-lg tracking-tight">Inteligência de Portfólio</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => portfolio.refetch()}
              disabled={portfolio.isFetching}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-secondary transition disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${portfolio.isFetching ? "animate-spin" : ""}`} />
              Atualizar análise
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-xs font-medium hover:opacity-90 transition">
                  <Download className="h-3.5 w-3.5" />
                  Exportar
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => copyText(resumoExecutivo)}>
                  Copiar resumo executivo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportRecomendacoesTxt}>
                  Copiar recomendações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportTableCsv}>Oportunidades (CSV)</DropdownMenuItem>
                <DropdownMenuItem onClick={exportInsightsCsv}>Insights (CSV)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 sm:px-10 py-10">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Interno</div>
        <h1 className="mt-2 font-display font-light text-3xl sm:text-4xl tracking-tight">
          Inteligência de Portfólio
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Resumo dos imóveis ativos para orientar reposição de ofertas por bairro, tipologia e
          dormitórios.
        </p>
        <p className="mt-2 max-w-3xl text-xs text-muted-foreground">
          Use este painel para identificar onde há excesso, escassez ou oportunidade de captação no
          portfólio ativo.
        </p>

        {/* Data source */}
        <div className="mt-6 rounded-xl border border-border bg-card/70 px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <div className="inline-flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-muted-foreground">Fonte:</span>
            <span className="font-medium">Base ativa do site</span>
          </div>
          <div>
            <span className="text-muted-foreground">Última sincronização: </span>
            <span className="font-medium">
              {lastSync ? lastSync.toLocaleString("pt-BR") : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Analisados: </span>
            <span className="font-medium">{ativos} imóveis ativos</span>
          </div>
          <div className="text-muted-foreground italic">
            Dados consultados diretamente da base do site — sem dependência de XML estático.
          </div>
        </div>

        {portfolio.isLoading && (
          <div className="mt-10 text-sm text-muted-foreground">Carregando base de imóveis...</div>
        )}
        {portfolio.error && (
          <div className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Não foi possível carregar a base ativa do site.{" "}
            <span className="opacity-70">{(portfolio.error as Error).message}</span>
          </div>
        )}

        {portfolio.data && (
          <Tabs defaultValue="visao" className="mt-8">
            <TabsList className="h-auto flex-wrap gap-1 p-1">
              <TabsTrigger value="visao">Visão executiva</TabsTrigger>
              <TabsTrigger value="oport">Oportunidades</TabsTrigger>
              <TabsTrigger value="avanc">Análises avançadas</TabsTrigger>
              <TabsTrigger value="tec">Detalhes técnicos</TabsTrigger>
            </TabsList>

            {/* ─────────── VISÃO EXECUTIVA ─────────── */}
            <TabsContent value="visao" className="mt-6 space-y-2">
              {/* KPIs essenciais */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <KpiCard label="Imóveis ativos" value={ativos} hint="Publicados e disponíveis" tone="ok" />
                <KpiCard label="Bairros com imóveis" value={byNeighborhoodMap.size} />
                <KpiCard
                  label="Bairros estratégicos c/ baixa oferta"
                  value={bairrosBaixa}
                  hint="Até 10 imóveis ativos"
                  tone={bairrosBaixa > 0 ? "warn" : "default"}
                />
                <KpiCard
                  label="Combinações críticas"
                  value={combosCriticas}
                  hint="1–2 unidades por perfil"
                  tone={combosCriticas > 0 ? "critical" : "default"}
                />
                <KpiCard
                  label="Tipologia dominante"
                  value={tipDom?.name ?? "—"}
                  hint={`${tipDom?.value ?? 0} imóveis`}
                />
                <KpiCard
                  label="Faixa de preço dominante"
                  value={priceDom?.name ?? "—"}
                  hint={`${priceDom?.value ?? 0} imóveis`}
                />
              </div>

              {/* Onde captar agora */}
              <SectionTitle sub="Recomendações prioritárias com base no estoque atual">
                Onde captar agora
              </SectionTitle>
              {captarAgora.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
                  Sem alertas críticos de captação no momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {captarAgora.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-red-200 bg-gradient-to-b from-red-50/60 to-card p-5"
                    >
                      <div className="text-[10px] uppercase tracking-[0.18em] text-red-700 font-medium">
                        Prioridade alta
                      </div>
                      <div className="mt-1.5 font-display text-lg leading-tight">{r.bairro}</div>
                      <div className="mt-1 text-sm text-foreground/80">{r.perfil}</div>
                      <div className="mt-3 text-xs text-muted-foreground">{r.motivo}</div>
                      <div className="mt-3 text-xs">
                        <span className="font-medium">Ação:</span> {r.acao}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Gráficos essenciais */}
              <SectionTitle sub="Composição do estoque ativo">Distribuição do estoque</SectionTitle>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground mb-2">Por tipologia</div>
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie data={byMacro} dataKey="value" nameKey="name" outerRadius={80} innerRadius={45}>
                        {byMacro.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground mb-2">Por dormitórios</div>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={byBedrooms}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0f766e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bairros estratégicos com baixa oferta */}
              <SectionTitle sub="Menor oferta primeiro — foco em reposição">
                Bairros estratégicos com baixa oferta
              </SectionTitle>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={strategicCounts} layout="vertical" margin={{ left: 90 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" fontSize={11} />
                      <YAxis dataKey="name" type="category" fontSize={11} width={130} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {strategicCounts.map((r, i) => {
                          const s = neighborhoodStockStatus(r.value);
                          const c =
                            s.label === "CRÍTICO"
                              ? "#dc2626"
                              : s.label === "ALTO"
                                ? "#ea580c"
                                : s.label === "ATENÇÃO"
                                  ? "#eab308"
                                  : "#10b981";
                          return <Cell key={i} fill={c} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Matriz simplificada bairro × tipologia */}
                <div className="rounded-2xl border border-border bg-card p-4 overflow-x-auto">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-muted-foreground">Matriz bairro × tipologia</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-700" /> 0
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400" /> 1–2
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" /> 3–5
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" /> 6+
                    </div>
                  </div>
                  <table className="text-xs w-full">
                    <thead>
                      <tr>
                        <th className="text-left pr-3 py-1 font-medium text-muted-foreground sticky left-0 bg-card">
                          Bairro
                        </th>
                        {macroCols.map((c) => (
                          <th key={c} className="px-1.5 py-1 text-center font-medium text-muted-foreground">
                            {c === "Comercial/Especial" ? "Com." : c.slice(0, 4)}.
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatBairroMacro.map((r) => (
                        <tr key={r.bairro} className="border-t border-border">
                          <td className="pr-3 py-1 whitespace-nowrap sticky left-0 bg-card">{r.bairro}</td>
                          {r.values.map((v, i) => (
                            <td
                              key={i}
                              className={`px-1.5 py-1 text-center ${heatmapCellColor(v)} rounded`}
                            >
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Insights prioritários */}
              <SectionTitle sub="Combinações críticas em bairros estratégicos">
                Insights prioritários
              </SectionTitle>
              {topInsights.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
                  Sem alertas críticos no momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topInsights.map((i, idx) => (
                    <InsightCard key={idx} i={i} />
                  ))}
                </div>
              )}
              <div className="mt-4">
                <button
                  onClick={() => setInsightsOpen(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-foreground/80 hover:text-foreground"
                >
                  Ver todos os insights <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Resumo executivo */}
              <SectionTitle sub="Texto pronto para comunicação executiva">
                Resumo executivo
              </SectionTitle>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm leading-relaxed">{resumoExecutivo}</p>
                <button
                  onClick={() => copyText(resumoExecutivo)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs hover:bg-secondary"
                >
                  <Copy className="h-3.5 w-3.5" /> Copiar resumo
                </button>
              </div>
            </TabsContent>

            {/* ─────────── OPORTUNIDADES ─────────── */}
            <TabsContent value="oport" className="mt-6 space-y-4">
              <SectionTitle sub="Combinações bairro + tipo + dormitórios com maior potencial de captação">
                Tabela de oportunidades de reposição
              </SectionTitle>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Filter className="h-3.5 w-3.5" /> Filtros:
                </div>
                <select
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs"
                  value={filterBairro}
                  onChange={(e) => {
                    setFilterBairro(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Todos os bairros</option>
                  {[...new Set(table.map((r) => r.bairro))].sort().map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
                <select
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs"
                  value={filterMacro}
                  onChange={(e) => {
                    setFilterMacro(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Todos os tipos</option>
                  {MACRO_TYPES.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <select
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs"
                  value={filterDorm}
                  onChange={(e) => {
                    setFilterDorm(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Todos os dormitórios</option>
                  {BEDROOM_GROUPS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
                <select
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Todos os status</option>
                  {["Crítico", "Reforçar captação", "Monitorar", "Saudável"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyStrategic}
                    onChange={(e) => {
                      setOnlyStrategic(e.target.checked);
                      setPage(1);
                    }}
                  />
                  Somente bairros estratégicos
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHealthy}
                    onChange={(e) => {
                      setShowHealthy(e.target.checked);
                      setPage(1);
                    }}
                  />
                  Mostrar também saudáveis/monitorar
                </label>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/60 text-left uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Bairro</th>
                      <th className="px-3 py-2">Perfil</th>
                      <th className="px-3 py-2 text-right">Qtd</th>
                      <th className="px-3 py-2 text-right">Preço mediano</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Ação</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {pagedTable.map((r, i) => (
                      <tr
                        key={i}
                        className="border-t border-border hover:bg-secondary/40 cursor-pointer"
                        onClick={() => setSelectedRow(r)}
                      >
                        <td className="px-3 py-2 whitespace-nowrap font-medium">{r.bairro}</td>
                        <td className="px-3 py-2">
                          {r.macro} · {r.dorms} dorm.
                        </td>
                        <td className="px-3 py-2 text-right font-medium">{r.qty}</td>
                        <td className="px-3 py-2 text-right">{brl(r.pmediana)}</td>
                        <td className="px-3 py-2">
                          <StatusChip status={r.status} />
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{r.acao}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </td>
                      </tr>
                    ))}
                    {pagedTable.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                          Nenhuma oportunidade para os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-2">
                {pagedTable.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedRow(r)}
                    className="w-full text-left rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{r.bairro}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {r.macro} · {r.dorms} dorm.
                        </div>
                      </div>
                      <StatusChip status={r.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span>
                        <strong>{r.qty}</strong> unid.
                      </span>
                      <span className="text-muted-foreground">{brl(r.pmediana)}</span>
                    </div>
                  </button>
                ))}
                {pagedTable.length === 0 && (
                  <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                    Nenhuma oportunidade para os filtros selecionados.
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-muted-foreground">
                  {filteredTable.length} oportunidade{filteredTable.length === 1 ? "" : "s"} — página{" "}
                  {page}/{totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs"
                  >
                    <option value={20}>20 por página</option>
                    <option value={50}>50 por página</option>
                    <option value={100}>100 por página</option>
                  </select>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-full border border-border bg-background px-3 py-1 hover:bg-secondary disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-full border border-border bg-background px-3 py-1 hover:bg-secondary disabled:opacity-40"
                  >
                    Próxima
                  </button>
                </div>
              </div>

              {/* Recomendações agrupadas */}
              <SectionTitle sub="Ações agrupadas por bairro estratégico">
                Recomendações de reposição
              </SectionTitle>
              {recomendacoes.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
                  Sem recomendações críticas no momento.
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                  {recomendacoes.map(([bairro, items]) => (
                    <div key={bairro}>
                      <div className="font-medium text-sm">{bairro}</div>
                      <ul className="mt-1 space-y-1 text-sm">
                        {items.map((it, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-emerald-600">•</span>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      onClick={exportRecomendacoesTxt}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs hover:bg-secondary"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copiar recomendações
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        recomendacoes
                          .map(([b, its]) => `${b}\n${its.map((i) => `- ${i}`).join("\n")}`)
                          .join("\n\n"),
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-4 py-2 text-xs hover:bg-emerald-700"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Enviar por WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ─────────── ANÁLISES AVANÇADAS ─────────── */}
            <TabsContent value="avanc" className="mt-6">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="preco-med">
                  <AccordionTrigger>Preço mediano por bairro</AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <ResponsiveContainer width="100%" height={360}>
                        <BarChart data={medianByBairro} layout="vertical" margin={{ left: 90 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis type="number" fontSize={10} tickFormatter={(v) => brl(v)} />
                          <YAxis dataKey="name" type="category" fontSize={11} width={130} />
                          <Tooltip formatter={(v: number) => brl(v)} />
                          <Bar dataKey="value" fill="#0f766e" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="ppm2">
                  <AccordionTrigger>Preço mediano por m² (bairro)</AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <ResponsiveContainer width="100%" height={360}>
                        <BarChart data={ppm2ByBairro} layout="vertical" margin={{ left: 90 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis type="number" fontSize={10} tickFormatter={(v) => brl(v)} />
                          <YAxis dataKey="name" type="category" fontSize={11} width={130} />
                          <Tooltip formatter={(v: number) => brl(v)} />
                          <Bar dataKey="value" fill="#db2777" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="scatter">
                  <AccordionTrigger>Dispersão preço × área</AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <ResponsiveContainer width="100%" height={420}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="x" name="Área (m²)" fontSize={11} type="number" />
                          <YAxis
                            dataKey="y"
                            name="Preço"
                            fontSize={11}
                            type="number"
                            tickFormatter={(v) => brl(v)}
                          />
                          <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            content={({ active: a, payload }) => {
                              if (!a || !payload || !payload.length) return null;
                              const d = payload[0].payload as {
                                code: string;
                                title: string;
                                bairro: string;
                                bedrooms: number | null;
                                x: number;
                                y: number;
                              };
                              return (
                                <div className="rounded-md border border-border bg-background p-2 text-xs">
                                  <div className="font-medium">Cód. {d.code}</div>
                                  <div className="line-clamp-2 max-w-xs">{d.title}</div>
                                  <div>
                                    {d.bairro} · {d.bedrooms ?? "—"} dorm.
                                  </div>
                                  <div>
                                    {brl(d.y)} · {d.x} m²
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          {scatterByMacro.map((s, i) => (
                            <Scatter
                              key={s.macro}
                              name={s.macro}
                              data={s.data}
                              fill={COLORS[i % COLORS.length]}
                            />
                          ))}
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="top-bairros">
                  <AccordionTrigger>Top 15 bairros por imóveis ativos</AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <ResponsiveContainer width="100%" height={420}>
                        <BarChart data={topBairros} layout="vertical" margin={{ left: 90 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis type="number" fontSize={11} />
                          <YAxis dataKey="name" type="category" fontSize={11} width={130} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#0891b2" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="preco-band">
                  <AccordionTrigger>Distribuição por faixa de preço</AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={byPrice}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" fontSize={10} />
                          <YAxis fontSize={11} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            {/* ─────────── DETALHES TÉCNICOS ─────────── */}
            <TabsContent value="tec" className="mt-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard label="Total na base" value={totalArquivo} />
                <KpiCard label="Publicados" value={publicados} />
                <KpiCard label="Ativos inferidos" value={ativos} />
                <KpiCard label="Confirmados disponíveis" value={confirmados} />
                <KpiCard label="Com erro de verificação" value={comErro} tone={comErro > 0 ? "warn" : "default"} />
                <KpiCard label="Indisponíveis" value={indisponiveis} />
                <KpiCard label="Preço médio" value={brl(precoMed)} />
                <KpiCard label="Preço mediano" value={brl(precoMediano)} />
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground space-y-2">
                <div>
                  <strong className="text-foreground">Fonte:</strong> a página consulta diretamente
                  a base ativa do site (mesma fonte usada pelas páginas públicas de imóveis). Não
                  há dependência de arquivo XML estático.
                </div>
                <div>
                  <strong className="text-foreground">Critério de ativo:</strong> publicado
                  (published=true), sem data em unavailable_since e sem status not_found/unavailable
                  em last_check_status.
                </div>
                <div>
                  <strong className="text-foreground">Normalização:</strong> bairros e tipologias
                  são normalizados para agrupamentos padrão (Apartamento, Casa, Cobertura, Terreno,
                  Comercial/Especial). Bairros estratégicos são um conjunto pré-definido de regiões
                  prioritárias de captação.
                </div>
                <div>
                  <strong className="text-foreground">Última sincronização:</strong>{" "}
                  {lastSync ? lastSync.toLocaleString("pt-BR") : "—"}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Drawer: detalhes da oportunidade */}
      <Sheet open={!!selectedRow} onOpenChange={(o) => !o && setSelectedRow(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedRow && (
            <>
              <SheetHeader>
                <SheetTitle>Detalhes da oportunidade</SheetTitle>
                <SheetDescription>
                  {selectedRow.bairro} · {selectedRow.macro} · {selectedRow.dorms} dorm.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Quantidade atual
                    </div>
                    <div className="mt-1 font-display text-2xl">{selectedRow.qty}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Status
                    </div>
                    <div className="mt-2">
                      <StatusChip status={selectedRow.status} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="Preço mínimo" value={brl(selectedRow.pmin)} />
                  <Metric label="Preço médio" value={brl(selectedRow.pmed)} />
                  <Metric label="Preço mediano" value={brl(selectedRow.pmediana)} />
                  <Metric label="Preço máximo" value={brl(selectedRow.pmax)} />
                  <Metric
                    label="Área média"
                    value={selectedRow.areaMedia ? `${Math.round(selectedRow.areaMedia)} m²` : "—"}
                  />
                  <Metric label="Ação sugerida" value={selectedRow.acao} />
                </div>
                {selectedRow.items.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                      Imóveis nesta combinação ({selectedRow.items.length})
                    </div>
                    <ul className="space-y-1.5 max-h-72 overflow-y-auto">
                      {selectedRow.items.slice(0, 30).map((p) => (
                        <li key={p.id} className="text-xs">
                          <Link
                            to="/imovel/$code"
                            params={{ code: p.code }}
                            className="text-foreground hover:underline"
                          >
                            <span className="font-medium">Cód. {p.code}</span> — {p.title}{" "}
                            <span className="text-muted-foreground">
                              · {brl(p.price_brl)}
                              {p.area_m2 ? ` · ${p.area_m2} m²` : ""}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Drawer: todos os insights */}
      <Sheet open={insightsOpen} onOpenChange={setInsightsOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Todos os insights</SheetTitle>
            <SheetDescription>
              {insights.length} combinações analisadas — ordenadas por prioridade.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-2">
            {insights.map((i, idx) => (
              <div key={idx} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm">
                    {i.bairro} — {i.tipo} · {i.dorms} dorm.
                  </div>
                  <PriorityChip priority={i.priority} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {i.quantidade} unidade{i.quantidade === 1 ? "" : "s"} ativa
                  {i.quantidade === 1 ? "" : "s"}
                </div>
                <div className="mt-2 text-xs">{i.diagnostico}</div>
                <div className="mt-1 text-xs text-foreground/80">
                  <strong>Ação:</strong> {i.acao}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

function InsightCard({ i }: { i: Insight }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium text-sm leading-tight">
          {i.bairro} — {i.tipo} {i.dorms} dorm.
        </div>
        <PriorityChip priority={i.priority} />
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {i.quantidade} unidade{i.quantidade === 1 ? "" : "s"} ativa
        {i.quantidade === 1 ? "" : "s"}
      </div>
      <div className="mt-3 text-xs text-foreground/80">{i.diagnostico}</div>
      <div className="mt-2 text-xs">
        <strong>Ação:</strong> {i.acao}
      </div>
    </div>
  );
}
