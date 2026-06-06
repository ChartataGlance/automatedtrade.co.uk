import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '../../lib/supabaseClient'

const ChartPreview = dynamic(() => import('../../components/ChartPreview'), { ssr: false })

export default function ChartPage() {
  const router = useRouter()
  const { id } = router.query
  const [config, setConfig] = useState<{ headers: string[]; rows: Array<Record<string, string | number>> } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchChart = async () => {
      setLoading(true)
      if (supabase) {
        const { data, error } = await supabase.from('charts').select('config').eq('id', String(id)).single()
        if (error) {
          console.error('Supabase fetch error', error)
        } else {
          setConfig(data.config)
        }
      } else {
        const raw = localStorage.getItem(`chart:${id}`)
        if (raw) {
          setConfig(JSON.parse(raw))
        } else {
          setConfig(null)
        }
      }
      setLoading(false)
    }
    fetchChart()
  }, [id])

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-4">View Chart</h1>
      {loading && <div className="card">Loading…</div>}
      {!loading && !config && <div className="card">Chart not found.</div>}
      {!loading && config && (
        <>
          <div className="card">
            <h4 className="font-medium">Saved chart</h4>
            <p className="text-sm text-gray-600">Columns: {config.headers.join(', ')}</p>
          </div>
          <ChartPreview headers={config.headers} rows={config.rows} />
        </>
      )}
    </div>
  )
}
