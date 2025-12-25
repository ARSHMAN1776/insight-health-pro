import React, { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Plus, 
  Pencil, 
  Building2, 
  Search, 
  User, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

// ============= Zod Validation Schema =============
const departmentSchema = z.object({
  department_name: z
    .string()
    .trim()
    .min(2, 'Department name must be at least 2 characters')
    .max(255, 'Department name must be less than 255 characters')
    .regex(
      /^[a-zA-Z0-9\s\-&(),.']+$/,
      'Department name can only contain letters, numbers, spaces, and common punctuation'
    ),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .transform(val => val?.trim() || ''),
  department_head: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

interface Department {
  department_id: string;
  department_name: string;
  description: string | null;
  department_head: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  head_doctor?: {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
  } | null;
}

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
}

interface FormErrors {
  department_name?: string;
  description?: string;
  department_head?: string;
  status?: string;
}

const DepartmentManagement: React.FC = () => {
  const { user, isRole } = useAuth();
  const isAdmin = isRole('admin');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ dept: Department; newStatus: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    department_name: '',
    description: '',
    department_head: '',
    status: 'Active',
  });

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('departments?action=list', {
        method: 'GET',
      });

      if (error) throw error;

      if (data?.success) {
        setDepartments(data.data || []);
      } else {
        throw new Error(data?.message || 'Failed to fetch departments');
      }
    } catch (error: any) {
      console.error('Failed to fetch departments:', error);
      // Fallback to direct query
      const { data, error: dbError } = await supabase
        .from('departments')
        .select('*')
        .order('department_name');
      
      if (!dbError && data) {
        setDepartments(data);
      } else {
        toast.error('Unable to load departments. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, first_name, last_name, specialization')
        .eq('status', 'active')
        .order('first_name');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      console.error('Failed to fetch doctors:', error);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, [fetchDepartments, fetchDoctors]);


  // Validate form data
  const validateForm = (): boolean => {
    try {
      departmentSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: FormErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof FormErrors;
          errors[field] = err.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting.');
      return;
    }

    // Double-check admin permission
    if (!isAdmin) {
      toast.error('You do not have permission to perform this action.');
      return;
    }

    setSubmitting(true);

    try {
      const action = selectedDepartment ? 'update' : 'add';
      const queryParams = selectedDepartment 
        ? `?action=${action}&id=${selectedDepartment.department_id}` 
        : `?action=${action}`;

      const { data, error } = await supabase.functions.invoke(`departments${queryParams}`, {
        method: selectedDepartment ? 'PUT' : 'POST',
        body: {
          department_name: formData.department_name.trim(),
          description: formData.description.trim() || null,
          department_head: formData.department_head || null,
          status: formData.status,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message);
        setDialogOpen(false);
        resetForm();
        fetchDepartments();
      } else {
        // Handle multiple errors if present
        if (data?.errors?.length > 0) {
          data.errors.forEach((err: string) => toast.error(err));
        } else {
          toast.error(data?.message || 'Operation failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      if (error.message?.includes('403')) {
        toast.error('Access denied. Administrator privileges are required.');
      } else if (error.message?.includes('401')) {
        toast.error('Your session has expired. Please log in again.');
      } else {
        toast.error(error.message || 'Failed to save department. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (department: Department) => {
    if (!isAdmin) {
      toast.error('You do not have permission to edit departments.');
      return;
    }
    setSelectedDepartment(department);
    setFormErrors({});
    setFormData({
      department_name: department.department_name,
      description: department.description || '',
      department_head: department.department_head || '',
      status: department.status,
    });
    setDialogOpen(true);
  };

  const initiateStatusChange = (dept: Department) => {
    if (!isAdmin) {
      toast.error('You do not have permission to change department status.');
      return;
    }
    const newStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
    setPendingStatusChange({ dept, newStatus });
    setStatusDialogOpen(true);
  };

  const handleStatusChange = async () => {
    if (!pendingStatusChange) return;

    // Double-check admin permission
    if (!isAdmin) {
      toast.error('You do not have permission to perform this action.');
      setStatusDialogOpen(false);
      setPendingStatusChange(null);
      return;
    }

    const { dept, newStatus } = pendingStatusChange;
    setSubmitting(true);

    try {
      if (newStatus === 'Inactive') {
        // Use deactivate endpoint for validation
        const { data, error } = await supabase.functions.invoke(
          `departments?action=deactivate&id=${dept.department_id}`,
          { method: 'PUT' }
        );

        if (error) throw error;

        if (data?.success) {
          toast.success(data.message);
          fetchDepartments();
        } else {
          toast.error(data?.message || 'Failed to deactivate department');
        }
      } else {
        // Reactivate
        const { data, error } = await supabase.functions.invoke(
          `departments?action=update&id=${dept.department_id}`,
          { 
            method: 'PUT',
            body: { status: 'Active' }
          }
        );

        if (error) throw error;

        if (data?.success) {
          toast.success(data.message);
          fetchDepartments();
        } else {
          toast.error(data?.message || 'Failed to activate department');
        }
      }
    } catch (error: any) {
      console.error('Status change error:', error);
      if (error.message?.includes('403')) {
        toast.error('Access denied. Administrator privileges are required.');
      } else if (error.message?.includes('401')) {
        toast.error('Your session has expired. Please log in again.');
      } else {
        toast.error(error.message || 'Failed to update status. Please try again.');
      }
    } finally {
      setSubmitting(false);
      setStatusDialogOpen(false);
      setPendingStatusChange(null);
    }
  };

  const resetForm = () => {
    setSelectedDepartment(null);
    setFormErrors({});
    setFormData({
      department_name: '',
      description: '',
      department_head: '',
      status: 'Active',
    });
  };

  const getDoctorName = (department: Department) => {
    if (department.head_doctor) {
      return `Dr. ${department.head_doctor.first_name} ${department.head_doctor.last_name}`;
    }
    if (!department.department_head) return 'Not assigned';
    const doctor = doctors.find((d) => d.id === department.department_head);
    return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Unknown';
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDepartments = departments.filter((d) => d.status === 'Active').length;
  const inactiveDepartments = departments.filter((d) => d.status === 'Inactive').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            Department Management
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Create, edit, and manage hospital departments' : 'View hospital departments'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>

          <Button variant="outline" size="icon" onClick={fetchDepartments} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>

          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {selectedDepartment ? 'Edit Department' : 'Add New Department'}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedDepartment 
                      ? 'Update the department information below.' 
                      : 'Fill in the details to create a new department.'}
                  </DialogDescription>
                </DialogHeader>
                
                <Separator />
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="department_name" className="text-sm font-medium">
                      Department Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="department_name"
                      value={formData.department_name}
                      onChange={(e) => {
                        setFormData({ ...formData, department_name: e.target.value });
                        if (formErrors.department_name) {
                          setFormErrors({ ...formErrors, department_name: undefined });
                        }
                      }}
                      placeholder="e.g., Cardiology"
                      maxLength={255}
                      required
                      className={`bg-card ${formErrors.department_name ? 'border-destructive' : ''}`}
                      aria-invalid={!!formErrors.department_name}
                      aria-describedby={formErrors.department_name ? 'department_name_error' : undefined}
                    />
                    {formErrors.department_name && (
                      <p id="department_name_error" className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.department_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        if (formErrors.description) {
                          setFormErrors({ ...formErrors, description: undefined });
                        }
                      }}
                      placeholder="Brief description of the department and its services..."
                      rows={3}
                      maxLength={1000}
                      className={`bg-card resize-none ${formErrors.description ? 'border-destructive' : ''}`}
                      aria-invalid={!!formErrors.description}
                      aria-describedby={formErrors.description ? 'description_error' : 'description_hint'}
                    />
                    {formErrors.description ? (
                      <p id="description_error" className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.description}
                      </p>
                    ) : (
                      <p id="description_hint" className="text-xs text-muted-foreground">
                        {formData.description.length}/1000 characters
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department_head" className="text-sm font-medium">
                      Department Head
                    </Label>
                    <Select
                      value={formData.department_head || "__none__"}
                      onValueChange={(value) => setFormData({ ...formData, department_head: value === "__none__" ? "" : value })}
                    >
                      <SelectTrigger className="bg-card">
                        <SelectValue placeholder="Select department head (optional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="__none__">None</SelectItem>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              Dr. {doctor.first_name} {doctor.last_name}
                              <span className="text-xs text-muted-foreground">
                                ({doctor.specialization})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="status_toggle" className="text-sm font-medium cursor-pointer">
                        Department Status
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.status === 'Active' 
                          ? 'Department is visible and available' 
                          : 'Department is hidden from users'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={formData.status === 'Active' ? 'default' : 'secondary'}>
                        {formData.status}
                      </Badge>
                      <Switch
                        id="status_toggle"
                        checked={formData.status === 'Active'}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, status: checked ? 'Active' : 'Inactive' })
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)} 
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        selectedDepartment ? 'Update Department' : 'Create Department'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All registered departments</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeDepartments}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently operational</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inactiveDepartments}</div>
            <p className="text-xs text-muted-foreground mt-1">Temporarily disabled</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With Head</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {departments.filter((d) => d.department_head).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Have assigned head</p>
          </CardContent>
        </Card>
      </div>

      {/* Departments Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Department List</CardTitle>
          <CardDescription>
            {filteredDepartments.length} department{filteredDepartments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Department Name</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Department Head</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  {isAdmin && <TableHead className="font-semibold text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 opacity-50" />
                        <div>
                          <p className="font-medium">No departments found</p>
                          <p className="text-sm">
                            {searchTerm 
                              ? 'Try adjusting your search terms' 
                              : 'Get started by adding your first department'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((dept) => (
                    <TableRow key={dept.department_id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="font-medium">{dept.department_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-[300px] truncate">
                          {dept.description || <span className="italic">No description</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className={dept.department_head ? '' : 'text-muted-foreground italic'}>
                            {getDoctorName(dept)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={dept.status === 'Active' ? 'default' : 'secondary'}
                            className={dept.status === 'Active' 
                              ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-100'}
                          >
                            {dept.status === 'Active' ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {dept.status}
                          </Badge>
                          {isAdmin && (
                            <Switch
                              checked={dept.status === 'Active'}
                              onCheckedChange={() => initiateStatusChange(dept)}
                              disabled={submitting}
                              className="data-[state=checked]:bg-green-500"
                            />
                          )}
                        </div>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(dept)}
                            className="gap-2"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        title={pendingStatusChange?.newStatus === 'Inactive' ? 'Deactivate Department' : 'Activate Department'}
        description={
          pendingStatusChange?.newStatus === 'Inactive'
            ? `Are you sure you want to deactivate "${pendingStatusChange?.dept.department_name}"? This will hide the department from patients during appointment booking. Deactivation will be blocked if doctors or patients are currently assigned.`
            : `Are you sure you want to activate "${pendingStatusChange?.dept.department_name}"? This will make the department visible to all users.`
        }
        onConfirm={handleStatusChange}
        confirmText={submitting ? 'Processing...' : (pendingStatusChange?.newStatus === 'Inactive' ? 'Deactivate' : 'Activate')}
        variant={pendingStatusChange?.newStatus === 'Inactive' ? 'destructive' : 'default'}
      />
    </div>
  );
};

export default DepartmentManagement;
