import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_properties",
  title: "Search properties",
  description:
    "Search published real estate listings from Michele dos Imóveis. Optional filters: neighborhood, property type, price range, and minimum bedrooms.",
  inputSchema: {
    neighborhood: z.string().optional().describe("Neighborhood name (e.g. 'Jurerê Internacional')."),
    property_type: z.string().optional().describe("Property type such as 'Apartamento', 'Casa', 'Cobertura'."),
    min_price_brl: z.number().optional().describe("Minimum price in BRL."),
    max_price_brl: z.number().optional().describe("Maximum price in BRL."),
    min_bedrooms: z.number().int().optional().describe("Minimum number of bedrooms."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ neighborhood, property_type, min_price_brl, max_price_brl, min_bedrooms, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const sb = supabaseForUser(ctx);
    let q = sb
      .from("properties")
      .select("code,title,property_type,neighborhood,city,price_brl,area_m2,bedrooms,bathrooms,parking_spots,cover_image,source_url")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("price_brl", { ascending: false });
    if (neighborhood) q = q.ilike("neighborhood", `%${neighborhood}%`);
    if (property_type) q = q.ilike("property_type", `%${property_type}%`);
    if (typeof min_price_brl === "number") q = q.gte("price_brl", min_price_brl);
    if (typeof max_price_brl === "number") q = q.lte("price_brl", max_price_brl);
    if (typeof min_bedrooms === "number") q = q.gte("bedrooms", min_bedrooms);
    q = q.limit(limit ?? 20);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { properties: data ?? [] },
    };
  },
});
