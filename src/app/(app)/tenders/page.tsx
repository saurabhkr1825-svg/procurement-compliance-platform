import Link from "next/link"
import { Search, PlusCircle, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function TendersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenders</h1>
          <p className="text-muted-foreground">Manage and evaluate your procurement tenders.</p>
        </div>
        <Button asChild>
          <Link href="/tenders/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Tender
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tenders..." className="pl-8" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <EmptyState 
            title="No tenders found" 
            description="You haven't created any tenders yet. Get started by creating your first tender." 
            action={
              <Button variant="outline" asChild className="mt-4">
                <Link href="/tenders/new">Create Tender</Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
