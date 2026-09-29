import { createClient } from "@/utils/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle, HelpCircle } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export default async function ReviewQueuePage() {
  const supabase = await createClient()

  // Fetch compliance results that are REVIEW or NOT VERIFIED
  const { data: queue } = await supabase
    .from('compliance_results')
    .select(`
      *,
      bidders(legal_name, tender_id),
      requirements(title, tender_id),
      bidder_documents(file_name)
    `)
    .in('result', ['REVIEW', 'NOT VERIFIED', 'NOT_VERIFIED'])
    .order('created_at', { ascending: false })

  function getStatusStyle(status: string) {
    switch (status) {
      case 'REVIEW': return "bg-[#FFF7ED] text-[#C2410C]"
      case 'NOT VERIFIED':
      case 'NOT_VERIFIED': return "bg-[#F1F5F9] text-[#475569]"
      default: return "bg-[#F1F5F9] text-[#475569]"
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'REVIEW': return <AlertCircle className="h-4 w-4 mr-1 text-amber-600" />
      case 'NOT VERIFIED':
      case 'NOT_VERIFIED': return <HelpCircle className="h-4 w-4 mr-1 text-slate-500" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Review Queue</h1>
          <p className="text-slate-500">Items requiring officer attention.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button variant="default" className="bg-slate-900 text-white hover:bg-slate-800 rounded-full h-8 px-4 text-xs font-semibold">
          All Items
        </Button>
        <Button variant="outline" className="bg-white text-slate-700 rounded-full h-8 px-4 text-xs font-semibold">
          High Priority
        </Button>
        <Button variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 rounded-full h-8 px-4 text-xs font-semibold hover:bg-amber-100">
          <AlertCircle className="h-3 w-3 mr-1.5" /> REVIEW
        </Button>
        <Button variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 rounded-full h-8 px-4 text-xs font-semibold hover:bg-slate-100">
          <HelpCircle className="h-3 w-3 mr-1.5" /> NOT VERIFIED
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
        <CardContent className="p-0">
          {!queue || queue.length === 0 ? (
            <div className="py-16">
              <EmptyState 
                title="Review Queue is Empty" 
                description="There are no compliance items that require officer attention at this time." 
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-700 h-11">Bidder</TableHead>
                    <TableHead className="font-semibold text-slate-700 h-11 w-1/4">Requirement</TableHead>
                    <TableHead className="font-semibold text-slate-700 h-11 w-1/3">Reason</TableHead>
                    <TableHead className="font-semibold text-slate-700 h-11">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 h-11 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 align-top">
                      <TableCell className="py-4 font-semibold text-slate-900">
                        {item.bidders?.legal_name || 'Unknown Bidder'}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-slate-800">{item.requirements?.title || 'Unknown Requirement'}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="text-sm text-slate-600 leading-relaxed mb-1.5">{item.reason}</p>
                        {item.bidder_documents?.file_name && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Source: {item.bidder_documents.file_name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(item.result)}`}>
                          {getStatusIcon(item.result)}
                          {item.result}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        {item.requirements?.tender_id ? (
                          <Button size="sm" variant="outline" asChild className="bg-white border-slate-200 shadow-sm text-blue-600 hover:text-blue-700">
                            <Link href={`/tenders/${item.requirements.tender_id}/compliance/${item.id}`}>
                              Inspect
                            </Link>
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
