# token-unlock-calendar MCP server

A small live MCP server serving the token unlock calendar and the verified
token figures from the token pages. Two read-only tools, no accounts, no
payments, no writes. Free, general information only, not financial advice.

## Tools

- `get_unlock_calendar` — the 12 upcoming unlock and market events
  (XRP, SUI, HYPE, UNI, PYTH, PENDLE, Fed, CGT). Optional `token` filter.
- `get_token_figures` — latest verified price, cap and diligence figures
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

## What is still needed before this goes live

1. A Cloudflare account in Gruffin's name, to deploy the Worker and get
   the stable `workers.dev` URL.
2. The deployed public URL, to fill in `<HOST>` in `server.json` (the
   GitHub side is done: repo `headgoldpicker/token-unlock-calendar` is
   public and `server.json` already names it).

No wallet and no paid route are involved. PayAI stays out of scope until
a paid x402 route and a USDC wallet exist, which is a separate decision.
