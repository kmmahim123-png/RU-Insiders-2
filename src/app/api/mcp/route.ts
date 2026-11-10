import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { AI_MCP_TOOLS, executeAiTool } from '@/lib/aiTools';

export const dynamic = 'force-dynamic';

/**
 * Standard JSON-RPC 2.0 Model Context Protocol (MCP) HTTP Endpoint
 * Exposes live Blood Donor 90-day eligibility tools, Department Teachers,
 * Store Orders, Campus Maps, and Admin Training Knowledge to any MCP Client.
 */
export async function GET() {
  const db = await readDb();
  const mcpEnabled = db.settings.aiConfig?.mcpEnabled !== false;
  return NextResponse.json({
    ok: true,
    protocol: 'MCP/2024-11-05 (JSON-RPC 2.0 over HTTP)',
    enabled: mcpEnabled,
    requiresToken: Boolean(db.settings.aiConfig?.mcpSecretToken),
    serverInfo: {
      name: 'ru-insiders-mcp-server',
      version: '1.0.0',
    },
    tools: AI_MCP_TOOLS.map((t) => ({ name: t.name, description: t.description })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const db = await readDb();
    const aiCfg = db.settings.aiConfig;

    if (aiCfg?.mcpEnabled === false) {
      return NextResponse.json(
        { jsonrpc: '2.0', id: null, error: { code: -32000, message: 'MCP server disabled by admin.' } },
        { status: 403 }
      );
    }

    const expectedToken = (aiCfg?.mcpSecretToken || '').trim();
    if (expectedToken) {
      const authHeader = req.headers.get('authorization') || '';
      const provided = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (provided !== expectedToken) {
        return NextResponse.json(
          { jsonrpc: '2.0', id: null, error: { code: -32001, message: 'Unauthorized MCP token.' } },
          { status: 401 }
        );
      }
    }

    const body = await req.json();
    const { id = null, method, params } = body || {};

    if (method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: { name: 'ru-insiders-mcp-server', version: '1.0.0' },
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
          },
        },
      });
    }

    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: AI_MCP_TOOLS.map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.parameters,
          })),
        },
      });
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      if (!toolName) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Missing tool name.' },
        });
      }
      const data = await executeAiTool(toolName, toolArgs);
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
          isError: Boolean(data?.error),
        },
      });
    }

    if (method === 'resources/list') {
      const docs = aiCfg?.trainingDocs || [];
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          resources: [
            {
              uri: 'ru-insiders://knowledge/all',
              name: 'RU Insiders Admin Trained Knowledge Base',
              mimeType: 'application/json',
            },
            ...docs.map((d) => ({
              uri: `ru-insiders://training/${d.id}`,
              name: d.title,
              mimeType: 'text/plain',
            })),
          ],
        },
      });
    }

    if (method === 'resources/read') {
      const uri = params?.uri || '';
      const docs = aiCfg?.trainingDocs || [];
      if (uri === 'ru-insiders://knowledge/all') {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(docs, null, 2) }],
          },
        });
      }
      const matched = docs.find((d) => `ru-insiders://training/${d.id}` === uri);
      if (matched) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            contents: [{ uri, mimeType: 'text/plain', text: `${matched.title}\n\n${matched.content}` }],
          },
        });
      }
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32004, message: 'Resource not found.' },
      });
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  } catch (err: any) {
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32603, message: err?.message || 'Internal error' } },
      { status: 500 }
    );
  }
}
