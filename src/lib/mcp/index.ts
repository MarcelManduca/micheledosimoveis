import {
  MCP_TOOLS,
  MCP_SERVER_INFO,
  extractContextFromRequest,
  listMcpToolsFormatted,
  invokeMcpTool,
  handleMcpJsonRpc,
} from "./server";
import { defineTool } from "./types";

export * from "./types";
export * from "./supabase";
export * from "./server";

export default {
  tools: MCP_TOOLS,
  serverInfo: MCP_SERVER_INFO,
  extractContext: extractContextFromRequest,
  listTools: listMcpToolsFormatted,
  invokeTool: invokeMcpTool,
  handleJsonRpc: handleMcpJsonRpc,
  defineTool,
};
