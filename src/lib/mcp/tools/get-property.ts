import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_property_by_code",
  title: "Get property by code",
  description: "Return the full published property record for a given internal code.",
  inputSchema: {
    code: z.string().min(1).describe("Property internal code (e.g. 'AP1234')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ code }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const sb = supabaseForUser(ctx);
    const { isCodeAdministrativelyBlocked, resolveEditorialPreservedSnapshot } = await import(
      "../../editorial-preserved"
    );
    const isBlocked = await isCodeAdministrativelyBlocked(code);
    if (isBlocked) {
      return { content: [{ type: "text", text: `No published or preserved property with code ${code}` }] };
    }

    const { data, error } = await sb
      .from("properties")
      .select("*")
      .eq("code", code)
      .eq("published", true)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      const snap = await resolveEditorialPreservedSnapshot(code, sb);
      if (snap) {
        const preservedPayload = {
          code: snap.code,
          title: snap.title,
          property_type: snap.propertyType,
          neighborhood: snap.neighborhood,
          city: snap.city,
          state: snap.state,
          address: snap.address,
          condo_name: snap.condoName,
          price_brl: null,
          area_m2: snap.areaM2,
          bedrooms: snap.bedrooms,
          suites: snap.suites,
          bathrooms: snap.bathrooms,
          parking_spots: snap.parkingSpots,
          description: snap.description,
          features: snap.features,
          condo_features: snap.condoFeatures,
          cover_image: snap.coverImage,
          published: false,
          is_archived: true,
          available_for_sale: false,
          unavailable_notice: snap.unavailableNotice,
          consultation_cta: "Consulte com a Michele outras unidades que possam estar disponíveis neste condomínio.",
          article_path: snap.articlePath,
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "unavailable_preserved",
                  notice: snap.unavailableNotice,
                  property: preservedPayload,
                },
                null,
                2,
              ),
            },
          ],
          structuredContent: { property: preservedPayload },
        };
      }
      return { content: [{ type: "text", text: `No published or preserved property with code ${code}` }] };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { property: data },
    };
  },
});
