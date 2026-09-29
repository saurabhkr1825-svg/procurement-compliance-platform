import { ExtractedEvidence, Requirement } from '../../domain/types';
import { RequirementExtractionProvider, EvidenceExtractionProvider } from './index';

/**
 * Mock provider that returns deterministic structured data.
 * Adheres to the interface to allow swapping with an LLM implementation later.
 */
export class MockRequirementExtractionProvider implements RequirementExtractionProvider {
  async extractRequirements(_documentText: string /* eslint-disable-line @typescript-eslint/no-unused-vars */): Promise<Partial<Requirement>[]> {
    // Simulate AI extraction delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return [
      {
        title: 'Valid PAN Registration',
        description: 'Bidder must possess a valid PAN registered with Income Tax Department.',
        category: 'LEGAL',
        requirementType: 'DOCUMENT',
        mandatory: true
      },
      {
        title: 'Valid GSTIN Registration',
        description: 'Bidder must possess a valid GSTIN.',
        category: 'LEGAL',
        requirementType: 'DOCUMENT',
        mandatory: true
      },
      {
        title: 'Annual Turnover',
        description: 'Average annual financial turnover during the last 3 years should be at least Rs. 50 Lakhs.',
        category: 'FINANCIAL',
        requirementType: 'THRESHOLD',
        mandatory: true,
        thresholdValue: 5000000,
        thresholdOperator: '>=',
        unit: 'INR'
      }
    ];
  }
}

export class MockEvidenceExtractionProvider implements EvidenceExtractionProvider {
  async extractEvidence(_documentText: string  , _requirements: Requirement[] /* eslint-disable-line @typescript-eslint/no-unused-vars */): Promise<ExtractedEvidence[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For the mock, we just return static mock evidence that matches the typical requirements
    return [
      {
        fieldName: 'pan_number',
        fieldValue: 'ABCDE1234F',
        confidence: 0.98,
        sourceText: 'Permanent Account Number: ABCDE1234F',
        pageNumber: 1
      },
      {
        fieldName: 'gstin_number',
        fieldValue: '27ABCDE1234F1Z5',
        confidence: 0.95,
        sourceText: 'GSTIN: 27ABCDE1234F1Z5',
        pageNumber: 1
      },
      {
        fieldName: 'annual_turnover',
        fieldValue: '7500000',
        confidence: 0.85,
        sourceText: 'Turnover for FY 2024-25 is Rs. 75 Lakhs.',
        pageNumber: 2
      }
    ];
  }
}
