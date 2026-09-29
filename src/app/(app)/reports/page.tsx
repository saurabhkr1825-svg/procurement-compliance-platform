import Link from "next/link"
import { Search, FileText, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { createClient } from "@/utils/supabase/server"

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: tenders } = await supabase
    .from('tenders')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compliance Reports</h1>
        <p className="text-muted-foreground">View final compliance reports for your tenders.</p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reports..." className="pl-8" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {!tenders || tenders.length === 0 ? (
            <EmptyState 
              title="No reports found" 
              description="No tenders exist yet to generate reports for." 
              action={
                <Button variant="outline" asChild className="mt-4">
                  <Link href="/tenders/new">Create Tender</Link>
                </Button>
              }
            />
          ) : (
            <div className="divide-y">
              {tenders.map((tender) => (
                <div key={tender.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        <Link href={`/tenders/${tender.id}/report`} className="hover:underline">
                          {tender.title} - Final Report
                        </Link>
                      </h3>
                      <div className="text-sm text-muted-foreground mt-1 flex gap-4">
                        <span>Ref: {tender.reference_number}</span>
                        <span>Status: {tender.status}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/tenders/${tender.id}/report`}>
                      View Report <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
