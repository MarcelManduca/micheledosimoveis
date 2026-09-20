import { createFileRoute } from "@tanstack/react-router";
import mcp from "@/lib/mcp";

export const Route = createFileRoute("/mcp")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // SSE or MCP discovery endpoint
        const url = new URL(request.url);
        return new Response(
          JSON.stringify({
            name: mcp.serverInfo.name,
            version: mcp.serverInfo.version,
            instructions: mcp.serverInfo.instructions,
            endpoints: {
              mcp: `${url.origin}/mcp`,
              tools: `${url.origin}/.mcp/list-tools`,
              oauthMetadata: `${url.origin}/.well-known/oauth-protected-resource`,
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      },
      POST: async ({ request }) => {
        const ctx = mcp.extractContext(request);
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: null,
              error: { code: -32700, message: "Parse error" },
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const { status, body: responseBody } = await mcp.handleJsonRpc(body, ctx);
        return new Response(JSON.stringify(responseBody), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
