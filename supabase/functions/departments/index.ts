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
  errors?: string[];
}

// ============= Input Sanitization =============
function sanitizeString(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 1000); // Max length safety
}

function sanitizeDepartmentName(name: string): string {
  return sanitizeString(name).slice(0, 255);
}

// ============= Validation Helpers =============
function validateDepartmentName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Department name is required' };
  }
  
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return { valid: false, error: 'Department name cannot be empty' };
  }
  
  if (trimmedName.length < 2) {
    return { valid: false, error: 'Department name must be at least 2 characters' };
  }
  
  if (trimmedName.length > 255) {
    return { valid: false, error: 'Department name must be less than 255 characters' };
  }
  
  // Allow only alphanumeric, spaces, hyphens, and common punctuation
  const validPattern = /^[a-zA-Z0-9\s\-&(),.']+$/;
  if (!validPattern.test(trimmedName)) {
    return { valid: false, error: 'Department name can only contain letters, numbers, spaces, hyphens, and common punctuation (&, (), ., \', ,)' };
  }
  
  return { valid: true };
}

function validateDescription(description: string | undefined): { valid: boolean; error?: string } {
  if (!description) return { valid: true };
  if (description.length > 1000) {
    return { valid: false, error: 'Description must be less than 1000 characters' };
  }
  return { valid: true };
}

function validateUUID(id: string | null): boolean {
  if (!id) return false;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
}

function createResponse(response: ApiResponse, status: number): Response {
  return new Response(JSON.stringify(response), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ============= Role-Based Access Control =============
async function verifyAdminRole(supabase: any, authHeader: string | null): Promise<{ 
  isAdmin: boolean; 
  userId: string | null; 
  error?: string 
}> {
  if (!authHeader) {
    return { isAdmin: false, userId: null, error: 'Authorization header is required' };
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Verify the JWT and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    console.error('[Departments API] Auth error:', authError);
    return { isAdmin: false, userId: null, error: 'Invalid or expired authentication token' };
  }

  // Check if user has admin role using the has_role function
  const { data: hasAdminRole, error: roleError } = await supabase.rpc('has_role', {
    _user_id: user.id,
    _role: 'admin'
  });

  if (roleError) {
    console.error('[Departments API] Role check error:', roleError);
    return { isAdmin: false, userId: user.id, error: 'Failed to verify user permissions' };
  }

  return { isAdmin: hasAdminRole === true, userId: user.id };
}

// ============= Main Handler =============
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    // Create anon client for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const authHeader = req.headers.get('authorization');

    console.log(`[Departments API] Action: ${action}, Method: ${req.method}`);

    // Define which actions require admin role
    const adminOnlyActions = ['add', 'update', 'deactivate'];
    
    // Verify admin role for protected actions
    if (adminOnlyActions.includes(action || '')) {
      const { isAdmin, userId, error: authError } = await verifyAdminRole(supabaseAuth, authHeader);
      
      if (authError) {
        return createResponse({ 
          success: false, 
          message: authError 
        }, 401);
      }
      
      if (!isAdmin) {
        console.log(`[Departments API] Access denied for user: ${userId}`);
        return createResponse({ 
          success: false, 
          message: 'Access denied. Administrator privileges are required to perform this action.' 
        }, 403);
      }
      
      console.log(`[Departments API] Admin access granted for user: ${userId}`);
    }

    switch (action) {
      case 'list':
        return await listDepartments(supabaseAdmin);
      
      case 'add':
        if (req.method !== 'POST') {
          return createResponse({ success: false, message: 'Method not allowed. Use POST for adding departments.' }, 405);
        }
        const addBody = await req.json().catch(() => ({}));
        return await addDepartment(supabaseAdmin, addBody);
      
      case 'update':
        if (req.method !== 'PUT' && req.method !== 'PATCH') {
          return createResponse({ success: false, message: 'Method not allowed. Use PUT or PATCH for updating departments.' }, 405);
        }
        const updateData = await req.json().catch(() => ({}));
        const departmentId = url.searchParams.get('id');
        if (!departmentId) {
          return createResponse({ success: false, message: 'Department ID is required in the URL parameters' }, 400);
        }
        if (!validateUUID(departmentId)) {
          return createResponse({ success: false, message: 'Invalid department ID format' }, 400);
        }
        return await updateDepartment(supabaseAdmin, departmentId, updateData);
      
      case 'deactivate':
        if (req.method !== 'PUT' && req.method !== 'PATCH') {
          return createResponse({ success: false, message: 'Method not allowed. Use PUT or PATCH for deactivation.' }, 405);
        }
        const deactivateId = url.searchParams.get('id');
        if (!deactivateId) {
          return createResponse({ success: false, message: 'Department ID is required in the URL parameters' }, 400);
        }
        if (!validateUUID(deactivateId)) {
          return createResponse({ success: false, message: 'Invalid department ID format' }, 400);
        }
        return await deactivateDepartment(supabaseAdmin, deactivateId);
      
      case 'get':
        const getId = url.searchParams.get('id');
        if (!getId) {
          return createResponse({ success: false, message: 'Department ID is required in the URL parameters' }, 400);
        }
        if (!validateUUID(getId)) {
          return createResponse({ success: false, message: 'Invalid department ID format' }, 400);
        }
        return await getDepartment(supabaseAdmin, getId);
      
      default:
        return createResponse({ 
          success: false, 
          message: 'Invalid or missing action parameter. Valid actions: list, add, update, deactivate, get' 
        }, 400);
    }
  } catch (error) {
    console.error('[Departments API] Unexpected error:', error);
    return createResponse({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
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
  console.log('[Departments API] Adding new department');

  // Collect all validation errors
  const validationErrors: string[] = [];

  // Sanitize inputs
  const sanitizedName = sanitizeDepartmentName(input.department_name || '');
  const sanitizedDescription = sanitizeString(input.description);

  // Validate department name
  const nameValidation = validateDepartmentName(sanitizedName);
  if (!nameValidation.valid) {
    validationErrors.push(nameValidation.error!);
  }

  // Validate description
  const descValidation = validateDescription(sanitizedDescription);
  if (!descValidation.valid) {
    validationErrors.push(descValidation.error!);
  }

  // Validate department_head UUID format if provided
  if (input.department_head && !validateUUID(input.department_head)) {
    validationErrors.push('Invalid department head ID format');
  }

  // Return all validation errors at once
  if (validationErrors.length > 0) {
    return createResponse({
      success: false,
      message: validationErrors.length === 1 ? validationErrors[0] : 'Please fix the following errors:',
      errors: validationErrors.length > 1 ? validationErrors : undefined,
    }, 400);
  }

  // Check for duplicate department name (case-insensitive)
  const { data: existing, error: checkError } = await supabase
    .from('departments')
    .select('department_id, department_name')
    .ilike('department_name', sanitizedName)
    .maybeSingle();

  if (checkError) {
    console.error('[Departments API] Duplicate check error:', checkError);
    return createResponse({
      success: false,
      message: 'Unable to verify department name availability. Please try again.',
    }, 500);
  }

  if (existing) {
    console.log('[Departments API] Duplicate department name found:', sanitizedName);
    return createResponse({
      success: false,
      message: `A department named "${sanitizedName}" already exists. Please choose a different name.`,
    }, 409);
  }

  // Validate department_head exists if provided
  if (input.department_head) {
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('id, first_name, last_name')
      .eq('id', input.department_head)
      .eq('status', 'active')
      .maybeSingle();

    if (doctorError) {
      console.error('[Departments API] Doctor lookup error:', doctorError);
      return createResponse({
        success: false,
        message: 'Unable to verify department head. Please try again.',
      }, 500);
    }

    if (!doctor) {
      return createResponse({
        success: false,
        message: 'The selected department head was not found or is no longer active. Please select a different doctor.',
      }, 400);
    }
  }

  // Insert department
  const { data, error } = await supabase
    .from('departments')
    .insert({
      department_name: sanitizedName,
      description: sanitizedDescription || null,
      department_head: input.department_head || null,
      status: input.status === 'Inactive' ? 'Inactive' : 'Active',
    })
    .select()
    .single();

  if (error) {
    console.error('[Departments API] Insert error:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return createResponse({
        success: false,
        message: `A department named "${sanitizedName}" already exists. Please choose a different name.`,
      }, 409);
    }
    
    return createResponse({
      success: false,
      message: 'Failed to create department. Please try again.',
    }, 500);
  }

  console.log('[Departments API] Department created:', data.department_id);
  return createResponse({
    success: true,
    message: `Department "${sanitizedName}" has been created successfully.`,
    data,
  }, 201);
}

// Update department
async function updateDepartment(supabase: any, id: string, input: Partial<DepartmentInput>): Promise<Response> {
  console.log(`[Departments API] Updating department: ${id}`);

  // Check if department exists
  const { data: existingDept, error: checkError } = await supabase
    .from('departments')
    .select('department_id, department_name, status')
    .eq('department_id', id)
    .maybeSingle();

  if (checkError) {
    console.error('[Departments API] Existence check error:', checkError);
    return createResponse({
      success: false,
      message: 'Unable to find department. Please try again.',
    }, 500);
  }

  if (!existingDept) {
    return createResponse({
      success: false,
      message: 'The department you are trying to update was not found. It may have been deleted.',
    }, 404);
  }

  const updateData: any = {};
  const validationErrors: string[] = [];

  // Validate and set department name if provided
  if (input.department_name !== undefined) {
    const sanitizedName = sanitizeDepartmentName(input.department_name);
    const nameValidation = validateDepartmentName(sanitizedName);
    
    if (!nameValidation.valid) {
      validationErrors.push(nameValidation.error!);
    } else {
      // Check for duplicate name (excluding current department)
      const { data: duplicate, error: dupError } = await supabase
        .from('departments')
        .select('department_id, department_name')
        .ilike('department_name', sanitizedName)
        .neq('department_id', id)
        .maybeSingle();

      if (dupError) {
        console.error('[Departments API] Duplicate check error:', dupError);
        return createResponse({
          success: false,
          message: 'Unable to verify department name availability. Please try again.',
        }, 500);
      }

      if (duplicate) {
        return createResponse({
          success: false,
          message: `A department named "${sanitizedName}" already exists. Please choose a different name.`,
        }, 409);
      }

      updateData.department_name = sanitizedName;
    }
  }

  // Validate description if provided
  if (input.description !== undefined) {
    const sanitizedDesc = sanitizeString(input.description);
    const descValidation = validateDescription(sanitizedDesc);
    if (!descValidation.valid) {
      validationErrors.push(descValidation.error!);
    } else {
      updateData.description = sanitizedDesc || null;
    }
  }

  // Validate department_head if provided
  if (input.department_head !== undefined) {
    if (input.department_head) {
      if (!validateUUID(input.department_head)) {
        validationErrors.push('Invalid department head ID format');
      } else {
        const { data: doctor, error: doctorError } = await supabase
          .from('doctors')
          .select('id, first_name, last_name')
          .eq('id', input.department_head)
          .eq('status', 'active')
          .maybeSingle();

        if (doctorError) {
          console.error('[Departments API] Doctor lookup error:', doctorError);
          return createResponse({
            success: false,
            message: 'Unable to verify department head. Please try again.',
          }, 500);
        }

        if (!doctor) {
          validationErrors.push('The selected department head was not found or is no longer active');
        } else {
          updateData.department_head = input.department_head;
        }
      }
    } else {
      updateData.department_head = null;
    }
  }

  // Set status if provided
  if (input.status !== undefined) {
    if (!['Active', 'Inactive'].includes(input.status)) {
      validationErrors.push('Status must be either "Active" or "Inactive"');
    } else {
      updateData.status = input.status;
    }
  }

  // Return all validation errors
  if (validationErrors.length > 0) {
    return createResponse({
      success: false,
      message: validationErrors.length === 1 ? validationErrors[0] : 'Please fix the following errors:',
      errors: validationErrors.length > 1 ? validationErrors : undefined,
    }, 400);
  }

  if (Object.keys(updateData).length === 0) {
    return createResponse({
      success: false,
      message: 'No changes provided. Please modify at least one field to update.',
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
      message: 'Failed to update department. Please try again.',
    }, 500);
  }

  console.log('[Departments API] Department updated:', id);
  return createResponse({
    success: true,
    message: `Department "${data.department_name}" has been updated successfully.`,
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
      message: 'Unable to find department. Please try again.',
    }, 500);
  }

  if (!dept) {
    return createResponse({
      success: false,
      message: 'The department you are trying to deactivate was not found. It may have been deleted.',
    }, 404);
  }

  if (dept.status === 'Inactive') {
    return createResponse({
      success: false,
      message: `"${dept.department_name}" is already inactive.`,
    }, 400);
  }

  // Check for assigned doctors (optimized count query)
  const { count: doctorCount, error: doctorError } = await supabase
    .from('doctors')
    .select('id', { count: 'exact', head: true })
    .eq('department_id', id)
    .eq('status', 'active');

  if (doctorError) {
    console.error('[Departments API] Doctor count error:', doctorError);
    return createResponse({
      success: false,
      message: 'Unable to check for assigned doctors. Please try again.',
    }, 500);
  }

  if (doctorCount && doctorCount > 0) {
    console.log(`[Departments API] Cannot deactivate - ${doctorCount} doctors assigned`);
    return createResponse({
      success: false,
      message: `Cannot deactivate "${dept.department_name}" because ${doctorCount} active doctor${doctorCount > 1 ? 's are' : ' is'} currently assigned. Please reassign ${doctorCount > 1 ? 'them' : 'the doctor'} to another department first.`,
    }, 409);
  }

  // Check for assigned patients (optimized count query)
  const { count: patientCount, error: patientError } = await supabase
    .from('patients')
    .select('id', { count: 'exact', head: true })
    .eq('department_id', id)
    .eq('status', 'active');

  if (patientError) {
    console.error('[Departments API] Patient count error:', patientError);
    return createResponse({
      success: false,
      message: 'Unable to check for assigned patients. Please try again.',
    }, 500);
  }

  if (patientCount && patientCount > 0) {
    console.log(`[Departments API] Cannot deactivate - ${patientCount} patients assigned`);
    return createResponse({
      success: false,
      message: `Cannot deactivate "${dept.department_name}" because ${patientCount} active patient${patientCount > 1 ? 's are' : ' is'} currently assigned. Please reassign ${patientCount > 1 ? 'them' : 'the patient'} to another department first.`,
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
      message: 'Failed to deactivate department. Please try again.',
    }, 500);
  }

  console.log('[Departments API] Department deactivated:', id);
  return createResponse({
    success: true,
    message: `"${dept.department_name}" has been deactivated successfully. It will no longer be visible to patients.`,
    data,
  }, 200);
}
