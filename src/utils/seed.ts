import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log("Starting DB Seeding...");
  
  // 1. Authenticate Demo User
  const demoEmail = 'demo@gmail.com';
  const demoPassword = 'password123';
  
  /* eslint-disable prefer-const */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let { data: authData, error: authError }: { data: any; error: any } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  });

  if (authError && authError.message.includes('Invalid login credentials')) {
    console.log("User not found, signing up...");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: demoEmail,
      password: demoPassword,
      options: {
        data: {
          full_name: 'Demo Procurement Officer',
          organization: 'Ministry of Procurement',
        }
      }
    });
    if (signUpError) {
      console.error("Sign up error:", signUpError);
      return;
    }
    authData = signUpData;
  } else if (authError) {
    console.error("Auth error:", authError);
    return;
  }

  const userId = authData.user?.id;
  if (!userId) {
    console.error("No user ID found");
    return;
  }

  console.log("Logged in as:", userId);

  // 2. Create Tender
  const { data: tender, error: tenderError } = await supabase
    .from('tenders')
    .insert({
      title: 'Supply of Smart Class Equipment',
      reference_number: 'TNDR/2026/001',
      description: 'Procurement of interactive panels and computing devices for smart classrooms.',
      organization: 'Ministry of Education',
      submission_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      created_by: userId,
    })
    .select()
    .single();

  if (tenderError) {
    console.error("Tender error:", tenderError);
    return;
  }
  console.log("Tender created:", tender.id);

  // 3. Create Requirement Pack Version
  const { data: reqPack, error: reqPackError } = await supabase
    .from('requirement_pack_versions')
    .insert({
      tender_id: tender.id,
      version_number: 1,
      status: 'FROZEN',
      created_by: userId
    })
    .select()
    .single();

  if (reqPackError) {
    console.error("ReqPack error:", reqPackError);
    return;
  }

  // 4. Create Requirements
  const reqs = [
    {
      tender_id: tender.id,
      pack_version_id: reqPack.id,
      title: 'Valid PAN Registration',
      description: 'Bidder must possess a valid PAN registered with Income Tax Department.',
      category: 'LEGAL',
      requirement_type: 'DOCUMENT',
      mandatory: true
    },
    {
      tender_id: tender.id,
      pack_version_id: reqPack.id,
      title: 'Valid GSTIN Registration',
      description: 'Bidder must possess a valid GSTIN.',
      category: 'LEGAL',
      requirement_type: 'DOCUMENT',
      mandatory: true
    },
    {
      tender_id: tender.id,
      pack_version_id: reqPack.id,
      title: 'Annual Turnover',
      description: 'Average annual financial turnover during the last 3 years should be at least Rs. 50 Lakhs.',
      category: 'FINANCIAL',
      requirement_type: 'THRESHOLD',
      mandatory: true,
      threshold_value: 5000000,
      threshold_operator: '>=',
      unit: 'INR'
    }
  ];

  const { data: requirements, error: reqError } = await supabase
    .from('requirements')
    .insert(reqs)
    .select();

  if (reqError) {
    console.error("Requirements error:", reqError);
    return;
  }

  // 5. Create Bidders
  const biddersData = [
    {
      tender_id: tender.id,
      legal_name: 'TechSolutions India Pvt Ltd',
      trade_name: 'TechSolutions',
      registration_number: 'U72900MH2020PTC123456',
      contact_email: 'bids@techsolutions.in',
      contact_phone: '+919876543210'
    },
    {
      tender_id: tender.id,
      legal_name: 'Global EduTech Corp',
      trade_name: 'Global EduTech',
      registration_number: 'L72200DL2010PLC987654',
      contact_email: 'tenders@globaledutech.com',
      contact_phone: '+919988776655'
    }
  ];

  const { data: bidders, error: biddersError } = await supabase
    .from('bidders')
    .insert(biddersData)
    .select();

  if (biddersError) {
    console.error("Bidders error:", biddersError);
    return;
  }
  console.log("Bidders created");

  // 6. Create Bidder Documents & Extractions for Bidder 1 (Compliant)
  const bidder1 = bidders[0];
  const reqPan = requirements.find(r => r.title.includes('PAN'))!;
  
  const { data: doc1 } = await supabase
    .from('bidder_documents')
    .insert({
      bidder_id: bidder1.id,
      file_name: 'PAN_Card.pdf',
      storage_path: `${bidder1.id}/PAN_Card.pdf`,
      document_type: 'PAN',
      processing_status: 'COMPLETED'
    })
    .select()
    .single();

  await supabase.from('extracted_fields').insert({
    document_id: doc1.id,
    field_name: 'pan_number',
    field_value: 'ABCDE1234F',
    confidence: 0.98
  });

  // Verification Results
  await supabase.from('verification_results').insert({
    bidder_id: bidder1.id,
    document_id: doc1.id,
    source_type: 'SIMULATED',
    source_name: 'PAN_SIMULATOR',
    identifier_type: 'PAN',
    identifier_value: 'ABCDE1234F',
    result_status: 'VERIFIED',
    verified_by: userId
  });

  // Compliance Result
  await supabase.from('compliance_results').insert({
    requirement_id: reqPan.id,
    pack_version_id: reqPack.id,
    bidder_id: bidder1.id,
    result: 'PASS',
    confidence: 0.99,
    reason: 'Valid PAN registered and verified.',
    evidence: 'ABCDE1234F',
    evidence_document_id: doc1.id,
    ai_result: 'PASS'
  });

  // 7. Audit Log
  await supabase.from('audit_logs').insert({
    user_id: userId,
    tender_id: tender.id,
    action: 'SEED_DATA_GENERATED',
    metadata: { note: 'Generated via demo seed script' }
  });

  console.log("Seed completed successfully!");
}

seed().catch(console.error);
