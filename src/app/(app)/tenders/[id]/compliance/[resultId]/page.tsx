import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, HelpCircle } from "lucide-react"

export default async function EvidenceViewerPage({
  params,
}: {
  params: Promise<{ id: string; resultId: string }>
}) {
  const { id, resultId } = await params
  const supabase = await createClient()

  const { data: result } = await supabase
    .from("compliance_results")
    .select(`
      *,
      requirements(*),
      bidders(*),
      bidder_documents(file_name, storage_path)
    `)
    .eq("id", resultId)
    .single()

  if (!result) notFound()

  function getStatusIcon(status: string) {
    switch (status) {
      case 'PASS': return <CheckCircle2 className="h-6 w-6 text-green-500" />
      case 'FAIL': return <XCircle className="h-6 w-6 text-red-500" />
      case 'REVIEW': return <AlertCircle className="h-6 w-6 text-amber-500" />
      case 'NOT VERIFIED': return <HelpCircle className="h-6 w-6 text-gray-400" />
      default: return null
    }
  }

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/tenders/${id}/compliance`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Matrix
          </Link>
        </Button>
        <h2 className="text-xl font-bold flex items-center gap-2">
          Evidence Viewer for {result.requirements?.title}
        </h2>
      </div>

      <div className="flex-1 grid md:grid-cols-2 gap-4 h-full min-h-0">
        {/* Left Side: Extracted Evidence and Rationale */}
        <div className="space-y-4 overflow-y-auto pr-2">
          <Card>
            <CardHeader className="bg-muted/30">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Compliance State</CardTitle>
                  <CardDescription>System determination based on evidence and rules</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.result)}
                  <Badge className={
                    result.result === 'PASS' ? 'bg-green-100 text-green-800' :
                    result.result === 'FAIL' ? 'bg-red-100 text-red-800' :
                    result.result === 'REVIEW' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {result.result}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">AI Extracted Value</h4>
                <p className="text-base font-medium">{result.evidence || 'No evidence extracted'}</p>
                {result.confidence && (
                  <p className="text-xs text-muted-foreground mt-1">Confidence: {(result.confidence * 100).toFixed(0)}%</p>
                )}
              </div>
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Reasoning</h4>
                <p className="text-sm">{result.reason}</p>
              </div>
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Rule Source</h4>
                <p className="text-sm font-medium">{result.requirements?.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{result.requirements?.category}</Badge>
                  <Badge variant="outline">{result.requirements?.requirement_type}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Officer Override</CardTitle>
              <CardDescription>If the AI made an error, override the status here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={async (formData) => {
                "use server"
                const supabase = await createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const status = formData.get("status") as string
                const reason = formData.get("reason") as string
                const fullReason = `MANUAL OVERRIDE: ${reason}`

                await supabase.from("compliance_results").update({
                  result: status,
                  reason: fullReason
                }).eq("id", resultId)

                await supabase.from("audit_logs").insert({
                  user_id: user.id,
                  tender_id: id,
                  bidder_id: result.bidder_id,
                  action: 'OFFICER_OVERRIDE',
                  metadata: {
                    previous_status: result.result,
                    new_status: status,
                    reason: fullReason,
                    requirement_id: result.requirement_id
                  }
                })
              }} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Status</label>
                  <select name="status" className="w-full p-2 border rounded-md">
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="NOT VERIFIED">NOT VERIFIED</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason for Override</label>
                  <textarea name="reason" className="w-full p-2 border rounded-md" required rows={3} placeholder="Provide justification..."></textarea>
                </div>
                <Button type="submit">Submit Override</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Document Preview (Simulated for MVP) */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="bg-muted/50 border-b py-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Source Document: <span className="text-primary">{result.bidder_documents?.file_name || 'N/A'}</span></CardTitle>
              <Badge variant="secondary">Page {result.evidence_page || 1}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 bg-gray-100 flex items-center justify-center relative overflow-hidden">
            {/* MVP Simulation of PDF viewer with highlight */}
            {!result.bidder_documents ? (
              <div className="text-muted-foreground">No source document available.</div>
            ) : (
              <div className="w-full h-full bg-white shadow-sm m-4 p-8 relative flex flex-col items-center justify-center text-center">
                <div className="absolute top-4 right-4 text-xs text-muted-foreground">SIMULATED PDF RENDERER</div>
                <div className="max-w-md space-y-4 text-left p-6 border rounded shadow-sm bg-yellow-50/30">
                  <h3 className="font-bold border-b pb-2 mb-4">EXTRACTED DOCUMENT CONTENT</h3>
                  <p className="text-sm leading-relaxed">
                    ...this certifies that <span className="font-bold bg-yellow-200 px-1 py-0.5 rounded">{result.evidence}</span> is officially registered under the name <strong>{result.bidders?.legal_name}</strong> in accordance with section...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
