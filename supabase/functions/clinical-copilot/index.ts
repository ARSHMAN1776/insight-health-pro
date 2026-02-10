import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CopilotRequest {
  action: "soap_note" | "treatment_plan" | "prescription_draft" | "differential" | "summarize";
  patientData: {
    age?: number;
    gender?: string;
    allergies?: string;
    medicalHistory?: string;
    currentMedications?: string;
  };
  clinicalData: {
    chiefComplaint?: string;
    symptoms?: string;
    vitalSigns?: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      spo2?: number;
      respiratoryRate?: number;
      weight?: number;
    };
    examination?: string;
    labResults?: string;
    previousDiagnosis?: string;
  };
}

const ACTION_PROMPTS: Record<string, string> = {
  soap_note: `Generate a structured SOAP note from the clinical data provided.

Format:
**SUBJECTIVE:**
- Chief complaint and history of present illness from symptoms
- Relevant past medical history, allergies, current medications

**OBJECTIVE:**
- Vital signs interpretation
- Physical examination findings
- Lab results if available

**ASSESSMENT:**
- Primary diagnosis with ICD-10 code
- Differential diagnoses (2-3) with ICD-10 codes
- Clinical reasoning

**PLAN:**
- Diagnostic workup (labs, imaging)
- Medications with specific dosages, frequency, duration
- Follow-up timeline
- Patient education points
- Red flags to watch for

Be specific with medication dosages. Use standard medical abbreviations.`,

  treatment_plan: `Generate a comprehensive treatment plan based on the clinical data.

Include:
1. **Diagnosis**: Primary and secondary with ICD-10 codes
2. **Pharmacological Treatment**: Specific medications with dosage, route, frequency, duration, and rationale
3. **Non-Pharmacological**: Lifestyle modifications, physical therapy, diet changes
4. **Monitoring**: What to monitor, how often, target values
5. **Follow-Up**: Timeline and what to assess
6. **Patient Education**: Key points in simple language
7. **Red Flags**: When to seek immediate care
8. **Referrals**: Specialist referrals if needed

Consider drug interactions with current medications and allergies listed.`,

  prescription_draft: `Generate a prescription draft based on the symptoms and diagnosis.

For EACH medication provide:
- **Drug Name** (generic)
- **Strength/Dosage**
- **Route** (oral, IV, topical, etc.)
- **Frequency** (OD, BD, TDS, QID, etc.)
- **Duration** (days/weeks)
- **Special Instructions** (before/after food, avoid driving, etc.)
- **Rationale** (why this drug)

Also include:
- **Drug Interaction Warnings** with current medications
- **Allergy Cross-Reactivity Check**
- **Cost-Effective Alternatives** if available

CRITICAL: Flag any contraindications with the patient's allergies or current medications.`,

  differential: `Provide a detailed differential diagnosis analysis.

For each diagnosis (provide 5-7):
1. **Condition** with ICD-10 code
2. **Probability** (High/Medium/Low with percentage estimate)
3. **Supporting Evidence** from the clinical data
4. **Against** - findings that argue against this diagnosis
5. **Confirmatory Tests** needed
6. **If Confirmed** - first-line treatment approach

Also provide:
- **Most Likely Diagnosis** with reasoning
- **Cannot-Miss Diagnoses** (dangerous conditions to rule out)
- **Recommended Workup Priority** (what to order first)`,

  summarize: `Generate a concise clinical summary suitable for:
- Handoff to another provider
- Chart documentation
- Referral letter

Include:
1. **One-Line Summary**: Patient demographics + chief complaint + key finding
2. **Clinical Synopsis**: 3-4 sentences covering presentation, workup, assessment
3. **Active Problems**: Numbered list with status
4. **Current Plan**: Key interventions in progress
5. **Pending Items**: Labs, consults, follow-ups awaited
6. **Alerts**: Allergies, drug interactions, fall risk, isolation precautions`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.57.2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { auth: { persistSession: false }, global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!userRole || !["doctor", "admin"].includes(userRole.role)) {
      return new Response(
        JSON.stringify({ error: "Only doctors can use the Clinical Copilot" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: CopilotRequest = await req.json();
    const { action, patientData, clinicalData } = body;

    if (!action || !ACTION_PROMPTS[action]) {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use: soap_note, treatment_plan, prescription_draft, differential, summarize" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build patient context
    let context = "PATIENT INFORMATION:\n";
    if (patientData.age) context += `- Age: ${patientData.age} years\n`;
    if (patientData.gender) context += `- Gender: ${patientData.gender}\n`;
    if (patientData.allergies) context += `- Allergies: ${patientData.allergies}\n`;
    if (patientData.medicalHistory) context += `- Medical History: ${patientData.medicalHistory}\n`;
    if (patientData.currentMedications) context += `- Current Medications: ${patientData.currentMedications}\n`;

    context += "\nCLINICAL DATA:\n";
    if (clinicalData.chiefComplaint) context += `- Chief Complaint: ${clinicalData.chiefComplaint}\n`;
    if (clinicalData.symptoms) context += `- Symptoms: ${clinicalData.symptoms}\n`;
    if (clinicalData.vitalSigns) {
      context += "- Vital Signs:\n";
      const vs = clinicalData.vitalSigns;
      if (vs.bloodPressure) context += `  - BP: ${vs.bloodPressure}\n`;
      if (vs.heartRate) context += `  - HR: ${vs.heartRate} bpm\n`;
      if (vs.temperature) context += `  - Temp: ${vs.temperature}°F\n`;
      if (vs.spo2) context += `  - SpO2: ${vs.spo2}%\n`;
      if (vs.respiratoryRate) context += `  - RR: ${vs.respiratoryRate}/min\n`;
      if (vs.weight) context += `  - Weight: ${vs.weight} kg\n`;
    }
    if (clinicalData.examination) context += `- Examination: ${clinicalData.examination}\n`;
    if (clinicalData.labResults) context += `- Lab Results: ${clinicalData.labResults}\n`;
    if (clinicalData.previousDiagnosis) context += `- Previous Diagnosis: ${clinicalData.previousDiagnosis}\n`;

    const systemPrompt = `You are an AI Clinical Copilot for healthcare professionals in a Hospital Management System.
You assist doctors by generating clinical documentation, treatment plans, and diagnostic analysis.

CRITICAL RULES:
- You are a DECISION SUPPORT tool, NOT a replacement for clinical judgment
- Always include ICD-10 codes where applicable
- Consider drug interactions and allergies
- Flag any life-threatening conditions immediately
- Use evidence-based medicine guidelines
- Be specific with medication dosages (not vague)
- Format output in clean markdown for readability

${ACTION_PROMPTS[action]}`;

    console.log(`Clinical Copilot: ${action} request from doctor ${user.id}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Contact administrator." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Clinical Copilot error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
