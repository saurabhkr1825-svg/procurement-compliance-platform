import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
  const notVerifiedCount = compliance?.filter(c => c.result === 'NOT VERIFIED').length || 0

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/tenders/${id}/bidders/${bidderId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bidder
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Final Officer Decision</h1>
        <p className="text-muted-foreground">Record the official procurement decision for {bidder.legal_name}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Summary</CardTitle>
          <CardDescription>Review the evaluation results before making a decision.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-3xl font-bold text-green-600">{passCount}</div>
              <div className="text-sm font-medium text-green-800">PASS</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="text-3xl font-bold text-red-600">{failCount}</div>
              <div className="text-sm font-medium text-red-800">FAIL</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-3xl font-bold text-amber-600">{reviewCount}</div>
              <div className="text-sm font-medium text-amber-800">REVIEW</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-3xl font-bold text-gray-600">{notVerifiedCount}</div>
              <div className="text-sm font-medium text-gray-800">NOT VERIFIED</div>
            </div>
          </div>
          
          {reviewCount > 0 && (
            <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200 text-sm flex items-center">
              <span className="font-semibold mr-2">Warning:</span> There are unresolved items in the review queue. It is recommended to resolve them before final decision.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record Decision</CardTitle>
          <CardDescription>This action is logged in the immutable audit trail.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitDecision} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Decision Status</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-slate-50 flex-1">
                  <input type="radio" name="status" value="QUALIFIED" defaultChecked={existingDecision?.status === 'QUALIFIED'} required />
                  <span className="font-medium text-green-700">Qualified</span>
                </label>
                <label className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-slate-50 flex-1">
                  <input type="radio" name="status" value="DISQUALIFIED" defaultChecked={existingDecision?.status === 'DISQUALIFIED'} />
                  <span className="font-medium text-red-700">Disqualified</span>
                </label>
                <label className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-slate-50 flex-1">
                  <input type="radio" name="status" value="REQUIRES_CLARIFICATION" defaultChecked={existingDecision?.status === 'REQUIRES_CLARIFICATION'} />
                  <span className="font-medium text-amber-700">Needs Clarification</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Decision Summary / Remarks</label>
              <textarea 
                name="summary" 
                className="w-full p-3 border rounded-md min-h-[100px]" 
                placeholder="Provide official justification based on the compliance matrix..."
                required
                defaultValue={existingDecision?.summary}
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" type="button" asChild>
                <Link href={`/tenders/${id}/bidders/${bidderId}`}>Cancel</Link>
              </Button>
              <Button type="submit">
                {existingDecision ? "Update Decision" : "Confirm Final Decision"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
