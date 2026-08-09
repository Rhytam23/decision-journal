'use client'

import { useCallback } from 'react'
import { getConfidenceDescriptor } from '@/lib/scoring'

interface ConfidenceSliderProps {
  value: number
  onChange: (value: number) => void
}

export function ConfidenceSlider({ value, onChange }: ConfidenceSliderProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10))
  }, [onChange])

  const descriptor = getConfidenceDescriptor(value)

  // Color based on value
  const color = value < 40 ? '#94a3b8' : value < 70 ? '#f59e0b' : '#cfa86b'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
          Confidence Level
        </span>
        <span
          className="font-heading text-2xl font-bold tabular-nums transition-colors duration-200"
          style={{ color }}
        >
          {value}%
        </span>
      </div>

      <input
        type="range"
        min={10}
        max={99}
        step={1}
        value={value}
        onChange={handleChange}
        aria-label={`Confidence level: ${value}%`}
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - 10) / 89) * 100}%, rgba(255,255,255,0.07) ${((value - 10) / 89) * 100}%, rgba(255,255,255,0.07) 100%)`
        }}
      />

      {/* Markers */}
      <div className="flex justify-between text-xs text-ink-muted px-0.5">
        <span>10%</span>
        <span>50%</span>
        <span>99%</span>
      </div>

      <p className="text-xs text-ink-muted italic">{descriptor}</p>
    </div>
  )
}
