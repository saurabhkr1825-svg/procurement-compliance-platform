import * as React from "react"
import { Bell, LogOut, Menu } from "lucide-react"
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
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="md:hidden h-9 w-9 px-0 text-slate-600">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        {/* We can place contextual breadcrumbs or titles here later */}
        <div className="hidden md:flex"></div>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6">
        <Button variant="ghost" size="sm" className="relative h-9 w-9 px-0 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 border-2 border-white"></span>
          <span className="sr-only">Notifications</span>
        </Button>
        
        {user && (
          <div className="flex items-center gap-4 border-l border-slate-200 pl-4 sm:pl-6">
            <div className="flex items-center gap-3">
              <div className="hidden flex-col text-right md:flex min-w-0">
                <span className="text-sm font-bold text-slate-900 leading-none truncate max-w-[120px] lg:max-w-[200px]" title={profile?.full_name || user.email}>{profile?.full_name || 'Saurabh'}</span>
                <span className="text-[10px] font-bold text-slate-500 mt-1 truncate max-w-[120px] lg:max-w-[200px] uppercase tracking-wider">{profile?.role || 'Procurement Officer'}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                {/* Fallback avatar */}
                <span className="text-sm font-bold text-slate-600">{(profile?.full_name || 'S')[0].toUpperCase()}</span>
              </div>
            </div>
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit" className="h-9 w-9 px-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Log out">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
