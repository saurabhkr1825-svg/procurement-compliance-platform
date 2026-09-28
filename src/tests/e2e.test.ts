import { ComplianceEngine } from '../core/engine';
import { MockRequirementExtractionProvider, MockEvidenceExtractionProvider } from '../core/providers/extraction/mock';
import { PanVerificationAdapter, DebarmentVerificationAdapter } from '../core/providers/verification/adapters';
import { DocumentProcessingPipeline } from '../core/pipeline';
import { ComplianceState, VerificationState } from '../core/domain/types';

async function runAcceptanceTest() {
  console.log("=== STARTING ACCEPTANCE TEST ===");

  // 1. Initialize Providers and Engine
  const reqProvider = new MockRequirementExtractionProvider();
  const evProvider = new MockEvidenceExtractionProvider();
  const panVerifier = new PanVerificationAdapter();
  const debarmentVerifier = new DebarmentVerificationAdapter();
  const engine = new ComplianceEngine();
  const pipeline = new DocumentProcessingPipeline();

  // 2. Extract Requirements (Tender Document Pipeline)
  console.log("\n[1] Extracting Requirements...");
  const rawReqs = await reqProvider.extractRequirements("Fake Tender Text");
  
  // Assign dummy IDs
  const requirements = rawReqs.map((req, i) => ({
    ...req,
    id: `REQ-${i}`,
    packVersionId: 'PACK-v1'
  })) as any[];
  
  console.log(`Extracted ${requirements.length} rules. Pack Frozen as v1.`);

  // 3. Bidder Uploads Documents
  console.log("\n[2] Bidder Uploads Documents...");
  await pipeline.processDocument("DOC-123"); // simulates pipeline

  // 4. Extract Evidence
  console.log("\n[3] Extracting Evidence...");
  const evidence = await evProvider.extractEvidence("Fake Bidder Text", requirements);
  console.log(`Extracted ${evidence.length} evidence fields.`);

  // 5. Run Verification Adapters
  console.log("\n[4] Running Verification Adapters...");
  const verifications: import('../core/domain/types').VerificationResult[] = [];
  
  const panEv = evidence.find(e => e.fieldName === 'pan_number');
  if (panEv) {
    const panResult = await panVerifier.verify('PAN', panEv.fieldValue);
    verifications.push(panResult);
    console.log(`PAN Verification: ${panResult.resultStatus}`);
  }

  // Simulate debarment check
  const debarResult = await debarmentVerifier.verify('NAME', 'TechSolutions');
  verifications.push(debarResult);
  console.log(`Debarment Check: ${debarResult.resultStatus}`);

  // 6. Execute Compliance Engine
  console.log("\n[5] Executing Compliance Engine deterministically...");
  const results = requirements.map(req => {
    return engine.evaluateRule(req, evidence, verifications, 'BIDDER-1');
  });

  results.forEach(res => {
    console.log(`-> Req: ${res.requirementId} | State: ${res.state} | Reason: ${res.reason}`);
  });

  // Verify the assertions
  const panRuleResult = results.find(r => r.requirementId === 'REQ-0');
  if (panRuleResult?.state !== ComplianceState.PASS) {
    throw new Error(`Expected PAN to PASS, got ${panRuleResult?.state}`);
  }

  const turnoverRuleResult = results.find(r => r.requirementId === 'REQ-2');
  if (turnoverRuleResult?.state !== ComplianceState.PASS) {
    throw new Error(`Expected Turnover to PASS, got ${turnoverRuleResult?.state}`);
  }

  console.log("\n[6] Mocking Corrigendum (v2)");
  console.log("Updating Turnover rule to 1 Crore (10000000 INR)");
  const newReqs = [...requirements];
  newReqs[2].thresholdValue = 10000000;
  newReqs[2].packVersionId = 'PACK-v2';

  const newTurnoverResult = engine.evaluateRule(newReqs[2], evidence, verifications, 'BIDDER-1');
  console.log(`-> Corrigendum Eval State: ${newTurnoverResult.state} | Reason: ${newTurnoverResult.reason}`);
  
  if (newTurnoverResult.state !== ComplianceState.FAIL) {
    throw new Error(`Expected Corrigendum Turnover to FAIL, got ${newTurnoverResult.state}`);
  }

  console.log("\n=== ACCEPTANCE TEST PASSED ===");
}

runAcceptanceTest().catch(console.error);
