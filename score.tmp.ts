import { execSync } from "child_process";
import { scoreDevelopment } from "./src/lib/launches-shared";
import { publicationBlockers } from "./src/lib/launches-publication";
const raw = execSync(`psql -At -c "select json_agg(t) from (select d.*, dev.name as developer_name, (select count(*) from development_properties p where p.development_id=d.id) as units from developments d left join developers dev on dev.id=d.developer_id) t"`).toString();
const rows = JSON.parse(raw);
const out = rows.map((r:any)=>{
  const units = Number(r.units);
  const { score } = scoreDevelopment(r, units);
  const b = publicationBlockers(r, units);
  return { nome: r.name, construtora: r.developer_name ?? "—", score, status: r.publication_status, unidades: units, apto: b.length===0, bloqueios: b };
}).sort((a:any,b:any)=>b.score-a.score);
console.log(JSON.stringify(out,null,1));
