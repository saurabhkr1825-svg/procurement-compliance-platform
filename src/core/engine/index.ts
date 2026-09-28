import { 
  Requirement, 
  ExtractedEvidence, 
  VerificationResult, 
  ComplianceResult, 
  ComplianceState,
  VerificationState
} from '../domain/types';

export class ComplianceEngine {
  
  /**
   * Evaluates a single requirement against provided evidence and verifications.
   * Completely isolated from UI or DB layers. Pure deterministic function.
   */
  public evaluateRule(
    requirement: Requirement,
    evidenceItems: ExtractedEvidence[],
    verifications: VerificationResult[],
    bidderId: string
  ): Omit<ComplianceResult, 'evaluatedAt'> {
    
    // Default fallback
    let state = ComplianceState.NOT_VERIFIED;
    let reason = 'System error in evaluation logic';
    let finalEvidence = '';
    
    // Find relevant evidence (in a real system, we map requirement categories to field names)
    // For MVP, we use naive matching by requirement type & category
    const relevantEvidence = this.matchEvidenceToRequirement(requirement, evidenceItems);
    
    if (!relevantEvidence && requirement.mandatory) {
      return {
        requirementId: requirement.id,
        packVersionId: requirement.packVersionId,
        bidderId,
        state: ComplianceState.FAIL,
        reason: 'Required evidence missing from uploaded documents',
        evidence: 'NONE'
      };
    }

    if (relevantEvidence) {
      finalEvidence = relevantEvidence.fieldValue;
      
      // AI Confidence flag check
      if (relevantEvidence.confidence < 0.70) {
        return {
          requirementId: requirement.id,
          packVersionId: requirement.packVersionId,
          bidderId,
          state: ComplianceState.REVIEW,
          reason: `AI extraction confidence too low (${(relevantEvidence.confidence * 100).toFixed(0)}%). Manual review required.`,
          evidence: finalEvidence,
          confidence: relevantEvidence.confidence
        };
      }

      // Check Verification if it's a DOCUMENT type (like PAN/GSTIN)
      if (requirement.requirementType === 'DOCUMENT') {
        const verification = verifications.find(v => v.identifierValue === relevantEvidence.fieldValue);
        
        if (!verification) {
          state = ComplianceState.NOT_VERIFIED;
          reason = 'Evidence extracted but verification source was unavailable or not run.';
        } else if (verification.resultStatus === VerificationState.CONFLICT) {
          state = ComplianceState.REVIEW;
          reason = 'Verification source returned conflicting information. Requires human review.';
        } else if (verification.resultStatus === VerificationState.NOT_VERIFIED) {
          state = ComplianceState.FAIL;
          reason = `Verification failed. Source: ${verification.sourceName} rejected the identifier.`;
        } else {
          state = ComplianceState.PASS;
          reason = `Evidence matches and was verified against ${verification.sourceName}.`;
        }
      } 
      // Check Threshold rule (like Annual Turnover)
      else if (requirement.requirementType === 'THRESHOLD') {
        const numericValue = parseFloat(relevantEvidence.fieldValue.replace(/[^0-9.-]+/g,""));
        const threshold = requirement.thresholdValue || 0;
        
        if (isNaN(numericValue)) {
          state = ComplianceState.REVIEW;
          reason = 'Extracted value could not be parsed as a number.';
        } else if (numericValue >= threshold) {
          state = ComplianceState.PASS;
          reason = `Extracted value (${numericValue}) meets threshold (>= ${threshold}).`;
        } else {
          state = ComplianceState.FAIL;
          reason = `Extracted value (${numericValue}) is strictly less than threshold (${threshold}).`;
        }
      }
      else {
        // Fallback for generic text matches if any
        state = ComplianceState.REVIEW;
        reason = 'No deterministic rule pathway found for this requirement type. Manual review required.';
      }
    }

    return {
      requirementId: requirement.id,
      packVersionId: requirement.packVersionId,
      bidderId,
      state,
      reason,
      evidence: finalEvidence,
      confidence: relevantEvidence?.confidence
    };
  }

  private matchEvidenceToRequirement(req: Requirement, evidence: ExtractedEvidence[]): ExtractedEvidence | undefined {
    // Naive matching for MVP. In reality, LLM extracts directly keyed to requirement ID, or we map it.
    if (req.title.toLowerCase().includes('pan')) return evidence.find(e => e.fieldName === 'pan_number');
    if (req.title.toLowerCase().includes('gstin')) return evidence.find(e => e.fieldName === 'gstin_number');
    if (req.title.toLowerCase().includes('turnover')) return evidence.find(e => e.fieldName === 'annual_turnover');
    if (req.title.toLowerCase().includes('oem')) return evidence.find(e => e.fieldName === 'oem_authorization');
    return undefined;
  }
}
