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
import { ArrowLeft, Download, RefreshCw, Copy, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/admin/inteligencia-portfolio")({
  head: () => ({ meta: [{ title: "Inteligência de Portfólio · Michele Prietsch" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: PortfolioIntelligencePage,
});

const COLORS = ["#0f766e", "#0891b2", "#7c3aed", "#db2777", "#ea580c", "#65a30d", "#a16207"];

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mt-12 mb-4">
      <h2 className="font-display text-xl tracking-tight">{children}</h2>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
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

  // KPIs & datasets
  const totalArquivo = enriched.length;
  const publicados = enriched.filter((p) => p.published).length;
  const ativos = active.length;
  const confirmados = enriched.filter((p) => (p.last_check_status ?? "").toLowerCase() === "available").length;
  const comErro = enriched.filter((p) => (p.last_check_status ?? "").toLowerCase() === "error").length;
  const indisponiveis = enriched.filter(
    (p) => !p.published || p.unavailable_since || ["not_found", "unavailable", "indisponivel"].includes((p.last_check_status ?? "").toLowerCase()),
  ).length;

  const byMacro = MACRO_TYPES.map((m) => ({ name: m, value: active.filter((p) => p.macro === m).length }));
  const byBedrooms = BEDROOM_GROUPS.map((b) => ({ name: `${b} dorm.`, value: active.filter((p) => p.bedGroup === b).length }));
  const byPrice = PRICE_BANDS.map((b) => ({ name: b, value: active.filter((p) => p.band === b).length }));

  const byNeighborhoodMap = new Map<string, number>();
  for (const p of active) byNeighborhoodMap.set(p.n_bairro, (byNeighborhoodMap.get(p.n_bairro) ?? 0) + 1);
  const topBairros = [...byNeighborhoodMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, value]) => ({ name, value }));

  const strategicCounts = STRATEGIC_NEIGHBORHOODS.map((n) => ({ name: n, value: byNeighborhoodMap.get(n) ?? 0 }))
    .sort((a, b) => a.value - b.value);

  const insights = useMemo(() => generatePortfolioInsights(enriched), [enriched]);

  // Dominants
  const tipDom = [...byMacro].sort((a, b) => b.value - a.value)[0];
  const priceDom = [...byPrice].sort((a, b) => b.value - a.value)[0];
  const dormDom = [...byBedrooms].sort((a, b) => b.value - a.value)[0];
  const prices = active.map((p) => p.price_brl ?? 0).filter((v) => v > 0);
  const precoMed = mean(prices);
  const precoMediano = median(prices);
  const bairrosBaixa = strategicCounts.filter((n) => n.value > 0 && n.value <= 10).length;
  const combosCriticas = insights.filter((i) => i.quantidade <= 2 && (i.priority === "Alta" || i.priority === "Média")).length;

  // Heatmap bairro × macro
  const macroCols: MacroType[] = ["Apartamento", "Casa", "Cobertura", "Terreno", "Comercial/Especial"];
  const heatBairroMacro = STRATEGIC_NEIGHBORHOODS.map((b) => ({
    bairro: b,
    values: macroCols.map((m) => active.filter((p) => p.n_bairro === b && p.macro === m).length),
  }));
  const bedCols: BedroomGroup[] = ["1", "2", "3", "4+"];
  const heatBairroDorm = STRATEGIC_NEIGHBORHOODS.map((b) => ({
    bairro: b,
    values: bedCols.map((bg) => active.filter((p) => p.n_bairro === b && p.bedGroup === bg).length),
  }));

  // Median price per strategic neighborhood (≥ 3 imóveis)
  const medianByBairro = STRATEGIC_NEIGHBORHOODS
    .map((b) => {
      const vals = active.filter((p) => p.n_bairro === b).map((p) => p.price_brl ?? 0).filter((v) => v > 0);
      return { name: b, value: vals.length >= 3 ? Math.round(median(vals)!) : 0, n: vals.length };
    })
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  const ppm2ByBairro = STRATEGIC_NEIGHBORHOODS
    .map((b) => {
      const vals = active
        .filter((p) => p.n_bairro === b && p.pricePerM2 != null)
        .map((p) => p.pricePerM2 as number);
      return { name: b, value: vals.length >= 3 ? Math.round(median(vals)!) : 0 };
    })
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  // Scatter
  const scatterByMacro = MACRO_TYPES.map((m) => ({
    macro: m,
    data: active
      .filter((p) => p.macro === m && p.price_brl && p.area_m2 && p.area_m2 > 0)
      .map((p) => ({ x: p.area_m2!, y: p.price_brl!, code: p.code, title: p.title, bairro: p.n_bairro, bedrooms: p.bedrooms, source: p.source_url })),
  })).filter((s) => s.data.length > 0);

  // Table: bairro × tipo × dorms aggregation
  type Row = {
    bairro: string;
    macro: MacroType;
    tipo_orig: string;
    dorms: BedroomGroup;
    qty: number;
    pmin: number | null;
    pmed: number | null;
    pmediana: number | null;
    pmax: number | null;
    areaMedia: number | null;
    status: string;
    acao: string;
  };
  const [filterBairro, setFilterBairro] = useState("");
  const [filterMacro, setFilterMacro] = useState("");
  const [filterDorm, setFilterDorm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const table: Row[] = useMemo(() => {
    const map = new Map<string, EnrichedProperty[]>();
    for (const p of active) {
      const k = `${p.n_bairro}||${p.macro}||${p.property_type ?? "—"}||${p.bedGroup}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    }
    const rows: Row[] = [];
    for (const [k, list] of map) {
      const [bairro, macro, tipo_orig, dorms] = k.split("||");
      const prices = list.map((p) => p.price_brl ?? 0).filter((v) => v > 0);
      const areas = list.map((p) => p.area_m2 ?? 0).filter((v) => v > 0);
      const qty = list.length;
      let status = "Saudável";
      let acao = "Manter";
      if (qty === 0) { status = "Ausente"; acao = "Captar"; }
      else if (qty === 1) { status = "Crítico"; acao = "Captar urgente"; }
      else if (qty === 2) { status = "Repor"; acao = "Reforçar captação"; }
      else if (qty <= 5) { status = "Monitorar"; acao = "Monitorar"; }
      rows.push({
        bairro,
        macro: macro as MacroType,
        tipo_orig,
        dorms: dorms as BedroomGroup,
        qty,
        pmin: prices.length ? Math.min(...prices) : null,
        pmed: mean(prices),
        pmediana: median(prices),
        pmax: prices.length ? Math.max(...prices) : null,
        areaMedia: mean(areas),
        status,
        acao,
      });
    }
    return rows.sort((a, b) => a.qty - b.qty || a.bairro.localeCompare(b.bairro));
  }, [active]);

  const filteredTable = table.filter((r) => {
    if (filterBairro && r.bairro !== filterBairro) return false;
    if (filterMacro && r.macro !== filterMacro) return false;
    if (filterDorm && r.dorms !== filterDorm) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  // Recommendations
  const recomendacoes = useMemo(() => {
    const recs: string[] = [];
    for (const b of STRATEGIC_NEIGHBORHOODS) {
      const count = byNeighborhoodMap.get(b) ?? 0;
      if (count === 0) continue;
      if (count <= 5) recs.push(`Ampliar estoque em ${b} (apenas ${count} imóveis ativos) — priorizar apartamentos, casas e coberturas.`);
      else if (count <= 10) recs.push(`Reforçar captação em ${b} (${count} imóveis ativos), especialmente em combinações com apenas 1 ou 2 unidades.`);
    }
    const critApt = insights.filter((i) => i.tipo === "Apartamento" && i.quantidade <= 2).slice(0, 5);
    for (const i of critApt) {
      recs.push(`Buscar apartamentos de ${i.dorms} dormitórios em ${i.bairro} (${i.quantidade} unidade${i.quantidade === 1 ? "" : "s"} hoje).`);
    }
    const critCob = insights.filter((i) => i.tipo === "Cobertura" && i.quantidade <= 2).slice(0, 5);
    for (const i of critCob) {
      recs.push(`Repor coberturas em ${i.bairro} (${i.quantidade} unidade${i.quantidade === 1 ? "" : "s"} de ${i.dorms} dormitórios).`);
    }
    return Array.from(new Set(recs)).slice(0, 20);
  }, [byNeighborhoodMap, insights]);

  const resumoExecutivo = `Hoje o site possui ${ativos} imóveis ativos. O estoque está mais concentrado em ${tipDom?.name?.toLowerCase() ?? "—"}, com predominância de imóveis com ${dormDom?.name ?? "—"} e faixa de preço dominante ${priceDom?.name ?? "—"}. Bairros estratégicos com baixa oferta: ${strategicCounts.filter((n) => n.value > 0 && n.value <= 10).map((n) => `${n.name} (${n.value})`).join(", ") || "nenhum"}. Recomenda-se priorizar a captação de apartamentos e coberturas em bairros estratégicos, especialmente combinações com apenas 1 ou 2 imóveis ativos.`;

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // no-op
    }
  }

  function exportInsightsCsv() {
    const rows: (string | number | null)[][] = [
      ["Prioridade", "Score", "Bairro", "Tipo", "Dormitórios", "Quantidade", "Preço mediano", "Diagnóstico", "Ação"],
      ...insights.map((i) => [i.priority, i.score, i.bairro, i.tipo, i.dorms, i.quantidade, i.precoRef ?? "", i.diagnostico, i.acao]),
    ];
    downloadCsv(`insights-portfolio-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }
  function exportTableCsv() {
    const rows: (string | number | null)[][] = [
      ["Bairro", "Tipo macro", "Tipo original", "Dormitórios", "Quantidade", "Preço mínimo", "Preço médio", "Preço mediano", "Preço máximo", "Área média", "Status", "Ação"],
      ...filteredTable.map((r) => [r.bairro, r.macro, r.tipo_orig, r.dorms, r.qty, r.pmin, r.pmed ? Math.round(r.pmed) : null, r.pmediana, r.pmax, r.areaMedia ? Math.round(r.areaMedia) : null, r.status, r.acao]),
    ];
    downloadCsv(`combinacoes-portfolio-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Painel
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-display text-lg tracking-tight">Inteligência de Portfólio</span>
          </div>
          <button
            onClick={() => portfolio.refetch()}
            disabled={portfolio.isFetching}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-secondary transition disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${portfolio.isFetching ? "animate-spin" : ""}`} />
            Atualizar análise
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 sm:px-10 py-10">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Interno</div>
        <h1 className="mt-2 font-display font-light text-3xl sm:text-4xl tracking-tight">Inteligência de Portfólio</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Análise dos imóveis ativos por bairro, tipologia, dormitórios e faixa de preço para orientar reposição de ofertas.
        </p>

        {portfolio.isLoading && (
          <div className="mt-10 text-sm text-muted-foreground">Carregando base de imóveis...</div>
        )}
        {portfolio.error && (
          <div className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {(portfolio.error as Error).message}
          </div>
        )}

        {portfolio.data && (
          <>
            {/* KPIs */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Total no arquivo" value={String(totalArquivo)} />
              <KpiCard label="Publicados" value={String(publicados)} />
              <KpiCard label="Ativos inferidos" value={String(ativos)} />
              <KpiCard label="Confirmados disponíveis" value={String(confirmados)} />
              <KpiCard label="Com erro de verificação" value={String(comErro)} />
              <KpiCard label="Indisponíveis" value={String(indisponiveis)} />
              <KpiCard label="Bairros com ativos" value={String(byNeighborhoodMap.size)} />
              <KpiCard label="Combinações críticas" value={String(combosCriticas)} hint="1–2 unidades em bairro estratégico" />
              <KpiCard label="Tipologia dominante" value={tipDom?.name ?? "—"} hint={`${tipDom?.value ?? 0} imóveis`} />
              <KpiCard label="Faixa dominante" value={priceDom?.name ?? "—"} hint={`${priceDom?.value ?? 0} imóveis`} />
              <KpiCard label="Dormitórios dominantes" value={dormDom?.name ?? "—"} hint={`${dormDom?.value ?? 0} imóveis`} />
              <KpiCard label="Bairros estratégicos com baixa oferta" value={String(bairrosBaixa)} hint="≤ 10 ativos" />
              <KpiCard label="Preço médio" value={brl(precoMed)} />
              <KpiCard label="Preço mediano" value={brl(precoMediano)} />
            </div>

            {/* Charts row 1 */}
            <SectionTitle sub="Composição do estoque ativo">Distribuição geral</SectionTitle>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-2">Por tipologia</div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={byMacro} dataKey="value" nameKey="name" outerRadius={90} label>
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
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={byBedrooms}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0f766e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-2">Por faixa de preço</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={byPrice}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bairros */}
            <SectionTitle sub="Bairros com mais volume e bairros estratégicos com menor oferta">Ranking de bairros</SectionTitle>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-2">Top 15 bairros por imóveis ativos</div>
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={topBairros} layout="vertical" margin={{ left: 90 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" fontSize={11} />
                    <YAxis dataKey="name" type="category" fontSize={11} width={130} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0891b2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-2">Bairros estratégicos — menor oferta primeiro</div>
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={strategicCounts} layout="vertical" margin={{ left: 90 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" fontSize={11} />
                    <YAxis dataKey="name" type="category" fontSize={11} width={130} />
                    <Tooltip />
                    <Bar dataKey="value">
                      {strategicCounts.map((r, i) => {
                        const s = neighborhoodStockStatus(r.value);
                        const c = s.label === "CRÍTICO" ? "#dc2626" : s.label === "ALTO" ? "#ea580c" : s.label === "ATENÇÃO" ? "#eab308" : "#10b981";
                        return <Cell key={i} fill={c} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Heatmaps */}
            <SectionTitle sub="Bairros estratégicos versus tipologia e dormitórios (vermelho = baixa oferta)">Matrizes de oferta</SectionTitle>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-4 overflow-x-auto">
                <div className="text-xs text-muted-foreground mb-2">Bairro × Tipologia</div>
                <table className="text-xs w-full">
                  <thead>
                    <tr>
                      <th className="text-left pr-3 py-1 font-medium text-muted-foreground">Bairro</th>
                      {macroCols.map((c) => (
                        <th key={c} className="px-2 py-1 text-center font-medium text-muted-foreground">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatBairroMacro.map((r) => (
                      <tr key={r.bairro} className="border-t border-border">
                        <td className="pr-3 py-1 whitespace-nowrap">{r.bairro}</td>
                        {r.values.map((v, i) => (
                          <td key={i} className={`px-2 py-1 text-center ${heatmapCellColor(v)} rounded`}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 overflow-x-auto">
                <div className="text-xs text-muted-foreground mb-2">Bairro × Dormitórios</div>
                <table className="text-xs w-full">
                  <thead>
                    <tr>
                      <th className="text-left pr-3 py-1 font-medium text-muted-foreground">Bairro</th>
                      {bedCols.map((c) => (
                        <th key={c} className="px-2 py-1 text-center font-medium text-muted-foreground">{c} dorm.</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatBairroDorm.map((r) => (
                      <tr key={r.bairro} className="border-t border-border">
                        <td className="pr-3 py-1 whitespace-nowrap">{r.bairro}</td>
                        {r.values.map((v, i) => (
                          <td key={i} className={`px-2 py-1 text-center ${heatmapCellColor(v)} rounded`}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Preços */}
            <SectionTitle sub="Bairros estratégicos com pelo menos 3 imóveis ativos">Preços por bairro</SectionTitle>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-2">Preço mediano por bairro</div>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={medianByBairro} layout="vertical" margin={{ left: 90 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" fontSize={10} tickFormatter={(v) => brl(v)} />
                    <YAxis dataKey="name" type="category" fontSize={11} width={130} />
                    <Tooltip formatter={(v: number) => brl(v)} />
                    <Bar dataKey="value" fill="#0f766e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-2">Preço mediano por m² (bairro)</div>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={ppm2ByBairro} layout="vertical" margin={{ left: 90 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" fontSize={10} tickFormatter={(v) => brl(v)} />
                    <YAxis dataKey="name" type="category" fontSize={11} width={130} />
                    <Tooltip formatter={(v: number) => brl(v)} />
                    <Bar dataKey="value" fill="#db2777" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scatter */}
            <SectionTitle sub="Cada ponto é um imóvel ativo — cor pela tipologia">Dispersão preço × área</SectionTitle>
            <div className="rounded-2xl border border-border bg-card p-4">
              <ResponsiveContainer width="100%" height={420}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="x" name="Área (m²)" fontSize={11} type="number" />
                  <YAxis dataKey="y" name="Preço" fontSize={11} type="number" tickFormatter={(v) => brl(v)} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active: a, payload }) => {
                      if (!a || !payload || !payload.length) return null;
                      const d = payload[0].payload as { code: string; title: string; bairro: string; bedrooms: number | null; x: number; y: number };
                      return (
                        <div className="rounded-md border border-border bg-background p-2 text-xs">
                          <div className="font-medium">Cód. {d.code}</div>
                          <div className="line-clamp-2 max-w-xs">{d.title}</div>
                          <div>{d.bairro} · {d.bedrooms ?? "—"} dorm.</div>
                          <div>{brl(d.y)} · {d.x} m²</div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {scatterByMacro.map((s, i) => (
                    <Scatter key={s.macro} name={s.macro} data={s.data} fill={COLORS[i % COLORS.length]} />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Insights cards */}
            <SectionTitle sub="Combinações bairro estratégico + tipo + dormitórios com baixa oferta, ordenadas por prioridade">Insights automáticos</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {insights.slice(0, 24).map((i, idx) => (
                <InsightCard key={idx} i={i} />
              ))}
              {insights.length === 0 && (
                <div className="text-sm text-muted-foreground">Sem alertas críticos no momento.</div>
              )}
            </div>

            {/* Recommendations */}
            <SectionTitle sub="Frases acionáveis para captação">Recomendações de reposição de ofertas</SectionTitle>
            <div className="rounded-2xl border border-border bg-card p-5">
              <ul className="space-y-2 text-sm">
                {recomendacoes.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-emerald-600">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => copyText(recomendacoes.join("\n"))} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs hover:bg-secondary">
                  <Copy className="h-3.5 w-3.5" /> Copiar recomendações
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(recomendacoes.join("\n"))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-4 py-2 text-xs hover:bg-emerald-700"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Enviar por WhatsApp
                </a>
              </div>
            </div>

            {/* Executive summary */}
            <SectionTitle sub="Texto pronto para comunicação executiva">Resumo executivo</SectionTitle>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm leading-relaxed">{resumoExecutivo}</p>
              <button
                onClick={() => copyText(resumoExecutivo)}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs hover:bg-secondary"
              >
                <Copy className="h-3.5 w-3.5" /> Copiar resumo
              </button>
            </div>

            {/* Table */}
            <SectionTitle sub="Combinações de bairro, tipo e dormitórios">Tabela gerencial de estoque</SectionTitle>
            <div className="flex flex-wrap gap-2 mb-3">
              <select className="rounded-full border border-border bg-background px-3 py-1.5 text-xs" value={filterBairro} onChange={(e) => setFilterBairro(e.target.value)}>
                <option value="">Todos os bairros</option>
                {[...new Set(table.map((r) => r.bairro))].sort().map((b) => <option key={b}>{b}</option>)}
              </select>
              <select className="rounded-full border border-border bg-background px-3 py-1.5 text-xs" value={filterMacro} onChange={(e) => setFilterMacro(e.target.value)}>
                <option value="">Todos os tipos</option>
                {MACRO_TYPES.map((m) => <option key={m}>{m}</option>)}
              </select>
              <select className="rounded-full border border-border bg-background px-3 py-1.5 text-xs" value={filterDorm} onChange={(e) => setFilterDorm(e.target.value)}>
                <option value="">Todos os dormitórios</option>
                {BEDROOM_GROUPS.map((b) => <option key={b}>{b}</option>)}
              </select>
              <select className="rounded-full border border-border bg-background px-3 py-1.5 text-xs" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Todos os status</option>
                {["Ausente", "Crítico", "Repor", "Monitorar", "Saudável"].map((s) => <option key={s}>{s}</option>)}
              </select>
              <button onClick={exportTableCsv} className="ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs hover:bg-secondary">
                <Download className="h-3.5 w-3.5" /> Exportar tabela CSV
              </button>
              <button onClick={exportInsightsCsv} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs hover:bg-secondary">
                <Download className="h-3.5 w-3.5" /> Exportar insights CSV
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-xs">
                <thead className="bg-secondary/60 text-left uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Bairro</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Tipo original</th>
                    <th className="px-3 py-2">Dorm.</th>
                    <th className="px-3 py-2 text-right">Qtd</th>
                    <th className="px-3 py-2 text-right">Preço mín.</th>
                    <th className="px-3 py-2 text-right">Preço médio</th>
                    <th className="px-3 py-2 text-right">Preço mediano</th>
                    <th className="px-3 py-2 text-right">Preço máx.</th>
                    <th className="px-3 py-2 text-right">Área média</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTable.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 whitespace-nowrap">{r.bairro}</td>
                      <td className="px-3 py-2">{r.macro}</td>
                      <td className="px-3 py-2 text-muted-foreground">{r.tipo_orig}</td>
                      <td className="px-3 py-2">{r.dorms}</td>
                      <td className="px-3 py-2 text-right font-medium">{r.qty}</td>
                      <td className="px-3 py-2 text-right">{brl(r.pmin)}</td>
                      <td className="px-3 py-2 text-right">{brl(r.pmed)}</td>
                      <td className="px-3 py-2 text-right">{brl(r.pmediana)}</td>
                      <td className="px-3 py-2 text-right">{brl(r.pmax)}</td>
                      <td className="px-3 py-2 text-right">{r.areaMedia ? `${Math.round(r.areaMedia)} m²` : "—"}</td>
                      <td className="px-3 py-2">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{r.acao}</td>
                    </tr>
                  ))}
                  {filteredTable.length === 0 && (
                    <tr><td colSpan={12} className="px-3 py-8 text-center text-muted-foreground">Nenhuma combinação para os filtros selecionados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Ausente: "bg-red-700 text-white",
    Crítico: "bg-red-500 text-white",
    Repor: "bg-orange-500 text-white",
    Monitorar: "bg-yellow-400 text-yellow-950",
    Saudável: "bg-emerald-500 text-white",
  };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${map[status] ?? "bg-secondary text-foreground"}`}>{status}</span>;
}

function InsightCard({ i }: { i: Insight }) {
  const color =
    i.priority === "Alta" ? "border-red-500/40 bg-red-50" :
    i.priority === "Média" ? "border-orange-500/40 bg-orange-50" :
    i.priority === "Monitorar" ? "border-yellow-500/40 bg-yellow-50" :
    "border-border bg-card";
  const badge =
    i.priority === "Alta" ? "bg-red-500 text-white" :
    i.priority === "Média" ? "bg-orange-500 text-white" :
    i.priority === "Monitorar" ? "bg-yellow-400 text-yellow-950" :
    "bg-secondary text-foreground";
  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge}`}>Prioridade {i.priority}</span>
        <span className="text-[10px] text-muted-foreground">score {i.score}</span>
      </div>
      <div className="mt-2 font-medium text-sm">{i.bairro}</div>
      <div className="text-xs text-muted-foreground">{i.tipo} · {i.dorms} dormitórios · {i.quantidade} unidade{i.quantidade === 1 ? "" : "s"}</div>
      {i.precoRef && <div className="mt-1 text-xs">Preço mediano: {brl(i.precoRef)}</div>}
      <div className="mt-2 text-xs">{i.diagnostico}</div>
      <div className="mt-1 text-xs font-medium">{i.acao}</div>
    </div>
  );
}
