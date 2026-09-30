import { createClient } from "@/utils/supabase/server"
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileDown, Printer } from "lucide-react"

import { createHash } from "crypto"

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tender } = await supabase.from('tenders').select('*').eq('id', id).single()
  
  const { data: bidders } = await supabase
    .from('bidders')
    .select('*, decisions(*), compliance_results(*, requirements(title, category))')
    .eq('tender_id', id)

  // In MVP, we just display the report on-screen, with a button to "Print" which uses browser print.
  const reportData = { tender, bidders };
  const hash = createHash("sha256").update(JSON.stringify(reportData)).digest("hex").substring(0, 8).toUpperCase();
  const reportHash = "RPT-" + hash;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-xl font-semibold">Evaluation Report Preview</h2>
          <p className="text-sm text-muted-foreground">Comprehensive compliance and verification report.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="print:hidden">
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
          <Button className="print:hidden">
            <FileDown className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-8 print:border-0 print:shadow-none print:p-0 text-slate-900">
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-slate-900">Procurement Evaluation Report</h1>
          <div className="flex justify-between mt-4 text-sm font-medium">
            <div>
              <p>Tender: <span className="font-bold">{tender?.title}</span></p>
              <p>Ref No: {tender?.reference_number}</p>
              <p>Organization: {tender?.organization}</p>
            </div>
            <div className="text-right">
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Report Hash: <span className="font-mono text-xs">{reportHash}</span></p>
            </div>
          </div>
        </div>

        {(!bidders || bidders.length === 0) ? (
          <p className="text-center text-muted-foreground">No bidder evaluation data available for this report.</p>
        ) : (
          bidders.map(bidder => {
            const decision = bidder.decisions && bidder.decisions.length > 0 ? bidder.decisions[0] : null;
            const isQualified = decision?.status === 'QUALIFIED';
            
            return (
              <div key={bidder.id} className="mb-12 page-break-after">
                <div className="bg-slate-50 p-4 rounded-md border mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">{bidder.legal_name}</h3>
                      <p className="text-sm">Reg: {bidder.registration_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold uppercase text-slate-500 mb-1">Final Decision</p>
                      {decision ? (
                        <div className={`px-4 py-1 text-sm font-bold rounded-full border ${
                          isQualified ? 'bg-green-100 text-green-800 border-green-300' : 
                          decision.status === 'DISQUALIFIED' ? 'bg-red-100 text-red-800 border-red-300' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {decision.status}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">PENDING</span>
                      )}
                    </div>
                  </div>
                  {decision?.summary && (
                    <div className="mt-4 text-sm bg-white p-3 border rounded">
                      <span className="font-semibold text-xs uppercase text-slate-500 block mb-1">Officer Remarks:</span>
                      {decision.summary}
                    </div>
                  )}
                </div>

                <h4 className="text-md font-semibold mb-2 border-b pb-1">Compliance Details</h4>
                <Table className="text-sm border">
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Evidence</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!bidder.compliance_results || bidder.compliance_results.length === 0) ? (
                      <TableRow><TableCell colSpan={4} className="text-center">No compliance evaluations.</TableCell></TableRow>
                    ) : (
                      bidder.compliance_results.map((res: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                        <TableRow key={res.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">{res.requirements?.title}</TableCell>
                          <TableCell>{res.requirements?.category}</TableCell>
                          <TableCell className="max-w-[250px] truncate" title={res.evidence}>{res.evidence}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              res.result === 'PASS' ? 'text-green-700 border-green-200 bg-green-50' : 
                              res.result === 'FAIL' ? 'text-red-700 border-red-200 bg-red-50' : ''
                            }>
                              {res.result}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )
          })
        )}

        <div className="mt-16 pt-8 border-t-2 border-slate-200 text-center text-sm text-slate-500 print:block">
          <p>Generated by GeM SecureX Compliance System</p>
          <p className="mt-1 font-mono text-xs">Verify authenticity via system audit trail (Report Hash: {reportHash})</p>
        </div>
      </div>
    </div>
  )
}
