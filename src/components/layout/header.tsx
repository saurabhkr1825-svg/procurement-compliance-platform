import * as React from "react"
import { Bell, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import { logout } from "@/app/(auth)/actions"

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

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
        
        {user && (
          <>
            <div className="flex items-center gap-2">
              <div className="hidden flex-col text-right md:flex">
                <span className="text-sm font-medium leading-none">{profile?.full_name || user.email}</span>
                <span className="text-xs text-muted-foreground">{profile?.role || 'Procurement Officer'}</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-foreground">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </>
        )}
      </div>
    </header>
  )
}
