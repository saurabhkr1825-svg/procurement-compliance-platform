export enum ComplianceState {
  PASS = 'PASS',
  FAIL = 'FAIL',
  REVIEW = 'REVIEW',
  NOT_VERIFIED = 'NOT_VERIFIED'
}

export enum VerificationState {
  VERIFIED = 'VERIFIED',
  NOT_VERIFIED = 'NOT_VERIFIED',
  CONFLICT = 'CONFLICT'
}

export enum VerificationProvenance {
  SIMULATED = 'SIMULATED',
  MANUAL = 'MANUAL',
  LIVE = 'LIVE' // For future live government integrations
}

export interface VerificationResult {
  sourceType: VerificationProvenance;
  sourceName: string;
  identifierType: string;
  identifierValue: string;
  resultStatus: VerificationState;
  verifiedData?: any; /* eslint-disable-line @typescript-eslint/no-explicit-any */
}

export interface ExtractedEvidence {
  fieldName: string;
  fieldValue: string;
  confidence: number;
  sourceText?: string;
  pageNumber?: number;
}

export interface Requirement {
  id: string;
  packVersionId: string;
  title: string;
  description: string;
  category: string;
  requirementType: 'THRESHOLD' | 'BOOLEAN' | 'DOCUMENT' | 'TEXT_MATCH' | 'DATE' | 'TECHNICAL' | 'EXPERIENCE' | 'OTHER';
  mandatory: boolean;
  thresholdValue?: number;
  thresholdOperator?: string;
  unit?: string;
}

export interface ComplianceResult {
  requirementId: string;
  packVersionId: string;
  bidderId: string;
  state: ComplianceState;
  reason: string;
  evidence: string;
  confidence?: number;
  evidenceDocumentId?: string;
  evaluatedAt: Date;
}
