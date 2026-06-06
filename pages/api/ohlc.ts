import type { NextApiRequest, NextApiResponse } from 'next'

type CacheEntry = { ts: number; data: any }
declare global {
  // persist cache between lambda invocations when possible
  // eslint-disable-next-line no-var
  var __ohlcCache: Record<string, CacheEntry> | undefined
}
if (!global.__ohlcCache) global.__ohlcCache = {}

const TTL_MS = 60 * 1000 // 60s cache; increase to 300000 for 5min

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const symbolRaw = String(req.query.symbol ?? 'BTCUSDT')
    const interval = String(req.query.interval ?? '1h')
    const limit = Number(req.query.limit ?? 200)
    const key = `${symbolRaw}_${interval}_${limit}`

    const cached = global.__ohlcCache![key]
    if (cached && Date.now() - cached.ts < TTL_MS) {
      return res.status(200).json({ source: 'cache', data: cached.data })
    }

    let data: Array<{ time: number; open: number; high: number; low: number; close: number }> = []

    if (symbolRaw.toUpperCase() === 'DAX' || symbolRaw.toUpperCase() === '^GDAXI' || symbolRaw.toUpperCase() === 'GDAXI') {
      // Yahoo Finance chart API (server-side)
      const yahooSymbol = encodeURIComponent('^GDAXI')
      const range = req.query.range ? String(req.query.range) : '30d'
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}&includePrePost=false`

      const r = await fetch(url)
      if (!r.ok) {
        const txt = await r.text()
        return res.status(502).json({ error: 'upstream_error', detail: txt })
      }
      const json = await r.json()
      const result = json?.chart?.result?.[0]
      if (!result) {
        return res.status(502).json({ error: 'no_data', detail: json })
      }

      const timestamps: number[] = result.timestamp || []
      const quote = result.indicators?.quote?.[0] || {}
      const opens: number[] = quote.open || []
      const highs: number[] = quote.high || []
      const lows: number[] = quote.low || []
      const closes: number[] = quote.close || []

      for (let i = 0; i < timestamps.length; i++) {
        const ts = timestamps[i]
        const open = opens[i]
        const high = highs[i]
        const low = lows[i]
        const close = closes[i]
        if (
          open === null ||
          high === null ||
          low === null ||
          close === null ||
          open === undefined
        ) {
          continue
        }
        data.push({
          time: Math.floor(Number(ts)),
          open: Number(open),
          high: Number(high),
          low: Number(low),
          close: Number(close)
        })
      }
    } else {
      const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(
        symbolRaw
      )}&interval=${encodeURIComponent(interval)}&limit=${encodeURIComponent(String(limit))}`

      const r = await fetch(url)
      if (!r.ok) {
        const txt = await r.text()
        return res.status(502).json({ error: 'upstream_error', detail: txt })
      }
      const klines = await r.json()
      data = klines.map((k: any[]) => {
        const openTimeMs = Number(k[0])
        return {
          time: Math.floor(openTimeMs / 1000),
          open: Number(k[1]),
          high: Number(k[2]),
          low: Number(k[3]),
          close: Number(k[4])
        }
      })
    }

    global.__ohlcCache![key] = { ts: Date.now(), data }
    return res.status(200).json({ source: 'api', data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal_error', detail: String(err) })
  }
}
