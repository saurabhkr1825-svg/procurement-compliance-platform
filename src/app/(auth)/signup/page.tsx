"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { signup } from "@/app/(auth)/actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm_password") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.message) {
      setSuccessMessage(result.message)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        
        {/* Accent Panel / Header */}
        <div className="bg-secondary p-8 text-center border-b border-border">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-border mb-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">ProcureAI</h1>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-2">
            Bid Compliance Platform
          </p>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Create an account</h2>
            <p className="text-sm text-muted-foreground mt-1">Register to start evaluating procurement tenders.</p>
          </div>

          <form action={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg text-center font-medium">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="p-3 text-sm text-[#15803D] bg-[#ECFDF3] border border-[#16A34A]/20 rounded-lg text-center font-medium">
                {successMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Full Name</label>
              <Input 
                id="full_name" 
                name="full_name" 
                type="text" 
                placeholder="Ravi Kumar"
                required 
                className="bg-white border-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Organization (Optional)</label>
              <Input 
                id="organization" 
                name="organization" 
                type="text" 
                placeholder="Ministry of Finance"
                className="bg-white border-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Email</label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="officer@procure.ai"
                required 
                className="bg-white border-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••"
                required 
                className="bg-white border-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Confirm Password</label>
              <Input 
                id="confirm_password" 
                name="confirm_password" 
                type="password" 
                placeholder="••••••••"
                required 
                className="bg-white border-border"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full font-semibold h-10 mt-2">
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
