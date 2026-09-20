import { z, type ZodTypeAny, type ZodRawShape } from "zod";

export interface McpContext {
  token: string | null;
  getToken: () => string | null;
  isAuthenticated: () => boolean;
}

export interface McpToolResult {
  content: Array<{
    type: "text" | "image" | "resource";
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

export interface McpTool<TArgs = any> {
  name: string;
  title?: string;
  description: string;
  inputSchema: ZodRawShape | z.ZodObject<ZodRawShape>;
  annotations?: {
    readOnlyHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
  handler: (args: TArgs, ctx: McpContext) => Promise<McpToolResult>;
}

export function defineTool<TArgs>(tool: McpTool<TArgs>): McpTool<TArgs> {
  return tool;
}
