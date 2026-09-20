import { z, ZodObject } from "zod";
import type { McpContext, McpTool, McpToolResult } from "./types";
import searchProperties from "./tools/search-properties";
import getProperty from "./tools/get-property";
import listCondominiums from "./tools/list-condominiums";
import getCondominium from "./tools/get-condominium";

export const MCP_TOOLS: McpTool[] = [
  searchProperties,
  getProperty,
  listCondominiums,
  getCondominium,
];

export const MCP_SERVER_INFO = {
  name: "michele-dos-imoveis-mcp",
  title: "Michele dos Imóveis",
  version: "0.1.0",
  instructions:
    "Ferramentas para consultar o portfólio da Michele dos Imóveis em Florianópolis: buscar imóveis publicados, obter detalhes por código, listar condomínios e obter um condomínio por slug.",
};

export function extractContextFromRequest(request: Request): McpContext {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  return {
    token,
    getToken: () => token,
    isAuthenticated: () => Boolean(token),
  };
}

// Convert tool inputSchema to standard JSON Schema
export function toolToJsonSchema(tool: McpTool): Record<string, unknown> {
  const schema = tool.inputSchema;
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  const shape = schema instanceof ZodObject ? schema.shape : schema;

  for (const [key, value] of Object.entries(shape as Record<string, any>)) {
    let typeName = "string";
    let isOptional = false;
    let desc = "";

    // Inspeciona tipos Zod comuns
    let curr = value;
    while (curr) {
      if (curr.description) desc = curr.description;
      const def = curr._def;
      if (!def) break;
      const typeNameFromDef = def.typeName || def.type;

      if (typeNameFromDef === "ZodOptional" || typeNameFromDef === "optional") {
        isOptional = true;
        curr = def.innerType;
      } else if (typeNameFromDef === "ZodNullable" || typeNameFromDef === "nullable") {
        curr = def.innerType;
      } else if (typeNameFromDef === "ZodDefault" || typeNameFromDef === "default") {
        isOptional = true;
        curr = def.innerType;
      } else if (typeNameFromDef === "ZodString" || typeNameFromDef === "string") {
        typeName = "string";
        break;
      } else if (typeNameFromDef === "ZodNumber" || typeNameFromDef === "number") {
        typeName = def.checks?.some((c: any) => c.kind === "int") ? "integer" : "number";
        break;
      } else if (typeNameFromDef === "ZodBoolean" || typeNameFromDef === "boolean") {
        typeName = "boolean";
        break;
      } else if (typeNameFromDef === "ZodArray" || typeNameFromDef === "array") {
        typeName = "array";
        break;
      } else {
        break;
      }
    }

    properties[key] = {
      type: typeName,
      ...(desc ? { description: desc } : {}),
    };

    if (!isOptional) {
      required.push(key);
    }
  }

  return {
    type: "object",
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

export function listMcpToolsFormatted() {
  return MCP_TOOLS.map((t) => ({
    name: t.name,
    title: t.title,
    description: t.description,
    inputSchema: toolToJsonSchema(t),
    annotations: t.annotations,
  }));
}

export async function invokeMcpTool(
  toolName: string,
  args: Record<string, unknown>,
  ctx: McpContext
): Promise<McpToolResult> {
  const tool = MCP_TOOLS.find((t) => t.name === toolName);
  if (!tool) {
    return {
      content: [{ type: "text", text: `Tool not found: ${toolName}` }],
      isError: true,
    };
  }

  try {
    return await tool.handler(args, ctx);
  } catch (err: any) {
    return {
      content: [{ type: "text", text: err?.message || String(err) }],
      isError: true,
    };
  }
}

// Handle JSON-RPC 2.0 MCP Request
export async function handleMcpJsonRpc(
  body: any,
  ctx: McpContext
): Promise<{ status: number; body: any }> {
  if (!body || typeof body !== "object") {
    return {
      status: 400,
      body: { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
    };
  }

  const { id, method, params } = body;

  switch (method) {
    case "initialize":
      return {
        status: 200,
        body: {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: {
              name: MCP_SERVER_INFO.name,
              version: MCP_SERVER_INFO.version,
            },
            instructions: MCP_SERVER_INFO.instructions,
          },
        },
      };

    case "notifications/initialized":
    case "ping":
      return {
        status: 200,
        body: { jsonrpc: "2.0", id, result: {} },
      };

    case "tools/list":
      return {
        status: 200,
        body: {
          jsonrpc: "2.0",
          id,
          result: {
            tools: listMcpToolsFormatted(),
          },
        },
      };

    case "tools/call": {
      const toolName = params?.name;
      const toolArgs = params?.arguments ?? {};
      const result = await invokeMcpTool(toolName, toolArgs, ctx);
      return {
        status: 200,
        body: {
          jsonrpc: "2.0",
          id,
          result,
        },
      };
    }

    default:
      return {
        status: 200,
        body: {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`,
          },
        },
      };
  }
}
