"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-primary">ProcureAI</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access the platform
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
              <Input id="email" type="email" placeholder="officer@example.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
              <Input id="password" type="password" />
            </div>
            <Button className="w-full" type="submit">
              Sign In
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Database authentication will be implemented in Phase 3.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
