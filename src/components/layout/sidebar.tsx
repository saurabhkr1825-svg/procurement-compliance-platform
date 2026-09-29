"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Activity, 
  Settings,
  ShieldCheck
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tenders', href: '/tenders', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex h-full w-64 flex-col border-r bg-slate-900 text-slate-100 shadow-sm">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <ShieldCheck className="h-6 w-6 text-blue-500 mr-3" />
        <span className="text-lg font-bold tracking-tight">ProcureAI</span>
      </div>
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        <div className="text-xs font-semibold text-slate-500 mb-4 px-2 tracking-wider uppercase">Workspace</div>
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-blue-100" : "text-slate-400 group-hover:text-slate-200"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="rounded-md bg-slate-800 p-3 text-xs text-slate-400">
          <p className="font-medium text-slate-300 mb-1">Secure Environment</p>
          <p>Actions are logged in the immutable audit trail.</p>
        </div>
      </div>
    </div>
  )
}
