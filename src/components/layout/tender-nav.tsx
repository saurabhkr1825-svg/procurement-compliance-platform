"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function TenderNav({ id }: { id: string }) {
  const pathname = usePathname()

  const navItems = [
    { name: "Overview", href: `/tenders/${id}` },
    { name: "Documents", href: `/tenders/${id}/documents` },
    { name: "Requirements", href: `/tenders/${id}/requirements` },
    { name: "Bidders", href: `/tenders/${id}/bidders` },
    { name: "Compliance Matrix", href: `/tenders/${id}/compliance` },
    { name: "Review Queue", href: `/tenders/${id}/risks` },
    { name: "Report", href: `/tenders/${id}/report` },
  ]

  return (
    <div className="border-b border-slate-200 mt-6">
      <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/tenders/${id}` && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              )}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
