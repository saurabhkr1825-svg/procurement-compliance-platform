-- 006_strict_states.sql

-- 1. Modify compliance_results constraint for the 4 strict PRD states
ALTER TABLE compliance_results DROP CONSTRAINT IF EXISTS compliance_results_result_check;
ALTER TABLE compliance_results ADD CONSTRAINT compliance_results_result_check CHECK (result IN ('PASS', 'FAIL', 'REVIEW', 'NOT_VERIFIED'));

-- Update existing records if any
UPDATE compliance_results SET result = 'NOT_VERIFIED' WHERE result = 'NOT VERIFIED';

-- 2. Modify verification_results constraint
ALTER TABLE verification_results DROP CONSTRAINT IF EXISTS verification_results_result_status_check;
ALTER TABLE verification_results ADD CONSTRAINT verification_results_result_status_check CHECK (result_status IN ('VERIFIED', 'NOT_VERIFIED', 'CONFLICT'));

-- Update existing records if any
UPDATE verification_results SET result_status = 'NOT_VERIFIED' WHERE result_status = 'NOT VERIFIED';
