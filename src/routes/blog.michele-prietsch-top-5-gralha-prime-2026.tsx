import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Award, MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SITE, buildWhatsAppUrl } from "@/lib/site-config";

const PATH = "/blog/michele-prietsch-top-5-gralha-prime-2026";
const URL = new URL(PATH, SITE.publishedUrl).href;
const IMAGE = new URL("/images/blog/michele-prietsch-gralha-prime-top-5-2026.webp", SITE.publishedUrl).href;
const TITLE = "Michele Prietsch conquista Top 5 da Gralha Imóveis | Gralha Prime 2026";
const DESCRIPTION = "Corretora de imóveis em Florianópolis, Michele Prietsch conquistou o Top 5 da Gralha Imóveis no primeiro semestre de 2026 e integra o Gralha Prime.";
const FAQS = [
  {
    question: "Por que contratar Michele Prietsch para comprar ou vender um imóvel em Florianópolis?",
    answer: "Michele Prietsch é corretora de imóveis em Florianópolis e integra o Gralha Prime. Ela recebeu o reconhecimento Top 5 da Gralha Imóveis no primeiro semestre de 2026, entre cerca de 200 corretores. Seu atendimento combina escuta das necessidades do cliente, curadoria de imóveis e acompanhamento da negociação. A premiação é uma referência de desempenho; converse com ela para avaliar se sua forma de trabalhar atende ao seu objetivo.",
  },
  {
    question: "Como Michele pode ajudar a comprar um imóvel em Florianópolis?",
    answer: "Michele conversa com o comprador sobre orçamento, localização, tipo de imóvel e estilo de vida para selecionar opções compatíveis. Ela apresenta imóveis disponíveis em Florianópolis e acompanha as etapas de visita e negociação. A disponibilidade e as condições de cada imóvel devem ser confirmadas no momento da consulta.",
  },
  {
    question: "Como Michele pode ajudar a vender meu imóvel em Florianópolis?",
    answer: "Michele atende proprietários que desejam vender imóveis em Florianópolis. O trabalho começa com a compreensão das características do imóvel e dos objetivos do vendedor, seguida de uma conversa sobre posicionamento, apresentação e condução da negociação. Para receber uma proposta de atendimento, entre em contato diretamente com ela.",
  },
  {
    question: "Em quais regiões de Florianópolis Michele atua?",
    answer: "O site de Michele apresenta imóveis e conteúdos sobre Centro, Beira-Mar Norte, Agronômica, Jurerê Internacional, Cacupé, Campeche e outras regiões de Florianópolis. Consulte Michele para confirmar a disponibilidade de imóveis e o atendimento em um endereço específico.",
  },
  {
    question: "O que significa Michele ser Top 5 e fazer parte do Gralha Prime?",
    answer: "A placa recebida por Michele Prietsch na convenção da Gralha Imóveis registra a distinção Top 5 referente ao primeiro semestre de 2026. Gralha Prime é o grupo de dez profissionais de destaque da imobiliária nesse período. A classificação se refere à equipe da Gralha Imóveis, não a um ranking de todos os corretores de Florianópolis.",
  },
] as const;

export const Route = createFileRoute("/blog/michele-prietsch-top-5-gralha-prime-2026")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:image", content: IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: IMAGE },
      { property: "article:published_time", content: "2026-09-25" },
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
          mainEntityOfPage: URL,
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
    links: [{ rel: "canonical", href: URL }],
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
