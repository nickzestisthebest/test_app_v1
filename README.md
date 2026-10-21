# Sprout: installable app + server

This folder is everything needed to run Sprout on your phone with real bank sync and AI.

- `public/` is the app itself (installs from Safari with "Add to Home Screen", works offline).
- `api/` is a small server that runs on Vercel for free while it's just you:
  - `api/plaid.js` connects banks through Plaid (read-only). Bank tokens are encrypted and never sent to the phone.
  - `api/ai.js` runs the AI for Ask Sprout, with daily and monthly limits per person and a hard monthly dollar budget.
  - `api/requests.js` holds Cancel for me requests: each person's written authorization, encrypted name and email, and status. You work them from Settings.
  - `api/status.js` tells the app what's set up and what your access code allows.
  - `api/state.js` keeps an encrypted backup of each person's plan, history and streak, so a new phone or a fresh sign-in gets it back. People can turn it off in Settings, which deletes it.
- `.env.example` lists every setting. Put the real values in Vercel, never in this folder or on GitHub.

The step-by-step setup guide is in the Sprout setup guide document.

## How the AI cost stays low

1. The phone answers most questions itself, for free: what you can spend, bills due, spending by category or store,
   subscriptions, budgets, debts, payday, savings targets, unusual charges, and logging purchases.
2. Only questions that need judgment ("should I...?") go to the AI, with a short summary instead of your raw history.
3. The cheapest current model (Claude Haiku 5.5), short answers, prompt caching for the fixed instructions,
   and saved answers for repeated questions.
4. Limits per person per day and month, and `AI_MONTHLY_BUDGET_USD` stops all AI calls for the month when it's reached.
   The phone keeps answering what it can.
5. The server only accepts the app's own prompts, so a leaked access code can't be used as a free AI service.

## Rebuilding after app changes

```
python3 tools/build_pwa.py path/to/sprout_v2.html
node tools/gen_prompts.mjs
```

## Running it on your computer

```
export $(grep -v '^#' .env | xargs)   # your keys
node tools/dev_server.mjs             # then open http://localhost:3000
```

`tools/test/` has the offline stand-ins for Plaid, Anthropic and Upstash, and the end-to-end test.
