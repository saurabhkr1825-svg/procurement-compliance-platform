"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/utils/supabase/client"

export default function NewTenderPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to create a tender.")
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase.from('tenders').insert({
      title: formData.get('title') as string,
      reference_number: formData.get('reference_number') as string,
      description: formData.get('description') as string,
      organization: formData.get('organization') as string,
      status: 'DRAFT',
      created_by: user.id
    }).select().single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Create Audit Log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      tender_id: data.id,
      action: 'TENDER_CREATED',
      metadata: { title: data.title }
    })

    router.push(`/tenders/${data.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Tender</h1>
        <p className="text-muted-foreground">Start a new procurement evaluation workspace.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tender Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input id="title" name="title" required placeholder="e.g. Supply of IT Equipment" />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="reference_number" className="text-sm font-medium">Reference Number</label>
              <Input id="reference_number" name="reference_number" required placeholder="e.g. TNDR/2026/001" />
            </div>

            <div className="space-y-2">
              <label htmlFor="organization" className="text-sm font-medium">Organization / Department</label>
              <Input id="organization" name="organization" required placeholder="e.g. Ministry of Education" />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea id="description" name="description" placeholder="Brief description of the procurement..." rows={4} />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Tender"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
