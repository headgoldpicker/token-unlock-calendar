# token-unlock-calendar MCP server

[![Token Unlock Calendar MCP connector](https://glama.ai/mcp/connectors/io.github.headgoldpicker/token-unlock-calendar/badges/score.svg)](https://glama.ai/mcp/connectors/io.github.headgoldpicker/token-unlock-calendar)

Listed in the [MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=token-unlock-calendar) and on [Glama](https://glama.ai/mcp/connectors/io.github.headgoldpicker/token-unlock-calendar).

A small live MCP server serving the token unlock calendar and the verified
token figures from the token pages. Two read-only tools, no accounts, no
payments, no writes. Free, general information only, not financial advice.

## Connect

Live endpoint: `https://token-unlock-calendar.printer-grandee0c.workers.dev/mcp`

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=token-unlock-calendar&config=eyJ1cmwiOiJodHRwczovL3Rva2VuLXVubG9jay1jYWxlbmRhci5wcmludGVyLWdyYW5kZWUwYy53b3JrZXJzLmRldi9tY3AifQ%3D%3D)
[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://vscode.dev/redirect/mcp/install?name=token-unlock-calendar&config=%7B%22name%22%3A%22token-unlock-calendar%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Ftoken-unlock-calendar.printer-grandee0c.workers.dev%2Fmcp%22%7D)
[![Add to Claude](https://img.shields.io/badge/Add%20to-Claude-D97757?style=flat-square)](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=token-unlock-calendar&connectorUrl=https%3A%2F%2Ftoken-unlock-calendar.printer-grandee0c.workers.dev%2Fmcp)

Or add it by hand. Claude Code:

```sh
claude mcp add --transport http token-unlock-calendar https://token-unlock-calendar.printer-grandee0c.workers.dev/mcp
```

Cursor (`.cursor/mcp.json`) and Claude Desktop:

```json
{
  "mcpServers": {
    "token-unlock-calendar": {
      "url": "https://token-unlock-calendar.printer-grandee0c.workers.dev/mcp"
    }
  }
}
```

Claude skill, which tells Claude which tool to call for which question:

```sh
npx skills add headgoldpicker/token-unlock-calendar
```

## Tools

- `get_unlock_calendar`: the 12 upcoming unlock and market events
  (XRP, SUI, HYPE, UNI, PYTH, PENDLE, Fed, CGT). Optional `token` filter.
- `get_token_figures`: latest verified price, cap and diligence figures
  for BTC, ETH, SOL, XRP, HYPE, LINK, ZEC, XMR, TAO, SUI, UNI, ADA,
  PYTH, SYRUP and AKT, plus ETF flows and Fear and Greed.
  Optional `token` filter. Any token in `data.json` with a price works.

Data lives in `data.json`. PYTH, SYRUP and AKT match the published token
pages (27 Nov 2026 11:15 AEDT gate check, 26 Nov UTC closes). The 12 added
tokens carry live prices from 27 Nov 2026, checked on CoinGecko and
CoinPaprika. Update the figures there when the pages refresh, and redeploy.

## Run locally

```sh
npm install
npm start
```

The server listens on port 3000 (or `$PORT`). Check it answers:

```sh
curl http://localhost:3000/health
curl -X POST http://localhost:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke-test","version":"1.0.0"}}}'
```

Then `tools/list` and `tools/call` for each tool. A client must send the
`Accept: application/json, text/event-stream` header.

## Deploy (free tier)

Chosen host is Cloudflare Workers: always on, no cold starts, no card,
free tier fits. `worker.js` is the same server as a Worker (`wrangler.toml`,
`main = "worker.js"`), stateless, same `data.json`. Run it locally with
`npx wrangler dev`, or deploy it free from the repo through Cloudflare
Workers Builds, which gives a stable
`https://token-unlock-calendar.<subdomain>.workers.dev` address. That URL
plus `/mcp` is the endpoint.

The plain Node version (`server.js`, `npm install`, `npm start`, port 3000)
still works on any Node host (Render, Railway, Fly.io) as a fallback.

## Publish to the MCP Registry

Needs a GitHub account in the owner's name. Replace `<GITHUB_USERNAME>`
in `server.json` with the GitHub login and `<HOST>` with the deployed
host, then:

```sh
brew install mcp-publisher   # or download the release tarball
mcp-publisher login github
mcp-publisher publish
curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=token-unlock-calendar"
```

Glama picks up a Registry listing on its hourly sync, so no separate
Glama submission is needed. addrbook reads the Registry hourly too, and
its probe can also be given the live endpoint URL directly.

No wallet and no paid route are involved. PayAI stays out of scope until
a paid x402 route and a USDC wallet exist, which is a separate decision.
