import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Activity, ShieldCheck, FileText, User, FileClock, AlertCircle, Clock } from "lucide-react"

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
    if (action.includes('REPORT') || action.includes('COMPLIANCE')) return <ShieldCheck className="h-4 w-4 text-green-600" />
    if (action.includes('DOCUMENT') || action.includes('EVIDENCE')) return <FileText className="h-4 w-4 text-blue-600" />
    if (action.includes('TENDER')) return <FileClock className="h-4 w-4 text-purple-600" />
    if (action.includes('OVERRIDE') || action.includes('DECISION')) return <AlertCircle className="h-4 w-4 text-amber-600" />
    return <Activity className="h-4 w-4 text-slate-500" />
  }

  const getActionColor = (action: string) => {
    if (action.includes('REPORT') || action.includes('COMPLIANCE')) return "bg-green-100 border-green-200"
    if (action.includes('DOCUMENT') || action.includes('EVIDENCE')) return "bg-blue-100 border-blue-200"
    if (action.includes('TENDER')) return "bg-purple-100 border-purple-200"
    if (action.includes('OVERRIDE') || action.includes('DECISION')) return "bg-amber-100 border-amber-200"
    return "bg-slate-100 border-slate-200"
  }

  const formatAction = (action: string) => {
    return action.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Audit Timeline</h1>
        <p className="text-slate-500 mt-1">Immutable global activity and compliance events.</p>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-white pb-4">
          <CardTitle className="text-base font-bold text-slate-900">System Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!logs || logs.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="No activity recorded"
                description="No audit events have been recorded in the system yet."
              />
            </div>
          ) : (
            <div className="relative border-l border-slate-200 ml-8 my-8 space-y-8">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-8">
                  <div className={`absolute -left-[17px] top-1 h-8 w-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <p className="text-sm font-bold text-slate-900">
                        {formatAction(log.action)}
                      </p>
                      <div className="flex items-center text-[11px] font-medium text-slate-500 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                        <Clock className="h-3 w-3 mr-1" />
                        <time dateTime={log.created_at}>
                          {new Date(log.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        </time>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      {log.tenders?.title && (
                        <p><span className="font-semibold text-slate-500">Workspace:</span> {log.tenders.title}</p>
                      )}
                      {log.bidders?.legal_name && (
                        <p><span className="font-semibold text-slate-500">Bidder:</span> {log.bidders.legal_name}</p>
                      )}
                      <p className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <User className="h-3 w-3" />
                        {log.user_id ? 'Authenticated Officer' : 'System Agent'}
                      </p>
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
