import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchProperties from "./tools/search-properties";
import getProperty from "./tools/get-property";
import listCondominiums from "./tools/list-condominiums";
import getCondominium from "./tools/get-condominium";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "michele-dos-imoveis-mcp",
  title: "Michele dos Imóveis",
  version: "0.1.0",
  instructions:
    "Ferramentas para consultar o portfólio da Michele dos Imóveis em Florianópolis: buscar imóveis publicados, obter detalhes por código, listar condomínios e obter um condomínio por slug.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchProperties, getProperty, listCondominiums, getCondominium],
});
