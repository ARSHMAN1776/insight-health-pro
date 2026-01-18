import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DiagnosisRequest {
  symptoms: string;
  patientAge?: number;
  patientGender?: string;
  medicalHistory?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    spo2?: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require valid JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the JWT token using Supabase client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.57.2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Invalid token:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user role - only doctors and admins can use AI diagnosis
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const allowedRoles = ["doctor", "admin"];
    if (!userRole || !allowedRoles.includes(userRole.role)) {
      console.error("Unauthorized role:", userRole?.role);
      return new Response(
        JSON.stringify({ error: "Only doctors and admins can use AI diagnosis" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`AI Diagnosis request from user ${user.id} (${userRole.role})`);

    const { symptoms, patientAge, patientGender, medicalHistory, vitalSigns }: DiagnosisRequest = await req.json();
    
    if (!symptoms || symptoms.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Symptoms are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context for the AI
    let patientContext = `Patient presenting with the following symptoms: ${symptoms}`;
    
    if (patientAge) {
      patientContext += `\nPatient age: ${patientAge} years`;
    }
    if (patientGender) {
      patientContext += `\nPatient gender: ${patientGender}`;
    }
    if (medicalHistory) {
      patientContext += `\nRelevant medical history: ${medicalHistory}`;
    }
    if (vitalSigns) {
      patientContext += "\nVital signs:";
      if (vitalSigns.bloodPressure) patientContext += `\n- Blood Pressure: ${vitalSigns.bloodPressure}`;
      if (vitalSigns.heartRate) patientContext += `\n- Heart Rate: ${vitalSigns.heartRate} bpm`;
      if (vitalSigns.temperature) patientContext += `\n- Temperature: ${vitalSigns.temperature}°F`;
      if (vitalSigns.spo2) patientContext += `\n- SpO2: ${vitalSigns.spo2}%`;
    }

    const systemPrompt = `You are an AI clinical decision support assistant for healthcare professionals. 
Your role is to provide differential diagnosis suggestions based on presented symptoms and patient information.

IMPORTANT DISCLAIMERS:
- These are suggestions only and should NOT replace clinical judgment
- The physician must verify and validate all suggestions
- Consider ordering appropriate diagnostic tests before confirming diagnosis
- Always consider patient-specific factors and local disease prevalence

When providing suggestions, structure your response as JSON with the following format:
{
  "suggestions": [
    {
      "diagnosis": "Condition name",
      "icdCode": "ICD-10 code if applicable",
      "confidence": "high/medium/low",
      "reasoning": "Brief explanation of why this condition is suggested",
      "recommendedTests": ["List of recommended diagnostic tests"],
      "redFlags": ["Any warning signs to watch for"]
    }
  ],
  "generalRecommendations": ["List of general clinical recommendations"],
  "urgency": "routine/urgent/emergency",
  "disclaimer": "This is AI-generated clinical decision support. All diagnoses must be verified by a qualified healthcare professional."
}

Provide 3-5 most likely differential diagnoses ranked by probability.`;

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
          { role: "user", content: patientContext },
        ],
        response_format: { type: "json_object" },
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
          JSON.stringify({ error: "AI service credits exhausted. Please contact administrator." }),
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI service" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let diagnosisResult;
    try {
      diagnosisResult = JSON.parse(content);
    } catch {
      // If JSON parsing fails, return the raw content
      diagnosisResult = { 
        rawResponse: content,
        disclaimer: "This is AI-generated clinical decision support. All diagnoses must be verified by a qualified healthcare professional."
      };
    }

    return new Response(
      JSON.stringify(diagnosisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI Diagnosis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
