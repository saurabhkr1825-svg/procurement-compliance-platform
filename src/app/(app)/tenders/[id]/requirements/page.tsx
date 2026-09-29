import { createClient } from "@/utils/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Lock, FileSignature, GitCommit, FileText, CheckCircle2 } from "lucide-react"

export default async function RequirementsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

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
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-accent p-3 rounded-xl border border-primary/20">
            <FileSignature className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Requirement Pack {packVersion && `v${packVersion.version_number}`}</h2>
            <div className="flex items-center gap-3 mt-1.5">
              {isFrozen ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                  <Lock className="h-3 w-3 mr-1" /> FROZEN
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  DRAFT
                </span>
              )}
              {isFrozen && (
                <span className="text-sm font-medium text-slate-500 flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-600" />
                  Officer Approved
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isFrozen && (
            <Button variant="outline" className="bg-white shadow-sm">Extract Requirements (AI)</Button>
          )}
          {packVersion && !isFrozen && (
            <form action={async () => {
              "use server"
              const supabase = await createClient()
              await supabase.from('requirement_pack_versions').update({ status: 'FROZEN' }).eq('id', packVersion.id)
            }}>
              <Button type="submit" className="bg-primary hover:bg-primary/90 shadow-sm">
                <Lock className="mr-2 h-4 w-4" /> Freeze Pack
              </Button>
            </form>
          )}
          {isFrozen && (
            <Button variant="outline" className="bg-white shadow-sm border-primary/30 text-primary hover:bg-accent">
              <GitCommit className="mr-2 h-4 w-4" /> Create Corrigendum (v{packVersion.version_number + 1})
            </Button>
          )}
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-700 h-11 w-[120px]">Req ID</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-11 w-1/3">Clause / Requirement</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-11">Category</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-11">Applicability</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-11">Evidence Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!requirements || requirements.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <FileText className="h-8 w-8 text-slate-300 mb-3" />
                        <p className="font-medium text-slate-600">No requirements found</p>
                        <p className="text-sm">Click &quot;Extract Requirements (AI)&quot; to analyze tender documents.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  requirements.map((req, idx) => (
                    <TableRow key={req.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 align-top">
                      <TableCell className="py-4">
                        <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">REQ-{String(idx + 1).padStart(3, '0')}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-semibold text-slate-900 text-sm mb-1">{req.title}</div>
                        <div className="text-sm text-slate-600 leading-relaxed">{req.description}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">{req.category}</Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {req.mandatory ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100">Mandatory</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Optional</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm font-medium text-slate-700">{req.requirement_type}</span>
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
