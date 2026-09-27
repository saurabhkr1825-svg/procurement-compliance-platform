import * as React from "react"
import { Loader2 } from "lucide-react"

export function LoadingState({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
