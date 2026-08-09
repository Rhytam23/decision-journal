// ============================================================
// Scoring — Decision Journal
// Ported and extended from the original app.js implementation
// ============================================================

import type { Assumption, Decision, AssumptionStatus, CalibrationPoint, CategoryMetric, EmotionMetric, InsightsData } from '@/lib/types'

// ============================================================
// DQS (Decision Quality Score) Calculation
// Combines assumption accuracy + outcome accuracy
// ============================================================

export function calculateAssumptionScore(assumptions: Assumption[]): number {
  if (assumptions.length === 0) return 100
  const evaluated = assumptions.filter(a => a.status !== 'pending')
  if (evaluated.length === 0) return 0

  const sum = evaluated.reduce((acc, a) => {
    if (a.status === 'true')    return acc + 100
    if (a.status === 'partial') return acc + 50
    // false or unknown count as 0
    return acc
  }, 0)

  return Math.round(sum / evaluated.length)
}

export function calculateOutcomeScore(correct: 'YES' | 'PARTIAL' | 'NO' | null): number {
  if (correct === 'YES')     return 100
  if (correct === 'PARTIAL') return 50
  return 0
}

export function calculateDQS(
  assumptions: Assumption[],
  outcomeCorrect: 'YES' | 'PARTIAL' | 'NO' | null
): { dqs: number; assumptionAccuracy: number; outcomeAccuracy: number } {
  const assumptionAccuracy = calculateAssumptionScore(assumptions)
  const outcomeAccuracy    = calculateOutcomeScore(outcomeCorrect)
  const dqs                = Math.round((assumptionAccuracy + outcomeAccuracy) / 2)

  return { dqs, assumptionAccuracy, outcomeAccuracy }
}

// ============================================================
// Calibration — confidence vs accuracy
// ============================================================

export function getCalibrationLabel(avgConfidence: number, avgDqs: number): {
  label: string
  type: 'good' | 'over' | 'under' | 'none'
} {
  const error = avgConfidence - avgDqs
  if (Math.abs(error) <= 8)  return { label: 'Well-calibrated', type: 'good' }
  if (error > 8)             return { label: 'Overconfident',   type: 'over' }
  return                            { label: 'Underconfident',  type: 'under' }
}

export function buildCalibrationPoints(decisions: Decision[]): CalibrationPoint[] {
  const resolved = decisions.filter(d => d.status === 'resolved' && d.dqs !== null)

  const bins: Array<{ min: number; max: number; confSum: number; dqsSum: number; count: number }> = [
    { min: 0,  max: 49, confSum: 0, dqsSum: 0, count: 0 },
    { min: 50, max: 59, confSum: 0, dqsSum: 0, count: 0 },
    { min: 60, max: 69, confSum: 0, dqsSum: 0, count: 0 },
    { min: 70, max: 79, confSum: 0, dqsSum: 0, count: 0 },
    { min: 80, max: 89, confSum: 0, dqsSum: 0, count: 0 },
    { min: 90, max: 100, confSum: 0, dqsSum: 0, count: 0 },
  ]

  resolved.forEach(d => {
    const bin = bins.find(b => d.confidence >= b.min && d.confidence <= b.max)
    if (bin) {
      bin.confSum += d.confidence
      bin.dqsSum  += d.dqs!
      bin.count++
    }
  })

  return bins
    .filter(b => b.count > 0)
    .map(b => ({
      confidence: Math.round(b.confSum / b.count),
      dqs:        Math.round(b.dqsSum  / b.count),
      count:      b.count,
    }))
}

// ============================================================
// Pattern language — derived from real data, never fabricated
// Requires at least 5 resolved decisions to show patterns
// ============================================================

const MIN_DECISIONS_FOR_PATTERNS = 5

export function derivePatterns(decisions: Decision[]): string[] {
  const resolved = decisions.filter(d => d.status === 'resolved' && d.dqs !== null)
  if (resolved.length < MIN_DECISIONS_FOR_PATTERNS) return []

  const patterns: string[] = []
  const avgDqs = resolved.reduce((s, d) => s + d.dqs!, 0) / resolved.length
  const avgConf = resolved.reduce((s, d) => s + d.confidence, 0) / resolved.length

  // Calibration pattern
  const calibError = avgConf - avgDqs
  if (calibError > 12) {
    patterns.push(`Your confidence (avg ${Math.round(avgConf)}%) tends to run higher than your outcome accuracy (avg ${Math.round(avgDqs)}%). You may be systematically overestimating certainty.`)
  } else if (calibError < -12) {
    patterns.push(`Your confidence (avg ${Math.round(avgConf)}%) tends to be lower than your outcome accuracy (avg ${Math.round(avgDqs)}%). You may be underselling your judgment.`)
  } else {
    patterns.push(`Your confidence tracks closely with your actual outcomes — a sign of well-calibrated thinking.`)
  }

  // Category pattern — find strongest and weakest categories (min 2 decisions each)
  const byCategory: Record<string, number[]> = {}
  resolved.forEach(d => {
    if (!byCategory[d.category]) byCategory[d.category] = []
    byCategory[d.category].push(d.dqs!)
  })

  const categoryAvgs = Object.entries(byCategory)
    .filter(([, scores]) => scores.length >= 2)
    .map(([cat, scores]) => ({
      cat,
      avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    }))
    .sort((a, b) => b.avg - a.avg)

  if (categoryAvgs.length >= 2) {
    const best  = categoryAvgs[0]
    const worst = categoryAvgs[categoryAvgs.length - 1]
    if (best.avg - worst.avg >= 20) {
      patterns.push(`Your ${best.cat} decisions have the strongest track record (avg DQS: ${best.avg}%). Your ${worst.cat} decisions show more room for improvement (avg DQS: ${worst.avg}%).`)
    }
  }

  // Emotion pattern — find if any emotion correlates with low quality
  const byEmotion: Record<string, number[]> = {}
  resolved.filter(d => d.emotion).forEach(d => {
    const e = d.emotion!
    if (!byEmotion[e]) byEmotion[e] = []
    byEmotion[e].push(d.dqs!)
  })

  const emotionAvgs = Object.entries(byEmotion)
    .filter(([, scores]) => scores.length >= 2)
    .map(([emotion, scores]) => ({
      emotion,
      avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    }))

  const lowEmotions = emotionAvgs.filter(e => e.avg < avgDqs - 15)
  if (lowEmotions.length > 0) {
    const names = lowEmotions.map(e => e.emotion).join(' and ')
    patterns.push(`Decisions made when feeling ${names} tend to score lower than your average. Consider revisiting major decisions before committing.`)
  }

  return patterns
}

// ============================================================
// Insights data assembly
// ============================================================

export function buildInsightsData(decisions: Decision[]): InsightsData {
  const today = new Date().toISOString().substring(0, 10)
  const resolved = decisions.filter(d => d.status === 'resolved')
  const active   = decisions.filter(d => d.status === 'active' && (d.expectedOutcomeDate ?? '9999') >= today)
  const overdue  = decisions.filter(d => d.status === 'active' && (d.expectedOutcomeDate ?? '9999') < today)

  const avgDqs = resolved.length > 0
    ? Math.round(resolved.reduce((s, d) => s + (d.dqs ?? 0), 0) / resolved.length)
    : null

  const avgConfidence = resolved.length > 0
    ? Math.round(resolved.reduce((s, d) => s + d.confidence, 0) / resolved.length)
    : null

  // Emotion metrics
  const emotionMap: Record<string, { sum: number; count: number }> = {}
  resolved.filter(d => d.emotion && d.dqs !== null).forEach(d => {
    const e = d.emotion!
    if (!emotionMap[e]) emotionMap[e] = { sum: 0, count: 0 }
    emotionMap[e].sum   += d.dqs!
    emotionMap[e].count += 1
  })
  const emotionMetrics: EmotionMetric[] = Object.entries(emotionMap).map(([emotion, { sum, count }]) => ({
    emotion: emotion as EmotionMetric['emotion'],
    avgDqs: Math.round(sum / count),
    count,
  })).sort((a, b) => b.avgDqs - a.avgDqs)

  // Category metrics
  const categoryMap: Record<string, { dqsSum: number; confSum: number; count: number }> = {}
  resolved.filter(d => d.dqs !== null).forEach(d => {
    if (!categoryMap[d.category]) categoryMap[d.category] = { dqsSum: 0, confSum: 0, count: 0 }
    categoryMap[d.category].dqsSum  += d.dqs!
    categoryMap[d.category].confSum += d.confidence
    categoryMap[d.category].count   += 1
  })
  const categoryMetrics: CategoryMetric[] = Object.entries(categoryMap).map(([category, { dqsSum, confSum, count }]) => ({
    category: category as CategoryMetric['category'],
    count,
    avgConfidence: Math.round(confSum / count),
    avgDqs: Math.round(dqsSum / count),
  })).sort((a, b) => b.avgDqs - a.avgDqs)

  return {
    totalDecisions:    decisions.length,
    resolvedDecisions: resolved.length,
    activeDecisions:   active.length,
    overdueDecisions:  overdue.length,
    avgDqs,
    avgConfidence,
    calibrationPoints: buildCalibrationPoints(decisions),
    emotionMetrics,
    categoryMetrics,
    patterns: derivePatterns(decisions),
  }
}

// ============================================================
// Confidence descriptor text
// ============================================================

export function getConfidenceDescriptor(value: number): string {
  if (value < 30) return 'Low confidence — mostly speculative'
  if (value < 50) return 'Slight lean — limited supporting evidence'
  if (value < 65) return 'Reasonably likely — balanced thesis'
  if (value < 80) return 'Highly probable — strong conviction'
  if (value < 92) return 'Near-certain — very high confidence'
  return                'Absolute certainty — be careful of overconfidence'
}

// ============================================================
// Assumption status display helpers
// ============================================================

export function getAssumptionStatusColor(status: AssumptionStatus): string {
  switch (status) {
    case 'true':    return 'text-signal-green'
    case 'partial': return 'text-signal-yellow'
    case 'false':   return 'text-signal-red'
    case 'unknown': return 'text-ink-muted'
    default:        return 'text-ink-secondary'
  }
}

export function getAssumptionStatusLabel(status: AssumptionStatus): string {
  switch (status) {
    case 'true':    return 'Correct'
    case 'partial': return 'Partially correct'
    case 'false':   return 'Incorrect'
    case 'unknown': return 'Unknown'
    default:        return 'Pending'
  }
}
