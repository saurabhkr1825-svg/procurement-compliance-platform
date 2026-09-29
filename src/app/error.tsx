"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Next.js Error Boundary Caught:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
      <div className="max-w-2xl bg-muted p-4 rounded-md text-left overflow-auto mb-6">
        <p className="font-mono text-sm text-foreground">
          {error.message || "Unknown error occurred"}
        </p>
        {error.stack && (
          <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
            {error.stack}
          </pre>
        )}
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Note: If you are seeing &quot;supabaseUrl is required&quot;, it means Vercel is missing your NEXT_PUBLIC_SUPABASE_URL environment variable.
        </p>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  )
}
