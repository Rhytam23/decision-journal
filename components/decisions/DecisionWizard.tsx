'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button }           from '@/components/ui/Button'
import { Input }            from '@/components/ui/Input'
import { Textarea }         from '@/components/ui/Textarea'
import { Select }           from '@/components/ui/Select'
import { ConfidenceSlider } from '@/components/ui/ConfidenceSlider'
import { createDecision }   from '@/lib/decisions'
import { defaultReviewDate, todayISO } from '@/lib/utils'
import type { WizardFormData, Category, Emotion } from '@/lib/types'

const CATEGORIES: Array<{ value: Category; label: string }> = [
  { value: 'Career',        label: 'Career' },
  { value: 'Finance',       label: 'Finance' },
  { value: 'Business',      label: 'Business' },
  { value: 'Personal',      label: 'Personal' },
  { value: 'Health',        label: 'Health' },
  { value: 'Education',     label: 'Education' },
  { value: 'Relationships', label: 'Relationships' },
  { value: 'Other',         label: 'Other' },
]

const EMOTIONS: Array<{ value: Emotion; label: string; symbol: string }> = [
  { value: 'Calm',       label: 'Calm',      symbol: '○' },
  { value: 'Objective',  label: 'Objective', symbol: '⊙' },
  { value: 'Optimistic', label: 'Optimistic',symbol: '◎' },
  { value: 'Anxious',    label: 'Anxious',   symbol: '~' },
  { value: 'Rushed',     label: 'Rushed',    symbol: '↯' },
  { value: 'Fatigued',   label: 'Fatigued',  symbol: '◑' },
]

const TOTAL_STEPS = 8

const INITIAL_FORM: WizardFormData = {
  title:               '',
  description:         '',
  category:            'Personal',
  decisionDate:        todayISO(),
  chosenOption:        '',
  alternatives:        [],
  reasoning:           '',
  assumptions:         [],
  predictedOutcome:    '',
  confidence:          70,
  expectedOutcomeDate: defaultReviewDate(30),
  emotion:             'Objective',
}

export function DecisionWizard() {
  const router = useRouter()
  const [step, setStep]       = useState(1)
  const [form, setForm]       = useState<WizardFormData>(INITIAL_FORM)
  const [errors, setErrors]   = useState<Partial<Record<keyof WizardFormData, string>>>({})
  const [assumptionInput, setAssumptionInput] = useState('')
  const [alternativeInput, setAlternativeInput] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition]  = useTransition()

  // ── Field updater ──────────────────────────────────────────
  function set<K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  // ── Assumption management ──────────────────────────────────
  function addAssumption() {
    const text = assumptionInput.trim()
    if (!text) return
    set('assumptions', [...form.assumptions, text])
    setAssumptionInput('')
  }

  function removeAssumption(i: number) {
    set('assumptions', form.assumptions.filter((_, idx) => idx !== i))
  }

  // ── Alternative management ─────────────────────────────────
  function addAlternative() {
    const text = alternativeInput.trim()
    if (!text) return
    set('alternatives', [...form.alternatives, text])
    setAlternativeInput('')
  }

  function removeAlternative(i: number) {
    set('alternatives', form.alternatives.filter((_, idx) => idx !== i))
  }

  // ── Step validation ────────────────────────────────────────
  function validateStep(s: number): boolean {
    const errs: typeof errors = {}

    if (s === 1) {
      if (!form.title.trim())    errs.title    = 'A title is required'
      if (!form.category)        errs.category = 'Choose a category'
    }
    if (s === 4) {
      if (form.assumptions.length === 0) {
        errs.assumptions = 'Add at least one assumption'
      }
    }
    if (s === 5) {
      if (!form.predictedOutcome.trim()) errs.predictedOutcome = 'Describe your prediction'
    }
    if (s === 7) {
      if (!form.expectedOutcomeDate) errs.expectedOutcomeDate = 'Set a review date'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function goNext() {
    if (!validateStep(step)) return
    if (step < TOTAL_STEPS) setStep(s => s + 1)
  }

  function goBack() {
    if (step > 1) setStep(s => s - 1)
  }

  // ── Submit ─────────────────────────────────────────────────
  async function handleSubmit() {
    setServerError(null)
    startTransition(async () => {
      const result = await createDecision(form)
      if ('error' in result) {
        setServerError(result.error)
        return
      }
      router.push(`/decisions/${result.id}?new=1`)
    })
  }

  // ── Progress indicator ─────────────────────────────────────
  const progress = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100)

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      {/* Progress bar */}
      <div className="h-0.5 bg-border">
        <div
          className="h-full bg-gold transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="max-w-xl mx-auto w-full px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goBack}
            disabled={step === 1}
            className="text-xs text-ink-muted hover:text-ink-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            ← Back
          </button>
          <span className="text-xs text-ink-muted font-medium">
            Step {step} of {TOTAL_STEPS}
          </span>
          <button
            onClick={() => router.push('/')}
            className="text-xs text-ink-muted hover:text-ink-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-4 pb-20 animate-fade-in">

        {/* ── STEP 1: What decision are you making? ── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-2">
                Step 1
              </p>
              <h1 className="font-heading text-2xl font-bold text-ink-primary leading-tight">
                What decision are you making?
              </h1>
              <p className="text-sm text-ink-muted mt-2">
                Give it a clear, specific title. Vague titles produce vague predictions.
              </p>
            </div>

            <Input
              label="Decision title"
              placeholder="e.g. Accept the senior engineer offer at Stripe"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              error={errors.title}
              maxLength={140}
              autoFocus
            />

            <Select
              label="Category"
              options={CATEGORIES}
              value={form.category}
              onChange={e => set('category', e.target.value as Category)}
              error={errors.category}
            />

            <Input
              label="Decision date (optional)"
              type="date"
              value={form.decisionDate}
              onChange={e => set('decisionDate', e.target.value)}
              hint="When are you making this decision?"
              max={todayISO()}
            />
          </div>
        )}

        {/* ── STEP 2: What are you considering? ── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-2">
                Step 2
              </p>
              <h1 className="font-heading text-2xl font-bold text-ink-primary leading-tight">
                What are you considering?
              </h1>
              <p className="text-sm text-ink-muted mt-2">
                Describe the context. What are the options? What are the tradeoffs you see?
              </p>
            </div>

            <Textarea
              label="Context and options"
              placeholder="e.g. I've been offered a senior role at Stripe (£90k, remote) and a team lead role at a startup (£70k, equity). I'm considering the Stripe offer primarily for stability and technical growth..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={5}
              maxLength={1500}
            />

            <Input
              label="What are you choosing? (optional)"
              placeholder="e.g. Accept the Stripe offer"
              value={form.chosenOption}
              onChange={e => set('chosenOption', e.target.value)}
              maxLength={200}
              hint="The option you are leaning toward or have chosen"
            />

            {/* Alternatives list */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                Alternatives you considered (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={alternativeInput}
                  onChange={e => setAlternativeInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAlternative())}
                  placeholder="e.g. Take the startup offer"
                  maxLength={200}
                  className="flex-1 bg-app-input border border-border rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 transition-all"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addAlternative}>Add</Button>
              </div>
              {form.alternatives.length > 0 && (
                <ul className="flex flex-col gap-1.5 mt-1">
                  {form.alternatives.map((alt, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 text-sm text-ink-secondary bg-app-surface border border-border rounded-lg px-3 py-2">
                      <span>{alt}</span>
                      <button
                        type="button"
                        onClick={() => removeAlternative(i)}
                        className="text-ink-muted hover:text-signal-red transition-colors text-xs shrink-0"
                        aria-label={`Remove alternative: ${alt}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Why are you leaning this way? ── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-2">
                Step 3
              </p>
              <h1 className="font-heading text-2xl font-bold text-ink-primary leading-tight">
                Why are you leaning this way?
              </h1>
              <p className="text-sm text-ink-muted mt-2">
                What is the core reasoning behind your decision? Be honest — this is for you.
              </p>
            </div>

            <Textarea
              label="Your reasoning"
              placeholder="e.g. The Stripe role aligns with where I want to be in 5 years. The salary difference is significant but the stability and the team quality matter more to me right now..."
              value={form.reasoning}
              onChange={e => set('reasoning', e.target.value)}
              rows={6}
              maxLength={1500}
            />

            {/* Emotional context */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                How are you feeling making this decision?
              </label>
              <p className="text-xs text-ink-muted">
                Emotional context helps identify biases in hindsight.
              </p>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {EMOTIONS.map(e => (
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => set('emotion', e.value)}
                    className={`
                      flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium
                      border transition-all duration-150
                      ${form.emotion === e.value
                        ? 'bg-gold-subtle border-gold-border text-gold'
                        : 'bg-app-input border-border text-ink-secondary hover:text-ink-primary hover:border-ink-muted'
                      }
                    `}
                  >
                    <span className="text-xs font-mono">{e.symbol}</span>
                    <span>{e.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: What assumptions are you making? ── */}
        {step === 4 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-2">
                Step 4
              </p>
              <h1 className="font-heading text-2xl font-bold text-ink-primary leading-tight">
                What assumptions are you making?
              </h1>
              <p className="text-sm text-ink-muted mt-2">
                Assumptions are the beliefs your decision depends on. Later, you&apos;ll be able to check whether they held.
              </p>
            </div>

            <p className="text-xs text-ink-secondary italic border-l-2 border-gold/30 pl-3 leading-relaxed">
              Example: &quot;I assume Stripe&apos;s engineering culture matches what I experienced in the interview process.&quot;
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                Add assumptions{' '}
                <span className="text-ink-muted font-normal normal-case tracking-normal">(required — add at least one)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={assumptionInput}
                  onChange={e => setAssumptionInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAssumption())}
                  placeholder="e.g. The role will include meaningful technical challenges"
                  maxLength={300}
                  className="flex-1 bg-app-input border border-border rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 transition-all"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addAssumption}>
                  Add
                </Button>
              </div>
              {errors.assumptions && (
                <p className="text-xs text-signal-red" role="alert">{errors.assumptions}</p>
              )}
            </div>

            {form.assumptions.length > 0 && (
              <ul className="flex flex-col gap-2">
                {form.assumptions.map((asm, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-3 bg-app-surface border border-dashed border-border rounded-xl px-4 py-3 group"
                  >
                    <span className="text-sm text-ink-secondary leading-relaxed">{asm}</span>
                    <button
                      type="button"
                      onClick={() => removeAssumption(i)}
                      className="text-ink-muted hover:text-signal-red transition-colors text-xs shrink-0 mt-0.5 opacity-0 group-hover:opacity-100"
                      aria-label={`Remove assumption: ${asm}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── STEP 5: What do you predict will happen? ── */}
        {step === 5 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-2">
                Step 5
              </p>
              <h1 className="font-heading text-2xl font-bold text-ink-primary leading-tight">
                What do you predict will happen?
              </h1>
              <p className="text-sm text-ink-muted mt-2">
                Write a specific, measurable prediction. This is what you&apos;ll compare reality against.
              </p>
            </div>

            <p className="text-xs text-ink-secondary italic border-l-2 border-gold/30 pl-3 leading-relaxed">
              Good prediction: &quot;I expect to receive a high performance rating in my first review and be given ownership of a significant project within 6 months.&quot;<br/><br/>
              Weak prediction: &quot;Things will go well.&quot;
            </p>

            <Textarea
              label="Your prediction"
              placeholder="Describe the specific outcome you expect from this decision..."
              value={form.predictedOutcome}
              onChange={e => set('predictedOutcome', e.target.value)}
              error={errors.predictedOutcome}
              rows={5}
              maxLength={1000}
            />
          </div>
        )}

        {/* ── STEP 6: How confident are you? ── */}
        {step === 6 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-2">
                Step 6
              </p>
              <h1 className="font-heading text-2xl font-bold text-ink-primary leading-tight">
                How confident are you?
              </h1>
              <p className="text-sm text-ink-muted mt-2">
                Not in the decision — in your prediction. What probability would you assign to it coming true?
              </p>
            </div>

            <div className="bg-app-surface border border-border rounded-2xl p-6">
              <ConfidenceSlider
                value={form.confidence}
                onChange={v => set('confidence', v)}
              />
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Over many decisions, your average confidence will be compared against your actual outcome accuracy. 
              This tells you whether you tend to be overconfident or underconfident.
            </p>
          </div>
        )}

        {/* ── STEP 7: When will the outcome become clear? ── */}
        {step === 7 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-2">
                Step 7
              </p>
              <h1 className="font-heading text-2xl font-bold text-ink-primary leading-tight">
                When will the outcome become clear?
              </h1>
              <p className="text-sm text-ink-muted mt-2">
                Set a date when you&apos;ll be able to evaluate whether your prediction was right.
              </p>
            </div>

            <Input
              label="Review date"
              type="date"
              value={form.expectedOutcomeDate}
              onChange={e => set('expectedOutcomeDate', e.target.value)}
              error={errors.expectedOutcomeDate}
              min={todayISO()}
              hint="When will you know enough to assess this prediction?"
            />

            <div className="flex gap-3 flex-wrap">
              {[
                { label: '1 month',  days: 30 },
                { label: '3 months', days: 90 },
                { label: '6 months', days: 180 },
                { label: '1 year',   days: 365 },
              ].map(({ label, days }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => set('expectedOutcomeDate', defaultReviewDate(days))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-ink-secondary hover:border-gold-border hover:text-gold transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 8: Confirmation ── */}
        {step === 8 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-2">
                Step 8
              </p>
              <h1 className="font-heading text-2xl font-bold text-ink-primary leading-tight">
                This prediction is now committed.
              </h1>
              <p className="text-sm text-ink-muted mt-2">
                Review what you are recording. Once saved, this prediction cannot be changed — only compared to reality.
              </p>
            </div>

            {/* Summary card */}
            <div className="bg-app-surface border border-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <p className="text-xs text-gold uppercase tracking-wider font-semibold mb-1">{form.category}</p>
                <h2 className="font-heading text-lg font-bold text-ink-primary">{form.title}</h2>
              </div>

              {form.predictedOutcome && (
                <div className="p-5 border-b border-border">
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-2 font-semibold">Prediction</p>
                  <blockquote className="text-sm text-ink-secondary italic leading-relaxed border-l-2 border-gold/40 pl-3">
                    {form.predictedOutcome}
                  </blockquote>
                </div>
              )}

              <div className="p-5 border-b border-border flex gap-6">
                <div>
                  <p className="text-xs text-ink-muted mb-1">Confidence</p>
                  <p className="font-heading font-bold text-gold text-lg">{form.confidence}%</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted mb-1">Review date</p>
                  <p className="font-heading font-bold text-ink-primary text-lg">
                    {form.expectedOutcomeDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted mb-1">Assumptions</p>
                  <p className="font-heading font-bold text-ink-primary text-lg">
                    {form.assumptions.length}
                  </p>
                </div>
              </div>

              {form.assumptions.length > 0 && (
                <div className="p-5">
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-3 font-semibold">Assumptions</p>
                  <ul className="flex flex-col gap-2">
                    {form.assumptions.map((asm, i) => (
                      <li key={i} className="text-xs text-ink-secondary flex gap-2">
                        <span className="text-gold mt-0.5 shrink-0">—</span>
                        <span>{asm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {serverError && (
              <div className="bg-signal-red/10 border border-signal-red/30 rounded-xl p-4 text-sm text-signal-red" role="alert">
                {serverError}
              </div>
            )}
          </div>
        )}

        {/* Navigation footer */}
        <div className="mt-8 flex items-center justify-between">
          {step < 8 ? (
            <>
              <div />
              <Button onClick={goNext} size="lg">
                {step === 7 ? 'Review & confirm →' : 'Continue →'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setStep(7)}>
                ← Edit
              </Button>
              <Button onClick={handleSubmit} size="lg" loading={isPending}>
                Save decision
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
