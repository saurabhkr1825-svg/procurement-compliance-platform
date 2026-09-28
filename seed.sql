-- Revised seed.sql incorporating all edge cases for PRD

DO $$
DECLARE
    v_user_id UUID;
    v_tender_id UUID;
    v_req_pack_v1 UUID;
    v_req_pack_v2 UUID;
    v_req1 UUID; v_req2 UUID; v_req3 UUID; v_req4 UUID; v_req5 UUID;
    v_bidder1 UUID; v_bidder2 UUID; v_bidder3 UUID;
    v_doc1 UUID; v_doc2 UUID; v_doc3 UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'demo@gmail.com' LIMIT 1;
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Demo user not found';
    END IF;

    -- Clean slate
    DELETE FROM public.audit_logs;
    DELETE FROM public.compliance_results;
    DELETE FROM public.verification_results;
    DELETE FROM public.extracted_fields;
    DELETE FROM public.bidder_documents;
    DELETE FROM public.decisions;
    DELETE FROM public.requirements;
    DELETE FROM public.requirement_pack_versions;
    DELETE FROM public.bidders;
    DELETE FROM public.tender_documents;
    DELETE FROM public.tenders;

    -- 1. Create Tender
    INSERT INTO public.tenders (title, reference_number, description, organization, status, created_by) 
    VALUES ('Supply of Smart Class Equipment', 'TNDR/2026/001', 'Smart classrooms equipment.', 'Ministry of Education', 'ACTIVE', v_user_id) 
    RETURNING id INTO v_tender_id;

    -- 2. Create Requirement Pack Version 1 (FROZEN)
    INSERT INTO public.requirement_pack_versions (tender_id, version_number, status, created_by) 
    VALUES (v_tender_id, 1, 'FROZEN', v_user_id) RETURNING id INTO v_req_pack_v1;

    -- Create requirements
    INSERT INTO public.requirements (tender_id, pack_version_id, title, description, category, requirement_type, mandatory) 
    VALUES (v_tender_id, v_req_pack_v1, 'Valid PAN', 'Bidder must possess a valid PAN.', 'LEGAL', 'DOCUMENT', true) RETURNING id INTO v_req1;
    
    INSERT INTO public.requirements (tender_id, pack_version_id, title, description, category, requirement_type, mandatory) 
    VALUES (v_tender_id, v_req_pack_v1, 'Valid GSTIN', 'Bidder must possess a valid GSTIN.', 'LEGAL', 'DOCUMENT', true) RETURNING id INTO v_req2;
    
    INSERT INTO public.requirements (tender_id, pack_version_id, title, description, category, requirement_type, mandatory, threshold_value, threshold_operator, unit) 
    VALUES (v_tender_id, v_req_pack_v1, 'Annual Turnover', 'Turnover >= 50 Lakhs.', 'FINANCIAL', 'THRESHOLD', true, 5000000, '>=', 'INR') RETURNING id INTO v_req3;

    INSERT INTO public.requirements (tender_id, pack_version_id, title, description, category, requirement_type, mandatory) 
    VALUES (v_tender_id, v_req_pack_v1, 'OEM Authorization', 'Bidder must be an OEM.', 'TECHNICAL', 'DOCUMENT', true) RETURNING id INTO v_req4;

    INSERT INTO public.requirements (tender_id, pack_version_id, title, description, category, requirement_type, mandatory) 
    VALUES (v_tender_id, v_req_pack_v1, 'No Debarment', 'Not debarred.', 'LEGAL', 'DOCUMENT', true) RETURNING id INTO v_req5;

    -- 3. Create Bidder 1 (The Perfect Bidder - PASS)
    INSERT INTO public.bidders (tender_id, legal_name, registration_number) 
    VALUES (v_tender_id, 'TechSolutions India Pvt Ltd', 'REG123') RETURNING id INTO v_bidder1;
    
    INSERT INTO public.bidder_documents (bidder_id, file_name, storage_path, document_type, processing_status) 
    VALUES (v_bidder1, 'PAN.pdf', v_bidder1 || '/PAN.pdf', 'PAN', 'COMPLETED') RETURNING id INTO v_doc1;

    INSERT INTO public.verification_results (bidder_id, document_id, source_type, source_name, identifier_type, identifier_value, result_status, verified_by) 
    VALUES (v_bidder1, v_doc1, 'SIMULATED', 'PAN_REGISTRY', 'PAN', 'ABCDE1234F', 'VERIFIED', v_user_id);

    INSERT INTO public.compliance_results (requirement_id, pack_version_id, bidder_id, result, confidence, reason, evidence, evidence_document_id) 
    VALUES (v_req1, v_req_pack_v1, v_bidder1, 'PASS', 0.99, 'Valid PAN.', 'ABCDE1234F', v_doc1);

    -- 4. Create Bidder 2 (The Problematic Bidder - All Edge Cases)
    INSERT INTO public.bidders (tender_id, legal_name, registration_number) 
    VALUES (v_tender_id, 'ShadyCorp LLP', 'REG999') RETURNING id INTO v_bidder2;

    -- A) PAN/GSTIN conflict -> REVIEW
    INSERT INTO public.compliance_results (requirement_id, pack_version_id, bidder_id, result, confidence, reason, evidence) 
    VALUES (v_req2, v_req_pack_v1, v_bidder2, 'REVIEW', 0.95, 'GSTIN registry returns conflict.', 'CONFLICT_GSTIN');

    -- B) Turnover failure -> FAIL
    INSERT INTO public.compliance_results (requirement_id, pack_version_id, bidder_id, result, confidence, reason, evidence) 
    VALUES (v_req3, v_req_pack_v1, v_bidder2, 'FAIL', 0.95, 'Value (1000000) strictly less than threshold (5000000).', '1000000');

    -- C) Missing Document -> FAIL
    INSERT INTO public.compliance_results (requirement_id, pack_version_id, bidder_id, result, confidence, reason, evidence) 
    VALUES (v_req1, v_req_pack_v1, v_bidder2, 'FAIL', NULL, 'Required evidence missing from uploaded documents.', 'NONE');

    -- D) Ambiguous OEM Authorization -> REVIEW (low confidence)
    INSERT INTO public.compliance_results (requirement_id, pack_version_id, bidder_id, result, confidence, reason, evidence) 
    VALUES (v_req4, v_req_pack_v1, v_bidder2, 'REVIEW', 0.65, 'AI extraction confidence too low (65%).', 'OEM AUTH LETTER?');

    -- E) Simulated Debarment Result -> FAIL
    INSERT INTO public.verification_results (bidder_id, document_id, source_type, source_name, identifier_type, identifier_value, result_status, verified_by) 
    VALUES (v_bidder2, NULL, 'SIMULATED', 'CENTRAL_DEBARMENT_REGISTRY', 'NAME', 'DEBARRED_COMP', 'NOT_VERIFIED', v_user_id);

    INSERT INTO public.compliance_results (requirement_id, pack_version_id, bidder_id, result, confidence, reason, evidence) 
    VALUES (v_req5, v_req_pack_v1, v_bidder2, 'FAIL', 0.99, 'Debarred entity check failed.', 'DEBARRED_COMP');

    -- F) Unavailable source -> NOT_VERIFIED
    INSERT INTO public.compliance_results (requirement_id, pack_version_id, bidder_id, result, confidence, reason, evidence) 
    VALUES (v_req2, v_req_pack_v1, v_bidder1, 'NOT_VERIFIED', 0.95, 'Source API unavailable.', '27ABCDE1234F1Z5');

    -- 5. Create Bidder 3 (Officer Override Demo)
    INSERT INTO public.bidders (tender_id, legal_name, registration_number) 
    VALUES (v_tender_id, 'Global Trade Ltd', 'REG777') RETURNING id INTO v_bidder3;

    INSERT INTO public.compliance_results (requirement_id, pack_version_id, bidder_id, result, confidence, reason, evidence, ai_result) 
    VALUES (v_req4, v_req_pack_v1, v_bidder3, 'PASS', 1.0, 'MANUAL OVERRIDE: Valid paper doc shown offline.', 'N/A', 'FAIL');

    -- 6. Audit & Corrigendum Mock (v2)
    INSERT INTO public.requirement_pack_versions (tender_id, version_number, status, created_by) 
    VALUES (v_tender_id, 2, 'DRAFT', v_user_id) RETURNING id INTO v_req_pack_v2;
    
    INSERT INTO public.audit_logs (user_id, tender_id, action, metadata) 
    VALUES (v_user_id, v_tender_id, 'PACK_CORRIGENDUM_CREATED', '{"version": 2}'::jsonb);

END $$;
