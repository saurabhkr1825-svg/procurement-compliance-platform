export enum AuditAction {
  TENDER_CREATED = 'TENDER_CREATED',
  PACK_FROZEN = 'PACK_FROZEN',
  PACK_CORRIGENDUM_CREATED = 'PACK_CORRIGENDUM_CREATED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  EVIDENCE_EXTRACTED = 'EVIDENCE_EXTRACTED',
  COMPLIANCE_EVALUATED = 'COMPLIANCE_EVALUATED',
  OFFICER_OVERRIDE = 'OFFICER_OVERRIDE',
  FINAL_DECISION_RECORDED = 'FINAL_DECISION_RECORDED',
  REPORT_GENERATED = 'REPORT_GENERATED'
}

export interface AuditEventPayload {
  userId: string;
  tenderId: string;
  bidderId?: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
}

export interface AuditRepository {
  logEvent(payload: AuditEventPayload): Promise<void>;
}

// In Next.js, this would be dependency injected or just import the Supabase client
import { createClient } from '@/utils/supabase/server';

export class AuditService {
  async logEvent(payload: AuditEventPayload): Promise<void> {
    const supabase = await createClient();
    
    await supabase.from('audit_logs').insert({
      user_id: payload.userId,
      tender_id: payload.tenderId,
      bidder_id: payload.bidderId,
      action: payload.action,
      metadata: payload.metadata
    });
  }
}
