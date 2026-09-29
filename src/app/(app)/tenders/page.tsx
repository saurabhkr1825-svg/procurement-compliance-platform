import Link from "next/link"
import { Search, PlusCircle, Filter, FileText, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { createClient } from "@/utils/supabase/server"

export default async function TendersPage() {
  const supabase = await createClient()
  
  // We need bidders count and requirements count per tender for the polished table.
  const { data: tenders } = await supabase
    .from('tenders')
    .select(`
      *,
      bidders (count),
      requirements (count)
    `)
    .order('created_at', { ascending: false })

  function getStatusBadge(status: string) {
    switch (status) {
      case 'DRAFT': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F1F5F9] text-[#475569]">DRAFT</span>
      case 'ACTIVE': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#DCE9F8] text-[#2563EB]">ACTIVE</span>
      case 'EVALUATION': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#FFF7ED] text-[#C2410C]">EVALUATION</span>
      case 'COMPLETED': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#ECFDF3] text-[#15803D]">COMPLETED</span>
      default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F1F5F9] text-[#475569]">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tender Workspace</h1>
          <p className="text-slate-500">Manage and evaluate your procurement tenders.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-sm">
          <Link href="/tenders/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Tender
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search by Tender ID or Title..." className="pl-8 bg-white shadow-sm border-slate-200" />
        </div>
        <Button variant="outline" className="shadow-sm border-slate-200 bg-white">
          <Filter className="mr-2 h-4 w-4 text-slate-500" />
          Filter
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
        <CardContent className="p-0">
          {!tenders || tenders.length === 0 ? (
            <div className="py-12">
              <EmptyState 
                title="No tenders yet" 
                description="Create your first tender to begin requirement extraction and bid evaluation." 
                action={
                  <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
                    <Link href="/tenders/new">Create Tender</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-700 h-11 w-[120px]">Tender ID</TableHead>
                    <TableHead className="font-semibold text-slate-700 h-11">Tender Title</TableHead>
                    <TableHead className="font-semibold text-slate-700 h-11 text-center">Reqs</TableHead>
                    <TableHead className="font-semibold text-slate-700 h-11 text-center">Bidders</TableHead>
                    <TableHead className="font-semibold text-slate-700 h-11">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 h-11">Last Updated</TableHead>
                    <TableHead className="font-semibold text-slate-700 h-11 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenders.map((tender) => (
                    <TableRow key={tender.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                      <TableCell className="font-medium text-slate-600 text-sm">
                        <Link href={`/tenders/${tender.id}`} className="hover:text-primary hover:underline">
                          {tender.reference_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <Link href={`/tenders/${tender.id}`} className="font-semibold text-slate-900 text-sm hover:text-primary">
                            {tender.title}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 font-medium text-xs px-2 py-0.5 rounded-full">
                          {tender.requirements?.[0]?.count || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 font-medium text-xs px-2 py-0.5 rounded-full">
                          {tender.bidders?.[0]?.count || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(tender.status)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(tender.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/tenders/${tender.id}`}>
                            Workspace <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
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
