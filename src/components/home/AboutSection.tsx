import { lazy, Suspense } from "react";
import portrait from "@/assets/michele-portrait.jpg";
import portraitHover from "@/assets/michele-portrait-2.jpg";
import { LazyVisible } from "@/components/LazyVisible";
import { AboutBio } from "@/components/home/AboutBio";
import { ABOUT_STATS } from "@/lib/site-config";

import dome01 from "@/assets/dome/michele-01.jpg.asset.json";
import dome02 from "@/assets/dome/michele-02.jpg.asset.json";
import dome03 from "@/assets/dome/michele-03.jpg.asset.json";
import dome04 from "@/assets/dome/michele-04.jpg.asset.json";
import dome05 from "@/assets/dome/michele-05.jpg.asset.json";
import dome06 from "@/assets/dome/michele-06.jpg.asset.json";
import dome07 from "@/assets/dome/michele-07.jpg.asset.json";
import dome08 from "@/assets/dome/michele-08.jpg.asset.json";
import dome09 from "@/assets/dome/michele-09.jpg.asset.json";
import dome10 from "@/assets/dome/michele-10.jpg.asset.json";
import dome11 from "@/assets/dome/michele-11.jpg.asset.json";
import dome12 from "@/assets/dome/michele-12.jpg.asset.json";
import dome13 from "@/assets/dome/michele-13.jpg.asset.json";
import dome14 from "@/assets/dome/michele-14.jpg.asset.json";
import dome15 from "@/assets/dome/michele-15.jpg.asset.json";

const DomeGallery = lazy(() => import("@/components/DomeGallery.jsx"));

const DOME_IMAGES = [
  dome01, dome02, dome03, dome04, dome05, dome06, dome07, dome08,
  dome09, dome10, dome11, dome12, dome13, dome14, dome15,
].map((a, i) => ({ src: a.url, alt: `Michele Prietsch - foto ${i + 1}` }));

export function AboutSection() {
  return (
    <section id="sobre" className="bg-secondary/60 border-y border-border">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-24 sm:py-32 grid gap-14 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <div className="group relative w-full max-w-md aspect-square rounded-[28px] overflow-hidden shadow-xl">
            <img
              src={portrait}
              alt="Michele Prietsch, corretora de imóveis de alto padrão em Florianópolis"
              loading="lazy"
              width={800}
              height={800}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
            />
            <img
              src={portraitHover}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={800}
              height={800}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100"
            />
          </div>
          <div className="absolute -bottom-6 -right-2 sm:right-10 rounded-2xl bg-background px-5 py-4 shadow-xl ring-1 ring-black/5">
            <div className="font-display text-3xl">+16 anos</div>
            <div className="text-xs text-muted-foreground mt-1">no mercado imobiliário</div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Corretora de imóveis de alto padrão em Florianópolis
          </div>
          <h2 className="mt-3 font-display font-light text-4xl sm:text-5xl tracking-tight">
            Mais que vender imóveis,<br />
            <span className="italic">conectar histórias em Florianópolis.</span>
          </h2>

          <AboutBio />

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ABOUT_STATS.map((s) => (
              <div key={s.l} className="rounded-2xl bg-background p-5 ring-1 ring-black/5">
                <div className="font-display text-2xl">{s.n}</div>
                <div className="mt-1 text-xs text-muted-foreground leading-snug">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dome Gallery — faixa horizontal */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10 pb-24 sm:pb-32 -mt-4">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
          Bastidores · Michele em cena
        </div>
        <LazyVisible
          className="relative w-full overflow-hidden rounded-[24px] ring-1 ring-black/5 bg-secondary/60"
          style={{ aspectRatio: "21 / 9" }}
          rootMargin="400px"
        >
          <Suspense fallback={<div aria-hidden className="h-full w-full bg-secondary/60" />}>
            <DomeGallery
              images={DOME_IMAGES}
              grayscale={true}
              fit={0.5}
              fitBasis="width"
              minRadius={320}
              maxRadius={900}
              padFactor={0.14}
              overlayBlurColor="#ece8df"
              openedImageWidth="360px"
              openedImageHeight="360px"
              imageBorderRadius="12px"
              openedImageBorderRadius="20px"
              segments={30}
            />
          </Suspense>
        </LazyVisible>
      </div>
    </section>
  );
}
