import { createFileRoute } from "@tanstack/react-router";
import mcp from "@/lib/mcp";

export const Route = createFileRoute("/.mcp/list-tools")({
  server: {
    handlers: {
      GET: async () => {
        const tools = mcp.listTools();
        return new Response(JSON.stringify({ tools }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
