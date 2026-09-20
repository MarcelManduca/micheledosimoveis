import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/.well-known/oauth-protected-resource")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const projectRef = process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID || "project-ref";

        return new Response(
          JSON.stringify({
            resource: `${url.origin}/mcp`,
            authorization_servers: [`https://${projectRef}.supabase.co/auth/v1`],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      },
    },
  },
});
