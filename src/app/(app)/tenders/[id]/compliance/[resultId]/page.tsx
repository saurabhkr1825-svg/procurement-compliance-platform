import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, HelpCircle, FileText, Microscope, FileCheck, ShieldCheck } from "lucide-react"

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
      case 'PASS': return <CheckCircle2 className="h-6 w-6 text-green-600" />
      case 'FAIL': return <XCircle className="h-6 w-6 text-red-600" />
      case 'REVIEW': return <AlertCircle className="h-6 w-6 text-amber-600" />
      case 'NOT VERIFIED':
      case 'NOT_VERIFIED': return <HelpCircle className="h-6 w-6 text-slate-400" />
      default: return null
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'PASS': return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold bg-green-50 text-green-700 border border-green-200">{getStatusIcon('PASS')} PASS</span>
      case 'FAIL': return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold bg-red-50 text-red-700 border border-red-200">{getStatusIcon('FAIL')} FAIL</span>
      case 'REVIEW': return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">{getStatusIcon('REVIEW')} REVIEW</span>
      case 'NOT VERIFIED':
      case 'NOT_VERIFIED': return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold bg-slate-100 text-slate-600 border border-slate-200">{getStatusIcon('NOT VERIFIED')} NOT VERIFIED</span>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild className="text-slate-500 hover:text-slate-900">
            <Link href={`/tenders/${id}/compliance`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Matrix
            </Link>
          </Button>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <Microscope className="h-5 w-5 text-blue-600" />
            Evidence Viewer
          </h2>
        </div>
      </div>

      <div className="flex-1 grid md:grid-cols-2 gap-6 h-full min-h-0">
        {/* Left Side: Extracted Evidence and Rationale */}
        <div className="space-y-6 overflow-y-auto pr-2 pb-8">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-800">Compliance State</CardTitle>
                  <CardDescription>System determination based on evidence and rules</CardDescription>
                </div>
                {getStatusBadge(result.result)}
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Extracted Value
                </h4>
                <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                  <p className="text-base font-medium text-slate-900 font-mono">{result.evidence || 'No evidence extracted'}</p>
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium tracking-tight">AI EXTRACTED</Badge>
                  </div>
                  {result.confidence && (
                    <span className="text-xs font-medium text-slate-500">Confidence: <strong className="text-slate-700">{(result.confidence * 100).toFixed(0)}%</strong></span>
                  )}
                </div>
              </div>
              
              <div className="pt-5 border-t border-slate-100">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> System Reasoning
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                  {result.reason}
                </p>
              </div>

              <div className="pt-5 border-t border-slate-100">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Requirement Rule Source</h4>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h5 className="font-semibold text-slate-900 mb-1">{result.requirements?.title}</h5>
                  <p className="text-sm text-slate-600 mb-3">{result.requirements?.description}</p>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-slate-600 border border-slate-200">{result.requirements?.category}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-slate-600 border border-slate-200">{result.requirements?.requirement_type}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-blue-600" /> Verification Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Registry Check</p>
                  <p className="text-xs text-slate-500">External validation</p>
                </div>
                <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200">Not Executed</Badge>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="bg-white shadow-sm">
                  Run Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Document Preview */}
        <div className="h-full border border-slate-200 rounded-lg overflow-hidden flex flex-col bg-slate-50 shadow-sm">
          <div className="p-3 border-b border-slate-200 bg-white flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                {result.bidder_documents?.file_name || 'Source Document'}
              </p>
              <p className="text-xs text-slate-500 ml-6">Page 1 • Section 1.2</p>
            </div>
            <Button variant="outline" size="sm" className="h-8 shadow-sm">
              Open Full Screen
            </Button>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto bg-slate-200 flex items-center justify-center">
            {/* Placeholder for PDF/Document viewer */}
            <div className="bg-white p-12 shadow-md w-full max-w-lg aspect-[1/1.4] relative flex flex-col gap-4 text-slate-300">
              <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
              <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
              <div className="h-4 w-5/6 bg-slate-100 rounded mt-8"></div>
              <div className="h-4 w-full bg-slate-100 rounded"></div>
              <div className="h-4 w-full bg-slate-100 rounded"></div>
              <div className="h-4 w-4/5 bg-slate-100 rounded"></div>
              
              {/* Highlight overlay */}
              <div className="absolute top-[40%] left-8 right-12 bg-amber-200/50 border-2 border-amber-400 rounded p-4 group cursor-pointer hover:bg-amber-200/70 transition-colors">
                <div className="h-4 w-full bg-amber-400/30 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-amber-400/30 rounded"></div>
                
                <div className="absolute -right-2 -top-2 w-4 h-4 bg-amber-500 rounded-full shadow border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              <div className="h-4 w-full bg-slate-100 rounded mt-20"></div>
              <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
