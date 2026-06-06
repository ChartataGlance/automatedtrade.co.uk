# Charting Website (Next.js + TypeScript) — Starter Scaffold

This scaffold provides a minimal MVP for a charting website:
- Next.js + TypeScript frontend
- CSV upload (PapaParse) -> preview -> chart rendering (react-chartjs-2 / Chart.js)
- Lightweight DAX front page using lightweight-charts and a server-side proxy to Yahoo Finance
- Optional Supabase integration for saving/loading charts
- Tailwind CSS for styles
- Fallback to localStorage if Supabase env vars are not set

Quick start
1. Install:
   npm install

2. Run dev server:
   npm run dev
   Open http://localhost:3000

Notes
- The front page fetches 1h OHLC for DAX via the Next.js API route at /api/ohlc. The API uses Yahoo Finance for DAX and Binance for crypto symbols.
- To persist charts to Supabase, create a table `charts` with columns:
  - id (text or uuid) PRIMARY KEY
  - config jsonb
  - created_at timestamp with time zone default now()
  - (optionally) owner_id text
- If Supabase env vars are not provided, the app will save/load charts to localStorage for demo purposes.
- To deploy to Vercel, push this repo and set it to use Node 18+.

If you want I can open a PR on branch `lightweight/dax-chart` with these files.
