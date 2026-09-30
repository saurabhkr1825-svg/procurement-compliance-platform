"use server"

import { createClient } from "@/utils/supabase/server"
import { MockRequirementExtractionProvider } from "@/core/providers/extraction/mock"
import { revalidatePath } from "next/cache"

export async function uploadTenderDocument(tenderId: string, formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return { error: "No file provided" };
  const supabase = await createClient();
  
  // Using the path expected by RLS policies
  const path = `${tenderId}/${Date.now()}_${file.name}`;
  
  const { error: uploadError } = await supabase.storage.from('tender-documents').upload(path, file);
  if (uploadError) return { error: uploadError.message };
  
  const { data, error } = await supabase.from('tender_documents').insert({
    tender_id: tenderId,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    storage_path: path,
    processing_status: 'UPLOADED'
  }).select().single();
  
  if (error) return { error: error.message };
  
  revalidatePath(`/tenders/new`);
  return { data };
}

export async function removeTenderDocument(docId: string, path: string) {
  const supabase = await createClient();
  await supabase.storage.from('tender-documents').remove([path]);
  const { error } = await supabase.from('tender_documents').delete().eq('id', docId);
  if (error) return { error: error.message };
  
  revalidatePath(`/tenders/new`);
  return { success: true };
}

export async function extractRequirements(tenderId: string) {
  const supabase = await createClient();
  const { data: docs } = await supabase.from('tender_documents').select('*').eq('tender_id', tenderId);
  if (!docs || docs.length === 0) return { error: "No documents available for extraction" };
  
  const provider = new MockRequirementExtractionProvider();
  const reqs = await provider.extractRequirements("MOCK TEXT");
  
  let { data: pack } = await supabase.from('requirement_pack_versions').select('*').eq('tender_id', tenderId).eq('status', 'DRAFT').order('version_number', { ascending: false }).limit(1).single();
  
  const { data: user } = await supabase.auth.getUser();
  if (!pack) {
    const { data: latestPack } = await supabase.from('requirement_pack_versions').select('version_number').eq('tender_id', tenderId).order('version_number', { ascending: false }).limit(1).maybeSingle();
    const nextVersion = latestPack ? latestPack.version_number + 1 : 1;
    const { data: newPack, error: packError } = await supabase.from('requirement_pack_versions').insert({
      tender_id: tenderId,
      version_number: nextVersion,
      status: 'DRAFT',
      created_by: user.user?.id || ''
    }).select().single();
    if (packError) return { error: packError.message };
    pack = newPack;
  }
  
  await supabase.from('requirements').delete().eq('pack_version_id', pack.id);
  
  const insertData = reqs.map(req => ({
    tender_id: tenderId,
    pack_version_id: pack.id,
    title: req.title,
    description: req.description,
    category: req.category,
    requirement_type: req.requirementType,
    mandatory: req.mandatory,
    threshold_value: req.thresholdValue,
    threshold_operator: req.thresholdOperator,
    unit: req.unit,
    confidence: 0.95
  }));
  
  const { error: insertError } = await supabase.from('requirements').insert(insertData);
  if (insertError) return { error: insertError.message };
  
  revalidatePath(`/tenders/new`);
  return { success: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateRequirement(reqId: string, updates: any) {
  const supabase = await createClient();
  const { error } = await supabase.from('requirements').update(updates).eq('id', reqId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteRequirement(reqId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('requirements').delete().eq('id', reqId);
  if (error) return { error: error.message };
  return { success: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addRequirement(tenderId: string, packId: string, req: any) {
  const supabase = await createClient();
  const { error } = await supabase.from('requirements').insert({ ...req, tender_id: tenderId, pack_version_id: packId });
  if (error) return { error: error.message };
  return { success: true };
}

export async function freezeRequirementPack(tenderId: string, packId: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const { error } = await supabase.from('requirement_pack_versions').update({ status: 'FROZEN' }).eq('id', packId);
  if (error) return { error: error.message };
  
  await supabase.from('audit_logs').insert({
    user_id: user.user?.id,
    tender_id: tenderId,
    action: 'REQUIREMENT_PACK_FROZEN',
    metadata: { pack_version_id: packId }
  });
  return { success: true };
}
