import Link from "next/link"
import { PlusCircle, FileText, Activity, Users, AlertCircle, Clock, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import { EmptyState } from "@/components/ui/empty-state"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
  
  const { count: totalTenders } = await supabase.from('tenders').select('*', { count: 'exact', head: true })
  const { count: activeTenders } = await supabase.from('tenders').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE')
  const { count: biddersEvaluated } = await supabase.from('bidders').select('*', { count: 'exact', head: true })
  
  // Get items needing review
  const { data: needsAttention } = await supabase
    .from('compliance_results')
    .select(`
      *,
      requirements(title, tender_id),
      bidders(legal_name)
    `)
    .in('result', ['REVIEW', 'NOT VERIFIED'])
    .order('created_at', { ascending: false })
    .limit(5)

  const reviewsPending = needsAttention?.length || 0

  const { data: recentTenders } = await supabase.from('tenders').select('*, requirements(count), bidders(count)').order('created_at', { ascending: false }).limit(3)

  function getStatusIcon(status: string) {
    switch (status) {
      case 'REVIEW': return <AlertCircle className="h-4 w-4 text-amber-600" />
      case 'NOT VERIFIED':
      case 'NOT_VERIFIED': return <Clock className="h-4 w-4 text-slate-400" />
      case 'FAIL': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return null
    }
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case 'REVIEW': return "bg-[#FFF7ED] text-[#C2410C]"
      case 'NOT VERIFIED':
      case 'NOT_VERIFIED': return "bg-[#F1F5F9] text-[#475569]"
      case 'FAIL': return "bg-[#FEF2F2] text-[#B91C1C]"
      default: return "bg-[#F1F5F9] text-[#475569]"
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            Good morning, {profile?.full_name?.split(' ')[0] || 'Officer'}!
          </h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Overview of your procurement activities.</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 px-5 rounded-lg">
          <Link href="/tenders/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Tender
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-500 mb-1">Total Tenders</span>
                <span className="text-3xl font-bold text-slate-900">{totalTenders || 0}</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-500 mb-1">Active Tenders</span>
                <span className="text-3xl font-bold text-slate-900">{activeTenders || 0}</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-500 mb-1">Bidders Evaluated</span>
                <span className="text-3xl font-bold text-slate-900">{biddersEvaluated || 0}</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-500 mb-1">Reviews Pending</span>
                <span className="text-3xl font-bold text-slate-900">{reviewsPending || 0}</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Active Tenders Section */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold text-slate-900">Active Workspaces</h2>
            <Link href="/tenders" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {!recentTenders || recentTenders.length === 0 ? (
              <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-8">
                  <EmptyState 
                    title="No active workspaces" 
                    description="Create a tender to start an evaluation workspace." 
                  />
                </CardContent>
              </Card>
            ) : (
              recentTenders.map(tender => (
                <Card key={tender.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
                      <div>
                        <Link href={`/tenders/${tender.id}`} className="font-bold text-lg text-slate-900 hover:text-blue-600 hover:underline">
                          {tender.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="font-medium text-slate-500 font-mono text-xs">{tender.reference_number}</span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {tender.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold text-slate-700">{tender.bidders?.[0]?.count || 0} Bidders</span>
                          <span className="text-xs text-slate-500">{tender.requirements?.[0]?.count || 0} Requirements</span>
                        </div>
                        <Button asChild variant="outline" size="sm" className="bg-white border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm hidden sm:flex">
                          <Link href={`/tenders/${tender.id}`}>
                            Workspace
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Needs Attention Section */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold text-slate-900">Needs Attention</h2>
          </div>
          
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden h-[calc(100%-2rem)]">
            <CardContent className="p-0 h-full flex flex-col">
              {!needsAttention || needsAttention.length === 0 ? (
                <div className="flex-1 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                    <p className="font-semibold text-slate-900">All clear</p>
                    <p className="text-sm text-slate-500 mt-1">No items require immediate attention.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {needsAttention.map((item: { id: string; result: string; requirements?: { title?: string; tender_id?: string }; bidders?: { legal_name?: string } }) => (
                    <div key={item.id} className="p-5 hover:bg-slate-50/50 transition-colors flex items-start gap-3">
                      <div className="mt-0.5">
                        {getStatusIcon(item.result)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {item.requirements?.title || 'Unknown Rule'}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border whitespace-nowrap ${getStatusStyle(item.result)}`}>
                            {item.result}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{item.bidders?.legal_name || 'Unknown Bidder'}</p>
                        <Link 
                          href={`/tenders/${item.requirements?.tender_id}/compliance/${item.id}`}
                          className="inline-block mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Resolve issue &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
