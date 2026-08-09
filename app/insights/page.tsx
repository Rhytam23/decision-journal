'use client'

import { useEffect, useState } from 'react'
import { Nav }          from '@/components/layout/Nav'
import { InsightsView } from '@/components/insights/InsightsView'
import { getDecisions } from '@/lib/decisions'
import { buildInsightsData } from '@/lib/scoring'
import { useAuth }      from '@/components/layout/AuthContext'
import type { InsightsData } from '@/lib/types'

const INITIAL_INSIGHTS: InsightsData = {
  totalDecisions:    0,
  resolvedDecisions: 0,
  activeDecisions:   0,
  overdueDecisions:  0,
  avgDqs:             null,
  avgConfidence:      null,
  calibrationPoints:  [],
  emotionMetrics:     [],
  categoryMetrics:    [],
  patterns:           [],
}

export default function InsightsPage() {
  const { user } = useAuth()
  const [data, setData]       = useState<InsightsData>(INITIAL_INSIGHTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true
    getDecisions().then(decisions => {
      if (active) {
        setData(buildInsightsData(decisions))
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Nav />
        <div className="max-w-4xl mx-auto px-4 py-32 flex justify-center">
          <span className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <Nav />
      <div className="animate-fade-in">
        <InsightsView data={data} />
      </div>
    </div>
  )
}
