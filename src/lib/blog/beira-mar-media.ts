/** Photos already distributed by the Michele website feed. See docs/BLOG_BEIRA_MAR.md. */
export const ARTICLE_PATH = "/blog/condominios-luxo-beira-mar-norte-agronomica" as const;
// Set only after receiving and verifying Michele's exact public Reel permalink.
export const LA_PERLE_REEL_URL: string | null = null;
export const CONDOMINIUM_MEDIA = {
  "villa-celimontana": {
    code: "43575",
    photos: ["/blog/beira-mar-norte/villa-celimontana.webp"],
  },
  "soprano-hall": {
    code: "44022",
    photos: ["/blog/beira-mar-norte/soprano-hall.webp"],
  },
  "jazz-club": {
    code: "22461",
    photos: ["/blog/beira-mar-norte/jazz-club.webp"],
  },
  "sonata-place": {
    code: "30870",
    photos: ["/blog/beira-mar-norte/sonata-place.webp"],
  },
  acqua: {
    code: "31776",
    photos: ["/blog/beira-mar-norte/acqua.webp"],
  },
  "la-perle": {
    code: "34547",
    photos: ["/blog/beira-mar-norte/la-perle.webp", "/blog/beira-mar-norte/la-perle-2.webp"],
  },
} as const;
