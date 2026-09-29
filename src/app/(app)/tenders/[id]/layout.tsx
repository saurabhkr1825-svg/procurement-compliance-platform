import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { TenderNav } from "@/components/layout/tender-nav"
import { FileText, Calendar, Activity } from "lucide-react"

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

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{tender.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-3">
              <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> Ref: {tender.reference_number}</span>
              <span className="flex items-center gap-1.5"><Activity className="h-4 w-4" /> Status: 
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{tender.status}</span>
              </span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(tender.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Actions area placeholder */}
          </div>
        </div>
        <TenderNav id={id} />
      </div>

      <div className="pb-8">{children}</div>
    </div>
  )
}
