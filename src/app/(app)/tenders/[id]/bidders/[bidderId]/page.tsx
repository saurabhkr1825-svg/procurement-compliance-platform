import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

  const { data: verifications } = await supabase
    .from("verification_results")
    .select("*")
    .eq("bidder_id", bidderId)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{bidder.legal_name}</h2>
          <p className="text-sm text-muted-foreground">Registration No: {bidder.registration_number}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-base py-1">
            {bidder.decisions && bidder.decisions.length > 0
              ? bidder.decisions[0].status
              : "EVALUATION PENDING"}
          </Badge>
          <Button asChild>
            <Link href={`/tenders/${id}/bidders/${bidderId}/decision`}>Record Decision</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!documents || documents.length === 0) ? (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No documents uploaded.</TableCell></TableRow>
                ) : (
                  documents.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium text-blue-600 hover:underline">
                        <Link href="#">{doc.file_name}</Link>
                      </TableCell>
                      <TableCell>{doc.document_type}</TableCell>
                      <TableCell><Badge>{doc.processing_status}</Badge></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Evaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!compliance || compliance.length === 0) ? (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No evaluation run.</TableCell></TableRow>
                ) : (
                  compliance.map(comp => (
                    <TableRow key={comp.id}>
                      <TableCell>{comp.requirements?.title}</TableCell>
                      <TableCell>
                        <Badge variant={comp.result === 'PASS' ? 'default' : 'destructive'} className={comp.result === 'PASS' ? 'bg-green-500' : ''}>
                          {comp.result}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Simulated Verifications (MVP)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Identifier</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!verifications || verifications.length === 0) ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No verifications performed.</TableCell></TableRow>
              ) : (
                verifications.map(ver => (
                  <TableRow key={ver.id}>
                    <TableCell><Badge variant="outline">{ver.source_name} ({ver.source_type})</Badge></TableCell>
                    <TableCell className="font-medium">{ver.identifier_value} ({ver.identifier_type})</TableCell>
                    <TableCell><Badge className="bg-green-100 text-green-800">{ver.result_status}</Badge></TableCell>
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
