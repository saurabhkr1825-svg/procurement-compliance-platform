"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function CreateTenderPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Tender</h1>
        <p className="text-muted-foreground">Define a new procurement tender.</p>
      </div>

      <Card>
        <form onSubmit={(e) => e.preventDefault()}>
          <CardHeader>
            <CardTitle>Tender Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Tender Title</label>
              <Input id="title" placeholder="e.g. IT Equipment Supply 2026" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="reference" className="text-sm font-medium">Reference Number</label>
                <Input id="reference" placeholder="e.g. TND-2026-001" />
              </div>
              <div className="space-y-2">
                <label htmlFor="organization" className="text-sm font-medium">Organization</label>
                <Input id="organization" placeholder="e.g. Ministry of Health" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="deadline" className="text-sm font-medium">Submission Deadline</label>
              <Input id="deadline" type="datetime-local" />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea id="description" placeholder="Brief description of the tender requirements..." rows={4} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4 border-t px-6 py-4">
            <div className="flex justify-end w-full space-x-2">
              <Button variant="outline" asChild>
                <Link href="/tenders">Cancel</Link>
              </Button>
              <Button type="button">Create Tender</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Database persistence will be implemented in Phase 2.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
