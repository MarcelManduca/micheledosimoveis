/** Editorial photos of the building and common areas, keyed to a verified address. */
export type CondominiumPhoto = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

const SONATA_PHOTOS: readonly CondominiumPhoto[] = [
  {
    src: "/condominios/sonata-place/fachada.webp",
    alt: "Fachada do condomínio Sonata Place na Agronômica, Florianópolis",
    caption: "Fachada do Sonata Place",
    width: 1066,
    height: 1600,
  },
  {
    src: "/condominios/sonata-place/piscina.webp",
    alt: "Piscina e área externa do condomínio Sonata Place na Agronômica",
    caption: "Piscina e área externa do condomínio",
    width: 1600,
    height: 1066,
  },
];

const JAZZ_PHOTOS: readonly CondominiumPhoto[] = [
  {
    src: "/condominios/jazz-club/fachada.webp",
    alt: "Fachada das torres do condomínio Jazz Club na Agronômica, Florianópolis",
    caption: "Fachada do Jazz Club · fonte: Mantovani e Rita Arquitetura",
    width: 1067,
    height: 1600,
  },
  {
    src: "/condominios/jazz-club/piscina.webp",
    alt: "Piscina e área externa do condomínio Jazz Club na Agronômica",
    caption: "Piscina do Jazz Club · fonte: Mantovani e Rita Arquitetura",
    width: 1067,
    height: 1600,
  },
];

const ACQUA_PHOTOS: readonly CondominiumPhoto[] = [
  {
    src: "/condominios/acqua/piscina.webp",
    alt: "Piscina do condomínio Acqua com vista para a Beira Mar Norte em Florianópolis",
    caption: "Piscina do Acqua · fonte: CFL Imóveis",
    width: 1600,
    height: 1068,
  },
  {
    src: "/condominios/acqua/playground.webp",
    alt: "Playground e área externa do condomínio Acqua na Agronômica",
    caption: "Playground e área externa · fonte: CFL Imóveis",
    width: 1600,
    height: 1068,
  },
];

// Original files: Drive/SONATA/Fachada 1 and Piscina 1.
// https://drive.google.com/drive/folders/1i6HXssEd7Fy6XtLsiVptLshHicjKeV9g
// Jazz Club photos: architectural project's portfolio (2016), not the marked Drive copies.
// https://mantovanierita.com.br/projetos/jazz-club/
// https://mantovanierita.com.br/wp-content/uploads/507_03_Frente.jpg
// https://mantovanierita.com.br/wp-content/uploads/507_13_Piscina.jpg
// Acqua photos: developer's page confirming Frei Caneca, 17.
// https://cflimoveis.com.br/acqua/
// https://cflimoveis.com.br/wp-content/uploads/2024/07/Acqua-CFL-19.jpg
// https://cflimoveis.com.br/wp-content/uploads/2024/07/Acqua-CFL-13-scaled.jpg
// The listing-unit photos in the blog are deliberately excluded.
export function getCondominiumPhotos(slug: string, address: string | null): readonly CondominiumPhoto[] {
  if (!address) return [];
  const normalized = address.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (slug === "condominio-sonata-place-agronomica-florianopolis") {
    return /constantino\s+nicolau\s+spyrides/.test(normalized) && /\b4152\b/.test(normalized)
      ? SONATA_PHOTOS
      : [];
  }
  if (slug === "condominio-jazz-club-agronomica-florianopolis") {
    return /paulo\s+zimmer/.test(normalized) && /\b101\b/.test(normalized)
      ? JAZZ_PHOTOS
      : [];
  }
  if (slug === "condominio-acqua-agronomica-florianopolis") {
    return /frei\s+caneca/.test(normalized) && /\b17\b/.test(normalized)
      ? ACQUA_PHOTOS
      : [];
  }
  return [];
}
