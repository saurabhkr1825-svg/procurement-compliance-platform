"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { signup } from "@/app/(auth)/actions"

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setMessage(null)
    
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.message) {
      setMessage(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-primary">ProcureAI</CardTitle>
          <CardDescription>
            Create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="p-4 text-center space-y-4">
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 p-3 rounded-md">
                {message}
              </div>
              <Button asChild className="w-full">
                <Link href="/login">Return to Login</Link>
              </Button>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="full_name" className="text-sm font-medium leading-none">Full Name</label>
                <Input id="full_name" name="full_name" placeholder="John Doe" required />
              </div>

              <div className="space-y-2">
                <label htmlFor="organization" className="text-sm font-medium leading-none">Organization</label>
                <Input id="organization" name="organization" placeholder="Ministry of Health" />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                <Input id="email" name="email" type="email" placeholder="officer@example.com" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                  <Input id="password" name="password" type="password" required minLength={6} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">Confirm Password</label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
                </div>
              </div>

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
              
              <div className="text-center text-sm mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
