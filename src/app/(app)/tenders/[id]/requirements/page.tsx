import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function RequirementsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get current active requirement pack version
  const { data: packVersion } = await supabase
    .from('requirement_pack_versions')
    .select('*')
    .eq('tender_id', id)
    .order('version_number', { ascending: false })
    .limit(1)
    .single()

  const { data: requirements } = await supabase
    .from('requirements')
    .select('*')
    .eq('tender_id', id)
    .order('created_at', { ascending: true })

  const isFrozen = packVersion?.status === 'FROZEN'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Requirement Pack</h2>
          <p className="text-sm text-muted-foreground">
            {packVersion ? `Version ${packVersion.version_number} - ${packVersion.status}` : 'No requirements extracted yet.'}
          </p>
        </div>
        <div className="space-x-2">
          {!isFrozen && (
            <Button variant="outline">Extract Requirements (AI)</Button>
          )}
          {packVersion && !isFrozen && (
            <form action={async () => {
              "use server"
              const supabase = await createClient()
              await supabase.from('requirement_pack_versions').update({ status: 'FROZEN' }).eq('id', packVersion.id)
            }}>
              <Button type="submit">Freeze Pack</Button>
            </form>
          )}
          {isFrozen && (
            <Button variant="outline">Create Corrigendum (v{packVersion.version_number + 1})</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>Rules and evidence required from bidders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Mandatory</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!requirements || requirements.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No requirements found. Click "Extract Requirements (AI)" to analyze tender documents.
                  </TableCell>
                </TableRow>
              ) : (
                requirements.map(req => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">
                      <div>{req.title}</div>
                      <div className="text-xs text-muted-foreground">{req.description}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{req.category}</Badge></TableCell>
                    <TableCell>{req.requirement_type}</TableCell>
                    <TableCell>{req.mandatory ? "Yes" : "No"}</TableCell>
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
