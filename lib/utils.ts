// ============================================================
// Utility functions — Decision Journal
// ============================================================

import type { Decision, DecisionRow, AssumptionRow, Assumption } from '@/lib/types'

// ============================================================
// Date formatting
// ============================================================

export function formatDate(dateStr: string | null | undefined, style: 'short' | 'long' = 'short'): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''))
    if (isNaN(d.getTime())) return dateStr
    if (style === 'long') {
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const date  = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffMs   = date.getTime() - today.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0)  return 'Today'
    if (diffDays === 1)  return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 0)    return `In ${diffDays} days`
    return `${Math.abs(diffDays)} days ago`
  } catch {
    return formatDate(dateStr)
  }
}

export function isDateOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const today = new Date().toISOString().substring(0, 10)
  return dateStr < today
}

export function todayISO(): string {
  return new Date().toISOString().substring(0, 10)
}

export function defaultReviewDate(daysFromNow = 30): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().substring(0, 10)
}

// ============================================================
// Row ↔ Domain object converters
// ============================================================

export function rowToAssumption(row: AssumptionRow): Assumption {
  return {
    id:         row.id,
    decisionId: row.decision_id,
    text:       row.text,
    status:     row.status,
    sortOrder:  row.sort_order,
  }
}

export function rowToDecision(row: DecisionRow, assumptions: AssumptionRow[]): Decision {
  const today = todayISO()
  const isOverdue =
    row.status === 'active' &&
    !!row.expected_outcome_date &&
    row.expected_outcome_date < today

  return {
    id:                     row.id,
    title:                  row.title,
    description:            row.description,
    category:               row.category,
    decisionDate:           row.decision_date,
    chosenOption:           row.chosen_option,
    alternatives:           row.alternatives ?? [],
    reasoning:              row.reasoning,
    predictedOutcome:       row.predicted_outcome,
    confidence:             row.confidence,
    expectedOutcomeDate:    row.expected_outcome_date,
    emotion:                row.emotion,
    actualOutcome:          row.actual_outcome,
    outcomeDate:            row.outcome_date,
    predictedOutcomeCorrect: row.predicted_outcome_correct,
    whatSurprised:          row.what_surprised,
    whatDifferently:        row.what_differently,
    wasDecisionGood:        row.was_decision_good,
    reflection:             row.reflection,
    lessons:                row.lessons,
    dqs:                    row.dqs,
    assumptionAccuracy:     row.assumption_accuracy,
    outcomeAccuracy:        row.outcome_accuracy,
    status:                 row.status,
    createdAt:              row.created_at,
    updatedAt:              row.updated_at,
    assumptions:            assumptions.map(rowToAssumption),
    isOverdue,
  }
}

// ============================================================
// String sanitization (belt-and-suspenders on top of React)
// ============================================================

export function sanitizeText(input: string, maxLength = 2000): string {
  return input.trim().substring(0, maxLength)
}

// ============================================================
// Category colors
// ============================================================

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    Career:        'text-signal-blue  bg-blue-500/8   border-blue-500/20',
    Finance:       'text-signal-green bg-emerald-500/8 border-emerald-500/20',
    Business:      'text-gold         bg-gold-subtle   border-gold-border',
    Personal:      'text-ink-secondary bg-white/4      border-white/10',
    Health:        'text-signal-green bg-emerald-500/8 border-emerald-500/20',
    Education:     'text-signal-blue  bg-blue-500/8   border-blue-500/20',
    Relationships: 'text-signal-yellow bg-yellow-500/8 border-yellow-500/20',
    Other:         'text-ink-muted    bg-white/3       border-white/8',
  }
  return map[category] ?? map.Other
}

// ============================================================
// Emotion display helpers
// ============================================================

const EMOTION_ICONS: Record<string, string> = {
  Calm:       '○',
  Anxious:    '~',
  Rushed:     '↯',
  Optimistic: '◎',
  Fatigued:   '◑',
  Objective:  '⊙',
}

export function getEmotionIcon(emotion: string | null): string {
  if (!emotion) return '⊙'
  return EMOTION_ICONS[emotion] ?? '⊙'
}

// ============================================================
// DQS color
// ============================================================

export function getDqsColor(dqs: number | null): string {
  if (dqs === null) return 'text-ink-muted'
  if (dqs >= 75)   return 'text-signal-green'
  if (dqs >= 50)   return 'text-signal-yellow'
  return                   'text-signal-red'
}
