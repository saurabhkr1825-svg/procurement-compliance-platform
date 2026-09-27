import * as React from "react"
import { Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle would go here */}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  )
}
