import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, HelpCircle, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default async function ComplianceMatrixPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: results } = await supabase
    .from('compliance_results')
    .select(`
      *,
      bidders(legal_name, tender_id),
      requirements(title, description, category, tender_id),
      bidder_documents(file_name)
    `)
    .order('created_at', { ascending: false })

  const filteredResults = results?.filter(
    (r: { requirements?: { tender_id?: string }, bidders?: { tender_id?: string } }) => r.requirements?.tender_id === id || r.bidders?.tender_id === id
  ) || []

  // Calculate summary
  const summary = {
    PASS: filteredResults.filter((r: { result: string }) => r.result === 'PASS').length,
    FAIL: filteredResults.filter((r: { result: string }) => r.result === 'FAIL').length,
    REVIEW: filteredResults.filter((r: { result: string }) => r.result === 'REVIEW').length,
    NOT_VERIFIED: filteredResults.filter((r: { result: string }) => r.result === 'NOT_VERIFIED' || r.result === 'NOT VERIFIED').length,
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'PASS': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'FAIL': return <XCircle className="h-4 w-4 text-red-600" />
      case 'REVIEW': return <AlertCircle className="h-4 w-4 text-amber-600" />
      case 'NOT VERIFIED':
      case 'NOT_VERIFIED': return <HelpCircle className="h-4 w-4 text-slate-400" />
      default: return null
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'PASS': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#ECFDF3] text-[#15803D]">{getStatusIcon('PASS')} PASS</span>
      case 'FAIL': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FEF2F2] text-[#B91C1C]">{getStatusIcon('FAIL')} FAIL</span>
      case 'REVIEW': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FFF7ED] text-[#C2410C]">{getStatusIcon('REVIEW')} REVIEW</span>
      case 'NOT VERIFIED':
      case 'NOT_VERIFIED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F1F5F9] text-[#475569]">{getStatusIcon('NOT VERIFIED')} NOT VERIFIED</span>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-green-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-green-700">{summary.PASS}</span>
            <span className="text-xs font-medium text-green-600 uppercase tracking-wider mt-1">PASS</span>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-red-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-red-700">{summary.FAIL}</span>
            <span className="text-xs font-medium text-red-600 uppercase tracking-wider mt-1">FAIL</span>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-amber-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-amber-700">{summary.REVIEW}</span>
            <span className="text-xs font-medium text-amber-600 uppercase tracking-wider mt-1">REVIEW</span>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-slate-300"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-700">{summary.NOT_VERIFIED}</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1 text-center">NOT VERIFIED</span>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-white pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Compliance Matrix</CardTitle>
              <CardDescription>Comprehensive evaluation of extracted bidder evidence</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Search criteria..." className="pl-8 w-full md:w-[250px] bg-white h-9 text-sm" />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2 text-slate-500" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-700 h-11">Requirement</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-11">Bidder</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-11">Result</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-11 w-1/3">Extracted Evidence</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-11">Provenance</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-11 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-12">
                      <div className="flex flex-col items-center justify-center">
                        <HelpCircle className="h-8 w-8 text-slate-300 mb-3" />
                        <p className="font-medium text-slate-600">No compliance results available</p>
                        <p className="text-sm">Run evaluation or freeze a requirement pack first.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((res: { id: string; result: string; reason: string; evidence: string; requirements?: { title: string; description: string; category: string; requirement_type: string; tender_id: string }; bidders?: { legal_name: string }; bidder_documents?: { file_name: string } }) => (
                    <TableRow key={res.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                      <TableCell className="align-top py-4">
                        <div className="font-semibold text-slate-900 text-sm mb-1">{res.requirements?.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed max-w-xs">{res.requirements?.description}</div>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <span className="font-medium text-slate-700 text-sm">{res.bidders?.legal_name}</span>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        {getStatusBadge(res.result)}
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <div className="text-sm font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded inline-block mb-1.5">{res.evidence || 'No evidence extracted'}</div>
                        <div className="text-xs text-slate-600 leading-relaxed">{res.reason}</div>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 w-fit">SIMULATED</span>
                          <span className="text-xs text-slate-500 truncate max-w-[150px] block" title={res.bidder_documents?.file_name}>
                            {res.bidder_documents?.file_name || 'Verification Source'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-4 text-right">
                        <Button variant="outline" size="sm" asChild className="bg-white border-slate-200">
                          <a href={`/tenders/${res.requirements?.tender_id}/compliance/${res.id}`}>
                            {res.result === 'REVIEW' || res.result === 'NOT VERIFIED' || res.result === 'NOT_VERIFIED' ? 'Review' : 'Inspect'}
                          </a>
                        </Button>
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
  )
}
