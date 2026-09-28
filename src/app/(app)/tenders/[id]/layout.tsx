import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"

export default async function TenderLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tender } = await supabase
    .from("tenders")
    .select("*")
    .eq("id", id)
    .single()

  if (!tender) {
    notFound()
  }

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{tender.title}</h1>
        <div className="flex space-x-4 text-sm text-muted-foreground mt-2">
          <span>Ref: {tender.reference_number}</span>
          <span>Status: <span className="font-medium text-amber-600">{tender.status}</span></span>
        </div>
      </div>

      <nav className="flex space-x-6 border-b pb-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div>{children}</div>
    </div>
  )
}
