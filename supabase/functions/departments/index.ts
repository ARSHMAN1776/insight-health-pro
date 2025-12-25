import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DepartmentInput {
  department_name: string;
  description?: string;
  department_head?: string;
  status?: 'Active' | 'Inactive';
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Validation helpers
function validateDepartmentName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Department name is required' };
  }
  
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return { valid: false, error: 'Department name cannot be empty' };
  }
  
  if (trimmedName.length > 255) {
    return { valid: false, error: 'Department name must be less than 255 characters' };
  }
  
  // Allow only alphanumeric, spaces, hyphens, and common punctuation
  const validPattern = /^[a-zA-Z0-9\s\-&(),.']+$/;
  if (!validPattern.test(trimmedName)) {
    return { valid: false, error: 'Department name contains invalid characters' };
  }
  
  return { valid: true };
}

function validateDescription(description: string | undefined): { valid: boolean; error?: string } {
  if (description && description.length > 1000) {
    return { valid: false, error: 'Description must be less than 1000 characters' };
  }
  return { valid: true };
}

function createResponse(response: ApiResponse, status: number): Response {
  return new Response(JSON.stringify(response), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    console.log(`[Departments API] Action: ${action}, Method: ${req.method}`);

    switch (action) {
      case 'list':
        return await listDepartments(supabase);
      
      case 'add':
        if (req.method !== 'POST') {
          return createResponse({ success: false, message: 'Method not allowed' }, 405);
        }
        return await addDepartment(supabase, await req.json());
      
      case 'update':
        if (req.method !== 'PUT' && req.method !== 'PATCH') {
          return createResponse({ success: false, message: 'Method not allowed' }, 405);
        }
        const updateData = await req.json();
        const departmentId = url.searchParams.get('id');
        if (!departmentId) {
          return createResponse({ success: false, message: 'Department ID is required' }, 400);
        }
        return await updateDepartment(supabase, departmentId, updateData);
      
      case 'deactivate':
        if (req.method !== 'PUT' && req.method !== 'PATCH') {
          return createResponse({ success: false, message: 'Method not allowed' }, 405);
        }
        const deactivateId = url.searchParams.get('id');
        if (!deactivateId) {
          return createResponse({ success: false, message: 'Department ID is required' }, 400);
        }
        return await deactivateDepartment(supabase, deactivateId);
      
      case 'get':
        const getId = url.searchParams.get('id');
        if (!getId) {
          return createResponse({ success: false, message: 'Department ID is required' }, 400);
        }
        return await getDepartment(supabase, getId);
      
      default:
        return createResponse({ 
          success: false, 
          message: 'Invalid action. Valid actions: list, add, update, deactivate, get' 
        }, 400);
    }
  } catch (error) {
    console.error('[Departments API] Unexpected error:', error);
    return createResponse({
      success: false,
      message: 'An unexpected error occurred',
      error: error.message,
    }, 500);
  }
});

// List all departments
async function listDepartments(supabase: any): Promise<Response> {
  console.log('[Departments API] Fetching department list');
  
  const { data, error } = await supabase
    .from('departments')
    .select(`
      *,
      head_doctor:doctors!department_head(id, first_name, last_name, specialization)
    `)
    .order('department_name');

  if (error) {
    console.error('[Departments API] List error:', error);
    return createResponse({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message,
    }, 500);
  }

  console.log(`[Departments API] Found ${data?.length || 0} departments`);
  return createResponse({
    success: true,
    message: 'Departments retrieved successfully',
    data,
  }, 200);
}

// Get single department
async function getDepartment(supabase: any, id: string): Promise<Response> {
  console.log(`[Departments API] Fetching department: ${id}`);
  
  const { data, error } = await supabase
    .from('departments')
    .select(`
      *,
      head_doctor:doctors!department_head(id, first_name, last_name, specialization)
    `)
    .eq('department_id', id)
    .maybeSingle();

  if (error) {
    console.error('[Departments API] Get error:', error);
    return createResponse({
      success: false,
      message: 'Failed to fetch department',
      error: error.message,
    }, 500);
  }

  if (!data) {
    return createResponse({
      success: false,
      message: 'Department not found',
    }, 404);
  }

  return createResponse({
    success: true,
    message: 'Department retrieved successfully',
    data,
  }, 200);
}

// Add new department
async function addDepartment(supabase: any, input: DepartmentInput): Promise<Response> {
  console.log('[Departments API] Adding new department:', input.department_name);

  // Validate department name
  const nameValidation = validateDepartmentName(input.department_name);
  if (!nameValidation.valid) {
    return createResponse({
      success: false,
      message: nameValidation.error!,
    }, 400);
  }

  // Validate description
  const descValidation = validateDescription(input.description);
  if (!descValidation.valid) {
    return createResponse({
      success: false,
      message: descValidation.error!,
    }, 400);
  }

  const trimmedName = input.department_name.trim();

  // Check for duplicate department name (case-insensitive)
  const { data: existing, error: checkError } = await supabase
    .from('departments')
    .select('department_id, department_name')
    .ilike('department_name', trimmedName)
    .maybeSingle();

  if (checkError) {
    console.error('[Departments API] Duplicate check error:', checkError);
    return createResponse({
      success: false,
      message: 'Failed to validate department name',
      error: checkError.message,
    }, 500);
  }

  if (existing) {
    console.log('[Departments API] Duplicate department name found:', trimmedName);
    return createResponse({
      success: false,
      message: `A department with the name "${trimmedName}" already exists`,
    }, 409);
  }

  // Validate department_head if provided
  if (input.department_head) {
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', input.department_head)
      .maybeSingle();

    if (doctorError || !doctor) {
      return createResponse({
        success: false,
        message: 'Invalid department head - doctor not found',
      }, 400);
    }
  }

  // Insert department
  const { data, error } = await supabase
    .from('departments')
    .insert({
      department_name: trimmedName,
      description: input.description?.trim() || null,
      department_head: input.department_head || null,
      status: input.status || 'Active',
    })
    .select()
    .single();

  if (error) {
    console.error('[Departments API] Insert error:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return createResponse({
        success: false,
        message: `A department with the name "${trimmedName}" already exists`,
      }, 409);
    }
    
    return createResponse({
      success: false,
      message: 'Failed to create department',
      error: error.message,
    }, 500);
  }

  console.log('[Departments API] Department created:', data.department_id);
  return createResponse({
    success: true,
    message: 'Department created successfully',
    data,
  }, 201);
}

// Update department
async function updateDepartment(supabase: any, id: string, input: Partial<DepartmentInput>): Promise<Response> {
  console.log(`[Departments API] Updating department: ${id}`);

  // Check if department exists
  const { data: existingDept, error: checkError } = await supabase
    .from('departments')
    .select('department_id, department_name')
    .eq('department_id', id)
    .maybeSingle();

  if (checkError) {
    console.error('[Departments API] Existence check error:', checkError);
    return createResponse({
      success: false,
      message: 'Failed to find department',
      error: checkError.message,
    }, 500);
  }

  if (!existingDept) {
    return createResponse({
      success: false,
      message: 'Department not found',
    }, 404);
  }

  const updateData: any = {};

  // Validate and set department name if provided
  if (input.department_name !== undefined) {
    const nameValidation = validateDepartmentName(input.department_name);
    if (!nameValidation.valid) {
      return createResponse({
        success: false,
        message: nameValidation.error!,
      }, 400);
    }

    const trimmedName = input.department_name.trim();

    // Check for duplicate name (excluding current department)
    const { data: duplicate, error: dupError } = await supabase
      .from('departments')
      .select('department_id')
      .ilike('department_name', trimmedName)
      .neq('department_id', id)
      .maybeSingle();

    if (dupError) {
      console.error('[Departments API] Duplicate check error:', dupError);
      return createResponse({
        success: false,
        message: 'Failed to validate department name',
        error: dupError.message,
      }, 500);
    }

    if (duplicate) {
      return createResponse({
        success: false,
        message: `A department with the name "${trimmedName}" already exists`,
      }, 409);
    }

    updateData.department_name = trimmedName;
  }

  // Validate description if provided
  if (input.description !== undefined) {
    const descValidation = validateDescription(input.description);
    if (!descValidation.valid) {
      return createResponse({
        success: false,
        message: descValidation.error!,
      }, 400);
    }
    updateData.description = input.description?.trim() || null;
  }

  // Validate department_head if provided
  if (input.department_head !== undefined) {
    if (input.department_head) {
      const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('id', input.department_head)
        .maybeSingle();

      if (doctorError || !doctor) {
        return createResponse({
          success: false,
          message: 'Invalid department head - doctor not found',
        }, 400);
      }
    }
    updateData.department_head = input.department_head || null;
  }

  // Set status if provided
  if (input.status !== undefined) {
    if (!['Active', 'Inactive'].includes(input.status)) {
      return createResponse({
        success: false,
        message: 'Status must be either "Active" or "Inactive"',
      }, 400);
    }
    updateData.status = input.status;
  }

  if (Object.keys(updateData).length === 0) {
    return createResponse({
      success: false,
      message: 'No valid fields to update',
    }, 400);
  }

  // Perform update
  const { data, error } = await supabase
    .from('departments')
    .update(updateData)
    .eq('department_id', id)
    .select()
    .single();

  if (error) {
    console.error('[Departments API] Update error:', error);
    return createResponse({
      success: false,
      message: 'Failed to update department',
      error: error.message,
    }, 500);
  }

  console.log('[Departments API] Department updated:', id);
  return createResponse({
    success: true,
    message: 'Department updated successfully',
    data,
  }, 200);
}

// Deactivate department (soft delete)
async function deactivateDepartment(supabase: any, id: string): Promise<Response> {
  console.log(`[Departments API] Deactivating department: ${id}`);

  // Check if department exists
  const { data: dept, error: checkError } = await supabase
    .from('departments')
    .select('department_id, department_name, status')
    .eq('department_id', id)
    .maybeSingle();

  if (checkError) {
    console.error('[Departments API] Existence check error:', checkError);
    return createResponse({
      success: false,
      message: 'Failed to find department',
      error: checkError.message,
    }, 500);
  }

  if (!dept) {
    return createResponse({
      success: false,
      message: 'Department not found',
    }, 404);
  }

  if (dept.status === 'Inactive') {
    return createResponse({
      success: false,
      message: 'Department is already inactive',
    }, 400);
  }

  // Check for assigned doctors
  const { count: doctorCount, error: doctorError } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })
    .eq('department_id', id);

  if (doctorError) {
    console.error('[Departments API] Doctor count error:', doctorError);
    return createResponse({
      success: false,
      message: 'Failed to check assigned doctors',
      error: doctorError.message,
    }, 500);
  }

  if (doctorCount && doctorCount > 0) {
    console.log(`[Departments API] Cannot deactivate - ${doctorCount} doctors assigned`);
    return createResponse({
      success: false,
      message: `Cannot deactivate department. ${doctorCount} doctor(s) are currently assigned to this department. Please reassign them first.`,
    }, 409);
  }

  // Check for assigned patients
  const { count: patientCount, error: patientError } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('department_id', id);

  if (patientError) {
    console.error('[Departments API] Patient count error:', patientError);
    return createResponse({
      success: false,
      message: 'Failed to check assigned patients',
      error: patientError.message,
    }, 500);
  }

  if (patientCount && patientCount > 0) {
    console.log(`[Departments API] Cannot deactivate - ${patientCount} patients assigned`);
    return createResponse({
      success: false,
      message: `Cannot deactivate department. ${patientCount} patient(s) are currently assigned to this department. Please reassign them first.`,
    }, 409);
  }

  // Perform soft delete
  const { data, error } = await supabase
    .from('departments')
    .update({ status: 'Inactive' })
    .eq('department_id', id)
    .select()
    .single();

  if (error) {
    console.error('[Departments API] Deactivation error:', error);
    return createResponse({
      success: false,
      message: 'Failed to deactivate department',
      error: error.message,
    }, 500);
  }

  console.log('[Departments API] Department deactivated:', id);
  return createResponse({
    success: true,
    message: 'Department deactivated successfully',
    data,
  }, 200);
}
