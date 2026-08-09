import { formatDate } from '@/lib/utils'
import type { Decision } from '@/lib/types'

interface TimelineEvent {
  label: string
  date: string | null
  done: boolean
  current?: boolean
}

interface DecisionTimelineProps {
  decision: Decision
}

export function DecisionTimeline({ decision }: DecisionTimelineProps) {
  const events: TimelineEvent[] = [
    {
      label: 'Decision recorded',
      date:  decision.createdAt,
      done:  true,
    },
    {
      label: 'Prediction committed',
      date:  decision.createdAt, // same time — committed on creation
      done:  !!decision.predictedOutcome,
    },
    {
      label: 'Outcome expected',
      date:  decision.expectedOutcomeDate,
      done:  false,
      current: decision.isOverdue,
    },
    {
      label: 'Outcome recorded',
      date:  decision.outcomeDate,
      done:  !!decision.actualOutcome,
    },
    {
      label: 'Reflection completed',
      date:  decision.status === 'resolved' ? decision.updatedAt : null,
      done:  decision.status === 'resolved',
    },
  ]

  return (
    <div className="flex flex-col gap-0">
      {events.map((event, i) => (
        <div key={i} className="flex items-start gap-4">
          {/* Dot + line */}
          <div className="flex flex-col items-center pt-0.5">
            <div
              className={`
                w-2.5 h-2.5 rounded-full border-2 shrink-0
                ${event.done
                  ? 'bg-gold border-gold'
                  : event.current
                    ? 'bg-transparent border-signal-yellow animate-pulse'
                    : 'bg-transparent border-border'
                }
              `}
            />
            {i < events.length - 1 && (
              <div className={`w-px flex-1 min-h-[28px] mt-1 ${event.done ? 'bg-gold/30' : 'bg-border'}`} />
            )}
          </div>

          {/* Content */}
          <div className="pb-6 last:pb-0">
            <p className={`text-sm font-medium leading-tight ${event.done ? 'text-ink-primary' : 'text-ink-muted'}`}>
              {event.label}
            </p>
            {event.date && (
              <p className="text-xs text-ink-muted mt-0.5">
                {formatDate(event.date)}
              </p>
            )}
            {!event.date && event.current && (
              <p className="text-xs text-signal-yellow mt-0.5">Past expected date</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
