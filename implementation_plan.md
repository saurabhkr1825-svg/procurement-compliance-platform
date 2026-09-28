# Revised Implementation Plan: Bid Compliance Copilot MVP

## 1. Clean Architecture Boundaries
To avoid a monolithic Next.js setup with scattered logic, the codebase will be strictly layered:
- **UI Layer (`src/app`, `src/components`)**: React components and Next.js pages strictly for presentation.
- **Server/API Layer (`src/app/api`, `src/actions`)**: Thin handlers that solely parse requests and invoke services.
- **Domain/Business Logic (`src/core/services`)**: Orchestrates the workflows (Tenders, Bidders, Review).
- **Deterministic Compliance Engine (`src/core/engine`)**: Isolated, pure logic engine evaluating evidence against rules.
- **Document Processing (`src/core/pipeline`)**: State-machine-based pipeline modeling real processing states.
- **Extraction Providers (`src/core/providers/extraction`)**: Abstracted LLM interfaces for requirement and evidence extraction.
- **Verification Adapters (`src/core/providers/verification`)**: Abstracted verification APIs.
- **Database/Repository Layer (`src/core/repositories`)**: Encapsulates all Supabase queries. No raw Supabase calls inside UI components.
- **Audit/Reporting (`src/core/services/audit.ts`)**: Centralized semantic audit logging.

## 2. Extraction Provider Abstraction
- Define interfaces: `RequirementExtractionProvider` and `EvidenceExtractionProvider`.
- Implement `MockRequirementExtractionProvider` and `MockEvidenceExtractionProvider`.
- The mocks will return structured, schema-valid data conforming strictly to the expected LLM JSON schema outputs, ensuring easy swap-in for a live LLM adapter later.

## 3. Verification Adapters
- Define `VerificationAdapter` interface.
- Implement:
  - `PanVerificationAdapter`
  - `GstinVerificationAdapter`
  - `UdyamVerificationAdapter`
  - `DebarmentVerificationAdapter`
  - `ManualVerificationAdapter`
- All results will enforce strict provenance tagging (`SIMULATED`, `MANUAL`) in the output, which will be preserved in the DB and UI.

## 4. Canonical Compliance States
- Define a global TypeScript Enum/Type: `ComplianceState` with exactly: `PASS`, `FAIL`, `REVIEW`, `NOT_VERIFIED`.
- Ensure the database schema, compliance engine output, APIs, and UI strictly adhere to this nomenclature (updating previous schema from 'NOT VERIFIED' to 'NOT_VERIFIED').

## 5. Isolated Deterministic Rule Engine
- **Input**: 
  - `RequirementPackVersion`
  - `ExtractedBidderEvidence`
  - `VerificationResults`
- **Output**: 
  - `ComplianceResult` (requirement_id, state, reason, evidence references, rule version, evaluated_at).
- **Execution**: The engine will run purely deterministically in backend TypeScript based on structured rules.

## 6. Audit System
- Implement an `AuditService` that logs events to the `audit_logs` table (or semantic `audit_events` if renamed).
- Ensure every state transition (Tender creation, Document upload, Pack Frozen, Result Evaluated, Officer Override, Final Decision) triggers an event.

## 7. Corrigendum & Versioning
- Requirement Packs will be explicitly versioned (`v1`, `v2`).
- `Freeze` action locks a version.
- `Corrigendum` action creates `v{N+1}` referencing the previous.
- The Compliance Engine explicitly maps its `ComplianceResult` to the evaluated Requirement Pack version ID.

## 8. Robust Demo Data Seed
The `seed.ts` will be updated to deterministically generate a full spectrum of compliance states:
1. **Fully Compliant Bidder** (`PASS`)
2. **PAN/GSTIN Conflict** (`REVIEW` or `FAIL`)
3. **Turnover Below Threshold** (`FAIL`)
4. **Missing Required Document** (`FAIL` or `REVIEW`)
5. **Ambiguous OEM Authorization** (`REVIEW` - low confidence mock OCR)
6. **Simulated Debarment Result** (`FAIL`)
7. **Unavailable Verification Source** (`NOT_VERIFIED`)
8. **Corrigendum Impact**: A requirement change (e.g. Turnover threshold increased) that triggers a re-evaluation resulting in a state change.
9. **Officer Override**: Pre-logged manual override.
10. **Final Decision**: Pre-logged final officer decisions.

## 9. Real Document Processing Pipeline
- Instead of instant UI tricks, the backend will model a real state flow:
  `UPLOADED` → `HASHED` → `EXTRACTING_TEXT` → `EXTRACTING_FIELDS` → `VALIDATING` → `COMPLETED`/`FAILED`.
- The database will track these states, and the UI will poll or subscribe to them.

## 10. UI Transparency (No False Claims)
- Strict badging across all screens: `SIMULATED SOURCE`, `AI-EXTRACTED`, `MANUAL VERIFICATION`.
- Never claim "Government Verified" for simulated data.
- UI elements will explicitly show the provenance trail for all evidence.

## 11. Acceptance Test / E2E Flow
The implementation will guarantee this sequence works end-to-end:
1. Create Tender & Upload Docs.
2. Trigger Pipeline (Extract Requirements).
3. Review & Freeze Pack (v1).
4. Add Bidder & Upload Docs.
5. Trigger Pipeline (Extract Evidence).
6. Run Verification Adapters.
7. Execute Compliance Engine.
8. Inspect Compliance Matrix & Evidence Viewer.
9. Resolve Review Queue Items & Perform Overrides.
10. Record Final Officer Decision.
11. Generate immutable Report & View Audit Timeline.
12. Create Corrigendum (v2) and observe re-evaluation.
