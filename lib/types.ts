// ============================================================
// Core domain types — Decision Journal
// ============================================================

export type AssumptionStatus = 'pending' | 'true' | 'partial' | 'false' | 'unknown'
export type OutcomeAccuracy  = 'YES' | 'PARTIAL' | 'NO'
export type WasDecisionGood  = 'yes' | 'no' | 'unsure'
export type DecisionStatus   = 'active' | 'resolved'
export type Emotion          = 'Calm' | 'Anxious' | 'Rushed' | 'Optimistic' | 'Fatigued' | 'Objective'

export type Category =
  | 'Career'
  | 'Finance'
  | 'Business'
  | 'Personal'
  | 'Health'
  | 'Education'
  | 'Relationships'
  | 'Other'

// ============================================================
// Database row types (snake_case — matches Supabase)
// ============================================================

export interface DecisionRow {
  id:                       string
  user_id:                  string
  title:                    string
  description:              string | null
  category:                 Category
  decision_date:            string | null       // ISO date string
  chosen_option:            string | null
  alternatives:             string[] | null
  reasoning:                string | null
  predicted_outcome:        string | null
  confidence:               number
  expected_outcome_date:    string | null       // ISO date string
  emotion:                  Emotion | null
  actual_outcome:           string | null
  outcome_date:             string | null
  predicted_outcome_correct: OutcomeAccuracy | null
  what_surprised:           string | null
  what_differently:         string | null
  was_decision_good:        WasDecisionGood | null
  reflection:               string | null
  lessons:                  string | null
  dqs:                      number | null
  assumption_accuracy:      number | null
  outcome_accuracy:         number | null
  status:                   DecisionStatus
  created_at:               string
  updated_at:               string
}

export interface AssumptionRow {
  id:          string
  decision_id: string
  user_id:     string
  text:        string
  status:      AssumptionStatus
  sort_order:  number
  created_at:  string
}

// ============================================================
// Application types (camelCase — used in components)
// ============================================================

export interface Assumption {
  id:         string
  decisionId: string
  text:       string
  status:     AssumptionStatus
  sortOrder:  number
}

export interface Decision {
  id:                     string
  title:                  string
  description:            string | null
  category:               Category
  decisionDate:           string | null
  chosenOption:           string | null
  alternatives:           string[]
  reasoning:              string | null
  predictedOutcome:       string | null
  confidence:             number
  expectedOutcomeDate:    string | null
  emotion:                Emotion | null
  actualOutcome:          string | null
  outcomeDate:            string | null
  predictedOutcomeCorrect: OutcomeAccuracy | null
  whatSurprised:          string | null
  whatDifferently:        string | null
  wasDecisionGood:        WasDecisionGood | null
  reflection:             string | null
  lessons:                string | null
  dqs:                    number | null
  assumptionAccuracy:     number | null
  outcomeAccuracy:        number | null
  status:                 DecisionStatus
  createdAt:              string
  updatedAt:              string
  assumptions:            Assumption[]
  // Derived
  isOverdue:              boolean
}

// ============================================================
// Wizard form state (used during decision creation)
// ============================================================

export interface WizardFormData {
  title:               string
  description:         string
  category:            Category
  decisionDate:        string
  chosenOption:        string
  alternatives:        string[]
  reasoning:           string
  assumptions:         string[]        // text strings before saving
  predictedOutcome:    string
  confidence:          number
  expectedOutcomeDate: string
  emotion:             Emotion
}

// ============================================================
// Review form state (used during outcome review)
// ============================================================

export interface ReviewFormData {
  actualOutcome:            string
  outcomeDate:              string
  predictedOutcomeCorrect:  OutcomeAccuracy | null
  assumptionStatuses:       Record<string, AssumptionStatus>
  whatSurprised:            string
  whatDifferently:          string
  wasDecisionGood:          WasDecisionGood | null
  reflection:               string
  lessons:                  string
}

// ============================================================
// Insights / analytics types
// ============================================================

export interface CalibrationPoint {
  confidence: number
  dqs:        number
  count:      number
}

export interface EmotionMetric {
  emotion: Emotion
  avgDqs:  number
  count:   number
}

export interface CategoryMetric {
  category:   Category
  count:       number
  avgConfidence: number
  avgDqs:      number
}

export interface InsightsData {
  totalDecisions:     number
  resolvedDecisions:  number
  activeDecisions:    number
  overdueDecisions:   number
  avgDqs:             number | null
  avgConfidence:      number | null
  calibrationPoints:  CalibrationPoint[]
  emotionMetrics:     EmotionMetric[]
  categoryMetrics:    CategoryMetric[]
  patterns:           string[]          // data-driven pattern strings
}
