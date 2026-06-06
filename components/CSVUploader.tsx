import React from 'react'
import Papa from 'papaparse'

type Props = {
  onData: (headers: string[], rows: Array<Record<string, string | number>>) => void
}

export default function CSVUploader({ onData }: Props) {
  const handleFile = (file: File | null) => {
    if (!file) return
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Array<Record<string, string | number>>
        const headers = results.meta.fields || []
        onData(headers, data)
      }
    })
  }

  return (
    <div className="card">
      <h3 className="text-lg font-medium mb-2">Upload CSV</h3>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        className="mb-3"
      />
      <p className="text-sm text-gray-600">Try the sample CSV in public/data/sample.csv</p>
    </div>
  )
}
