import { ArrowRight, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { SITE, WHATSAPP_URL } from "@/lib/site-config";

export function ContactSection() {
  return (
    <section id="contato" className="mx-auto max-w-7xl px-6 sm:px-10 py-24 sm:py-32">
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-foreground text-background p-10 sm:p-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr] lg:items-end">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-background/60">
              Vamos conversar
            </div>
            <h2 className="mt-4 font-display font-light text-4xl sm:text-6xl leading-[1] tracking-tight">
              Encontre o seu<br />
              <span className="italic">endereço em Floripa.</span>
            </h2>
            <p className="mt-6 max-w-md text-background/70">
              Conte o bairro, o estilo de vida e o orçamento que você procura.
              Em poucas horas eu retorno com uma seleção personalizada —
              inclusive imóveis fora do mercado.
            </p>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-background text-foreground pl-6 pr-2 py-2 text-sm font-medium hover:bg-background/90 transition"
            >
              Falar no WhatsApp
              <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          </div>

          <ul className="space-y-4 text-sm text-background/85">
            <li className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10">
                <Phone className="h-4 w-4" />
              </span>
              {SITE.phoneDisplay}
            </li>
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-3 hover:text-background transition"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10">
                  <Mail className="h-4 w-4" />
                </span>
                Enviar e-mail
              </a>
            </li>
            <li>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 hover:text-background transition"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10">
                  <Instagram className="h-4 w-4" />
                </span>
                @{SITE.instagram}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10">
                <MapPin className="h-4 w-4" />
              </span>
              Florianópolis/SC · Norte, Centro, Leste e Sul da Ilha
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
