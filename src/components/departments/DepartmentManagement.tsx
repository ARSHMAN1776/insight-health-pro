import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Power, Building2, Search, User, PowerOff } from 'lucide-react';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

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

const DepartmentManagement: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    department_name: '',
    description: '',
    department_head: '',
    status: 'Active',
  });

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('departments', {
        method: 'GET',
        body: null,
        headers: { 'Content-Type': 'application/json' },
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
        toast.error('Failed to fetch departments');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.department_name.trim()) {
      toast.error('Department Name is required');
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
        toast.error(data?.message || 'Operation failed');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to save department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      department_name: department.department_name,
      description: department.description || '',
      department_head: department.department_head || '',
      status: department.status,
    });
    setDialogOpen(true);
  };

  const handleDeactivate = async () => {
    if (!selectedDepartment) return;

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        `departments?action=deactivate&id=${selectedDepartment.department_id}`,
        { method: 'PUT' }
      );

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message);
        setDeactivateDialogOpen(false);
        setSelectedDepartment(null);
        fetchDepartments();
      } else {
        toast.error(data?.message || 'Failed to deactivate department');
      }
    } catch (error: any) {
      console.error('Deactivate error:', error);
      toast.error(error.message || 'Failed to deactivate department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReactivate = async (department: Department) => {
    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        `departments?action=update&id=${department.department_id}`,
        { 
          method: 'PUT',
          body: { status: 'Active' }
        }
      );

      if (error) throw error;

      if (data?.success) {
        toast.success('Department reactivated successfully');
        fetchDepartments();
      } else {
        toast.error(data?.message || 'Failed to reactivate department');
      }
    } catch (error: any) {
      console.error('Reactivate error:', error);
      toast.error(error.message || 'Failed to reactivate department');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDepartment(null);
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
    dept.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Department Management</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage hospital departments' : 'View hospital departments'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {selectedDepartment ? 'Edit Department' : 'Add New Department'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="department_name">Department Name *</Label>
                    <Input
                      id="department_name"
                      value={formData.department_name}
                      onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                      placeholder="e.g., Cardiology"
                      maxLength={255}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the department"
                      rows={3}
                      maxLength={1000}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department_head">Department Head</Label>
                      <Select
                        value={formData.department_head}
                        onValueChange={(value) => setFormData({ ...formData, department_head: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select head doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              Dr. {doctor.first_name} {doctor.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Saving...' : (selectedDepartment ? 'Update' : 'Create')} Department
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
            <Building2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.filter((d) => d.status === 'Active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Department Head</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.filter((d) => d.department_head).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Department Head</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No departments match your search' : 'No departments found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((dept) => (
                  <TableRow key={dept.department_id}>
                    <TableCell>
                      <div className="font-medium">{dept.department_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                        {dept.description || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{getDoctorName(dept)}</TableCell>
                    <TableCell>
                      <Badge variant={dept.status === 'Active' ? 'default' : 'secondary'}>
                        {dept.status}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(dept)}
                            title="Edit department"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {dept.status === 'Active' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedDepartment(dept);
                                setDeactivateDialogOpen(true);
                              }}
                              title="Deactivate department"
                            >
                              <PowerOff className="h-4 w-4 text-destructive" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReactivate(dept)}
                              disabled={submitting}
                              title="Reactivate department"
                            >
                              <Power className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        title="Deactivate Department"
        description={`Are you sure you want to deactivate "${selectedDepartment?.department_name}"? This will soft-delete the department and it won't be visible to patients during appointment booking.`}
        onConfirm={handleDeactivate}
        confirmText={submitting ? 'Deactivating...' : 'Deactivate'}
        variant="destructive"
      />
    </div>
  );
};

export default DepartmentManagement;
