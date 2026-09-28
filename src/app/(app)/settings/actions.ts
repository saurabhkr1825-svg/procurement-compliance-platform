"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const fullName = formData.get("full_name") as string
  const organization = formData.get("organization") as string

  if (!fullName) {
    return { error: "Full name is required" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ 
      full_name: fullName, 
      organization: organization || "",
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/settings")
  revalidatePath("/", "layout")
  
  return { success: "Profile updated successfully" }
}
