"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/utils/supabase/client"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export default function NewTenderPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Basic inline validation state
  const [formErrors, setFormErrors] = useState<{title?: string; reference_number?: string; organization?: string}>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const reference_number = formData.get('reference_number') as string
    const organization = formData.get('organization') as string
    const description = formData.get('description') as string

    // Inline Validation
    const errors: {title?: string; reference_number?: string; organization?: string} = {}
    if (!title.trim()) errors.title = "Tender Title is required"
    if (!reference_number.trim()) errors.reference_number = "Reference Number is required"
    if (!organization.trim()) errors.organization = "Organization / Department is required"

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to create a tender.")
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase.from('tenders').insert({
      title,
      reference_number,
      description,
      organization,
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
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header and Stepper */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Tender</h1>
        <p className="text-slate-500 mt-1">Start a new procurement evaluation workspace.</p>
        
        {/* Progress Stepper */}
        <div className="mt-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
            
            {/* Step 1 (Active) */}
            <div className="flex flex-col items-center gap-2 bg-background px-2">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-sm ring-4 ring-background">
                1
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Tender Details</span>
            </div>
            
            {/* Step 2 (Inactive) */}
            <div className="flex flex-col items-center gap-2 bg-background px-2">
              <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold ring-4 ring-background">
                2
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Documents</span>
            </div>
            
            {/* Step 3 (Inactive) */}
            <div className="flex flex-col items-center gap-2 bg-background px-2 hidden sm:flex">
              <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold ring-4 ring-background">
                3
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Requirement Pack</span>
            </div>
            
            {/* Step 4 (Inactive) */}
            <div className="flex flex-col items-center gap-2 bg-background px-2">
              <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold ring-4 ring-background">
                4
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Review & Freeze</span>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
        <CardHeader className="bg-white border-b border-slate-100 pb-5">
          <CardTitle className="text-lg font-bold text-slate-800">Basic Information</CardTitle>
          <CardDescription>Enter the foundational details for this tender workspace.</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <div className="mt-0.5">
                  <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="title" className="text-sm font-semibold text-slate-900">
                  Tender Title <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="e.g. Supply of Smart Class Equipment" 
                  className={`h-11 bg-white border-slate-200 focus-visible:ring-primary ${formErrors.title ? 'border-red-300 focus-visible:ring-red-500 bg-red-50/20' : ''}`}
                />
                {formErrors.title && <p className="text-xs font-medium text-red-600 mt-1">{formErrors.title}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="reference_number" className="text-sm font-semibold text-slate-900">
                  Reference Number <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="reference_number" 
                  name="reference_number" 
                  placeholder="e.g. TNDR/2026/001" 
                  className={`h-11 bg-white border-slate-200 focus-visible:ring-primary ${formErrors.reference_number ? 'border-red-300 focus-visible:ring-red-500 bg-red-50/20' : ''}`}
                />
                {formErrors.reference_number && <p className="text-xs font-medium text-red-600 mt-1">{formErrors.reference_number}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="organization" className="text-sm font-semibold text-slate-900">
                  Organization / Department <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="organization" 
                  name="organization" 
                  placeholder="e.g. Ministry of Education" 
                  className={`h-11 bg-white border-slate-200 focus-visible:ring-primary ${formErrors.organization ? 'border-red-300 focus-visible:ring-red-500 bg-red-50/20' : ''}`}
                />
                {formErrors.organization && <p className="text-xs font-medium text-red-600 mt-1">{formErrors.organization}</p>}
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="text-sm font-semibold text-slate-900">
                  Description
                </label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Brief description of the procurement scope, objectives, or key requirements..." 
                  rows={4} 
                  className="bg-white border-slate-200 focus-visible:ring-primary resize-y min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>

          {/* Separated Action Area */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-slate-400" />
              <span>Your tender workspace will be created before documents and requirements are added.</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                className="w-full sm:w-auto bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 h-11 px-6 font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-sm h-11 px-6 font-medium"
              >
                {loading ? "Creating Workspace..." : (
                  <>
                    Create Workspace <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}
