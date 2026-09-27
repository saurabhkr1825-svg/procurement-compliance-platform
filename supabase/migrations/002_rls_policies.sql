-- 002_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bidders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bidder_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can access their own profile" 
ON profiles FOR ALL 
USING (id = auth.uid());

-- tenders
CREATE POLICY "Users can access their own tenders" 
ON tenders FOR ALL 
USING (created_by = auth.uid());

-- tender_documents
CREATE POLICY "Users can access documents for their tenders" 
ON tender_documents FOR ALL 
USING (tender_id IN (SELECT id FROM tenders WHERE created_by = auth.uid()));

-- requirements
CREATE POLICY "Users can access requirements for their tenders" 
ON requirements FOR ALL 
USING (tender_id IN (SELECT id FROM tenders WHERE created_by = auth.uid()));

-- bidders
CREATE POLICY "Users can access bidders for their tenders" 
ON bidders FOR ALL 
USING (tender_id IN (SELECT id FROM tenders WHERE created_by = auth.uid()));

-- bidder_documents
CREATE POLICY "Users can access bidder documents for their tenders" 
ON bidder_documents FOR ALL 
USING (bidder_id IN (
    SELECT id FROM bidders WHERE tender_id IN (
        SELECT id FROM tenders WHERE created_by = auth.uid()
    )
));

-- extracted_fields
CREATE POLICY "Users can access extracted fields for their tenders" 
ON extracted_fields FOR ALL 
USING (document_id IN (
    SELECT id FROM bidder_documents WHERE bidder_id IN (
        SELECT id FROM bidders WHERE tender_id IN (
            SELECT id FROM tenders WHERE created_by = auth.uid()
        )
    )
));

-- compliance_results
CREATE POLICY "Users can access compliance results for their tenders" 
ON compliance_results FOR ALL 
USING (bidder_id IN (
    SELECT id FROM bidders WHERE tender_id IN (
        SELECT id FROM tenders WHERE created_by = auth.uid()
    )
));

-- risk_flags
CREATE POLICY "Users can access risk flags for their tenders" 
ON risk_flags FOR ALL 
USING (bidder_id IN (
    SELECT id FROM bidders WHERE tender_id IN (
        SELECT id FROM tenders WHERE created_by = auth.uid()
    )
));

-- audit_logs
CREATE POLICY "Users can access audit logs for their tenders" 
ON audit_logs FOR ALL 
USING (tender_id IN (SELECT id FROM tenders WHERE created_by = auth.uid()));
