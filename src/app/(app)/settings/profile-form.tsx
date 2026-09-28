"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateProfile } from "./actions"

type ProfileFormProps = {
  profile: {
    full_name: string | null
    organization: string | null
  } | null
  email: string | undefined
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    const result = await updateProfile(formData)
    
    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else if (result?.success) {
      setMessage({ type: 'success', text: result.success })
    }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 text-sm rounded-md border ${message.type === 'error' ? 'text-red-500 bg-red-50 border-red-200' : 'text-green-600 bg-green-50 border-green-200'}`}>
          {message.text}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium leading-none">Email (Read Only)</label>
        <Input id="email" type="email" value={email || ""} disabled />
      </div>
      <div className="space-y-2">
        <label htmlFor="full_name" className="text-sm font-medium leading-none">Full Name</label>
        <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ""} required />
      </div>
      <div className="space-y-2">
        <label htmlFor="organization" className="text-sm font-medium leading-none">Organization</label>
        <Input id="organization" name="organization" defaultValue={profile?.organization || ""} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
