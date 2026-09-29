"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardCheck, 
  ShieldCheck, 
  FileBarChart, 
  Activity, 
  Settings,
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tenders', href: '/tenders', icon: FileText },
  { name: 'Review Queue', href: '/review-queue', icon: ClipboardCheck },
  { name: 'Compliance', href: '/compliance', icon: ShieldCheck },
  { name: 'Reports', href: '/reports', icon: FileBarChart },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex h-full w-[240px] flex-col border-r border-border bg-background">
      <div className="flex h-16 items-center px-6 pt-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ProcureAI</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-secondary text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-primary"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
            {/* Placeholder for User Avatar image */}
            <span className="text-sm font-bold text-slate-600">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900">Saurabh</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Procurement Officer</span>
          </div>
        </div>
      </div>
    </div>
  )
}
