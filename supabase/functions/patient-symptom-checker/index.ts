import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SymptomCheckRequest {
  symptoms: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory?: string;
  currentMedications?: string;
}

interface PossibleCondition {
  name: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  selfCareAdvice: string[];
}

interface SymptomCheckResponse {
  possibleConditions: PossibleCondition[];
  recommendedDepartment: {
    name: string;
    reason: string;
  };
  availableDoctors: Array<{
    id: string;
    name: string;
    specialization: string;
    department: string;
  }>;
  urgency: 'routine' | 'urgent' | 'emergency';
  emergencyWarning?: string;
  generalAdvice: string[];
  disclaimer: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require valid JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required. Please log in." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the JWT token
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
        JSON.stringify({ error: "Invalid or expired session. Please log in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user role - only patients can use symptom checker
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const allowedRoles = ["patient", "doctor", "admin", "nurse"];
    if (!userRole || !allowedRoles.includes(userRole.role)) {
      console.error("Unauthorized role:", userRole?.role);
      return new Response(
        JSON.stringify({ error: "Only patients can use the symptom checker" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Symptom check request from user ${user.id} (${userRole.role})`);

    const { symptoms, age, gender, medicalHistory, currentMedications }: SymptomCheckRequest = await req.json();

    // Validate required fields
    if (!symptoms || symptoms.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please describe your symptoms' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!age || age < 0 || age > 150) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid age' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!gender) {
      return new Response(
        JSON.stringify({ error: 'Please select your gender' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build patient context
    let patientContext = `Patient Information:
- Age: ${age} years old
- Gender: ${gender}
- Symptoms: ${symptoms}`;

    if (medicalHistory) {
      patientContext += `\n- Medical History: ${medicalHistory}`;
    }
    if (currentMedications) {
      patientContext += `\n- Current Medications: ${currentMedications}`;
    }

    const systemPrompt = `You are a friendly healthcare assistant helping patients understand their symptoms. Your role is to:
1. Analyze symptoms in simple, easy-to-understand language (no medical jargon)
2. Suggest possible conditions (NOT diagnoses - always clarify this)
3. Recommend which hospital department would be best to visit
4. Provide general self-care advice when appropriate
5. Identify emergency situations that need immediate attention

IMPORTANT GUIDELINES:
- Use simple, patient-friendly language
- Never provide definitive diagnoses - only possible explanations
- Always recommend seeing a doctor for proper evaluation
- Flag any symptoms that could indicate an emergency
- Be reassuring but honest

Respond ONLY with a valid JSON object in this exact format:
{
  "possibleConditions": [
    {
      "name": "Condition name in simple terms",
      "description": "Brief, easy-to-understand explanation",
      "severity": "mild" | "moderate" | "severe",
      "selfCareAdvice": ["Advice 1", "Advice 2"]
    }
  ],
  "recommendedDepartment": {
    "name": "Department name (e.g., General Medicine, Cardiology, Orthopedics)",
    "reason": "Why this department is recommended"
  },
  "urgency": "routine" | "urgent" | "emergency",
  "emergencyWarning": "Only include if urgency is urgent or emergency",
  "generalAdvice": ["General health advice 1", "General health advice 2"],
  "disclaimer": "A friendly reminder that this is informational only"
}

Map symptoms to these common hospital departments:
- General Medicine: fever, cold, flu, general weakness, fatigue
- Cardiology: chest pain, palpitations, shortness of breath, high blood pressure
- Orthopedics: bone/joint pain, fractures, sprains, back pain
- Dermatology: skin rashes, allergies, skin conditions
- Gastroenterology: stomach pain, digestive issues, nausea, vomiting
- Neurology: headaches, dizziness, numbness, seizures
- Pulmonology: breathing problems, cough, asthma
- ENT: ear/nose/throat issues, hearing problems, sinus issues
- Ophthalmology: eye problems, vision issues
- Gynecology: women's health issues
- Urology: urinary problems
- Pediatrics: children's health (if age < 18)
- Emergency: severe symptoms requiring immediate attention`;

    console.log('Calling Lovable AI for symptom analysis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: patientContext }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Service is busy. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service temporarily unavailable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Unable to analyze symptoms at this time.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Unable to process symptoms.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse AI response
    let analysisResult: Omit<SymptomCheckResponse, 'availableDoctors'>;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      
      analysisResult = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Unable to interpret analysis results.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch available doctors from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const departmentName = analysisResult.recommendedDepartment?.name || '';
    
    // Map common department names to specializations
    const specializationMap: Record<string, string[]> = {
      'General Medicine': ['General Medicine', 'Internal Medicine', 'Family Medicine'],
      'Cardiology': ['Cardiology', 'Cardiac Surgery'],
      'Orthopedics': ['Orthopedics', 'Sports Medicine'],
      'Dermatology': ['Dermatology'],
      'Gastroenterology': ['Gastroenterology'],
      'Neurology': ['Neurology', 'Neurosurgery'],
      'Pulmonology': ['Pulmonology', 'Respiratory Medicine'],
      'ENT': ['ENT', 'Otolaryngology', 'Ear Nose Throat'],
      'Ophthalmology': ['Ophthalmology'],
      'Gynecology': ['Gynecology', 'Obstetrics'],
      'Urology': ['Urology'],
      'Pediatrics': ['Pediatrics'],
      'Emergency': ['Emergency Medicine'],
    };

    const specializations = specializationMap[departmentName] || [departmentName];

    console.log('Fetching doctors for specializations:', specializations);

    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('id, first_name, last_name, specialization, department')
      .in('specialization', specializations)
      .eq('status', 'active')
      .limit(5);

    if (doctorsError) {
      console.error('Error fetching doctors:', doctorsError);
    }

    const availableDoctors = (doctors || []).map(doc => ({
      id: doc.id,
      name: `Dr. ${doc.first_name} ${doc.last_name}`,
      specialization: doc.specialization,
      department: doc.department || departmentName,
    }));

    const response: SymptomCheckResponse = {
      ...analysisResult,
      availableDoctors,
      disclaimer: analysisResult.disclaimer || 
        'This information is for educational purposes only and is not a substitute for professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.',
    };

    console.log('Symptom analysis completed successfully');

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Symptom checker error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
