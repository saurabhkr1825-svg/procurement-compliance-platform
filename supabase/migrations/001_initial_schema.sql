-- 001_initial_schema.sql

-- profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    organization TEXT,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- tenders
CREATE TABLE tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    reference_number TEXT,
    description TEXT,
    organization TEXT,
    submission_deadline TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED')),
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- tender_documents
CREATE TABLE tender_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT,
    file_size BIGINT,
    processing_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (processing_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    page_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- requirements
CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    requirement_type TEXT CHECK (requirement_type IN ('THRESHOLD', 'BOOLEAN', 'DOCUMENT', 'TEXT_MATCH', 'DATE', 'TECHNICAL', 'EXPERIENCE', 'OTHER')),
    mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    threshold_value NUMERIC,
    threshold_operator TEXT,
    unit TEXT,
    source_document_id UUID REFERENCES tender_documents(id) ON DELETE SET NULL,
    source_page INTEGER,
    source_text TEXT,
    confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- bidders
CREATE TABLE bidders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE RESTRICT,
    legal_name TEXT NOT NULL,
    trade_name TEXT,
    registration_number TEXT,
    address TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- bidder_documents
CREATE TABLE bidder_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bidder_id UUID NOT NULL REFERENCES bidders(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT,
    file_size BIGINT,
    document_type TEXT CHECK (document_type IN ('GST_CERTIFICATE', 'PAN', 'UDYAM', 'FINANCIAL_STATEMENT', 'CA_CERTIFICATE', 'EXPERIENCE_CERTIFICATE', 'OEM_AUTHORIZATION', 'TECHNICAL_DATASHEET', 'WORK_ORDER', 'DECLARATION', 'OTHER')),
    processing_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (processing_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    page_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- extracted_fields
CREATE TABLE extracted_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES bidder_documents(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_value TEXT,
    normalized_value TEXT,
    data_type TEXT,
    page_number INTEGER,
    source_text TEXT,
    confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- compliance_results
CREATE TABLE compliance_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE RESTRICT,
    bidder_id UUID NOT NULL REFERENCES bidders(id) ON DELETE RESTRICT,
    result TEXT NOT NULL CHECK (result IN ('COMPLIANT', 'NON_COMPLIANT', 'MISSING', 'REVIEW_REQUIRED', 'NOT_APPLICABLE')),
    confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
    reason TEXT,
    evidence TEXT,
    evidence_document_id UUID REFERENCES bidder_documents(id) ON DELETE SET NULL,
    evidence_page INTEGER,
    ai_result TEXT,
    officer_result TEXT,
    officer_remark TEXT,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- risk_flags
CREATE TABLE risk_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bidder_id UUID NOT NULL REFERENCES bidders(id) ON DELETE RESTRICT,
    requirement_id UUID REFERENCES requirements(id) ON DELETE SET NULL,
    risk_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
    title TEXT NOT NULL,
    description TEXT,
    evidence TEXT,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    tender_id UUID REFERENCES tenders(id) ON DELETE SET NULL,
    bidder_id UUID REFERENCES bidders(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tenders_created_by ON tenders(created_by);
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tenders_created_at ON tenders(created_at);

CREATE INDEX idx_tender_documents_tender_id ON tender_documents(tender_id);

CREATE INDEX idx_requirements_tender_id ON requirements(tender_id);

CREATE INDEX idx_bidders_tender_id ON bidders(tender_id);

CREATE INDEX idx_bidder_documents_bidder_id ON bidder_documents(bidder_id);

CREATE INDEX idx_extracted_fields_document_id ON extracted_fields(document_id);

CREATE INDEX idx_compliance_results_req_id ON compliance_results(requirement_id);
CREATE INDEX idx_compliance_results_bidder_id ON compliance_results(bidder_id);

CREATE INDEX idx_risk_flags_bidder_id ON risk_flags(bidder_id);

CREATE INDEX idx_audit_logs_tender_id ON audit_logs(tender_id);
CREATE INDEX idx_audit_logs_bidder_id ON audit_logs(bidder_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
