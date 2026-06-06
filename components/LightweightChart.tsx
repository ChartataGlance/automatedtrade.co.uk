import React, { useEffect, useRef } from 'react'
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts'

type CandlestickData = { time: number; open: number; high: number; low: number; close: number }

type Props = {
  data: CandlestickData[]
  width?: number
  height?: number
}

export default function LightweightChart({ data, width = 800, height = 360 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    chartRef.current = createChart(containerRef.current, {
      width,
      height,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#262626'
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' }
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false }
    })

    seriesRef.current = chartRef.current.addCandlestickSeries({
      wickVisible: true,
      borderVisible: true
    })

    seriesRef.current.setData(data)

    const handleResize = () => {
      if (!chartRef.current || !containerRef.current) return
      chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chartRef.current?.remove()
      chartRef.current = null
      seriesRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (seriesRef.current) seriesRef.current.setData(data)
  }, [data])

  return <div ref={containerRef} style={{ width: '100%', height: height }} />
}
