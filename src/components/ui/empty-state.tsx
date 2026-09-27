import * as React from "react"
import { InboxIcon } from "lucide-react"

export interface EmptyStateProps {
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <InboxIcon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 mb-6 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {action}
    </div>
  )
}
