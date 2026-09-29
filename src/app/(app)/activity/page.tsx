import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Activity, ShieldCheck, FileText, User, FileClock, AlertCircle } from "lucide-react"

export default async function ActivityPage() {
  const supabase = await createClient()

  // Fetch audit logs with related tender and bidder data
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('*, tenders(title), bidders(legal_name)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching audit logs:", error)
  }

  const getActionIcon = (action: string) => {
    if (action.includes('REPORT') || action.includes('COMPLIANCE')) return <ShieldCheck className="h-4 w-4 text-green-500" />
    if (action.includes('DOCUMENT') || action.includes('EVIDENCE')) return <FileText className="h-4 w-4 text-blue-500" />
    if (action.includes('TENDER')) return <FileClock className="h-4 w-4 text-purple-500" />
    if (action.includes('OVERRIDE')) return <AlertCircle className="h-4 w-4 text-orange-500" />
    return <Activity className="h-4 w-4 text-muted-foreground" />
  }

  const formatAction = (action: string) => {
    return action.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Timeline</h1>
        <p className="text-muted-foreground">Global activity and compliance events.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>The last 50 events across all tenders</CardDescription>
        </CardHeader>
        <CardContent>
          {!logs || logs.length === 0 ? (
            <EmptyState
              title="No activity recorded"
              description="No audit events have been recorded in the system yet."
            />
          ) : (
            <div className="space-y-8">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 items-start">
                  <div className="mt-1 bg-muted p-2 rounded-full">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {formatAction(log.action)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {log.tenders?.title && <span>Tender: {log.tenders.title}</span>}
                      {log.tenders?.title && log.bidders?.legal_name && <span> • </span>}
                      {log.bidders?.legal_name && <span>Bidder: {log.bidders.legal_name}</span>}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <time dateTime={log.created_at}>
                        {new Date(log.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </time>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.user_id ? 'Authenticated User' : 'System'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
