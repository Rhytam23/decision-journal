import { CalibrationChart } from '@/components/insights/CalibrationChart'
import { getCalibrationLabel } from '@/lib/scoring'
import { getDqsColor } from '@/lib/utils'
import type { InsightsData } from '@/lib/types'

interface InsightsViewProps {
  data: InsightsData
}

const MIN_FOR_PATTERNS = 5

export function InsightsView({ data }: InsightsViewProps) {
  const calibration = data.avgDqs !== null && data.avgConfidence !== null
    ? getCalibrationLabel(data.avgConfidence, data.avgDqs)
    : null

  const calibrationColors: Record<string, string> = {
    good:  'text-signal-green border-signal-green/30 bg-signal-green/8',
    over:  'text-signal-red   border-signal-red/30   bg-signal-red/8',
    under: 'text-signal-yellow border-signal-yellow/30 bg-signal-yellow/8',
    none:  'text-ink-muted     border-border           bg-app-hover',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">

      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink-primary mb-1">Insights</h1>
        <p className="text-sm text-ink-muted">
          {data.resolvedDecisions === 0
            ? 'Complete your first outcome review to see patterns here.'
            : `Based on ${data.resolvedDecisions} reviewed ${data.resolvedDecisions === 1 ? 'decision' : 'decisions'}.`
          }
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total decisions', value: String(data.totalDecisions) },
          { label: 'Reviewed',        value: String(data.resolvedDecisions) },
          { label: 'Active',          value: String(data.activeDecisions) },
          { label: 'Overdue',         value: String(data.overdueDecisions), highlight: data.overdueDecisions > 0 },
        ].map(item => (
          <div key={item.label} className="bg-app-surface border border-border rounded-xl p-4">
            <p className="text-xs text-ink-muted mb-1">{item.label}</p>
            <p className={`font-heading text-2xl font-bold ${item.highlight ? 'text-signal-yellow' : 'text-ink-primary'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* DQS + Calibration */}
      {data.resolvedDecisions > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-app-surface border border-border rounded-2xl p-6">
            <p className="text-xs text-ink-muted uppercase tracking-wider mb-1 font-semibold">
              Average Decision Quality
            </p>
            <div className="flex items-end gap-2 mb-3">
              <span className={`font-heading text-4xl font-bold ${getDqsColor(data.avgDqs)}`}>
                {data.avgDqs !== null ? `${data.avgDqs}%` : '—'}
              </span>
              <span className="text-xs text-ink-muted mb-1.5">DQS</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              A reflective score combining assumption accuracy and prediction accuracy. 
              Not a scientifically validated metric — a prompt for honest reflection.
            </p>
          </div>

          <div className="bg-app-surface border border-border rounded-2xl p-6">
            <p className="text-xs text-ink-muted uppercase tracking-wider mb-1 font-semibold">
              Calibration
            </p>
            {calibration ? (
              <>
                <div className="mb-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-sm font-bold border ${calibrationColors[calibration.type]}`}>
                    {calibration.label}
                  </span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Your avg confidence: <span className="text-gold font-bold">{data.avgConfidence}%</span> ·{' '}
                  Your avg accuracy: <span className={`font-bold ${getDqsColor(data.avgDqs)}`}>{data.avgDqs}%</span>
                </p>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Well-calibrated means your confidence aligns with your actual accuracy over time.
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-muted">
                Awaiting reviewed decisions.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Calibration curve chart */}
      <div className="bg-app-surface border border-border rounded-2xl p-6">
        <h2 className="font-heading text-base font-semibold text-ink-primary mb-1">
          Calibration Curve
        </h2>
        <p className="text-xs text-ink-muted mb-5">
          Confidence (x) vs actual accuracy (y). The dashed diagonal is perfect calibration.
          Points above the line mean you underestimated; below means overconfident.
        </p>
        <CalibrationChart points={data.calibrationPoints} />
      </div>

      {/* Emotion bars */}
      {data.emotionMetrics.length > 0 && (
        <div className="bg-app-surface border border-border rounded-2xl p-6">
          <h2 className="font-heading text-base font-semibold text-ink-primary mb-1">
            Decision quality by emotional context
          </h2>
          <p className="text-xs text-ink-muted mb-5">
            Average DQS grouped by how you felt when making each decision. 
            Helps surface emotional patterns in your reasoning.
          </p>
          <div className="flex flex-col gap-4">
            {data.emotionMetrics.map(em => (
              <div key={em.emotion}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-ink-secondary">
                    {em.emotion}
                    <span className="text-ink-muted ml-1.5">({em.count} {em.count === 1 ? 'decision' : 'decisions'})</span>
                  </span>
                  <span className={`text-xs font-bold ${getDqsColor(em.avgDqs)}`}>
                    {em.avgDqs}% DQS
                  </span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all duration-700"
                    style={{ width: `${em.avgDqs}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category table */}
      {data.categoryMetrics.length > 0 && (
        <div className="bg-app-surface border border-border rounded-2xl p-6">
          <h2 className="font-heading text-base font-semibold text-ink-primary mb-1">
            Performance by category
          </h2>
          <p className="text-xs text-ink-muted mb-5">
            Where your decision-making is strongest — and where there&apos;s room to improve.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Category', 'Decisions', 'Avg Confidence', 'Avg DQS'].map(h => (
                  <th
                    key={h}
                    className="text-left text-xs text-ink-muted uppercase tracking-wide font-semibold pb-3 border-b border-border"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.categoryMetrics.map(cat => (
                <tr key={cat.category} className="border-b border-border/50 last:border-0 hover:bg-app-hover transition-colors">
                  <td className="py-3 font-medium text-ink-primary">{cat.category}</td>
                  <td className="py-3 text-ink-secondary">{cat.count}</td>
                  <td className="py-3 text-ink-secondary">{cat.avgConfidence}%</td>
                  <td className={`py-3 font-bold ${getDqsColor(cat.avgDqs)}`}>{cat.avgDqs}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pattern language — only with sufficient data */}
      {data.patterns.length > 0 && (
        <div className="bg-app-surface border border-border rounded-2xl p-6">
          <h2 className="font-heading text-base font-semibold text-ink-primary mb-1">
            What your decisions reveal
          </h2>
          <p className="text-xs text-ink-muted mb-5">
            These patterns are derived directly from your {data.resolvedDecisions} reviewed decisions. 
            They update as you add more.
          </p>
          <ul className="flex flex-col gap-4">
            {data.patterns.map((pattern, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink-secondary leading-relaxed">
                <span className="text-gold mt-0.5 shrink-0 font-bold">—</span>
                <span>{pattern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Insufficient data message */}
      {data.resolvedDecisions < MIN_FOR_PATTERNS && data.resolvedDecisions > 0 && (
        <div className="border border-border rounded-2xl p-6 text-center">
          <p className="text-sm text-ink-muted">
            Patterns will appear after you review{' '}
            <span className="text-ink-primary font-medium">{MIN_FOR_PATTERNS - data.resolvedDecisions} more</span>{' '}
            {MIN_FOR_PATTERNS - data.resolvedDecisions === 1 ? 'decision' : 'decisions'}.
          </p>
        </div>
      )}

    </div>
  )
}
