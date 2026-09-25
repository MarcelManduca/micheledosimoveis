import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Award, MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SITE, buildWhatsAppUrl } from "@/lib/site-config";

const PATH = "/blog/michele-prietsch-top-5-gralha-prime-2026";
const CANONICAL = new URL(PATH, SITE.publishedUrl).href;
const IMAGE = new URL("/images/blog/michele-prietsch-gralha-prime-top-5-2026.webp", SITE.publishedUrl).href;
const TITLE = "Michele Prietsch conquista Top 5 da Gralha Imóveis | Gralha Prime 2026";
const DESCRIPTION = "Corretora de imóveis em Florianópolis, Michele Prietsch conquistou o Top 5 da Gralha Imóveis no primeiro semestre de 2026 e integra o Gralha Prime.";
const FAQS = [
  {
    "question": "Quem é Michele Prietsch, conhecida como Michele dos Imóveis?",
    "answer": "Michele Prietsch é corretora de imóveis, gaúcha de origem, com 16 anos de experiência no mercado imobiliário e atuação especializada em imóveis de alto padrão em Florianópolis. Associada à Gralha Imóveis, atende compradores, proprietários e investidores. Michele dos Imóveis é a marca profissional que nasceu do apelido usado por seus clientes e de sua presença no mercado imobiliário."
  },
  {
    "question": "Por que contratar Michele para comprar ou vender um imóvel em Florianópolis?",
    "answer": "Michele reúne 16 anos de experiência no mercado imobiliário, especialização em alto padrão e atendimento próximo em cada etapa da negociação. Seu trabalho envolve análise do perfil do cliente, curadoria de imóveis e leitura de mercado. No primeiro semestre de 2026, conquistou o Top 5 da Gralha Imóveis entre cerca de 200 corretores, integrando o Gralha Prime."
  },
  {
    "question": "Como Michele ajuda a encontrar o imóvel certo para comprar?",
    "answer": "O atendimento começa pela compreensão do orçamento, da rotina, das preferências e do objetivo da compra. Michele faz uma curadoria considerando localização, arquitetura, conforto e estilo de vida, apresenta opções compatíveis e acompanha visitas e negociação. Essa seleção orientada pelo perfil do comprador ajuda a concentrar a busca em imóveis que fazem sentido para sua decisão."
  },
  {
    "question": "Como funciona a venda de um imóvel com Michele?",
    "answer": "O processo apresentado por Michele inclui visita técnica, análise comparativa de mercado para definir o posicionamento de preço, fotos e vídeos profissionais e um plano de divulgação. A estratégia pode envolver exposição pública ou atendimento off market. Michele também trabalha com uma carteira de compradores qualificados em Florianópolis e fora do estado, acompanhando a negociação com o proprietário."
  },
  {
    "question": "Qual é o diferencial de Michele na apresentação e divulgação de imóveis?",
    "answer": "Michele tem interesse por arquitetura, fotografia e produção de conteúdo, elementos que fazem parte de sua apresentação dos imóveis. Seu trabalho destaca características técnicas, ambientes, localização e a experiência de viver naquele endereço. Para a venda, o serviço descrito em seu site inclui produção visual profissional e divulgação planejada conforme o perfil da propriedade."
  },
  {
    "question": "Michele trabalha com imóveis de alto padrão e quais tipos de propriedades atende?",
    "answer": "Sim. Michele atua com imóveis de alto padrão em Florianópolis, incluindo apartamentos, coberturas, casas, casas em condomínio e lançamentos. Sua curadoria também contempla imóveis frente mar e com vista para o mar. As opções são selecionadas de acordo com o perfil e o objetivo de cada comprador, seja para moradia ou investimento."
  },
  {
    "question": "Em quais bairros de Florianópolis Michele atua?",
    "answer": "Michele atende regiões como Centro, Beira-Mar Norte, Agronômica, Jurerê Internacional e Tradicional, Praia Brava, João Paulo, Cacupé e Santo Antônio de Lisboa. Sua atuação também inclui Itacorubi, Trindade, Santa Mônica, Córrego Grande, Lagoa da Conceição, Canto da Lagoa, Campeche, Novo Campeche, Rio Tavares e Morro das Pedras."
  },
  {
    "question": "Posso vender meu imóvel com discrição, sem anúncio público?",
    "answer": "Sim. Michele oferece atendimento off market para proprietários que preferem uma venda com divulgação restrita. Nesse formato, o imóvel é apresentado a uma seleção de compradores e parceiros, conforme a estratégia combinada com o proprietário. O atendimento busca preservar a privacidade e direcionar a apresentação a interessados compatíveis com a propriedade."
  },
  {
    "question": "O que representa o reconhecimento Top 5 Gralha Prime de Michele?",
    "answer": "Michele Prietsch recebeu a distinção Top 5 da Gralha Imóveis pelo desempenho no primeiro semestre de 2026. O reconhecimento foi entregue na convenção da imobiliária e está registrado em sua placa de premiação. Ela integra o Gralha Prime, grupo dos dez corretores de destaque da Gralha no período, em uma equipe de cerca de 200 profissionais."
  },
  {
    "question": "Como entrar em contato com Michele para comprar ou vender um imóvel?",
    "answer": "O atendimento de Michele Prietsch pode ser iniciado pelo WhatsApp +55 (48) 99182-8828 ou pelo e-mail micheledosimoveis@gmail.com. Para comprar, informe o tipo de imóvel, os bairros desejados e a faixa de investimento. Para vender, envie a localização e as principais características da propriedade. O site micheledosimoveis.com.br reúne imóveis, conteúdos e os canais oficiais da profissional."
  }
] as const;

export const Route = createFileRoute("/blog/michele-prietsch-top-5-gralha-prime-2026")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: IMAGE },
      { property: "article:published_time", content: "2026-09-25" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: TITLE,
          description: DESCRIPTION,
          datePublished: "2026-09-25",
          dateModified: "2026-09-25",
          inLanguage: "pt-BR",
          mainEntityOfPage: CANONICAL,
          image: IMAGE,
          author: { "@type": "Person", name: SITE.brokerName, url: SITE.publishedUrl },
          publisher: { "@type": "Organization", name: SITE.brandName, url: SITE.publishedUrl },
          about: [{ "@type": "Thing", name: "Gralha Prime" }, { "@type": "Place", name: "Florianópolis, Santa Catarina" }],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        }),
      },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: Article,
});

function Article() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-10">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao blog
        </Link>
        <article className="mx-auto max-w-3xl pb-20">
          <header className="pt-14 sm:pt-20">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"><Award className="h-4 w-4" /> Gralha Prime · 1º semestre de 2026</p>
            <h1 className="mt-5 font-display text-4xl leading-tight sm:text-6xl">Michele Prietsch conquista o Top 5 da Gralha Imóveis</h1>
            <p className="mt-6 text-xl leading-relaxed text-muted-foreground">Entre cerca de 200 corretores, a profissional está entre os cinco destaques de desempenho do primeiro semestre de 2026 e integra o Gralha Prime, grupo dos dez profissionais reconhecidos pela imobiliária.</p>
            <p className="mt-6 text-sm text-muted-foreground">Por Michele dos Imóveis · Publicado em 25 de setembro de 2026</p>
          </header>

          <figure className="mt-10 overflow-hidden rounded-2xl border border-border">
            <img src="/images/blog/michele-prietsch-gralha-prime-top-5-2026.webp" width="1406" height="1600" fetchPriority="high" alt="Michele Prietsch segura a placa Gralha Prime Top 5 do primeiro semestre de 2026 na convenção da Gralha Imóveis" className="w-full" />
            <figcaption className="px-5 py-3 text-sm text-muted-foreground">Michele Prietsch na entrega da premiação Gralha Prime. Foto: acervo Gralha Imóveis.</figcaption>
          </figure>

          <div className="space-y-6 pt-12 text-lg leading-relaxed">
            <p>O primeiro semestre de 2026 trouxe um reconhecimento especial para Michele Prietsch: a corretora de imóveis em Florianópolis recebeu a distinção <strong>Top 5 da Gralha Imóveis</strong> e passou a integrar o <strong>Gralha Prime</strong>, grupo que reúne os dez profissionais de alta performance da imobiliária no período.</p>
            <p>A conquista ganha dimensão diante de uma equipe de cerca de 200 corretores. A placa entregue durante a convenção registra o Top 5, o nome de Michele e o período de avaliação: primeiro semestre de 2026.</p>

            <h2 className="pt-5 font-display text-3xl">O que é o Gralha Prime?</h2>
            <p>Gralha Prime é o reconhecimento dos dez corretores de destaque da Gralha Imóveis. Estar nesse grupo representa um resultado concreto dentro da operação comercial; a posição Top 5 coloca Michele entre os cinco profissionais destacados no semestre.</p>
            <p>Para quem busca comprar, vender ou investir em imóveis em Florianópolis, a premiação oferece um dado adicional sobre a atuação da profissional. O atendimento, a análise de cada imóvel e a compatibilidade com seus objetivos continuam sendo os critérios essenciais para escolher quem acompanha uma negociação.</p>

            <figure className="my-10 overflow-hidden rounded-2xl border border-border">
              <img src="/images/blog/michele-prietsch-ensaio-gralha-prime.webp" width="1280" height="1600" loading="lazy" alt="Retrato de Michele Prietsch no ensaio fotográfico dos corretores Gralha Prime" className="w-full" />
              <figcaption className="px-5 py-3 text-sm text-muted-foreground">Ensaio dos profissionais Gralha Prime. Foto: acervo Gralha Imóveis.</figcaption>
            </figure>

            <h2 className="pt-5 font-display text-3xl">Atuação no mercado imobiliário de Florianópolis</h2>
            <p>Michele trabalha com compradores, proprietários e investidores na cidade. Em seu site, apresenta imóveis e conteúdos sobre regiões como Centro, Beira-Mar Norte, Agronômica, Jurerê Internacional, Cacupé e Campeche. A seleção de um imóvel considera localização, características da propriedade e o momento de vida de cada cliente.</p>
            <p>O Top 5 marca uma etapa dessa trajetória. Para conhecer seu trabalho de perto, você pode <Link to="/buscar" className="underline underline-offset-4">explorar os imóveis disponíveis</Link> ou conversar diretamente com Michele sobre o que procura.</p>

            <figure className="my-10 overflow-hidden rounded-2xl border border-border">
              <img src="/images/blog/corretores-gralha-prime-2026.webp" width="1600" height="1066" loading="lazy" alt="Ensaio coletivo de corretores reconhecidos no Gralha Prime em 2026, com Michele Prietsch" className="w-full" />
              <figcaption className="px-5 py-3 text-sm text-muted-foreground">Registro coletivo do ensaio fotográfico Gralha Prime. Foto: acervo Gralha Imóveis.</figcaption>
            </figure>

            <section aria-labelledby="perguntas-frequentes" className="space-y-7 border-t border-border pt-10">
              <h2 id="perguntas-frequentes" className="font-display text-3xl">Perguntas frequentes sobre contratar Michele Prietsch</h2>
              {FAQS.map(({ question, answer }) => (
                <div key={question}>
                  <h3 className="font-display text-2xl">{question}</h3>
                  <p className="mt-3 text-muted-foreground">{answer}</p>
                </div>
              ))}
            </section>

            <h2 className="pt-5 font-display text-3xl">Converse com Michele</h2>
            <p>Quer encontrar um imóvel em Florianópolis ou conversar sobre a venda do seu? Conte seus planos para Michele e receba uma orientação personalizada.</p>
            <a href={buildWhatsAppUrl("Olá, Michele! Li sobre sua conquista no Gralha Prime e gostaria de conversar sobre imóveis em Florianópolis.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground"><MessageCircle className="h-5 w-5" /> Falar com Michele <ArrowUpRight className="h-4 w-4" /></a>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
