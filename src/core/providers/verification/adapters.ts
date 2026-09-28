import { VerificationAdapter } from './index';
import { VerificationResult, VerificationProvenance, VerificationState } from '../../domain/types';

export class PanVerificationAdapter implements VerificationAdapter {
  sourceName = 'PAN_REGISTRY_API';
  sourceType = VerificationProvenance.SIMULATED;

  async verify(identifierType: string, identifierValue: string): Promise<VerificationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock logic: ABCDE1234F passes, BADPAN123 fails
    const isValid = identifierValue === 'ABCDE1234F' || identifierValue.length === 10;
    
    return {
      sourceType: this.sourceType,
      sourceName: this.sourceName,
      identifierType,
      identifierValue,
      resultStatus: isValid ? VerificationState.VERIFIED : VerificationState.NOT_VERIFIED,
      verifiedData: isValid ? { name: 'TechSolutions India Pvt Ltd', status: 'Active' } : null
    };
  }
}

export class GstinVerificationAdapter implements VerificationAdapter {
  sourceName = 'GSTN_PORTAL_API';
  sourceType = VerificationProvenance.SIMULATED;

  async verify(identifierType: string, identifierValue: string): Promise<VerificationResult> {
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock conflict: A specific GSTIN returns conflict to demonstrate edge case
    if (identifierValue === 'CONFLICT_GSTIN') {
      return {
        sourceType: this.sourceType,
        sourceName: this.sourceName,
        identifierType,
        identifierValue,
        resultStatus: VerificationState.CONFLICT,
        verifiedData: { name: 'Different Company Ltd', status: 'Suspended' }
      };
    }

    const isValid = identifierValue.startsWith('27') && identifierValue.length === 15;
    
    return {
      sourceType: this.sourceType,
      sourceName: this.sourceName,
      identifierType,
      identifierValue,
      resultStatus: isValid ? VerificationState.VERIFIED : VerificationState.NOT_VERIFIED,
      verifiedData: isValid ? { legalName: 'TechSolutions India Pvt Ltd', status: 'Active' } : null
    };
  }
}

export class DebarmentVerificationAdapter implements VerificationAdapter {
  sourceName = 'CENTRAL_DEBARMENT_REGISTRY';
  sourceType = VerificationProvenance.SIMULATED;

  async verify(identifierType: string, identifierValue: string): Promise<VerificationResult> {
    // Simulate failing debarment check for demonstration
    if (identifierValue === 'DEBARRED_COMP') {
      return {
        sourceType: this.sourceType,
        sourceName: this.sourceName,
        identifierType,
        identifierValue,
        resultStatus: VerificationState.NOT_VERIFIED, // Not verified to be clean
        verifiedData: { status: 'DEBARRED', reason: 'Fraudulent practices in 2023' }
      };
    }
    
    return {
      sourceType: this.sourceType,
      sourceName: this.sourceName,
      identifierType,
      identifierValue,
      resultStatus: VerificationState.VERIFIED, // Verified clean
      verifiedData: { status: 'CLEAN' }
    };
  }
}
