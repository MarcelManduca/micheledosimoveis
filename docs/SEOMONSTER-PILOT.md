# Piloto SEOMonster — Michele dos Imóveis

O SEOMonster é um MCP local de apoio à operação de SEO. Ele **não é carregado
pelo site**, não entra no bundle público e não deve ser instalado como
dependência do projeto.

## Objetivo inicial

Conectar, em modo de leitura:

- Google Search Console: `sc-domain:micheledosimoveis.com.br`
- Google Analytics 4
- PageSpeed Insights

O piloto deve responder, com dados reais:

1. quais consultas estão entre as posições 8 e 20;
2. quais páginas têm muitas impressões e CTR abaixo do esperado;
3. quais conteúdos/condomínios representam as melhores oportunidades;
4. quais páginas perderam visibilidade;
5. quais URLs publicadas apresentam problemas técnicos ou de indexação.

## Segurança

- Nunca versionar `client_secret.json`, `token.json`, chaves ou arquivos TOML
  com credenciais.
- Manter `SEO_MCP_ALLOW_DESTRUCTIVE=false`.
- Autorizar somente os escopos Google `webmasters.readonly` e
  `analytics.readonly` durante o piloto.
- Não usar `gsc_submit_sitemap`, `gsc_request_indexing` nem ferramentas de
  escrita do Cloudflare.
- Guardar os arquivos OAuth em `~/.config/seo-monster/`, com acesso restrito
  ao usuário local.

## Instalação local

Requisitos: Python 3.11+ e `uv`.

```bash
which uvx
uvx --from seo-monster seo-monster --help
```

A configuração do servidor para VS Code/Codex compatível está em
`.vscode/mcp.json`. Se o aplicativo gráfico não localizar `uvx`, substitua
`"command": "uvx"` pelo caminho absoluto retornado por `which uvx`. Essa
alteração deve permanecer local quando o caminho for específico de uma máquina.

## Autorização Google

1. No Google Cloud Console, criar ou selecionar um projeto dedicado ao piloto.
2. Habilitar:
   - Search Console API;
   - Google Analytics Data API;
   - PageSpeed Insights API.
3. Criar um cliente OAuth do tipo **Aplicativo para computador**.
4. Salvar o JSON em:
   `~/.config/seo-monster/client_secret.json`.
5. Executar localmente:

```bash
mkdir -p ~/.config/seo-monster
SEO_MCP_GOOGLE_OAUTH_CLIENT="$HOME/.config/seo-monster/client_secret.json" \
SEO_MCP_GOOGLE_TOKEN="$HOME/.config/seo-monster/token.json" \
SEO_MCP_GSC_DEFAULT_SITE="sc-domain:micheledosimoveis.com.br" \
uvx --from seo-monster seo-monster auth
```

O login deve ser feito com a conta que já possui acesso ao Search Console e ao
GA4 do domínio.

## Validação após o OAuth

Reiniciar o cliente MCP e executar:

1. `system_status` com `probe=true`;
2. `gsc_list_properties`;
3. confirmar a presença de `sc-domain:micheledosimoveis.com.br`;
4. localizar o ID correto da propriedade GA4;
5. configurar `SEO_MCP_GA4_PROPERTY_ID=properties/ID`;
6. executar `gsc_top_queries`, `gsc_query_opportunities`,
   `content_opportunities`, `ga4_setup_audit` e `psi_analyze`.

## Critério de sucesso do piloto

O piloto estará aprovado quando:

- as propriedades GSC e GA4 corretas estiverem acessíveis;
- nenhuma permissão de escrita estiver ativa;
- houver uma lista priorizada de oportunidades com consulta, página,
  impressões, posição, CTR e ação recomendada;
- os achados gerarem um backlog verificável de SEO para o site;
- nenhuma credencial tiver sido incluída no Git.
