import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import CSVUploader from '../components/CSVUploader'
import { supabase } from '../lib/supabaseClient'

const ChartPreview = dynamic(() => import('../components/ChartPreview'), { ssr: false })

export default function CreatePage() {
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Array<Record<string, string | number>>>([])
  const [savedId, setSavedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleData = (h: string[], r: Array<Record<string, string | number>>) => {
    setHeaders(h)
    setRows(r)
    setSavedId(null)
  }

  const saveChart = async () => {
    const id = crypto.randomUUID?.() ?? String(Date.now())
    const config = { headers, rows }
    setSaving(true)
    if (supabase) {
      const { error } = await supabase.from('charts').insert([{ id, config }])
      if (error) {
        console.error('Supabase save error', error)
        alert('Save failed; check console.')
      } else {
        setSavedId(id)
      }
    } else {
      try {
        localStorage.setItem(`chart:${id}`, JSON.stringify(config))
        setSavedId(id)
      } catch (e) {
        console.error(e)
        alert('Local save failed')
      }
    }
    setSaving(false)
  }

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-4">Create Chart</h1>

      <CSVUploader onData={handleData} />

      {headers.length > 0 && (
        <>
          <div className="card">
            <h4 className="font-medium">Data preview</h4>
            <p className="text-sm text-gray-600 mb-2">Detected columns: {headers.join(', ')}</p>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="text-left pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      {headers.map((h) => (
                        <td key={h} className="pr-4">{String(row[h] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ChartPreview headers={headers} rows={rows} />

          <div className="card">
            <button
              onClick={saveChart}
              disabled={saving}
              className="px-4 py-2 mr-2 bg-green-600 text-white rounded"
            >
              {saving ? 'Saving…' : 'Save Chart'}
            </button>
            {savedId && (
              <div className="mt-3">
                <p className="text-sm">
                  Saved — view at <a className="text-indigo-600" href={`/chart/${savedId}`}>{`/chart/${savedId}`}</a>
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
