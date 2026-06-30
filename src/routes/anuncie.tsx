import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Camera,
  LineChart,
  Users,
  Sparkles,
  Lock,
  EyeOff,
} from "lucide-react";

const ANUNCIE_FAQ = [
  {
    q: "Como funciona o processo de venda de imóveis de alto padrão com a Michele?",
    a: "Começamos com uma visita técnica e análise comparativa de mercado para precificação estratégica. Em seguida produzimos fotos e vídeos profissionais, definimos o plano de divulgação (público ou Off Market) e ativamos a carteira de clientes qualificados em Florianópolis e fora do estado.",
  },
  {
    q: "O que é venda Off Market?",
    a: "É a venda discreta, sem anúncio público. O imóvel é oferecido apenas para uma carteira selecionada de compradores e parceiros, preservando privacidade, exclusividade e poder de negociação.",
  },
  {
    q: "Em quais bairros de Florianópolis você atua?",
    a: "Centro/Beira Mar Norte, Agronômica, Jurerê (Tradicional e Internacional), Praia Brava, João Paulo, Cacupé, Santo Antônio de Lisboa, Itacorubi, Trindade, Santa Mônica, Córrego Grande, Lagoa da Conceição, Canto da Lagoa, Campeche, Novo Campeche, Rio Tavares e Morro das Pedras.",
  },
  {
    q: "Quanto tempo leva para vender um imóvel de alto padrão?",
    a: "Depende da precificação, do estágio do mercado e da qualidade do produto. Imóveis bem precificados e bem apresentados normalmente recebem propostas em 30 a 120 dias.",
  },
  {
    q: "Quais documentos preciso ter para anunciar?",
    a: "Matrícula atualizada, IPTU do ano vigente, regularização junto ao condomínio (se aplicável) e documentação dos proprietários. A Michele orienta toda a checagem antes de ativar a divulgação.",
  },
];

export const Route = createFileRoute("/anuncie")({
  head: () => ({
    meta: [
      { title: "Anuncie seu imóvel de alto padrão em Florianópolis | Michele dos Imóveis" },
      {
        name: "description",
        content:
          "Venda seu imóvel de alto padrão em Florianópolis com curadoria, precificação estratégica, produção visual profissional e atendimento Off Market sigiloso.",
      },
      {
        property: "og:title",
        content: "Anuncie seu imóvel de alto padrão em Florianópolis | Michele dos Imóveis",
      },
      {
        property: "og:description",
        content:
          "Curadoria imobiliária personalizada para proprietários — venda com discrição, estratégia e acesso aos compradores certos.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://micheledosimoveis.com.br/anuncie" },
    ],
    links: [{ rel: "canonical", href: "https://micheledosimoveis.com.br/anuncie" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: ANUNCIE_FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: AnunciePage,
});

const WHATSAPP_ANUNCIE = `https://api.whatsapp.com/send?phone=5548991828828&text=${encodeURIComponent(
  "Olá, Michele. Tenho interesse em anunciar meu imóvel com curadoria de alto padrão e gostaria de entender como funciona o processo.",
)}`;
const WHATSAPP_OFFMARKET = `https://api.whatsapp.com/send?phone=5548991828828&text=${encodeURIComponent(
  "Olá, Michele. Tenho um imóvel de alto padrão e gostaria de conversar sobre uma venda Off Market, com sigilo e discrição.",
)}`;

function AnunciePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-5 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <Link to="/" className="font-display text-lg tracking-tight">
            Michele dos Imóveis
          </Link>
        </div>
      </header>

      <section className="relative bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-24 sm:py-32">
          <div className="grid gap-14 lg:grid-cols-[1.1fr,1fr] lg:items-start">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-background/60">
                Para proprietários
              </div>
              <h1 className="mt-4 font-display font-light text-4xl sm:text-6xl leading-[1.05] tracking-tight">
                Anuncie seu imóvel de alto padrão em{" "}
                <span className="italic">Florianópolis.</span>
              </h1>
              <h2 className="mt-5 font-display text-xl sm:text-2xl text-background/80 tracking-tight">
                Venda com estratégia, discrição e acesso aos compradores certos.
              </h2>
              <p className="mt-6 text-background/75 leading-relaxed">
                Vender um imóvel de alto padrão exige mais do que simplesmente anunciar. Exige
                leitura de mercado, posicionamento correto, precificação estratégica, apresentação
                visual de qualidade e acesso aos compradores certos.
              </p>
              <p className="mt-4 text-background/75 leading-relaxed">
                <strong className="text-background font-medium">Michele Prietsch</strong>, também
                conhecida como <em>Michele dos Imóveis</em>, oferece uma curadoria imobiliária
                personalizada para proprietários que desejam vender imóveis de luxo e alto luxo em
                Florianópolis com segurança, discrição e alto nível de profissionalismo.
              </p>
              <p className="mt-4 text-background/75 leading-relaxed">
                O trabalho envolve análise criteriosa do imóvel, ferramentas avançadas de
                precificação, produção de fotos e vídeos profissionais, estratégia de divulgação
                nas redes sociais e endereçamento direto a clientes de carteira com perfil
                compatível.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={WHATSAPP_ANUNCIE}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full bg-background text-foreground pl-6 pr-2 py-2 text-sm font-medium hover:bg-background/95 transition"
                >
                  Quero anunciar meu imóvel
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background group-hover:translate-x-0.5 transition">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
                <a
                  href={WHATSAPP_OFFMARKET}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-background/85 underline-offset-4 hover:underline px-2 py-2"
                >
                  Tenho interesse em venda Off Market
                </a>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: LineChart,
                  title: "Precificação estratégica",
                  desc: "Ferramentas avançadas e leitura de mercado para uma faixa de valor competitiva e coerente com o alto padrão de Florianópolis.",
                },
                {
                  icon: Camera,
                  title: "Fotos e vídeos profissionais",
                  desc: "Produção visual que valoriza arquitetura, acabamentos, ambientes e o estilo de vida que o imóvel proporciona.",
                },
                {
                  icon: Sparkles,
                  title: "Divulgação qualificada",
                  desc: "Exposição em redes sociais, canais digitais e base de relacionamento, sempre respeitando o posicionamento premium do imóvel.",
                },
                {
                  icon: Users,
                  title: "Clientes de carteira",
                  desc: "Endereçamento ativo a compradores e investidores com perfil compatível — sem exposição genérica.",
                },
                {
                  icon: ShieldCheck,
                  title: "Atendimento consultivo",
                  desc: "Acompanhamento próximo da avaliação à negociação, com transparência, critério e discrição.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <li
                  key={title}
                  className="rounded-2xl bg-background/[0.06] ring-1 ring-background/10 p-5 backdrop-blur-sm"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10 ring-1 ring-background/15">
                    <Icon className="h-4 w-4 text-background" />
                  </span>
                  <div className="mt-4 font-display text-lg tracking-tight text-background">
                    {title}
                  </div>
                  <p className="mt-1.5 text-sm text-background/70 leading-relaxed">{desc}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-16 sm:mt-20 relative overflow-hidden rounded-[28px] sm:rounded-[36px] ring-1 ring-[#C8A464]/40 bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-black p-8 sm:p-14">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#C8A464]/10 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr,1.2fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#C8A464]/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#E6C68A] ring-1 ring-[#C8A464]/30">
                  <Lock className="h-3.5 w-3.5" /> Exclusivo · Sigiloso
                </div>
                <h3 className="mt-5 font-display font-light text-3xl sm:text-4xl leading-[1.1] tracking-tight text-background">
                  Venda <span className="italic text-[#E6C68A]">Off Market</span>: sigilo para
                  imóveis de luxo e alto luxo.
                </h3>
                <div className="mt-6 flex items-center gap-4 text-sm text-background/70">
                  <span className="inline-flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-[#E6C68A]" /> Sem exposição em portais
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline-flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#E6C68A]" /> Rede com +200 corretores
                  </span>
                </div>
              </div>

              <div>
                <p className="text-background/80 leading-relaxed">
                  Nem todo proprietário deseja expor publicamente a venda do seu imóvel. No mercado
                  de luxo e alto luxo, cresce a busca por negociações{" "}
                  <strong className="text-background font-medium">Off Market</strong> — uma
                  estratégia em que o imóvel é apresentado de forma reservada, apenas para
                  compradores e profissionais selecionados.
                </p>
                <p className="mt-4 text-background/75 leading-relaxed">
                  Para proprietários que valorizam privacidade, discrição e controle sobre a
                  exposição, Michele Prietsch atua com divulgação interna e sigilosa. Por meio de
                  uma rede com conexão a mais de 200 corretores, o imóvel é apresentado a
                  profissionais qualificados e potenciais compradores sem exposição aberta nos
                  portais ou redes sociais.
                </p>
                <p className="mt-4 text-background/75 leading-relaxed">
                  Essa abordagem preserva a imagem do proprietário, protege informações sensíveis
                  e aumenta a precisão na busca por compradores realmente alinhados ao perfil do
                  imóvel.
                </p>

                <a
                  href={WHATSAPP_OFFMARKET}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#C8A464] text-black pl-6 pr-2 py-2 text-sm font-medium hover:bg-[#d4b478] transition"
                >
                  Conversar sobre venda Off Market
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-[#E6C68A] group-hover:translate-x-0.5 transition">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-background/60 max-w-3xl mx-auto">
            Seu imóvel merece mais do que um anúncio. Merece estratégia, curadoria e compradores
            qualificados.
          </p>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-8 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Michele Prietsch · CRECI 69502</span>
          <Link to="/" className="underline">
            Início
          </Link>
        </div>
      </footer>
    </div>
  );
}
