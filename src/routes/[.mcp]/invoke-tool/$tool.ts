import { createFileRoute } from "@tanstack/react-router";
import mcp from "@/lib/mcp";

export const Route = createFileRoute("/.mcp/invoke-tool/$tool")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const toolName = params.tool;
        const ctx = mcp.extractContext(request);
        let args: Record<string, unknown> = {};

        try {
          const body = await request.json();
          args = (body && typeof body === "object") ? body : {};
        } catch {
          args = {};
        }

        const result = await mcp.invokeTool(toolName, args, ctx);
        const status = result.isError ? 400 : 200;

        return new Response(JSON.stringify(result), {
          status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
