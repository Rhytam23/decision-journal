interface EmptyStateProps {
  title: string
  description: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {icon && (
        <div className="mb-5 text-ink-muted opacity-40 text-5xl select-none">
          {icon}
        </div>
      )}
      <h3 className="font-heading text-lg font-semibold text-ink-primary mb-2">
        {title}
      </h3>
      <p className="text-sm text-ink-muted max-w-sm leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
