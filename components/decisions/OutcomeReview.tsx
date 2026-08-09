'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button }   from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Input }    from '@/components/ui/Input'
import { saveReview } from '@/lib/decisions'
import { formatDate } from '@/lib/utils'
import type { Decision, ReviewFormData, AssumptionStatus, OutcomeAccuracy, WasDecisionGood } from '@/lib/types'

interface OutcomeReviewProps {
  decision: Decision
}

const ASSUMPTION_OPTIONS: Array<{ value: AssumptionStatus; label: string; color: string }> = [
  { value: 'true',    label: 'Correct',  color: 'text-signal-green border-signal-green/30 bg-signal-green/8 hover:bg-signal-green/15' },
  { value: 'partial', label: 'Partial',  color: 'text-signal-yellow border-signal-yellow/30 bg-signal-yellow/8 hover:bg-signal-yellow/15' },
  { value: 'false',   label: 'Incorrect',color: 'text-signal-red border-signal-red/30 bg-signal-red/8 hover:bg-signal-red/15' },
  { value: 'unknown', label: 'Unknown',  color: 'text-ink-muted border-border bg-app-hover hover:bg-app-hover' },
]

const OUTCOME_OPTIONS: Array<{ value: OutcomeAccuracy; label: string; desc: string }> = [
  { value: 'YES',     label: 'Yes, fully',  desc: 'Prediction was correct' },
  { value: 'PARTIAL', label: 'Partially',   desc: 'Some but not all' },
  { value: 'NO',      label: 'No',          desc: 'Prediction did not happen' },
]

const DECISION_QUALITY_OPTIONS: Array<{ value: WasDecisionGood; label: string; desc: string }> = [
  { value: 'yes',    label: 'Yes',    desc: 'Good process and reasoning' },
  { value: 'unsure', label: 'Unsure', desc: "Hard to say" },
  { value: 'no',     label: 'No',     desc: 'Poor process in hindsight' },
]

const INITIAL_REVIEW = (decision: Decision): ReviewFormData => ({
  actualOutcome:           '',
  outcomeDate:             new Date().toISOString().substring(0, 10),
  predictedOutcomeCorrect: null,
  assumptionStatuses:      Object.fromEntries(decision.assumptions.map(a => [a.id, 'true' as AssumptionStatus])),
  whatSurprised:           '',
  whatDifferently:         '',
  wasDecisionGood:         null,
  reflection:              '',
  lessons:                 '',
})

export function OutcomeReview({ decision }: OutcomeReviewProps) {
  const router = useRouter()
  const [form, setForm]     = useState<ReviewFormData>(() => INITIAL_REVIEW(decision))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition]  = useTransition()

  function setField<K extends keyof ReviewFormData>(key: K, value: ReviewFormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => { const n = {...e}; delete n[key]; return n })
  }

  function setAssumption(id: string, status: AssumptionStatus) {
    setForm(f => ({ ...f, assumptionStatuses: { ...f.assumptionStatuses, [id]: status } }))
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.actualOutcome.trim())    errs.actualOutcome           = 'Describe what actually happened'
    if (!form.predictedOutcomeCorrect) errs.predictedOutcomeCorrect = 'Select how accurate your prediction was'
    if (!form.wasDecisionGood)         errs.wasDecisionGood         = 'Evaluate the quality of the decision'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    setServerError(null)
    startTransition(async () => {
      const result = await saveReview(
        decision.id,
        form,
        decision.assumptions.map(a => ({ id: a.id, text: a.text }))
      )
      if ('error' in result) {
        setServerError(result.error)
        return
      }
      router.push(`/decisions/${decision.id}`)
      router.refresh()
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">

      {/* Header */}
      <div>
        <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-2">
          Outcome review
        </p>
        <h1 className="font-heading text-2xl font-bold text-ink-primary leading-tight mb-1">
          {decision.title}
        </h1>
        <p className="text-sm text-ink-muted">
          Recorded {formatDate(decision.createdAt)} · Expected outcome {formatDate(decision.expectedOutcomeDate)}
        </p>
      </div>

      {/* Original prediction — immutable, quoted */}
      {decision.predictedOutcome && (
        <div className="bg-app-surface border border-border rounded-2xl p-5">
          <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-3">
            What you predicted
          </p>
          <blockquote className="text-sm text-ink-primary italic leading-relaxed border-l-2 border-gold/40 pl-4">
            {decision.predictedOutcome}
          </blockquote>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
            <span className="text-xs text-ink-muted">
              Confidence: <span className="text-gold font-bold">{decision.confidence}%</span>
            </span>
            <span className="text-xs text-ink-muted">
              Category: <span className="text-ink-secondary">{decision.category}</span>
            </span>
          </div>
        </div>
      )}

      {/* ── SECTION 1: Assumptions ── */}
      {decision.assumptions.length > 0 && (
        <section aria-labelledby="assumptions-heading">
          <h2 id="assumptions-heading" className="font-heading text-base font-semibold text-ink-primary mb-1">
            1. Test your assumptions
          </h2>
          <p className="text-sm text-ink-muted mb-4">
            Did each assumption hold? This is how the product distinguishes good reasoning from lucky outcomes.
          </p>
          <ul className="flex flex-col gap-3">
            {decision.assumptions.map(a => (
              <li key={a.id} className="bg-app-surface border border-border rounded-xl p-4">
                <p className="text-sm text-ink-secondary mb-3 leading-relaxed">{a.text}</p>
                <div className="flex gap-2 flex-wrap">
                  {ASSUMPTION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAssumption(a.id, opt.value)}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                        ${form.assumptionStatuses[a.id] === opt.value
                          ? `${opt.color} ring-1 ring-current`
                          : 'text-ink-muted border-border bg-transparent hover:bg-app-hover'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── SECTION 2: Actual outcome ── */}
      <section aria-labelledby="outcome-heading">
        <h2 id="outcome-heading" className="font-heading text-base font-semibold text-ink-primary mb-1">
          2. What actually happened?
        </h2>
        <p className="text-sm text-ink-muted mb-4">
          Describe the actual outcome in your own words.
        </p>
        <div className="flex flex-col gap-4">
          <Textarea
            label="Actual outcome"
            placeholder="Describe what happened as objectively as possible..."
            value={form.actualOutcome}
            onChange={e => setField('actualOutcome', e.target.value)}
            error={errors.actualOutcome}
            rows={4}
            maxLength={1500}
          />
          <Input
            label="When did this become clear?"
            type="date"
            value={form.outcomeDate}
            onChange={e => setField('outcomeDate', e.target.value)}
            max={new Date().toISOString().substring(0, 10)}
          />
        </div>
      </section>

      {/* ── SECTION 3: Prediction accuracy ── */}
      <section aria-labelledby="accuracy-heading">
        <h2 id="accuracy-heading" className="font-heading text-base font-semibold text-ink-primary mb-1">
          3. How accurate was your prediction?
        </h2>
        <p className="text-sm text-ink-muted mb-4">
          Compare what you predicted with what actually happened.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {OUTCOME_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setField('predictedOutcomeCorrect', opt.value)}
              className={`
                flex flex-col items-center gap-1 p-4 rounded-xl border text-center transition-all
                ${form.predictedOutcomeCorrect === opt.value
                  ? opt.value === 'YES'
                    ? 'border-signal-green/40 bg-signal-green/8 text-signal-green'
                    : opt.value === 'PARTIAL'
                      ? 'border-signal-yellow/40 bg-signal-yellow/8 text-signal-yellow'
                      : 'border-signal-red/40 bg-signal-red/8 text-signal-red'
                  : 'border-border text-ink-secondary hover:border-ink-muted hover:text-ink-primary'
                }
              `}
            >
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-xs opacity-70">{opt.desc}</span>
            </button>
          ))}
        </div>
        {errors.predictedOutcomeCorrect && (
          <p className="text-xs text-signal-red mt-2" role="alert">{errors.predictedOutcomeCorrect}</p>
        )}
      </section>

      {/* ── SECTION 4: Reflection ── */}
      <section aria-labelledby="reflection-heading">
        <h2 id="reflection-heading" className="font-heading text-base font-semibold text-ink-primary mb-1">
          4. Reflection
        </h2>
        <p className="text-sm text-ink-muted mb-4">
          This is the most important part. Don&apos;t rush it.
        </p>
        <div className="flex flex-col gap-4">
          <Textarea
            label="What surprised you?"
            placeholder="What did you not anticipate? What turned out differently than expected?"
            value={form.whatSurprised}
            onChange={e => setField('whatSurprised', e.target.value)}
            rows={3}
            maxLength={800}
          />
          <Textarea
            label="What would you do differently?"
            placeholder="If you faced this same situation again, what would change?"
            value={form.whatDifferently}
            onChange={e => setField('whatDifferently', e.target.value)}
            rows={3}
            maxLength={800}
          />
          <Textarea
            label="Overall reflection (optional)"
            placeholder="Any other thoughts about this decision and outcome..."
            value={form.reflection}
            onChange={e => setField('reflection', e.target.value)}
            rows={3}
            maxLength={1000}
          />
          <Textarea
            label="Key lessons learned (optional)"
            placeholder="What would you tell your past self about this decision?"
            value={form.lessons}
            onChange={e => setField('lessons', e.target.value)}
            rows={2}
            maxLength={500}
          />
        </div>
      </section>

      {/* ── SECTION 5: Decision quality ── */}
      <section aria-labelledby="quality-heading">
        <h2 id="quality-heading" className="font-heading text-base font-semibold text-ink-primary mb-1">
          5. Was this a good decision?
        </h2>
        <p className="text-sm text-ink-muted mb-4">
          Separate from the outcome — was the decision well-reasoned at the time you made it?
          A good decision can still produce a bad outcome.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {DECISION_QUALITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setField('wasDecisionGood', opt.value)}
              className={`
                flex flex-col items-center gap-1 p-4 rounded-xl border text-center transition-all
                ${form.wasDecisionGood === opt.value
                  ? 'border-gold-border bg-gold-subtle text-gold'
                  : 'border-border text-ink-secondary hover:border-ink-muted hover:text-ink-primary'
                }
              `}
            >
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-xs opacity-70">{opt.desc}</span>
            </button>
          ))}
        </div>
        {errors.wasDecisionGood && (
          <p className="text-xs text-signal-red mt-2" role="alert">{errors.wasDecisionGood}</p>
        )}
      </section>

      {serverError && (
        <div className="bg-signal-red/10 border border-signal-red/30 rounded-xl p-4 text-sm text-signal-red" role="alert">
          {serverError}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <button
          onClick={() => router.back()}
          className="text-sm text-ink-muted hover:text-ink-primary transition-colors"
        >
          ← Cancel
        </button>
        <Button onClick={handleSubmit} size="lg" loading={isPending}>
          Save review
        </Button>
      </div>

    </div>
  )
}
