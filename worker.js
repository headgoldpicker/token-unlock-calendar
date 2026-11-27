import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import data from './data.json';

// Cloudflare Workers entry for the token-unlock-calendar MCP server.
// Same two read-only tools as server.js, same data.json. Stateless: a fresh
// transport and server are created per request, so there is no session state
// to keep between requests. Run locally with `npx wrangler dev`, deploy with
// `wrangler deploy` or through Workers Builds from the repo.

// Tokens are the figure entries that carry a price. Adding a token to
// data.json with a price_usd field makes it available to get_token_figures.
const tokenList = Object.keys(data.figures)
  .filter((k) => data.figures[k] && typeof data.figures[k].price_usd === 'number')
  .map((k) => k.toUpperCase());

function createServer() {
  const server = new McpServer({ name: 'token-unlock-calendar', version: '1.0.0' });

  server.tool(
    'get_unlock_calendar',
    'Upcoming token unlock and market events for BTC, ETH, SOL, XRP, HYPE, LINK, ZEC, XMR, TAO, SUI, UNI, ADA, PYTH, SYRUP, AKT and PENDLE, with verified figures. Free, general information only.',
    {
      token: z
        .string()
        .optional()
        .describe('Optional filter: BTC, ETH, SOL, XRP, HYPE, LINK, ZEC, XMR, TAO, SUI, UNI, ADA, PYTH, SYRUP, AKT, PENDLE, FED or CGT. Omit for all entries.'),
    },
    async ({ token }) => {
      let entries = data.calendar;
      if (token) {
        const t = token.toUpperCase();
        entries = entries.filter(
          (e) => (e.token || '').toUpperCase().includes(t)
        );
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { as_of: data.as_of, entries, disclaimer: data.disclaimer },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    'get_token_figures',
    'Latest verified price, market cap and diligence figures for BTC, ETH, SOL, XRP, HYPE, LINK, ZEC, XMR, TAO, SUI, UNI, ADA, PYTH, SYRUP and AKT, plus ETF flows and Fear and Greed. Free, general information only.',
    {
      token: z
        .string()
        .optional()
        .describe('Optional token: BTC, ETH, SOL, XRP, HYPE, LINK, ZEC, XMR, TAO, SUI, UNI, ADA, PYTH, SYRUP or AKT. Omit for all figures plus market context.'),
    },
    async ({ token }) => {
      let out;
      if (token) {
        const key = token.toLowerCase();
        const entry = data.figures[key];
        const isToken = entry && typeof entry.price_usd === 'number';
        out = isToken
          ? { as_of: data.as_of, [key]: entry, disclaimer: data.disclaimer }
          : {
              as_of: data.as_of,
              error: `Unknown token. Use one of: ${tokenList.join(', ')}.`,
              disclaimer: data.disclaimer,
            };
      } else {
        out = {
          as_of: data.as_of,
          figures: data.figures,
          gates: data.gates,
          disclaimer: data.disclaimer,
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(out, null, 2) }],
      };
    }
  );

  return server;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return Response.json({
        name: 'token-unlock-calendar',
        description:
          'Token unlock dates and checked figures for BTC, ETH, SOL, XRP, HYPE, LINK, ZEC, XMR, TAO, SUI, UNI, ADA, PYTH, SYRUP, AKT and PENDLE. Free, general information only, not financial advice.',
        tools: ['get_unlock_calendar', 'get_token_figures'],
        mcp_endpoint: '/mcp',
      });
    }

    if (url.pathname === '/health') {
      return Response.json({ ok: true });
    }

    if (url.pathname === '/mcp') {
      if (request.method !== 'POST') {
        return Response.json(
          { error: 'Method not allowed. Use POST for MCP requests.' },
          { status: 405 }
        );
      }
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await createServer().connect(transport);
      return transport.handleRequest(request);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  },
};
