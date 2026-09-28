import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle } from "lucide-react"

export default async function BiddersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: bidders } = await supabase
    .from('bidders')
    .select('*, compliance_results(result), decisions(status)')
    .eq('tender_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Bidders Workspace</h2>
          <p className="text-sm text-muted-foreground">Manage participating entities and their documents.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Bidder
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participating Bidders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Legal Name</TableHead>
                <TableHead>Registration No.</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!bidders || bidders.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No bidders registered yet.
                  </TableCell>
                </TableRow>
              ) : (
                bidders.map(bidder => (
                  <TableRow key={bidder.id}>
                    <TableCell className="font-medium">
                      {bidder.legal_name}
                      <div className="text-xs text-muted-foreground">{bidder.contact_email}</div>
                    </TableCell>
                    <TableCell>{bidder.registration_number}</TableCell>
                    <TableCell>
                      {bidder.decisions && bidder.decisions.length > 0 ? (
                        <span className="font-medium text-green-600">{bidder.decisions[0].status}</span>
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tenders/${id}/bidders/${bidder.id}`}>Workspace</Link>
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
