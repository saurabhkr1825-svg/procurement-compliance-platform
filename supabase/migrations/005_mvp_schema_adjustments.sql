-- 005_mvp_schema_adjustments.sql

-- 1. requirement_pack_versions
CREATE TABLE requirement_pack_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FROZEN')),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tender_id, version_number)
);

-- Alter requirements to reference pack version
ALTER TABLE requirements 
ADD COLUMN pack_version_id UUID REFERENCES requirement_pack_versions(id) ON DELETE CASCADE;

-- 2. Modify compliance_results constraint for the 4 PRD states
ALTER TABLE compliance_results DROP CONSTRAINT IF EXISTS compliance_results_result_check;
ALTER TABLE compliance_results ADD CONSTRAINT compliance_results_result_check CHECK (result IN ('PASS', 'FAIL', 'REVIEW', 'NOT VERIFIED'));

-- Add pack_version_id to compliance_results so results tie to a specific version
ALTER TABLE compliance_results ADD COLUMN pack_version_id UUID REFERENCES requirement_pack_versions(id) ON DELETE CASCADE;

-- 3. Add file hash column to documents
ALTER TABLE tender_documents ADD COLUMN file_hash TEXT;
ALTER TABLE bidder_documents ADD COLUMN file_hash TEXT;

-- 4. verification_results
CREATE TABLE verification_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bidder_id UUID NOT NULL REFERENCES bidders(id) ON DELETE CASCADE,
    document_id UUID REFERENCES bidder_documents(id) ON DELETE SET NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('SIMULATED', 'LIVE', 'MANUAL')),
    source_name TEXT NOT NULL, -- e.g., 'PAN_SIMULATOR'
    identifier_type TEXT NOT NULL, -- e.g., 'PAN'
    identifier_value TEXT NOT NULL,
    result_status TEXT NOT NULL CHECK (result_status IN ('VERIFIED', 'NOT VERIFIED', 'CONFLICT')),
    verified_data JSONB, -- The structured data returned by source
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 5. decisions
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bidder_id UUID NOT NULL REFERENCES bidders(id) ON DELETE CASCADE,
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('QUALIFIED', 'DISQUALIFIED', 'REQUIRES_CLARIFICATION')),
    summary TEXT,
    officer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bidder_id) -- one final decision per bidder
);

-- 6. reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    bidder_id UUID REFERENCES bidders(id) ON DELETE CASCADE,
    pack_version_id UUID REFERENCES requirement_pack_versions(id) ON DELETE SET NULL,
    report_hash TEXT,
    content_url TEXT,
    generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_req_pack_versions_tender_id ON requirement_pack_versions(tender_id);
CREATE INDEX idx_verification_results_bidder_id ON verification_results(bidder_id);
CREATE INDEX idx_decisions_tender_id ON decisions(tender_id);
CREATE INDEX idx_reports_tender_id ON reports(tender_id);
