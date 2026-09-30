"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function createBidder(tenderId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const legal_name = formData.get("legal_name")?.toString().trim()
  const registration_number = formData.get("registration_number")?.toString().trim()
  const pan = formData.get("pan")?.toString().trim()
  const gstin = formData.get("gstin")?.toString().trim()
  const registered_address = formData.get("registered_address")?.toString().trim()
  const contact_email = formData.get("contact_email")?.toString().trim()
  const contact_phone = formData.get("contact_phone")?.toString().trim()

  if (!legal_name) {
    return { error: "Legal Name is required" }
  }

  // Duplicate Check
  let conflictQuery = supabase
    .from("bidders")
    .select("id")
    .eq("tender_id", tenderId)
    
  const orClauses = []
  if (registration_number) orClauses.push(`registration_number.eq."${registration_number}"`)
  
  if (orClauses.length > 0) {
    conflictQuery = conflictQuery.or(orClauses.join(","))
    const { data: existing } = await conflictQuery
    if (existing && existing.length > 0) {
      return { error: "A bidder with this Registration Number already exists in this tender." }
    }
  }

  // Insert bidder
  const { data, error } = await supabase.from("bidders").insert({
    tender_id: tenderId,
    legal_name,
    registration_number: registration_number || null,
    address: registered_address || null,
    contact_email: contact_email || null,
    contact_phone: contact_phone || null,
  }).select().single()

  if (error) {
    console.error("Bidder creation error:", error)
    return { error: "Failed to create bidder." }
  }

  // Record audit event
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    tender_id: tenderId,
    bidder_id: data.id,
    action: "BIDDER_CREATED",
    metadata: { legal_name }
  })

  revalidatePath(`/tenders/${tenderId}/bidders`)
  return { success: true }
}
