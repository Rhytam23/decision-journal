'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Nav }           from '@/components/layout/Nav'
import { OutcomeReview } from '@/components/decisions/OutcomeReview'
import { getDecision }   from '@/lib/decisions'
import { useAuth }       from '@/components/layout/AuthContext'
import type { Decision } from '@/lib/types'

export default function ReviewPage() {
  const params   = useParams()
  const router   = useRouter()
  const { user } = useAuth()
  const id       = params.id as string

  const [decision, setDecision] = useState<Decision | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!user || !id) return
    let active = true
    getDecision(id).then(data => {
      if (active) {
        setDecision(data)
        setLoading(false)
        if (data && data.status === 'resolved') {
          router.push(`/decisions/${id}`)
        }
      }
    })
    return () => { active = false }
  }, [user, id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Nav />
        <div className="max-w-2xl mx-auto px-4 py-32 flex justify-center">
          <span className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!decision) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center text-ink-muted">Decision not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <Nav />
      <div className="animate-fade-in">
        <OutcomeReview decision={decision} />
      </div>
    </div>
  )
}
