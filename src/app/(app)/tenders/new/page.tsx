"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/utils/supabase/client"
import { ArrowRight, CheckCircle2, FileText, Upload, Trash2, Edit2, Check, X, ShieldCheck, Lock, Play } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import {
  uploadTenderDocument,
  removeTenderDocument,
  extractRequirements,
  updateRequirement,
  deleteRequirement,
  freezeRequirementPack
} from "./actions"

function WizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stepParam = searchParams.get('step')
  const tenderIdParam = searchParams.get('id')
  
  const currentStep = stepParam ? parseInt(stepParam) : 1
  const tenderId = tenderIdParam || null

  const supabase = createClient()
  
  // Data State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tender, setTender] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [documents, setDocuments] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pack, setPack] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [requirements, setRequirements] = useState<any[]>([])
  
  // UI State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<{title?: string; reference_number?: string; organization?: string}>({})
  
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [extracting, setExtracting] = useState(false)
  const [editingReq, setEditingReq] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editForm, setEditForm] = useState<any>({})
  
  const [freezing, setFreezing] = useState(false)

  // Fetch Data on Mount/Change
  useEffect(() => {
    if (tenderId) {
      const fetchData = async () => {
        const { data: t } = await supabase.from('tenders').select('*').eq('id', tenderId).single()
        if (t) setTender(t)
        
        const { data: docs } = await supabase.from('tender_documents').select('*').eq('tender_id', tenderId).order('created_at', { ascending: false })
        if (docs) setDocuments(docs)
        
        const { data: p } = await supabase.from('requirement_pack_versions').select('*').eq('tender_id', tenderId).order('version_number', { ascending: false }).limit(1).maybeSingle()
        if (p) {
          setPack(p)
          const { data: reqs } = await supabase.from('requirements').select('*').eq('pack_version_id', p.id).order('created_at', { ascending: true })
          if (reqs) setRequirements(reqs)
        }
      }
      fetchData()
    }
  }, [tenderId, supabase])

  // STEP 1 - TENDER DETAILS
  async function handleSubmitStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const reference_number = formData.get('reference_number') as string
    const organization = formData.get('organization') as string
    const description = formData.get('description') as string

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors: any = {}
    if (!title.trim()) errors.title = "Tender Title is required"
    if (!reference_number.trim()) errors.reference_number = "Reference Number is required"
    if (!organization.trim()) errors.organization = "Organization / Department is required"

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to create a tender.")
      setLoading(false)
      return
    }

    if (tenderId) {
      // Update existing
      const { error: updateError } = await supabase.from('tenders').update({
        title, reference_number, description, organization
      }).eq('id', tenderId)
      
      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
      setLoading(false)
      router.push(`/tenders/new?id=${tenderId}&step=2`)
    } else {
      // Insert new
      const { data, error: insertError } = await supabase.from('tenders').insert({
        title, reference_number, description, organization, status: 'DRAFT', created_by: user.id
      }).select().single()

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
      
      await supabase.from('audit_logs').insert({
        user_id: user.id, tender_id: data.id, action: 'TENDER_CREATED', metadata: { title: data.title }
      })
      
      setLoading(false)
      router.push(`/tenders/new?id=${data.id}&step=2`)
    }
  }

  // STEP 2 - DOCUMENTS
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !tenderId) return
    
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported file format. Please upload PDF, DOCX, or TXT.")
      return
    }

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    
    const res = await uploadTenderDocument(tenderId, formData)
    
    if (res.error) {
      setError(res.error)
    } else if (res.data) {
      setDocuments([res.data, ...documents])
    }
    
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleRemoveDocument(docId: string, path: string) {
    if (!confirm("Are you sure you want to remove this document?")) return
    const res = await removeTenderDocument(docId, path)
    if (res.success) {
      setDocuments(documents.filter(d => d.id !== docId))
    } else {
      setError(res.error || "Failed to remove document")
    }
  }
  
  function proceedToStep3() {
    router.push(`/tenders/new?id=${tenderId}&step=3`)
  }

  // STEP 3 - REQUIREMENTS
  async function handleExtractRequirements() {
    if (!tenderId) return
    setExtracting(true)
    setError(null)
    
    const res = await extractRequirements(tenderId)
    if (res.error) {
      setError(res.error)
    } else {
      // Reload reqs
      const { data: p } = await supabase.from('requirement_pack_versions').select('*').eq('tender_id', tenderId).order('version_number', { ascending: false }).limit(1).single()
      if (p) {
        setPack(p)
        const { data: reqs } = await supabase.from('requirements').select('*').eq('pack_version_id', p.id).order('created_at', { ascending: true })
        if (reqs) setRequirements(reqs)
      }
    }
    
    setExtracting(false)
  }

  async function handleSaveReq(reqId: string) {
    const res = await updateRequirement(reqId, editForm)
    if (res.success) {
      setRequirements(requirements.map(r => r.id === reqId ? { ...r, ...editForm } : r))
      setEditingReq(null)
    } else {
      setError(res.error || "Failed to update requirement")
    }
  }

  async function handleDeleteReq(reqId: string) {
    if (!confirm("Remove this requirement?")) return
    const res = await deleteRequirement(reqId)
    if (res.success) {
      setRequirements(requirements.filter(r => r.id !== reqId))
    } else {
      setError(res.error || "Failed to delete requirement")
    }
  }

  function proceedToStep4() {
    if (requirements.length === 0) {
      setError("At least one requirement is needed.")
      return
    }
    router.push(`/tenders/new?id=${tenderId}&step=4`)
  }

  // STEP 4 - REVIEW & FREEZE
  async function handleFreezePack() {
    if (!tenderId || !pack) return
    setFreezing(true)
    const res = await freezeRequirementPack(tenderId, pack.id)
    if (res.success) {
      router.push(`/tenders/${tenderId}`)
    } else {
      setError(res.error || "Failed to freeze pack")
      setFreezing(false)
    }
  }

  const navigateToStep = (step: number) => {
    // Basic navigation guard
    if (step === 2 && !tenderId) return
    if (step === 3 && documents.length === 0) return
    if (step === 4 && requirements.length === 0) return
    if (pack?.status === 'FROZEN') return
    
    router.push(tenderId ? `/tenders/new?id=${tenderId}&step=${step}` : `/tenders/new`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {pack?.status === 'FROZEN' ? 'Tender Workspace Configured' : 'Create Tender'}
        </h1>
        <p className="text-slate-500 mt-1">Set up your procurement evaluation workspace.</p>
        
        {/* Progress Stepper */}
        <div className="mt-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
            
            {[
              { num: 1, label: "Tender Details", enabled: true },
              { num: 2, label: "Documents", enabled: !!tenderId },
              { num: 3, label: "Requirement Pack", enabled: documents.length > 0 },
              { num: 4, label: "Review & Freeze", enabled: requirements.length > 0 }
            ].map(step => {
              const isPast = currentStep > step.num
              const isActive = currentStep === step.num
              const isClickable = step.enabled && pack?.status !== 'FROZEN'
              
              let bgClass = "bg-slate-200 text-slate-500"
              let ringClass = "ring-slate-100"
              
              if (isActive) {
                bgClass = "bg-primary text-white"
                ringClass = "ring-white"
              } else if (isPast) {
                bgClass = "bg-primary text-white"
                ringClass = "ring-white"
              }

              return (
                <button
                  key={step.num}
                  type="button"
                  disabled={!isClickable}
                  onClick={() => navigateToStep(step.num)}
                  className="flex flex-col items-center gap-2 bg-background px-2 group cursor-pointer disabled:cursor-default"
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ring-4 ${bgClass} ${ringClass}`}>
                    {isPast ? <Check className="h-4 w-4 text-white" /> : step.num}
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${isActive || isPast ? 'text-primary' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="h-4 w-4 text-red-600 mt-0.5" />
          {error}
        </div>
      )}

      {/* STEP 1: TENDER DETAILS */}
      {currentStep === 1 && (
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
          <CardHeader className="bg-white border-b border-slate-100 pb-5">
            <CardTitle className="text-lg font-bold text-slate-800">Basic Information</CardTitle>
            <CardDescription>Enter the foundational details for this tender workspace.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitStep1}>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="title" className="text-sm font-semibold text-slate-900">Tender Title *</label>
                  <Input id="title" name="title" defaultValue={tender?.title} placeholder="e.g. Supply of Smart Class Equipment" className={`h-11 bg-white border-slate-200 focus-visible:ring-primary ${formErrors.title ? 'border-red-300 bg-red-50/20' : ''}`} />
                  {formErrors.title && <p className="text-xs font-medium text-red-600 mt-1">{formErrors.title}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="reference_number" className="text-sm font-semibold text-slate-900">Reference Number *</label>
                  <Input id="reference_number" name="reference_number" defaultValue={tender?.reference_number} placeholder="e.g. TNDR/2026/001" className={`h-11 bg-white border-slate-200 focus-visible:ring-primary ${formErrors.reference_number ? 'border-red-300 bg-red-50/20' : ''}`} />
                  {formErrors.reference_number && <p className="text-xs font-medium text-red-600 mt-1">{formErrors.reference_number}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="organization" className="text-sm font-semibold text-slate-900">Organization / Department *</label>
                  <Input id="organization" name="organization" defaultValue={tender?.organization} placeholder="e.g. Ministry of Education" className={`h-11 bg-white border-slate-200 focus-visible:ring-primary ${formErrors.organization ? 'border-red-300 bg-red-50/20' : ''}`} />
                  {formErrors.organization && <p className="text-xs font-medium text-red-600 mt-1">{formErrors.organization}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="description" className="text-sm font-semibold text-slate-900">Description</label>
                  <Textarea id="description" name="description" defaultValue={tender?.description} placeholder="Brief description..." rows={4} className="bg-white border-slate-200 focus-visible:ring-primary min-h-[100px]" />
                </div>
              </div>
            </CardContent>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard')} className="bg-white text-slate-700 h-11 px-6">Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-primary text-white h-11 px-6">
                {loading ? "Saving..." : tenderId ? "Update & Continue" : "Create Workspace"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* STEP 2: DOCUMENTS */}
      {currentStep === 2 && (
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
          <CardHeader className="bg-white border-b border-slate-100 pb-5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Upload Tender Documents</CardTitle>
              <CardDescription>Upload files like NIT, Corrigendum, or BoQ (PDF, DOCX, TXT).</CardDescription>
            </div>
            <div>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-primary hover:bg-[#2563EB] text-white">
                <Upload className="mr-2 h-4 w-4" /> {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {documents.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p>No documents uploaded yet.</p>
                <p className="text-sm mt-1">Upload tender documents to proceed.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700">Document Name</TableHead>
                    <TableHead className="font-semibold text-slate-700">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700">Size</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium text-slate-900">{doc.file_name}</TableCell>
                      <TableCell>{doc.mime_type?.split('/')[1]?.toUpperCase() || 'UNKNOWN'}</TableCell>
                      <TableCell>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</TableCell>
                      <TableCell><Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">{doc.processing_status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveDocument(doc.id, doc.storage_path)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => navigateToStep(1)} className="bg-white h-11 px-6">Back</Button>
            <Button type="button" onClick={proceedToStep3} className="bg-primary text-white h-11 px-6">Continue to Requirement Pack <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </Card>
      )}

      {/* STEP 3: REQUIREMENT PACK */}
      {currentStep === 3 && (
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
          <CardHeader className="bg-white border-b border-slate-100 pb-5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Requirement Pack</CardTitle>
              <CardDescription>Extract and review compliance rules from documents.</CardDescription>
            </div>
            <Button onClick={handleExtractRequirements} disabled={extracting || documents.length === 0} variant="outline" className="border-primary/30 text-primary hover:bg-accent">
              <Play className="mr-2 h-4 w-4" /> {extracting ? "Extracting..." : "Extract Requirements"}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {requirements.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <ShieldCheck className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p>No requirements found.</p>
                <p className="text-sm mt-1">Click &quot;Extract Requirements&quot; to analyze uploaded documents.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700">Requirement</TableHead>
                    <TableHead className="font-semibold text-slate-700">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700">Params</TableHead>
                    <TableHead className="font-semibold text-slate-700">Conf.</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements.map((req) => {
                    const isEditing = editingReq === req.id
                    return (
                      <TableRow key={req.id}>
                        {isEditing ? (
                          <>
                            <TableCell>
                              <Input value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="mb-2" />
                              <Textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                            </TableCell>
                            <TableCell colSpan={3}>
                              <div className="text-sm text-slate-500 italic">Editing in progress...</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleSaveReq(req.id)} className="text-green-600 mr-2"><Check className="h-4 w-4"/></Button>
                              <Button variant="ghost" size="sm" onClick={() => setEditingReq(null)} className="text-red-600"><X className="h-4 w-4"/></Button>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="max-w-xs">
                              <div className="font-semibold text-slate-900">{req.title}</div>
                              <div className="text-sm text-slate-600 truncate">{req.description}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-slate-50">{req.category}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {req.requirement_type === 'THRESHOLD' ? `${req.threshold_operator} ${req.threshold_value} ${req.unit}` : req.requirement_type}
                            </TableCell>
                            <TableCell>
                              {req.confidence ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">HIGH</Badge> : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => { setEditingReq(req.id); setEditForm(req); }}><Edit2 className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteReq(req.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => navigateToStep(2)} className="bg-white h-11 px-6">Back</Button>
            <Button type="button" onClick={proceedToStep4} className="bg-primary text-white h-11 px-6">Continue to Review & Freeze <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </Card>
      )}

      {/* STEP 4: REVIEW & FREEZE */}
      {currentStep === 4 && (
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
          <CardHeader className="bg-slate-50 border-b border-slate-200 pb-5">
            <CardTitle className="text-xl font-bold text-slate-900">Final Review</CardTitle>
            <CardDescription>Review the finalized requirement pack before freezing. Frozen packs cannot be edited.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white border border-slate-200 rounded-xl">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Tender Ref</p>
                <p className="font-semibold text-slate-900">{tender?.reference_number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Documents</p>
                <p className="font-semibold text-slate-900">{documents.length} Uploaded</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Requirements</p>
                <p className="font-semibold text-slate-900">{requirements.length} Extracted</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Pack Version</p>
                <p className="font-semibold text-slate-900">v{pack?.version_number || 1} (DRAFT)</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-800 mb-3">Requirement Summary</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Req</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Mandatory</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requirements.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div className="font-semibold text-slate-900">{req.title}</div>
                        </TableCell>
                        <TableCell>{req.requirement_type}</TableCell>
                        <TableCell>{req.mandatory ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
          </CardContent>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => navigateToStep(3)} className="bg-white h-11 px-6">Back to Requirements</Button>
            <Button type="button" onClick={handleFreezePack} disabled={freezing} className="bg-[#14213D] hover:bg-[#0B1B35] text-white h-11 px-6">
              <Lock className="mr-2 h-4 w-4" /> {freezing ? "Freezing..." : "Freeze Requirement Pack"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function NewTenderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Wizard...</div>}>
      <WizardContent />
    </Suspense>
  )
}
