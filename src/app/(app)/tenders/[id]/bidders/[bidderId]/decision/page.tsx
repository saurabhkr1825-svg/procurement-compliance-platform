import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ShieldCheck, FileCheck, CheckCircle2, XCircle, AlertCircle, HelpCircle, Lock } from "lucide-react"

export default async function OfficerDecisionPage({
  params,
}: {
  params: Promise<{ id: string; bidderId: string }>
}) {
  const { id, bidderId } = await params
  const supabase = await createClient()

  const { data: bidder } = await supabase
    .from("bidders")
    .select("*, decisions(*)")
    .eq("id", bidderId)
    .single()

  if (!bidder) notFound()

  const { data: compliance } = await supabase
    .from("compliance_results")
    .select("*")
    .eq("bidder_id", bidderId)

  const passCount = compliance?.filter(c => c.result === 'PASS').length || 0
  const failCount = compliance?.filter(c => c.result === 'FAIL').length || 0
  const reviewCount = compliance?.filter(c => c.result === 'REVIEW').length || 0
  const notVerifiedCount = compliance?.filter(c => c.result === 'NOT_VERIFIED' || c.result === 'NOT VERIFIED').length || 0

  const hasIssues = failCount > 0 || reviewCount > 0 || notVerifiedCount > 0

  async function submitDecision(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const status = formData.get("status") as string
    const summary = formData.get("summary") as string

    await supabase.from("decisions").upsert({
      bidder_id: bidderId,
      tender_id: id,
      status: status,
      summary: summary,
      officer_id: user.id
    }, { onConflict: 'bidder_id' })

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      tender_id: id,
      bidder_id: bidderId,
      action: 'OFFICER_DECISION_RECORDED',
      metadata: { status, summary }
    })

    redirect(`/tenders/${id}/bidders/${bidderId}`)
  }

  const existingDecision = bidder.decisions && bidder.decisions.length > 0 ? bidder.decisions[0] : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild className="text-slate-500 hover:text-slate-900">
          <Link href={`/tenders/${id}/bidders/${bidderId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bidder Workspace
          </Link>
        </Button>
      </div>

      <div className="flex items-start gap-4 pb-4 border-b border-slate-200">
        <div className="bg-accent p-3 rounded-lg border border-primary/30">
          <FileCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Official Compliance Decision</h1>
          <p className="text-slate-500 mt-1">Record the final procurement decision for <strong className="text-slate-700">{bidder.legal_name}</strong>.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2 text-slate-500" /> System Evaluation Summary
            </CardTitle>
            <CardDescription>AI-extracted evidence and automated checks.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between p-4 bg-green-50/30">
                <div className="flex items-center text-green-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> PASS
                </div>
                <span className="font-bold text-green-700">{passCount}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50/30">
                <div className="flex items-center text-red-700 font-medium">
                  <XCircle className="h-4 w-4 mr-2" /> FAIL
                </div>
                <span className="font-bold text-red-700">{failCount}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50/30">
                <div className="flex items-center text-amber-700 font-medium">
                  <AlertCircle className="h-4 w-4 mr-2" /> REVIEW
                </div>
                <span className="font-bold text-amber-700">{reviewCount}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50">
                <div className="flex items-center text-slate-600 font-medium">
                  <HelpCircle className="h-4 w-4 mr-2" /> NOT VERIFIED
                </div>
                <span className="font-bold text-slate-600">{notVerifiedCount}</span>
              </div>
            </div>
            {hasIssues && (
              <div className="p-4 bg-amber-50 text-sm text-amber-800 border-t border-amber-100">
                <strong>Attention:</strong> There are unresolved issues or failures. Please review the compliance matrix and evidence before making a final decision.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center">
              <Lock className="h-4 w-4 mr-2 text-primary" /> Officer Authority
            </CardTitle>
            <CardDescription>Final decision override.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {existingDecision ? (
              <div className="space-y-4">
                <div className="p-4 bg-accent border border-primary/30 rounded-lg text-sm text-primary/90 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <strong className="block mb-1 text-base">Decision recorded by authorized officer</strong>
                    <p>A final decision has already been recorded for this bidder. Modifications require re-opening the evaluation phase.</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Status</span>
                    <span className="inline-flex font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded">{existingDecision.status}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Officer Remarks</span>
                    <p className="text-sm text-slate-700 bg-white border border-slate-200 p-3 rounded-md">{existingDecision.summary || 'No remarks provided.'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form action={submitDecision} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="status" className="block text-sm font-semibold text-slate-900">
                    Final Decision
                  </label>
                  <select 
                    name="status" 
                    id="status"
                    className="w-full flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select a status...</option>
                    <option value="QUALIFIED">QUALIFIED - Compliant</option>
                    <option value="DISQUALIFIED">DISQUALIFIED - Non-Compliant</option>
                    <option value="CLARIFICATION_REQUIRED">REQUIRES CLARIFICATION</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <label htmlFor="summary" className="block text-sm font-semibold text-slate-900">
                    Officer Remarks & Justification
                  </label>
                  <textarea 
                    name="summary" 
                    id="summary"
                    rows={4}
                    className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Provide justification for this decision. This will be included in the immutable audit log and final report."
                    required
                  />
                </div>

                <div className="p-4 bg-accent border border-primary/30 rounded-lg text-sm text-primary/90 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <strong className="block mb-1">By submitting this form:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li>You establish human authority over the AI evaluation.</li>
                      <li>This decision will be cryptographically hashed in the final report.</li>
                      <li>Your identity will be permanently recorded in the audit log.</li>
                    </ul>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-sm h-11 text-base font-medium">
                  Record Official Decision
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
