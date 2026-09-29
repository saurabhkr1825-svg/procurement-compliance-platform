import { VerificationResult, VerificationProvenance } from '../../domain/types';

export interface VerificationAdapter {
  sourceName: string;
  sourceType: VerificationProvenance;
  
  /**
   * Verifies an identifier against the target source.
   */
  verify(identifierType: string, identifierValue: string): Promise<VerificationResult>;
}
