import * as React from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "./button"

export interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({ 
  title = "Something went wrong", 
  description = "Please try again later.",
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-200" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 mb-6 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  )
}
