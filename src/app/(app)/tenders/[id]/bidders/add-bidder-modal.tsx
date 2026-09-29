"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { createBidder } from "./actions"
import { Input } from "@/components/ui/input"

export function AddBidderModal({ tenderId }: { tenderId: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    // Client-side validations
    let pan = formData.get("pan")?.toString().trim()
    if (pan) {
      pan = pan.toUpperCase()
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
        setError("Invalid PAN format.")
        setLoading(false)
        return
      }
      formData.set("pan", pan)
    }

    let gstin = formData.get("gstin")?.toString().trim()
    if (gstin) {
      gstin = gstin.toUpperCase()
      if (gstin.length !== 15) {
        setError("Invalid GSTIN format (must be 15 characters).")
        setLoading(false)
        return
      }
      formData.set("gstin", gstin)
    }
    
    const result = await createBidder(tenderId, formData)
    
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setOpen(false)
    }
    
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90 text-white rounded-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Bidder
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl sm:max-w-[425px] w-full p-6 shadow-lg animate-in zoom-in-95">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground">Add Bidder</h2>
            </div>
            
            <form action={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg text-center font-medium">
                  {error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Legal Name *</label>
                <Input name="legal_name" required placeholder="Entity Name" className="bg-white" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">PAN</label>
                  <Input name="pan" placeholder="ABCDE1234F" className="bg-white uppercase" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">GSTIN</label>
                  <Input name="gstin" placeholder="09ABCDE1234F1Z5" className="bg-white uppercase" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Registration Number</label>
                <Input name="registration_number" placeholder="UDYAM-XX-00-0000000" className="bg-white" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Registered Address</label>
                <Input name="registered_address" placeholder="Address" className="bg-white" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Contact Email</label>
                  <Input name="contact_email" type="email" placeholder="email@example.com" className="bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Contact Phone</label>
                  <Input name="contact_phone" placeholder="+91 9876543210" className="bg-white" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-full px-6">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
                  {loading ? "Adding..." : "Add Bidder"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
