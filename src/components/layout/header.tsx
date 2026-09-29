import * as React from "react"
import { Bell, User, LogOut, Menu } from "lucide-react"
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
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <div className="hidden md:flex flex-col">
          <span className="text-sm font-semibold text-slate-800 tracking-tight">Procurement Workspace</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
          <span className="sr-only">Notifications</span>
        </Button>
        
        {user && (
          <div className="flex items-center gap-4 border-l pl-6">
            <div className="flex items-center gap-3">
              <div className="hidden flex-col text-right md:flex">
                <span className="text-sm font-bold text-slate-900 leading-none">{profile?.full_name || user.email}</span>
                <span className="text-xs font-medium text-blue-600 mt-1">{profile?.role || 'Procurement Officer'}</span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 border border-blue-200">
                <User className="h-4 w-4 text-blue-700" />
              </div>
            </div>
            <form action={logout}>
              <Button variant="ghost" size="icon" type="submit" className="text-slate-400 hover:text-red-600 hover:bg-red-50" title="Log out">
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
