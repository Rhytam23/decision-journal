'use client'

import { useEffect, useRef } from 'react'
import type { CalibrationPoint } from '@/lib/types'

interface CalibrationChartProps {
  points: CalibrationPoint[]
}

export function CalibrationChart({ points }: CalibrationChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const dpr = window.devicePixelRatio || 1
    const w   = parent.clientWidth
    const h   = parent.clientHeight || 240

    canvas.width  = w * dpr
    canvas.height = h * dpr
    canvas.style.width  = `${w}px`
    canvas.style.height = `${h}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)

    const pad   = 40
    const gw    = w - pad * 2
    const gh    = h - pad * 2

    // Clear
    ctx.fillStyle = '#101422'
    ctx.fillRect(0, 0, w, h)

    // Grid lines + labels
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth   = 1
    ctx.fillStyle   = '#5e6f85'
    ctx.font        = '500 9px "Plus Jakarta Sans", sans-serif'
    ctx.textAlign   = 'center'
    ctx.textBaseline = 'top'

    const intervals = 5
    for (let i = 0; i <= intervals; i++) {
      const pct = i * (100 / intervals)
      const x   = pad + (i / intervals) * gw
      const y   = pad + (1 - i / intervals) * gh

      // Vertical grid
      ctx.beginPath()
      ctx.moveTo(x, pad)
      ctx.lineTo(x, pad + gh)
      ctx.stroke()
      ctx.fillText(`${pct}%`, x, pad + gh + 6)

      // Horizontal grid
      ctx.beginPath()
      ctx.moveTo(pad, y)
      ctx.lineTo(pad + gw, y)
      ctx.stroke()

      ctx.textAlign    = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${pct}%`, pad - 6, y)
      ctx.textAlign    = 'center'
    }

    // Axis labels
    ctx.fillStyle = '#94a3b8'
    ctx.font      = '500 9px "Plus Jakarta Sans", sans-serif'
    ctx.textBaseline = 'top'
    ctx.fillText('Declared Confidence →', pad + gw / 2, pad + gh + 20)

    ctx.save()
    ctx.translate(12, pad + gh / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textBaseline = 'bottom'
    ctx.fillText('Actual Accuracy (DQS) →', 0, 0)
    ctx.restore()

    // Ideal calibration diagonal
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.setLineDash([4, 4])
    ctx.lineWidth   = 1.5
    ctx.moveTo(pad, pad + gh)
    ctx.lineTo(pad + gw, pad)
    ctx.stroke()
    ctx.setLineDash([])

    if (points.length === 0) {
      // Empty state message
      ctx.fillStyle    = '#5e6f85'
      ctx.font         = '500 11px "Plus Jakarta Sans", sans-serif'
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Review decisions to see your calibration curve', w / 2, h / 2)
      return
    }

    // Sort points by confidence for line drawing
    const sorted = [...points].sort((a, b) => a.confidence - b.confidence)

    // Draw connecting line
    ctx.beginPath()
    ctx.strokeStyle = '#cfa86b'
    ctx.lineWidth   = 2.5
    ctx.lineJoin    = 'round'

    sorted.forEach((pt, i) => {
      const px = pad + (pt.confidence / 100) * gw
      const py = pad + (1 - pt.dqs / 100) * gh
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    })
    ctx.stroke()

    // Draw dots
    sorted.forEach(pt => {
      const px = pad + (pt.confidence / 100) * gw
      const py = pad + (1 - pt.dqs / 100) * gh

      // Outer circle
      ctx.beginPath()
      ctx.fillStyle = '#cfa86b'
      ctx.arc(px, py, 5, 0, Math.PI * 2)
      ctx.fill()

      // Inner ring
      ctx.beginPath()
      ctx.strokeStyle = '#101422'
      ctx.lineWidth   = 1.5
      ctx.arc(px, py, 5, 0, Math.PI * 2)
      ctx.stroke()

      // Count label
      ctx.fillStyle    = '#94a3b8'
      ctx.font         = '500 8px monospace'
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(`n=${pt.count}`, px, py - 7)
    })
  }, [points])

  // Re-draw on resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      // Trigger re-render by dispatching a custom event
      canvas.dispatchEvent(new Event('resize'))
    })
    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative w-full h-60">
      <canvas ref={canvasRef} className="block w-full h-full" aria-label="Calibration curve chart" />
    </div>
  )
}
