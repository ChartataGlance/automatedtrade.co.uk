import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

type Props = {
  headers: string[]
  rows: Array<Record<string, string | number>>
  xKey?: string
  yKey?: string
}

export default function ChartPreview({ headers, rows, xKey, yKey }: Props) {
  const x = xKey || headers[0]
  const y = yKey || headers[1] || headers[0]

  const labels = rows.map((r) => String(r[x] ?? ''))
  const dataPoints = rows.map((r) => Number(r[y] ?? 0))

  const data = {
    labels,
    datasets: [
      {
        label: y,
        data: dataPoints,
        borderColor: 'rgb(34,197,94)',
        backgroundColor: 'rgba(34,197,94,0.2)'
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: `${y} vs ${x}` }
    }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-medium mb-2">Chart Preview</h3>
      <div>
        <Line options={options} data={data} />
      </div>
    </div>
  )
}
