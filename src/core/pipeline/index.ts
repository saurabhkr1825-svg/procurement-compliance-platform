export enum ProcessingState {
  UPLOADED = 'UPLOADED',
  HASHED = 'HASHED',
  EXTRACTING_TEXT = 'EXTRACTING_TEXT',
  EXTRACTING_FIELDS = 'EXTRACTING_FIELDS',
  VALIDATING = 'VALIDATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export class DocumentProcessingPipeline {
  /**
   * Simulates the async pipeline for document processing
   */
  async processDocument(documentId: string): Promise<void> {
    // In a real system, this pushes a job to Redis/Celery.
    // For MVP, we simulate the state transitions linearly.
    
    await this.updateState(documentId, ProcessingState.HASHED);
    await new Promise(r => setTimeout(r, 500));
    
    await this.updateState(documentId, ProcessingState.EXTRACTING_TEXT);
    await new Promise(r => setTimeout(r, 1000));
    
    await this.updateState(documentId, ProcessingState.EXTRACTING_FIELDS);
    // Call MockEvidenceExtractionProvider here...
    await new Promise(r => setTimeout(r, 1000));

    await this.updateState(documentId, ProcessingState.VALIDATING);
    await new Promise(r => setTimeout(r, 500));
    
    await this.updateState(documentId, ProcessingState.COMPLETED);
  }

  private async updateState(documentId: string, state: ProcessingState): Promise<void> {
    // Update DB state
    console.log(`[Pipeline] Doc ${documentId} -> ${state}`);
  }
}
