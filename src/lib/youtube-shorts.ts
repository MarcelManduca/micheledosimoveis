/**
 * Shorts reais do canal @micheledosimoveis.
 * Selecionados manualmente. Atualize aqui para adicionar/remover cards.
 * Referência: https://www.youtube.com/@micheledosimoveis/shorts
 */

export type YouTubeShort = {
  id: string;
  youtubeId: string;
  title: string;
  url: string;
  thumbnail: string;
};

const short = (youtubeId: string, title: string): YouTubeShort => ({
  id: youtubeId,
  youtubeId,
  title,
  url: `https://www.youtube.com/shorts/${youtubeId}`,
  // Miniatura oficial do YouTube — não é possível "inventar" imagem.
  thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
});

export const YOUTUBE_SHORTS: readonly YouTubeShort[] = [
  short("orCBhI-EVeg", "Casa à venda R$5.900.000 · 5 suítes · Praia do Campeche · Florianópolis/SC"),
  short("ufnBKlnVgsU", "Campeche · Florianópolis · SC · R$5.990.000"),
  short("Q-GZuqHOKXo", "Viva Cacupé · Florianópolis · SC · R$9.800.000"),
  short("CkQirQiryLs", "Trindade · Florianópolis · SC · R$1.790.000"),
  short("5cy8qLJSbO8", "Duplex à venda em Jurerê · Florianópolis/SC · R$8.500.000"),
  short("JbtErprUM6g", "Apartamento no Centro de Floripa · R$850.000"),
  short("EJzvR5-htJc", "Cobertura · Florianópolis · R$1.950.000"),
  short("9zWzDVrePGc", "Beira-Mar Norte · Florianópolis · SC · R$2.750.000"),
] as const;
