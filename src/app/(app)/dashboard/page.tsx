import Link from "next/link"
import { PlusCircle, FileText, Activity, Users, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { createClient } from "@/utils/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
  
  const { count: totalTenders } = await supabase.from('tenders').select('*', { count: 'exact', head: true })
  const { count: activeTenders } = await supabase.from('tenders').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE')
  const { count: biddersReview } = await supabase.from('bidders').select('*', { count: 'exact', head: true })
  const { count: decisions } = await supabase.from('decisions').select('*', { count: 'exact', head: true })
  
  const { data: recentTenders } = await supabase.from('tenders').select('*').order('created_at', { ascending: false }).limit(5)
  const { data: recentActivity } = await supabase.from('audit_logs').select('*, tenders(title), bidders(legal_name)').order('created_at', { ascending: false }).limit(5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {profile?.full_name || 'Officer'}</h1>
          <p className="text-muted-foreground">Overview of your procurement activities.</p>
        </div>
        <Button asChild>
          <Link href="/tenders/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Tender
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTenders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenders</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTenders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bidders Evaluated</CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{biddersReview || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Evaluations</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisions || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Tenders</CardTitle>
          </CardHeader>
          <CardContent>
            {!recentTenders || recentTenders.length === 0 ? (
              <EmptyState 
                title="No tenders yet" 
                description="Create your first tender to get started." 
                action={
                  <Button variant="outline" asChild className="mt-4">
                    <Link href="/tenders/new">Create Tender</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {recentTenders.map(tender => (
                  <div key={tender.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <Link href={`/tenders/${tender.id}`} className="font-medium hover:underline text-primary">
                        {tender.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{tender.reference_number} • {tender.status}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/tenders/${tender.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Audit Timeline (Recent Activity)</CardTitle>
            <CardDescription>Track events in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {!recentActivity || recentActivity.length === 0 ? (
              <EmptyState 
                title="No recent activity" 
                description="Activity will appear here once actions are performed in the system." 
              />
            ) : (
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="mt-0.5 rounded-full bg-primary/10 p-1 text-primary">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                      {activity.tenders && (
                        <p className="text-xs mt-1">Tender: {(activity.tenders as { title: string }).title}</p>
                      )}
                      {activity.bidders && (
                        <p className="text-xs mt-1">Bidder: {(activity.bidders as { legal_name: string }).legal_name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
