import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import LightweightChart from '../components/LightweightChart'

type OHLC = { time: number; open: number; high: number; low: number; close: number }

export default function Home() {
  const [data, setData] = useState<OHLC[]>([])
  const [loading, setLoading] = useState(false)
  const [symbol, setSymbol] = useState('DAX')
  const [interval] = useState('1h')
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ohlc?symbol=${symbol}&interval=${interval}&limit=200`)
      if (!res.ok) throw new Error(`Fetch error ${res.status}`)
      const json = await res.json()
      setData(json.data)
    } catch (e: any) {
      setError(String(e.message ?? e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 60 * 1000)
    return () => clearInterval(id)
  }, [symbol])

  return (
    <div className="container">
      <Head>
        <title>automatedtrade.co.uk — market</title>
        <meta name="description" content="Lightweight 1h OHLC chart" />
      </Head>

      <header className="py-6">
        <h1 className="text-2xl font-bold">automatedtrade.co.uk</h1>
        <p className="text-sm text-gray-600">Lightweight 1h OHLC chart</p>
      </header>

      <main>
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="mr-2 text-sm">Symbol</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                <option>BTCUSDT</option>
                <option>ETHUSDT</option>
                <option>BNBUSDT</option>
                <option>ADAUSDT</option>
                <option>DAX</option>
              </select>
              <span className="ml-3 text-xs text-gray-500">interval: {interval}</span>
            </div>

            <div>
              <button
                onClick={fetchData}
                className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading && <div>Loading chart…</div>}
          {error && <div className="text-red-600">Error: {error}</div>}
          {!loading && data.length > 0 && <LightweightChart data={data as any} height={360} />}
        </div>
      </main>
    </div>
  )
}
