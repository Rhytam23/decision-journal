import Link from 'next/link'
import { formatDate, formatRelativeDate, getCategoryColor, getDqsColor, getEmotionIcon } from '@/lib/utils'
import type { Decision } from '@/lib/types'

interface DecisionCardProps {
  decision: Decision
}

export function DecisionCard({ decision }: DecisionCardProps) {
  const categoryClass = getCategoryColor(decision.category)
  const isOverdue = decision.isOverdue

  return (
    <Link
      href={`/decisions/${decision.id}`}
      className={`
        block group bg-app-surface border rounded-2xl p-5
        hover:border-gold-border hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]
        transition-all duration-200 cursor-pointer
        ${isOverdue
          ? 'border-signal-yellow/30 border-l-2 border-l-signal-yellow/60'
          : decision.status === 'resolved'
            ? 'border-border border-l-2 border-l-gold/40'
            : 'border-border'
        }
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${categoryClass}`}>
          {decision.category}
        </span>

        {/* Status badge */}
        {decision.status === 'resolved' ? (
          <span className="text-[10px] text-ink-muted font-medium">
            Reviewed {formatDate(decision.outcomeDate ?? decision.updatedAt, 'short')}
          </span>
        ) : isOverdue ? (
          <span className="text-[10px] text-signal-yellow font-semibold uppercase tracking-wide">
            Awaiting review
          </span>
        ) : (
          <span className="text-[10px] text-ink-muted font-medium">
            Review {formatRelativeDate(decision.expectedOutcomeDate)}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-heading font-semibold text-[0.95rem] text-ink-primary mb-2 leading-snug group-hover:text-gold transition-colors line-clamp-2">
        {decision.title}
      </h3>

      {/* Prediction preview */}
      {decision.predictedOutcome && (
        <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed mb-4">
          {decision.predictedOutcome}
        </p>
      )}

      {/* Footer metrics */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span title="Confidence">
            <span className="text-ink-secondary font-medium">{decision.confidence}%</span>{' '}
            confidence
          </span>
          <span className="opacity-30">·</span>
          <span title="Assumptions">
            <span className="text-ink-secondary font-medium">{decision.assumptions.length}</span>{' '}
            {decision.assumptions.length === 1 ? 'assumption' : 'assumptions'}
          </span>
          {decision.emotion && (
            <>
              <span className="opacity-30">·</span>
              <span title={`Felt: ${decision.emotion}`}>{getEmotionIcon(decision.emotion)}</span>
            </>
          )}
        </div>

        {/* DQS badge if resolved */}
        {decision.status === 'resolved' && decision.dqs !== null && (
          <span className={`font-heading text-xs font-bold ${getDqsColor(decision.dqs)}`}>
            DQS {decision.dqs}%
          </span>
        )}
      </div>
    </Link>
  )
}
