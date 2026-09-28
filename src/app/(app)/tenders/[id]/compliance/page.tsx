import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from "lucide-react"

export default async function ComplianceMatrixPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: results } = await supabase
    .from('compliance_results')
    .select(`
      *,
      bidders(legal_name),
      requirements(title, description, category),
      bidder_documents(file_name)
    `)
    .order('created_at', { ascending: false })
    // In a real app we'd filter by tender_id through a join or view, but for MVP we fetch all and filter JS side or use a view
    // Since we don't have a direct tender_id on compliance_results, we rely on requirements.tender_id or bidders.tender_id

  // We filter in JS for the MVP to keep DB queries simple without custom views
  const filteredResults = results?.filter((r: any) => r.requirements?.tender_id === id || r.bidders?.tender_id === id) || []

  function getStatusIcon(status: string) {
    switch (status) {
      case 'PASS': return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'FAIL': return <XCircle className="h-5 w-5 text-red-500" />
      case 'REVIEW': return <AlertCircle className="h-5 w-5 text-amber-500" />
      case 'NOT VERIFIED': return <HelpCircle className="h-5 w-5 text-gray-400" />
      default: return null
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'PASS': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">PASS</Badge>
      case 'FAIL': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">FAIL</Badge>
      case 'REVIEW': return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">REVIEW</Badge>
      case 'NOT VERIFIED': return <Badge variant="outline" className="text-gray-500">NOT VERIFIED</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Compliance Matrix</h2>
          <p className="text-sm text-muted-foreground">Evaluation of bidder evidence against frozen requirements.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation Results</CardTitle>
          <CardDescription>All extracted evidence and verification checks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bidder</TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Evidence / Reason</TableHead>
                  <TableHead>Source Doc</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No compliance results available. Run evaluation first.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((res: any) => (
                    <TableRow key={res.id}>
                      <TableCell className="font-medium">{res.bidders?.legal_name}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{res.requirements?.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{res.requirements?.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(res.result)}
                          {getStatusBadge(res.result)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{res.evidence || '-'}</div>
                        <div className="text-xs text-muted-foreground mt-1">{res.reason}</div>
                      </TableCell>
                      <TableCell className="text-sm text-primary">
                        {res.bidder_documents?.file_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <a href={`/tenders/${id}/compliance/${res.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                          Inspect
                        </a>
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
