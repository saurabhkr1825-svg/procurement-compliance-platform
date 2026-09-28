import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default async function ReviewQueuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // For MVP, the Review Queue shows compliance results marked as "REVIEW"
  const { data: reviews } = await supabase
    .from('compliance_results')
    .select(`
      *,
      bidders!inner(legal_name, tender_id),
      requirements(title)
    `)
    .eq('bidders.tender_id', id)
    .eq('result', 'REVIEW')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Review Queue</h2>
          <p className="text-sm text-muted-foreground">Items requiring manual officer review due to low AI confidence or conflicts.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items Pending Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bidder</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead>Reason for Review</TableHead>
                <TableHead>Evidence snippet</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!reviews || reviews.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </div>
                      <p>All clear! No items require manual review.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((rev: any) => (
                  <TableRow key={rev.id}>
                    <TableCell className="font-medium">{rev.bidders.legal_name}</TableCell>
                    <TableCell>{rev.requirements?.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-amber-600 font-medium text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Ambiguous Evidence
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{rev.reason}</div>
                    </TableCell>
                    <TableCell className="text-sm">"{rev.evidence}"</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tenders/${id}/compliance/${rev.id}`}>Resolve</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
