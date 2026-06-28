// Server-only availability checker for gralhaimoveis.com.br listings.
// Returns one of: "available" | "not_found" | "error".

const ALLOWED_HOSTS = new Set(["gralhaimoveis.com.br", "www.gralhaimoveis.com.br"]);
const MAX_HTML_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 12_000;

export type AvailabilityResult = {
  status: "available" | "not_found" | "error";
  detail: string;
};

export async function checkGralhaAvailability(url: string): Promise<AvailabilityResult> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { status: "error", detail: "URL inválida" };
  }
  if (u.protocol !== "https:" || !ALLOWED_HOSTS.has(u.hostname.toLowerCase())) {
    return { status: "error", detail: "Host não permitido" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(u.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
    });

    if (resp.status === 404 || resp.status === 410) {
      return { status: "not_found", detail: `HTTP ${resp.status}` };
    }
    if (!resp.ok) {
      return { status: "error", detail: `HTTP ${resp.status}` };
    }

    // Detect redirect to home/search (listing removed)
    const finalUrl = new URL(resp.url);
    if (!/\/imovel\//i.test(finalUrl.pathname)) {
      return { status: "not_found", detail: `Redirecionado para ${finalUrl.pathname}` };
    }

    // Read at most MAX_HTML_BYTES
    const reader = resp.body?.getReader();
    if (!reader) return { status: "error", detail: "Resposta vazia" };
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.length;
        if (total > MAX_HTML_BYTES) break;
        chunks.push(value);
      }
    }
    const html = new TextDecoder("utf-8").decode(
      chunks.reduce((acc, c) => {
        const out = new Uint8Array(acc.length + c.length);
        out.set(acc, 0);
        out.set(c, acc.length);
        return out;
      }, new Uint8Array()),
    );

    const lower = html.toLowerCase();
    const notFoundMarkers = [
      "imóvel não encontrado",
      "imovel nao encontrado",
      "não foi encontrado",
      "página não encontrada",
      "pagina nao encontrada",
      "esse imóvel não está mais disponível",
      "imóvel indisponível",
    ];
    if (notFoundMarkers.some((m) => lower.includes(m))) {
      return { status: "not_found", detail: "Página indica imóvel indisponível" };
    }

    return { status: "available", detail: "OK" };
  } catch (err) {
    return { status: "error", detail: (err as Error).message || "Falha de rede" };
  } finally {
    clearTimeout(timer);
  }
}
