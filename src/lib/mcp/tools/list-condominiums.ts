import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_condominiums",
  title: "List condominiums",
  description: "List published condominiums in Florianópolis, optionally filtered by neighborhood.",
  inputSchema: {
    neighborhood: z.string().optional().describe("Neighborhood name to filter by."),
    limit: z.number().int().min(1).max(100).optional().describe("Max results (default 30)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ neighborhood, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const sb = supabaseForUser(ctx);
    let q = sb
      .from("condominiums")
      .select("slug,name,neighborhood,address,bedrooms_min,bedrooms_max,area_min_m2,area_max_m2,condo_fee_min_brl,amenities")
      .eq("is_active", true)
      .order("name");
    if (neighborhood) q = q.ilike("neighborhood", `%${neighborhood}%`);
    q = q.limit(limit ?? 30);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { condominiums: data ?? [] },
    };
  },
});
