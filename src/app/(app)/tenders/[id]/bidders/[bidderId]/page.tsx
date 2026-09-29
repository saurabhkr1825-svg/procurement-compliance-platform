import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building2, ShieldCheck, FileText } from "lucide-react"

export default async function BidderWorkspacePage({
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

  const { data: documents } = await supabase
    .from("bidder_documents")
    .select("*")
    .eq("bidder_id", bidderId)

  const { data: compliance } = await supabase
    .from("compliance_results")
    .select("*, requirements(title)")
    .eq("bidder_id", bidderId)

  // Calculate summary
  const summary = {
    PASS: compliance?.filter((r: { result: string }) => r.result === 'PASS').length || 0,
    FAIL: compliance?.filter((r: { result: string }) => r.result === 'FAIL').length || 0,
    REVIEW: compliance?.filter((r: { result: string }) => r.result === 'REVIEW').length || 0,
    NOT_VERIFIED: compliance?.filter((r: { result: string }) => r.result === 'NOT_VERIFIED' || r.result === 'NOT VERIFIED').length || 0,
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'PASS': return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold tracking-wider bg-green-50 text-green-700 border border-green-200 uppercase">PASS</span>
      case 'FAIL': return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold tracking-wider bg-red-50 text-red-700 border border-red-200 uppercase">FAIL</span>
      case 'REVIEW': return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold tracking-wider bg-amber-50 text-amber-700 border border-amber-200 uppercase">REVIEW</span>
      case 'NOT VERIFIED':
      case 'NOT_VERIFIED': return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold tracking-wider bg-slate-100 text-slate-600 border border-slate-200 uppercase">NOT VERIFIED</span>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <Building2 className="h-8 w-8 text-slate-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{bidder.legal_name}</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-sm font-medium text-slate-500 font-mono">ID: {bidder.registration_number}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              {bidder.decisions && bidder.decisions.length > 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wider bg-slate-100 text-slate-700 uppercase">
                  {bidder.decisions[0].status}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wider bg-slate-100 text-slate-500 uppercase border border-slate-200">
                  EVALUATION PENDING
                </span>
              )}
            </div>
            
            {/* Nav Tabs */}
            <div className="flex items-center gap-6 mt-6 border-b border-slate-200">
              <div className="pb-3 border-b-2 border-blue-600 text-sm font-semibold text-blue-600">Overview</div>
              <div className="pb-3 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 cursor-pointer">Identity</div>
              <div className="pb-3 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 cursor-pointer">Documents</div>
              <div className="pb-3 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 cursor-pointer">Audit</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg px-6">
            <Link href={`/tenders/${id}/bidders/${bidderId}/decision`}>Record Officer Decision</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-green-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-green-700">{summary.PASS}</span>
            <span className="text-xs font-bold text-green-600 uppercase tracking-wider mt-1">PASS</span>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-red-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-red-700">{summary.FAIL}</span>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider mt-1">FAIL</span>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-amber-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-amber-700">{summary.REVIEW}</span>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-1">REVIEW</span>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-slate-300"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-700">{summary.NOT_VERIFIED}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 text-center">NOT VERIFIED</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-white pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" /> Compliance Evaluation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-700 h-10">Requirement</TableHead>
                    <TableHead className="font-semibold text-slate-700 h-10 text-right">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!compliance || compliance.length === 0) ? (
                    <TableRow><TableCell colSpan={2} className="text-center text-slate-500 py-8">No evaluation run.</TableCell></TableRow>
                  ) : (
                    compliance.map(comp => (
                      <TableRow key={comp.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-900">{comp.requirements?.title}</TableCell>
                        <TableCell className="text-right">
                          {getStatusBadge(comp.result)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-white pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-slate-500" /> Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-700 h-10">File</TableHead>
                    <TableHead className="font-semibold text-slate-700 h-10">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700 h-10 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!documents || documents.length === 0) ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-slate-500 py-8">No documents uploaded.</TableCell></TableRow>
                  ) : (
                    documents.map(doc => (
                      <TableRow key={doc.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <TableCell className="font-medium text-blue-600 hover:underline">
                          <Link href="#">{doc.file_name}</Link>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">{doc.document_type}</TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            {doc.processing_status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
