import { ExtractedEvidence, Requirement } from '../../domain/types';

export interface RequirementExtractionProvider {
  /**
   * Extracts formal structured requirements from a tender document's raw text.
   */
  extractRequirements(documentText: string): Promise<Partial<Requirement>[]>;
}

export interface EvidenceExtractionProvider {
  /**
   * Extracts evidence fields corresponding to a set of requirements from bidder documents.
   */
  extractEvidence(documentText: string, requirements: Requirement[]): Promise<ExtractedEvidence[]>;
}
