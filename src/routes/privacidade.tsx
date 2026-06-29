import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Michele dos Imóveis" },
      {
        name: "description",
        content:
          "Política de Privacidade e tratamento de dados pessoais em conformidade com a LGPD (Lei nº 13.709/2018) — Michele Prietsch (Michele dos Imóveis).",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Política de Privacidade — Michele dos Imóveis" },
      { property: "og:url", content: "https://micheledosimoveis.lovable.app/privacidade" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://micheledosimoveis.lovable.app/privacidade" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const updated = "29 de junho de 2026";
  return (
    <main className="bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 py-16">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Privacidade & LGPD
        </p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl leading-tight">
          Política de Privacidade
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Última atualização: {updated}. Esta página é mantida pela controladora{" "}
          <strong>Michele Prietsch</strong> (Michele dos Imóveis) para esclarecer como tratamos
          dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº
          13.709/2018).
        </p>

        <section className="prose prose-sm mt-10 max-w-none space-y-6 text-sm leading-relaxed text-foreground/90">
          <div>
            <h2 className="font-display text-lg">1. Controladora dos dados</h2>
            <p className="mt-2">
              Michele Prietsch · CRECI 69502 · CRECI 11463J — corretora associada à Gralha
              Imóveis. Endereço: R. Alves de Brito, 285 — Centro · Florianópolis/SC. Contato:
              WhatsApp (48) 99182-8828 / e-mail micheledosimoveis@gmail.com.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg">2. Dados que tratamos</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>
                <strong>Contato espontâneo:</strong> quando você clica nos botões de WhatsApp,
                e-mail ou telefone, a conversa ocorre na plataforma escolhida — não coletamos
                seus dados diretamente neste site.
              </li>
              <li>
                <strong>Dados de navegação:</strong> endereço IP, tipo de dispositivo, páginas
                visitadas e referência de origem, usados de forma agregada para segurança e
                melhoria do site.
              </li>
              <li>
                <strong>Cookies:</strong> essenciais (autenticação da área administrativa) e,
                mediante seu consentimento, analíticos.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg">3. Bases legais e finalidades</h2>
            <p className="mt-2">
              Tratamos dados com base em: (i) <em>execução de contrato e procedimentos
              preliminares</em> para atender solicitações de visita ou intermediação imobiliária;
              (ii) <em>legítimo interesse</em> para segurança e prevenção a fraude; (iii){" "}
              <em>consentimento</em> para cookies não essenciais; (iv) <em>cumprimento de
              obrigação legal</em> aplicável à atividade de corretagem.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg">4. Compartilhamento</h2>
            <p className="mt-2">
              Os imóveis exibidos são oriundos do portal parceiro Gralha Imóveis. Operadores
              técnicos utilizados: provedor de hospedagem do site, provedor de banco de dados e
              autenticação (Lovable Cloud / Supabase) e provedor de mapas (OpenStreetMap via
              Leaflet). Não vendemos dados pessoais.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg">5. Retenção</h2>
            <p className="mt-2">
              Mensagens trocadas por WhatsApp ou e-mail seguem a política de retenção da
              respectiva plataforma. Registros de acesso podem ser mantidos pelo prazo legal
              aplicável (Marco Civil da Internet).
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg">6. Seus direitos (art. 18 da LGPD)</h2>
            <p className="mt-2">
              Você pode solicitar a qualquer momento: confirmação da existência de tratamento;
              acesso, correção ou anonimização dos dados; portabilidade; eliminação dos dados
              tratados com seu consentimento; informação sobre compartilhamento; e revogação do
              consentimento. Para exercer seus direitos, escreva para{" "}
              <strong>micheledosimoveis@gmail.com</strong>.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg">7. Segurança</h2>
            <p className="mt-2">
              Adotamos medidas técnicas e administrativas razoáveis: HTTPS em todo o site,
              autenticação com senha forte e segregação de funções administrativas, controle de
              acesso a banco de dados por papel (RLS) e validação de entradas com sanitização
              server-side. Nenhuma medida é 100% infalível; comunicamos incidentes relevantes
              conforme exigido por lei.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg">8. Cookies</h2>
            <p className="mt-2">
              Utilizamos o mínimo necessário. Você pode revogar seu consentimento limpando o
              armazenamento do navegador para este domínio — a faixa de consentimento aparecerá
              novamente.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg">9. Alterações</h2>
            <p className="mt-2">
              Esta política pode ser atualizada para refletir mudanças legais ou operacionais.
              A data de atualização ficará sempre visível no topo.
            </p>
          </div>
        </section>

        <div className="mt-12">
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-5 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </main>
  );
}
