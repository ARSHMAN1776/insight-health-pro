import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Database query functions for the chatbot
interface QueryResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Get user context from JWT
async function getUserContext(supabase: ReturnType<typeof createClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  // Get user role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const role = roleData?.role || 'patient';

  // Get patient_id or doctor_id based on role
  let patientId = null;
  let doctorId = null;
  let userName = '';

  if (role === 'patient') {
    const { data: patientData } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .eq('user_id', user.id)
      .single();
    if (patientData) {
      patientId = patientData.id;
      userName = `${patientData.first_name} ${patientData.last_name}`;
    }
  } else if (role === 'doctor') {
    const { data: doctorData } = await supabase
      .from('doctors')
      .select('id, first_name, last_name')
      .eq('user_id', user.id)
      .single();
    if (doctorData) {
      doctorId = doctorData.id;
      userName = `Dr. ${doctorData.first_name} ${doctorData.last_name}`;
    }
  }

  return { userId: user.id, role, patientId, doctorId, userName, email: user.email };
}

// Patient queries
async function getPatientAppointments(supabase: ReturnType<typeof createClient>, patientId: string): Promise<QueryResult> {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id, appointment_date, appointment_time, status, symptoms, appointment_type,
      doctors:doctor_id (first_name, last_name, specialization)
    `)
    .eq('patient_id', patientId)
    .gte('appointment_date', new Date().toISOString().split('T')[0])
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })
    .limit(5);

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

async function getPatientPrescriptions(supabase: ReturnType<typeof createClient>, patientId: string): Promise<QueryResult> {
  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      id, medication_name, dosage, frequency, duration, instructions, created_at,
      doctors:doctor_id (first_name, last_name)
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

async function getPatientLabTests(supabase: ReturnType<typeof createClient>, patientId: string): Promise<QueryResult> {
  const { data, error } = await supabase
    .from('lab_tests')
    .select('id, test_name, status, result, test_date, created_at')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

async function getDoctorSchedule(supabase: ReturnType<typeof createClient>, doctorName: string): Promise<QueryResult> {
  // Search for doctor by name
  const { data: doctors, error: docError } = await supabase
    .from('doctors')
    .select('id, first_name, last_name, specialization')
    .or(`first_name.ilike.%${doctorName}%,last_name.ilike.%${doctorName}%`)
    .limit(1);

  if (docError || !doctors?.length) {
    return { success: false, error: 'Doctor not found' };
  }

  const doctor = doctors[0];

  // Get doctor's schedule
  const { data: schedules } = await supabase
    .from('staff_schedules')
    .select('day_of_week, start_time, end_time, break_start, break_end')
    .eq('staff_id', doctor.id)
    .eq('staff_type', 'doctor');

  return { 
    success: true, 
    data: { 
      doctor: { name: `Dr. ${doctor.first_name} ${doctor.last_name}`, specialization: doctor.specialization },
      schedules 
    } 
  };
}

async function getAvailableSlots(supabase: ReturnType<typeof createClient>, doctorName: string, date: string): Promise<QueryResult> {
  // Search for doctor by name
  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, first_name, last_name')
    .or(`first_name.ilike.%${doctorName}%,last_name.ilike.%${doctorName}%`)
    .limit(1);

  if (!doctors?.length) {
    return { success: false, error: 'Doctor not found' };
  }

  const doctorId = doctors[0].id;

  // Get existing appointments for that date
  const { data: bookedSlots } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', date)
    .in('status', ['pending', 'confirmed']);

  return { 
    success: true, 
    data: { 
      doctor: `Dr. ${doctors[0].first_name} ${doctors[0].last_name}`,
      date,
      bookedSlots: bookedSlots?.map(s => s.appointment_time) || []
    } 
  };
}

// Doctor queries
async function getDoctorTodayPatients(supabase: ReturnType<typeof createClient>, doctorId: string): Promise<QueryResult> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id, appointment_time, status, symptoms, appointment_type,
      patients:patient_id (first_name, last_name, date_of_birth, gender)
    `)
    .eq('doctor_id', doctorId)
    .eq('appointment_date', today)
    .order('appointment_time', { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

async function getDoctorPatientCount(supabase: ReturnType<typeof createClient>, doctorId: string): Promise<QueryResult> {
  const today = new Date().toISOString().split('T')[0];
  
  const { count, error } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', doctorId)
    .eq('appointment_date', today);

  if (error) return { success: false, error: error.message };
  return { success: true, data: { count: count || 0 } };
}

async function getPatientPrescriptionByName(supabase: ReturnType<typeof createClient>, doctorId: string, patientName: string): Promise<QueryResult> {
  // First find the patient
  const { data: patients } = await supabase
    .from('patients')
    .select('id, first_name, last_name')
    .or(`first_name.ilike.%${patientName}%,last_name.ilike.%${patientName}%`)
    .limit(3);

  if (!patients?.length) {
    return { success: false, error: 'Patient not found' };
  }

  // Get prescriptions for these patients written by this doctor
  const { data: prescriptions, error } = await supabase
    .from('prescriptions')
    .select(`
      id, medication_name, dosage, frequency, duration, instructions, created_at,
      patients:patient_id (first_name, last_name)
    `)
    .eq('doctor_id', doctorId)
    .in('patient_id', patients.map(p => p.id))
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) return { success: false, error: error.message };
  return { success: true, data: prescriptions };
}

async function searchDoctorPatients(supabase: ReturnType<typeof createClient>, doctorId: string, searchTerm: string): Promise<QueryResult> {
  // Get patients who have had appointments with this doctor
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      patients:patient_id (id, first_name, last_name, date_of_birth, gender, phone)
    `)
    .eq('doctor_id', doctorId)
    .limit(100);

  if (error) return { success: false, error: error.message };

  // Filter and deduplicate patients
  const patientMap = new Map();
  data?.forEach(apt => {
    const patient = apt.patients as { id: string; first_name: string; last_name: string };
    if (patient && !patientMap.has(patient.id)) {
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      if (fullName.includes(searchTerm.toLowerCase())) {
        patientMap.set(patient.id, patient);
      }
    }
  });

  return { success: true, data: Array.from(patientMap.values()).slice(0, 5) };
}

async function getDoctorUpcomingAppointments(supabase: ReturnType<typeof createClient>, doctorId: string): Promise<QueryResult> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id, appointment_date, appointment_time, status, symptoms, appointment_type,
      patients:patient_id (first_name, last_name)
    `)
    .eq('doctor_id', doctorId)
    .gte('appointment_date', today)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })
    .limit(10);

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

// Intent detection and query execution
async function processIntent(
  supabase: ReturnType<typeof createClient>,
  userContext: { role: string; patientId: string | null; doctorId: string | null; userName: string },
  userMessage: string
): Promise<{ intent: string; data: unknown; error?: string }> {
  const message = userMessage.toLowerCase();
  
  // Patient intents
  if (userContext.role === 'patient' && userContext.patientId) {
    if (message.includes('appointment') || message.includes('schedule') || message.includes('booking') || message.includes('when')) {
      if (message.includes('next') || message.includes('upcoming') || message.includes('my')) {
        const result = await getPatientAppointments(supabase, userContext.patientId);
        return { intent: 'patient_appointments', data: result.data, error: result.error };
      }
    }
    
    if (message.includes('prescription') || message.includes('medicine') || message.includes('medication')) {
      const result = await getPatientPrescriptions(supabase, userContext.patientId);
      return { intent: 'patient_prescriptions', data: result.data, error: result.error };
    }
    
    if (message.includes('lab') || message.includes('test') || message.includes('result')) {
      const result = await getPatientLabTests(supabase, userContext.patientId);
      return { intent: 'patient_lab_tests', data: result.data, error: result.error };
    }
    
    if (message.includes('dr.') || message.includes('doctor') || message.includes('timing') || message.includes('schedule')) {
      // Extract doctor name
      const drMatch = message.match(/dr\.?\s*(\w+)/i) || message.match(/doctor\s+(\w+)/i);
      if (drMatch) {
        const result = await getDoctorSchedule(supabase, drMatch[1]);
        return { intent: 'doctor_schedule', data: result.data, error: result.error };
      }
    }
  }
  
  // Doctor intents
  if (userContext.role === 'doctor' && userContext.doctorId) {
    if (message.includes('today') && (message.includes('patient') || message.includes('how many'))) {
      if (message.includes('how many') || message.includes('count')) {
        const result = await getDoctorPatientCount(supabase, userContext.doctorId);
        return { intent: 'doctor_patient_count', data: result.data, error: result.error };
      } else {
        const result = await getDoctorTodayPatients(supabase, userContext.doctorId);
        return { intent: 'doctor_today_patients', data: result.data, error: result.error };
      }
    }
    
    if (message.includes('prescription') && (message.includes('patient') || message.includes('for'))) {
      // Extract patient name
      const forMatch = message.match(/for\s+(?:patient\s+)?['"]?(\w+)['"]?/i);
      if (forMatch) {
        const result = await getPatientPrescriptionByName(supabase, userContext.doctorId, forMatch[1]);
        return { intent: 'doctor_patient_prescription', data: result.data, error: result.error };
      }
    }
    
    if (message.includes('search') || message.includes('find patient')) {
      const searchMatch = message.match(/(?:search|find)\s+(?:patient\s+)?['"]?(\w+)['"]?/i);
      if (searchMatch) {
        const result = await searchDoctorPatients(supabase, userContext.doctorId, searchMatch[1]);
        return { intent: 'doctor_search_patients', data: result.data, error: result.error };
      }
    }
    
    if (message.includes('upcoming') || message.includes('schedule') || message.includes('my appointment')) {
      const result = await getDoctorUpcomingAppointments(supabase, userContext.doctorId);
      return { intent: 'doctor_upcoming_appointments', data: result.data, error: result.error };
    }
  }
  
  return { intent: 'general', data: null };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    console.log("Chatbot request received with", messages?.length || 0, "messages");
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client with user's JWT if available
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {}
      }
    });

    // Get user context
    const userContext = await getUserContext(supabase);
    console.log("User context:", userContext ? { role: userContext.role, hasPatientId: !!userContext.patientId, hasDoctorId: !!userContext.doctorId } : 'anonymous');

    // Get the latest user message
    const lastUserMessage = messages?.filter((m: { role: string }) => m.role === 'user').pop()?.content || '';

    // Process intent and get data if user is authenticated
    let intentData: { intent: string; data: unknown; error?: string } = { intent: 'general', data: null };
    if (userContext && lastUserMessage) {
      intentData = await processIntent(supabase, {
        role: userContext.role,
        patientId: userContext.patientId,
        doctorId: userContext.doctorId,
        userName: userContext.userName
      }, lastUserMessage);
      console.log("Intent detected:", intentData.intent, "Has data:", !!intentData.data);
    }

    // Build context-aware system prompt
    let systemPrompt = `You are a friendly, professional AI assistant for HealthCare HMS (Hospital Management System).

RESPONSE STYLE:
- Keep responses SHORT and CONCISE (2-4 sentences max)
- Be warm, polite, and helpful
- Use simple, clear language
- Break information into bullet points when listing items
- Format dates nicely (e.g., "January 22, 2026 at 10:30 AM")
- End with a helpful follow-up question when appropriate`;

    if (userContext) {
      systemPrompt += `\n\nUSER CONTEXT:
- User: ${userContext.userName || 'Unknown'}
- Role: ${userContext.role}
- Email: ${userContext.email}`;

      if (userContext.role === 'patient') {
        systemPrompt += `\n\nAS A PATIENT ASSISTANT, you can help with:
- Viewing upcoming appointments
- Checking prescriptions and medications
- Viewing lab test results
- Finding doctor schedules and availability`;
      } else if (userContext.role === 'doctor') {
        systemPrompt += `\n\nAS A DOCTOR ASSISTANT, you can help with:
- Viewing today's patient list and count
- Checking patient prescriptions
- Searching for patients
- Viewing your upcoming appointments`;
      }

      // Add data context if we have it
      if (intentData.data) {
        systemPrompt += `\n\nDATABASE QUERY RESULT:
Intent: ${intentData.intent}
Data: ${JSON.stringify(intentData.data, null, 2)}

Use this data to answer the user's question naturally. If the data is empty, tell them no records were found.`;
      } else if (intentData.error) {
        systemPrompt += `\n\nDATABASE QUERY ERROR: ${intentData.error}
Apologize and suggest they try again or contact support.`;
      }
    } else {
      systemPrompt += `\n\nThe user is not logged in. You can answer general questions about:
- Hospital features and services
- How to get started with the system
- Pricing and plans
- Contact information

For personalized information (appointments, prescriptions, etc.), politely ask them to log in first.`;
    }

    console.log("Calling Lovable AI Gateway...");
    
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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error response:", errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    console.log("Streaming response back to client");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
