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

// Original files: Drive/SONATA/Fachada 1 and Piscina 1.
// https://drive.google.com/drive/folders/1i6HXssEd7Fy6XtLsiVptLshHicjKeV9g
// The listing-unit photos in the blog are deliberately excluded.
export function getCondominiumPhotos(slug: string, address: string | null): readonly CondominiumPhoto[] {
  if (slug !== "condominio-sonata-place-agronomica-florianopolis" || !address) return [];
  const normalized = address.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (!/constantino\s+nicolau\s+spyrides/.test(normalized) || !/\b4152\b/.test(normalized)) return [];
  return SONATA_PHOTOS;
}
