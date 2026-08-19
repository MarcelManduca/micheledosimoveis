import { parseGralhaPropertyHtml, fetchGralhaApiItem } from "./gralha-scraper.server";
import { checkGralhaAvailability } from "./gralha-availability.server";

export type SyncOptions = {
  url: string;
  featured?: boolean;
  isLaunch?: boolean;
};

export type SyncResult = {
  mode: "created" | "updated" | "no_change" | "unpublished" | "republished" | "error";
  changedFields: string[];
  photosAdded: number;
  photosRemoved: number;
  photosReordered: number;
  publishedBefore: boolean;
  publishedAfter: boolean;
  error: string | null;
  id?: string;
  code?: string;
};

const ALLOWED_HOSTS = new Set(["gralhaimoveis.com.br", "www.gralhaimoveis.com.br"]);
const MAX_HTML_BYTES = 4 * 1024 * 1024; // 4 MB
const FETCH_TIMEOUT_MS = 15_000;
const NOT_FOUND_MARKERS = [
  "imóvel não encontrado",
  "imovel nao encontrado",
  "não foi encontrado",
  "página não encontrada",
  "pagina nao encontrada",
  "esse imóvel não está mais disponível",
  "imóvel indisponível",
];

function arraysEqual(a: any[] | null, b: any[] | null): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export async function syncOneGralhaProperty(
  db: any,
  options: SyncOptions
): Promise<SyncResult> {
  const { url, featured = false, isLaunch = false } = options;
  const now = new Date().toISOString();

  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return {
      mode: "error",
      changedFields: [],
      photosAdded: 0,
      photosRemoved: 0,
      photosReordered: 0,
      publishedBefore: false,
      publishedAfter: false,
      error: "URL inválida.",
    };
  }

  if (u.protocol !== "https:" || !ALLOWED_HOSTS.has(u.hostname.toLowerCase())) {
    return {
      mode: "error",
      changedFields: [],
      photosAdded: 0,
      photosRemoved: 0,
      photosReordered: 0,
      publishedBefore: false,
      publishedAfter: false,
      error: "URL de host não permitido.",
    };
  }

  const urlCodeMatch = u.pathname.match(/(\d{4,})/);
  const urlCode = urlCodeMatch ? urlCodeMatch[1] : u.pathname.split("/").filter(Boolean).pop() || "";

  // 1. Fetch unico para disponibilidade e conteudo
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  let responseUrl = url;
  let isNotFound = false;
  let isTransientError = false;
  let errorMessage: string | null = null;

  try {
    const resp = await fetch(u.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });

    responseUrl = resp.url;

    if (resp.status === 404 || resp.status === 410) {
      isNotFound = true;
      errorMessage = `HTTP ${resp.status}`;
    } else if (!resp.ok) {
      isTransientError = true;
      errorMessage = `HTTP ${resp.status}`;
    } else {
      // Verificar redirecionamento fora de /imovel/
      const finalUrl = new URL(resp.url);
      if (!/\/imovel\//i.test(finalUrl.pathname)) {
        isNotFound = true;
        errorMessage = `Redirecionado para ${finalUrl.pathname}`;
      } else {
        // Ler HTML respeitando limite de tamanho
        const reader = resp.body?.getReader();
        if (!reader) {
          html = await resp.text();
        } else {
          const chunks: Uint8Array[] = [];
          let total = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            if (total > MAX_HTML_BYTES) {
              await reader.cancel();
              throw new Error("Página muito grande para processar.");
            }
            chunks.push(value);
          }
          const merged = new Uint8Array(total);
          let offset = 0;
          for (const c of chunks) {
            merged.set(c, offset);
            offset += c.byteLength;
          }
          html = new TextDecoder("utf-8").decode(merged);
        }

        // Verificar markers de indisponibilidade
        const lower = html.toLowerCase();
        if (NOT_FOUND_MARKERS.some((m) => lower.includes(m))) {
          isNotFound = true;
          errorMessage = "Página indica imóvel indisponível.";
        }
      }
    }
  } catch (err) {
    isTransientError = true;
    errorMessage = (err as Error).message || "Falha de rede ou timeout";
  } finally {
    clearTimeout(timer);
  }

  const finalUrlCode = urlCode || "";

  // 2. Tratar erros transitórios ou não encontrados
  if (isTransientError || isNotFound) {
    const { data: existing, error: findErr } = await db
      .from("properties")
      .select("*")
      .or(`code.eq.${finalUrlCode},source_url.eq.${url}`)
      .maybeSingle();

    if (findErr) {
      return {
        mode: "error",
        changedFields: [],
        photosAdded: 0,
        photosRemoved: 0,
        photosReordered: 0,
        publishedBefore: false,
        publishedAfter: false,
        error: `Erro ao consultar imóvel no banco: ${findErr.message}`,
        code: finalUrlCode,
      };
    }

    const publishedBefore = existing ? existing.published : false;

    if (isTransientError) {
      if (existing) {
        const { error: upErr } = await db
          .from("properties")
          .update({
            last_checked_at: now,
            last_check_status: `error: ${errorMessage}`,
          })
          .eq("id", existing.id);
        if (upErr) {
          return {
            mode: "error",
            changedFields: [],
            photosAdded: 0,
            photosRemoved: 0,
            photosReordered: 0,
            publishedBefore,
            publishedAfter: publishedBefore,
            error: `Erro ao atualizar status de erro: ${upErr.message}`,
            code: existing.code,
          };
        }
      }
      return {
        mode: "error",
        changedFields: [],
        photosAdded: 0,
        photosRemoved: 0,
        photosReordered: 0,
        publishedBefore,
        publishedAfter: publishedBefore,
        error: errorMessage,
        id: existing?.id,
        code: existing?.code || finalUrlCode,
      };
    }

    if (isNotFound) {
      if (existing) {
        const { error: upErr } = await db
          .from("properties")
          .update({
            last_checked_at: now,
            last_check_status: `not_found: ${errorMessage}`,
            unavailable_since: existing.unavailable_since || now,
            published: false,
          })
          .eq("id", existing.id);
        if (upErr) {
          return {
            mode: "error",
            changedFields: [],
            photosAdded: 0,
            photosRemoved: 0,
            photosReordered: 0,
            publishedBefore,
            publishedAfter: false,
            error: `Erro ao atualizar status indisponível: ${upErr.message}`,
            code: existing.code,
          };
        }
        return {
          mode: "unpublished",
          changedFields: [],
          photosAdded: 0,
          photosRemoved: 0,
          photosReordered: 0,
          publishedBefore,
          publishedAfter: false,
          error: null,
          id: existing.id,
          code: existing.code,
        };
      } else {
        return {
          mode: "unpublished",
          changedFields: [],
          photosAdded: 0,
          photosRemoved: 0,
          photosReordered: 0,
          publishedBefore: false,
          publishedAfter: false,
          error: `Imóvel não encontrado na origem: ${errorMessage}`,
          code: finalUrlCode,
        };
      }
    }
  }

  // 3. Buscar imóvel existente preliminarmente no banco para usar como fallback no parser
  let { data: existing, error: findErr } = await db
    .from("properties")
    .select("*")
    .or(`code.eq.${finalUrlCode},source_url.eq.${url}`)
    .maybeSingle();

  if (findErr) {
    return {
      mode: "error",
      changedFields: [],
      photosAdded: 0,
      photosRemoved: 0,
      photosReordered: 0,
      publishedBefore: false,
      publishedAfter: false,
      error: `Erro ao buscar imóvel existente: ${findErr.message}`,
      code: finalUrlCode,
    };
  }

  // 4. Imóvel disponível -> Realizar parse do HTML (passando existing como fallback)
  let scraped;
  try {
    scraped = await parseGralhaPropertyHtml(html!, url, existing);
  } catch (err) {
    if (existing) {
      await db
        .from("properties")
        .update({
          last_checked_at: now,
          last_check_status: `error_parse: ${(err as Error).message}`,
        })
        .eq("id", existing.id);
    }
    return {
      mode: "error",
      changedFields: [],
      photosAdded: 0,
      photosRemoved: 0,
      photosReordered: 0,
      publishedBefore: existing ? existing.published : false,
      publishedAfter: existing ? existing.published : false,
      error: `Erro ao analisar página: ${(err as Error).message}`,
      id: existing?.id,
      code: existing?.code || finalUrlCode,
    };
  }

  // 5. Após obter scraped.code real, verificar se existe outro registro com scraped.code ou source_url
  const realCode = scraped.code || finalUrlCode;
  if (!existing || (existing.code !== realCode)) {
    const { data: realExisting, error: findRealErr } = await db
      .from("properties")
      .select("*")
      .or(`code.eq.${realCode},source_url.eq.${url}`)
      .maybeSingle();

    if (findRealErr) {
      return {
        mode: "error",
        changedFields: [],
        photosAdded: 0,
        photosRemoved: 0,
        photosReordered: 0,
        publishedBefore: existing ? existing.published : false,
        publishedAfter: existing ? existing.published : false,
        error: `Erro ao rebuscar imóvel pelo código real: ${findRealErr.message}`,
        code: realCode,
      };
    }

    if (realExisting) {
      existing = realExisting;
      try {
        scraped = await parseGralhaPropertyHtml(html!, url, existing);
      } catch (err) {
        // Ignorar se falhar na segunda tentativa (já rodou ok antes)
      }
    }
  }

  const publishedBefore = existing ? existing.published : false;

  // 6. Atualizar ou Inserir dados comerciais e galeria de fotos (dentro de try/catch para checar erros)
  try {
    const changedFields: string[] = [];
    const updateData: Record<string, any> = {};

    const checkField = (key: string, scrapedVal: any, existingVal: any) => {
      if (Array.isArray(scrapedVal)) {
        if (!arraysEqual(scrapedVal, existingVal)) {
          changedFields.push(key);
          updateData[key] = scrapedVal;
        }
      } else {
        if (scrapedVal !== existingVal) {
          changedFields.push(key);
          updateData[key] = scrapedVal;
        }
      }
    };

    if (existing) {
      checkField("title", scraped.title, existing.title);
      checkField("property_type", scraped.property_type, existing.property_type);
      checkField("neighborhood", scraped.neighborhood, existing.neighborhood);
      checkField("city", scraped.city, existing.city);
      checkField("state", scraped.state, existing.state);
      checkField("address", scraped.address, existing.address);
      checkField("condo_name", scraped.condo_name, existing.condo_name);
      checkField("price_brl", scraped.price_brl, existing.price_brl);
      checkField("condo_fee_brl", scraped.condo_fee_brl, existing.condo_fee_brl);
      checkField("iptu_brl", scraped.iptu_brl, existing.iptu_brl);
      checkField("area_m2", scraped.area_m2, existing.area_m2);
      checkField("bedrooms", scraped.bedrooms, existing.bedrooms);
      checkField("suites", scraped.suites, existing.suites);
      checkField("bathrooms", scraped.bathrooms, existing.bathrooms);
      checkField("parking_spots", scraped.parking_spots, existing.parking_spots);
      checkField("description", scraped.description, existing.description);
      checkField("features", scraped.features, existing.features);
      checkField("condo_features", scraped.condo_features, existing.condo_features);
      checkField("cover_image", scraped.cover_image, existing.cover_image);
      checkField("code", scraped.code, existing.code);
      checkField("source_url", url, existing.source_url);

      const isRepublishing = !existing.published || existing.last_check_status !== "available";
      if (isRepublishing) {
        updateData.published = true;
        updateData.unavailable_since = null;
        updateData.last_check_status = "available";
      }

      updateData.last_checked_at = now;
      updateData.last_check_status = "available";

      if (Object.keys(updateData).length > 0) {
        const { error: upErr } = await db
          .from("properties")
          .update(updateData)
          .eq("id", existing.id);
        if (upErr) throw upErr;
      }

      // Diff de Fotos
      let photosAdded = 0;
      let photosRemoved = 0;
      let photosReordered = 0;

      const { data: existingPhotos, error: phErr } = await db
        .from("property_photos")
        .select("id, url, position")
        .eq("property_id", existing.id)
        .order("position", { ascending: true });
      if (phErr) throw phErr;

      const desiredPhotos = Array.from(new Set(scraped.photos.map((p) => p.trim()))).slice(0, 80);
      const existingMap = new Map<string, { id: string; position: number }>();
      for (const ph of existingPhotos || []) {
        existingMap.set(ph.url, { id: ph.id, position: ph.position });
      }

      const urlsToDelete: string[] = [];
      for (const ph of existingPhotos || []) {
        if (!desiredPhotos.includes(ph.url)) {
          urlsToDelete.push(ph.url);
          photosRemoved++;
        }
      }

      if (urlsToDelete.length > 0) {
        const { error: delErr } = await db
          .from("property_photos")
          .delete()
          .eq("property_id", existing.id)
          .in("url", urlsToDelete);
        if (delErr) throw delErr;
      }

      const toInsert: Array<{ property_id: string; url: string; position: number }> = [];
      for (let i = 0; i < desiredPhotos.length; i++) {
        const pUrl = desiredPhotos[i];
        const exist = existingMap.get(pUrl);
        if (!exist) {
          toInsert.push({ property_id: existing.id, url: pUrl, position: i });
          photosAdded++;
        } else {
          if (exist.position !== i) {
            const { error: upPhotoErr } = await db
              .from("property_photos")
              .update({ position: i })
              .eq("id", exist.id);
            if (upPhotoErr) throw upPhotoErr;
            photosReordered++;
          }
        }
      }

      if (toInsert.length > 0) {
        const { error: insPhotoErr } = await db
          .from("property_photos")
          .insert(toInsert);
        if (insPhotoErr) throw insPhotoErr;
      }

      const hasPhotoChanges = photosAdded > 0 || photosRemoved > 0 || photosReordered > 0;
      const mode = isRepublishing
        ? "republished"
        : (changedFields.length > 0 || hasPhotoChanges)
        ? "updated"
        : "no_change";

      return {
        mode,
        changedFields,
        photosAdded,
        photosRemoved,
        photosReordered,
        publishedBefore,
        publishedAfter: true,
        error: null,
        id: existing.id,
        code: scraped.code,
      };
    } else {
      // Criar novo registro
      const { data: inserted, error: insErr } = await db
        .from("properties")
        .insert({
          code: scraped.code,
          source_url: scraped.source_url,
          title: scraped.title,
          property_type: scraped.property_type,
          neighborhood: scraped.neighborhood,
          city: scraped.city,
          state: scraped.state,
          address: scraped.address,
          condo_name: scraped.condo_name,
          price_brl: scraped.price_brl,
          condo_fee_brl: scraped.condo_fee_brl,
          iptu_brl: scraped.iptu_brl,
          area_m2: scraped.area_m2,
          bedrooms: scraped.bedrooms,
          suites: scraped.suites,
          bathrooms: scraped.bathrooms,
          parking_spots: scraped.parking_spots,
          description: scraped.description,
          features: scraped.features,
          condo_features: scraped.condo_features,
          cover_image: scraped.cover_image,
          published: true,
          featured,
          is_launch: isLaunch,
          last_checked_at: now,
          last_check_status: "available",
          unavailable_since: null,
        })
        .select("id")
        .single();

      if (insErr || !inserted) throw insErr || new Error("Falha ao inserir novo imóvel.");

      const desiredPhotos = Array.from(new Set(scraped.photos.map((p) => p.trim()))).slice(0, 80);
      if (desiredPhotos.length > 0) {
        const rows = desiredPhotos.map((url, i) => ({
          property_id: inserted.id,
          url,
          position: i,
        }));
        const { error: insPhotosErr } = await db.from("property_photos").insert(rows);
        if (insPhotosErr) throw insPhotosErr;
      }

      return {
        mode: "created",
        changedFields: [
          "title",
          "property_type",
          "neighborhood",
          "city",
          "state",
          "address",
          "condo_name",
          "price_brl",
          "condo_fee_brl",
          "iptu_brl",
          "area_m2",
          "bedrooms",
          "suites",
          "bathrooms",
          "parking_spots",
          "description",
          "features",
          "condo_features",
          "cover_image",
        ],
        photosAdded: desiredPhotos.length,
        photosRemoved: 0,
        photosReordered: 0,
        publishedBefore: false,
        publishedAfter: true,
        error: null,
        id: inserted.id,
        code: scraped.code,
      };
    }
  } catch (err) {
    return {
      mode: "error",
      changedFields: [],
      photosAdded: 0,
      photosRemoved: 0,
      photosReordered: 0,
      publishedBefore,
      publishedAfter: publishedBefore,
      error: (err as Error).message || "Erro inesperado ao gravar no banco.",
      id: existing?.id,
      code: scraped?.code || finalUrlCode,
    };
  }
}
