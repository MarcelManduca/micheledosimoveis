import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { McpContext } from "./types";

export function supabaseForUser(ctx: McpContext): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
  const token = ctx.getToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return createClient(url, key, {
    global: { headers },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
