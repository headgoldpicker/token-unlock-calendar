---
name: token-unlock-calendar
description: Token unlock dates and checked price and market cap figures for 15 crypto tokens. Use when the user asks which token unlocks are coming, how big an unlock is, or for checked figures on a token.
---

# Token Unlock Calendar

How to answer questions about token unlocks and token figures using the Token Unlock Calendar MCP server.

Install it with:

```sh
npx skills add headgoldpicker/token-unlock-calendar
```

## Tools

The server has two read-only tools. No sign-up, no key.

- `get_unlock_calendar`: the 12 upcoming unlock and market events (XRP, SUI, HYPE, UNI, PYTH, PENDLE, Fed, CGT). Pass `token` to filter to one token.
- `get_token_figures`: latest verified price, cap and diligence figures for BTC, ETH, SOL, XRP, HYPE, LINK, ZEC, XMR, TAO, SUI, UNI, ADA, PYTH, SYRUP and AKT, plus ETF flows and Fear and Greed. Pass `token` for one token.

## How to answer

- For which unlocks are coming, call `get_unlock_calendar` first, then give the dates soonest first with the token, the amount unlocking and its share of circulating supply.
- For how big an unlock is, call `get_token_figures` for that token and compare the unlock size with the circulating supply and the market cap.
- Say which date the figures are from. If a figure is flagged unconfirmed, say so plainly and do not present it as settled.
- This is general information only, not financial advice. Never present a figure as a prediction or a recommendation.
