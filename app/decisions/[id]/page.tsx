'use client'

import { useEffect, useState, useTransition } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link                  from 'next/link'
import { Nav }               from '@/components/layout/Nav'
import { DecisionTimeline }  from '@/components/decisions/DecisionTimeline'
import { Button }            from '@/components/ui/Button'
import { getDecision, deleteDecision } from '@/lib/decisions'
import { useAuth }           from '@/components/layout/AuthContext'
import { formatDate, getCategoryColor, getEmotionIcon, getDqsColor } from '@/lib/utils'
import { getAssumptionStatusLabel, getAssumptionStatusColor } from '@/lib/scoring'
import type { Decision } from '@/lib/types'

export default function DecisionDetailPage() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const { user }     = useAuth()

  const id           = params.id as string
  const isNew        = searchParams.get('new') === '1'

  const [decision, setDecision] = useState<Decision | null>(null)
  const [loading, setLoading]   = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!user || !id) return
    let active = true
    getDecision(id).then(data => {
      if (active) {
        setDecision(data)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [user, id])

  function handleDelete() {
    if (!confirm('Are you sure you want to delete this decision? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteDecision(id)
      if (result.success) {
        router.push('/')
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete decision')
      }
    })
  }

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

  if (!decision) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-3">404</p>
          <h1 className="font-heading text-2xl font-bold text-ink-primary mb-2">
            Decision not found
          </h1>
          <p className="text-sm text-ink-muted mb-6">
            This decision may have been deleted, or you don&apos;t have access to it.
          </p>
          <Link
            href="/"
            className="text-sm text-gold hover:text-gold-dim transition-colors underline underline-offset-2"
          >
            ← Back to journal
          </Link>
        </div>
      </div>
    )
  }

  const catColor = getCategoryColor(decision.category)

  return (
    <div className="min-h-screen bg-app-bg">
      <Nav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* New decision confirmation banner */}
        {isNew && (
          <div className="mb-8 bg-gold-subtle border border-gold-border rounded-xl px-5 py-4 animate-fade-in">
            <p className="text-sm text-gold font-medium">
              Your prediction is recorded. Come back when the outcome is clear.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

          {/* ── Left: Main content ── */}
          <div className="flex flex-col gap-8 animate-fade-in">

            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${catColor}`}>
                  {decision.category}
                </span>
                <span className="text-xs text-ink-muted">
                  {formatDate(decision.createdAt)}
                </span>
                {decision.emotion && (
                  <span className="text-xs text-ink-muted" title={`Felt: ${decision.emotion}`}>
                    {getEmotionIcon(decision.emotion)} {decision.emotion}
                  </span>
                )}
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-ink-primary leading-tight">
                {decision.title}
              </h1>
            </div>

            {/* Context */}
            {decision.description && (
              <section aria-labelledby="context-heading">
                <h2 id="context-heading" className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-2">
                  Context
                </h2>
                <p className="text-sm text-ink-secondary leading-relaxed">{decision.description}</p>
              </section>
            )}

            {/* Chosen option + alternatives */}
            {(decision.chosenOption || decision.alternatives.length > 0) && (
              <section aria-labelledby="options-heading">
                <h2 id="options-heading" className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-3">
                  Options considered
                </h2>
                {decision.chosenOption && (
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-gold text-xs mt-0.5 shrink-0 font-bold">✓</span>
                    <p className="text-sm text-ink-primary font-medium">{decision.chosenOption}</p>
                  </div>
                )}
                {decision.alternatives.map((alt, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1">
                    <span className="text-ink-muted text-xs mt-0.5 shrink-0">—</span>
                    <p className="text-sm text-ink-secondary">{alt}</p>
                  </div>
                ))}
              </section>
            )}

            {/* Reasoning */}
            {decision.reasoning && (
              <section aria-labelledby="reasoning-heading">
                <h2 id="reasoning-heading" className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-2">
                  Reasoning
                </h2>
                <p className="text-sm text-ink-secondary leading-relaxed">{decision.reasoning}</p>
              </section>
            )}

            {/* Assumptions */}
            {decision.assumptions.length > 0 && (
              <section aria-labelledby="assumptions-heading">
                <h2 id="assumptions-heading" className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-3">
                  Assumptions
                </h2>
                <ul className="flex flex-col gap-2">
                  {decision.assumptions.map(a => (
                    <li key={a.id} className="flex items-start gap-3 text-sm">
                      <span className="text-gold mt-0.5 shrink-0">—</span>
                      <div className="flex-1">
                        <span className="text-ink-secondary">{a.text}</span>
                        {a.status !== 'pending' && (
                          <span className={`ml-2 text-xs font-semibold ${getAssumptionStatusColor(a.status)}`}>
                            · {getAssumptionStatusLabel(a.status)}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Original prediction — visually distinct */}
            {decision.predictedOutcome && (
              <section aria-labelledby="prediction-heading">
                <h2 id="prediction-heading" className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-3">
                  Prediction
                </h2>
                <div className="bg-app-surface border border-gold-border rounded-2xl p-5">
                  <blockquote className="text-sm text-ink-primary italic leading-relaxed border-l-2 border-gold/50 pl-4 mb-4">
                    {decision.predictedOutcome}
                  </blockquote>
                  <div className="flex items-center gap-4 text-xs text-ink-muted pt-4 border-t border-border">
                    <span>Confidence: <strong className="text-gold">{decision.confidence}%</strong></span>
                    <span>·</span>
                    <span>Review by: <strong className="text-ink-secondary">{formatDate(decision.expectedOutcomeDate)}</strong></span>
                  </div>
                </div>
              </section>
            )}

            {/* Outcome (if reviewed) */}
            {decision.status === 'resolved' && (
              <>
                <section aria-labelledby="outcome-heading">
                  <h2 id="outcome-heading" className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-3">
                    What actually happened
                  </h2>
                  {decision.actualOutcome ? (
                    <p className="text-sm text-ink-secondary leading-relaxed">{decision.actualOutcome}</p>
                  ) : (
                    <p className="text-sm text-ink-muted italic">Not recorded.</p>
                  )}
                  {decision.predictedOutcomeCorrect && (
                    <div className="mt-3 inline-flex items-center gap-2">
                      <span className="text-xs text-ink-muted">Prediction accuracy:</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                        decision.predictedOutcomeCorrect === 'YES'
                          ? 'text-signal-green border-signal-green/30 bg-signal-green/8'
                          : decision.predictedOutcomeCorrect === 'PARTIAL'
                            ? 'text-signal-yellow border-signal-yellow/30 bg-signal-yellow/8'
                            : 'text-signal-red border-signal-red/30 bg-signal-red/8'
                      }`}>
                        {decision.predictedOutcomeCorrect === 'YES' ? 'Correct' :
                         decision.predictedOutcomeCorrect === 'PARTIAL' ? 'Partially correct' : 'Incorrect'}
                      </span>
                    </div>
                  )}
                </section>

                {/* Reflection */}
                {(decision.whatSurprised || decision.whatDifferently || decision.reflection) && (
                  <section aria-labelledby="reflection-heading">
                    <h2 id="reflection-heading" className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-4">
                      Reflection
                    </h2>
                    <div className="flex flex-col gap-4">
                      {decision.whatSurprised && (
                        <div>
                          <p className="text-xs text-ink-muted mb-1 font-medium">What surprised you</p>
                          <p className="text-sm text-ink-secondary leading-relaxed">{decision.whatSurprised}</p>
                        </div>
                      )}
                      {decision.whatDifferently && (
                        <div>
                          <p className="text-xs text-ink-muted mb-1 font-medium">What you would do differently</p>
                          <p className="text-sm text-ink-secondary leading-relaxed">{decision.whatDifferently}</p>
                        </div>
                      )}
                      {decision.reflection && (
                        <div>
                          <p className="text-xs text-ink-muted mb-1 font-medium">Overall reflection</p>
                          <p className="text-sm text-ink-secondary leading-relaxed">{decision.reflection}</p>
                        </div>
                      )}
                      {decision.lessons && (
                        <div>
                          <p className="text-xs text-ink-muted mb-1 font-medium">Key lessons</p>
                          <p className="text-sm text-ink-secondary leading-relaxed">{decision.lessons}</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Scores */}
                {decision.dqs !== null && (
                  <section aria-labelledby="scores-heading" className="bg-app-surface border border-border rounded-2xl p-5">
                    <h2 id="scores-heading" className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-4">
                      Decision quality assessment
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'DQS',                value: decision.dqs,                desc: 'Overall score' },
                        { label: 'Assumption accuracy', value: decision.assumptionAccuracy, desc: 'How correct were assumptions' },
                        { label: 'Prediction accuracy', value: decision.outcomeAccuracy,    desc: 'How correct was prediction' },
                      ].map(item => (
                        <div key={item.label} className="text-center">
                          <p className={`font-heading text-2xl font-bold ${getDqsColor(item.value)}`}>
                            {item.value !== null ? `${item.value}%` : '—'}
                          </p>
                          <p className="text-xs text-ink-muted mt-1">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-ink-muted mt-4 pt-4 border-t border-border leading-relaxed">
                      DQS = (assumption accuracy + prediction accuracy) ÷ 2. 
                      This is a reflective metric, not a scientific one.
                      {decision.wasDecisionGood && (
                        <> Was this a good decision? <span className="text-ink-secondary font-medium capitalize">{decision.wasDecisionGood}.</span></>
                      )}
                    </p>
                  </section>
                )}
              </>
            )}

            {/* Review CTA */}
            {decision.status === 'active' && (
              <div className={`rounded-2xl p-5 border ${decision.isOverdue ? 'border-signal-yellow/30 bg-signal-yellow/5' : 'border-border bg-app-surface'}`}>
                <p className="text-sm font-medium text-ink-primary mb-1">
                  {decision.isOverdue
                    ? 'This outcome is ready for review.'
                    : `Review due ${formatDate(decision.expectedOutcomeDate)}.`
                  }
                </p>
                <p className="text-xs text-ink-muted mb-4">
                  When you are ready, record what actually happened and compare it to your prediction.
                </p>
                <Link href={`/decisions/${decision.id}/review`}>
                  <Button variant={decision.isOverdue ? 'primary' : 'secondary'}>
                    Record outcome →
                  </Button>
                </Link>
              </div>
            )}

            {/* Delete */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                loading={isPending}
              >
                Delete this decision
              </Button>
            </div>

          </div>

          {/* ── Right: Sidebar / Timeline ── */}
          <aside className="lg:sticky lg:top-20 self-start">
            <div className="bg-app-surface border border-border rounded-2xl p-5">
              <h3 className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-5">
                Timeline
              </h3>
              <DecisionTimeline decision={decision} />
            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}
