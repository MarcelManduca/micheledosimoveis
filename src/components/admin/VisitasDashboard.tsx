import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileWarning } from "lucide-react";

interface Visita {
  equipe_codigo: string;
  equipe_nome: string;
  data: string;
}

interface EquipeLookup {
  [key: string]: string;
}

export function VisitasDashboard() {
  const { data: visitas = [], isLoading: isLoadingVisitas } = useQuery<Visita[]>({
    queryKey: ["visitas-detalhes"],
    queryFn: () => fetch("/data/visitas_detalhes.json").then(r => r.json()),
  });

  const { data: equipes = {} } = useQuery<EquipeLookup>({
    queryKey: ["equipes-lookup"],
    queryFn: () => fetch("/data/equipes.json").then(r => r.json()),
  });

  const { stats, error } = useMemo(() => {
    // 1. Filtragem (exemplo: Janeiro 2026)
    const visitasFiltradas = visitas.filter(v => v.data.startsWith("2026-01"));
    
    // 2. Agrupamento em UMA ÚNICA PASSAGEM
    const grupos = visitasFiltradas.reduce((acc, v) => {
      const key = String(v.equipe_codigo);
      if (!acc[key]) {
        let label = v.equipe_nome;
        if (!label) {
          if (key === "0") label = "Equipe 0";
          else if (key === "1") label = "Equipe 1";
          else if (key === "NAO_DISPONIVEL") label = "Equipe não disponível";
          else if (key === "SEM_EQUIPE") label = "Sem equipe";
          else label = equipes[key] || "Outros";
        }
        acc[key] = { label, count: 0 };
      }
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { label: string; count: number }>);

    const rows = Object.values(grupos).filter(r => !(r.label === "Sem equipe" && r.count === 0));
    const totalDasLinhas = rows.reduce((sum, r) => sum + r.count, 0);

    // 3. Asserção obrigatória
    let assertionError = null;
    if (visitasFiltradas.length > 0 && totalDasLinhas !== visitasFiltradas.length) {
      assertionError = `Erro de integridade: Soma das linhas (${totalDasLinhas}) diverge do total filtrado (${visitasFiltradas.length}).`;
      if (process.env.NODE_ENV === 'development') {
        console.error(assertionError);
      }
    }

    return { 
      stats: rows, 
      total: totalDasLinhas,
      error: assertionError 
    };
  }, [visitas, equipes]);

  if (isLoadingVisitas) return <div>Carregando dashboard...</div>;
  if (error) return (
    <Alert variant="destructive">
      <FileWarning className="h-4 w-4" />
      <AlertTitle>Erro Crítico de Contagem</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipe</TableHead>
              <TableHead className="text-right">Visitas (Jan/26)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((row) => (
              <TableRow key={row.label}>
                <TableCell>{row.label}</TableCell>
                <TableCell className="text-right font-medium">{row.count}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50 font-bold">
              <TableCell>TOTAL EMPRESA</TableCell>
              <TableCell className="text-right">{total}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
