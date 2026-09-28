import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, CheckCircle, AlertTriangle } from "lucide-react"

export default async function TenderOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tender } = await supabase.from('tenders').select('*').eq('id', id).single()
  
  const { count: docsCount } = await supabase.from('tender_documents').select('*', { count: 'exact', head: true }).eq('tender_id', id)
  const { count: reqsCount } = await supabase.from('requirements').select('*', { count: 'exact', head: true }).eq('tender_id', id)
  const { count: biddersCount } = await supabase.from('bidders').select('*', { count: 'exact', head: true }).eq('tender_id', id)
  
  // Calculate review items for this tender via risk_flags or compliance_results requiring review
  const { count: reviewCount } = await supabase.from('compliance_results').select('*, bidders!inner(*)', { count: 'exact', head: true }).eq('bidders.tender_id', id).eq('result', 'REVIEW')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{tender?.description || "No description provided."}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tender Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{docsCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requirements</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reqsCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bidders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{biddersCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items to Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewCount || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
