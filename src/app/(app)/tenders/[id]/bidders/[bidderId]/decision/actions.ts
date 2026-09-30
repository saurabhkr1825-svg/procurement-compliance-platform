"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function submitDecisionAction(tenderId: string, bidderId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error("No user found for decision submission")
    return { error: "Unauthorized" }
  }

  const status = formData.get("status") as string
  const summary = formData.get("summary") as string

  if (!status || !summary) {
    return { error: "Missing required fields" }
  }

  const { error: upsertError } = await supabase.from("decisions").upsert({
    bidder_id: bidderId,
    tender_id: tenderId,
    status: status,
    summary: summary,
    officer_id: user.id
  }, { onConflict: 'bidder_id' })

  if (upsertError) {
    console.error("Decision upsert error:", upsertError)
    return { error: upsertError.message }
  }

  const { error: auditError } = await supabase.from("audit_logs").insert({
    user_id: user.id,
    tender_id: tenderId,
    bidder_id: bidderId,
    action: 'OFFICER_DECISION_RECORDED',
    metadata: { status, summary }
  })

  if (auditError) {
    console.error("Audit log error:", auditError)
  }

  redirect(`/tenders/${tenderId}/bidders/${bidderId}`)
}
