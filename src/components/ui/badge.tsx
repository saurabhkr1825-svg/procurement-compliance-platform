import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80": variant === "default",
          "border-transparent bg-muted text-muted-foreground hover:bg-muted/80": variant === "secondary",
          "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100": variant === "destructive",
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100": variant === "success",
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100": variant === "warning",
          "text-foreground": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
