import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Users, 
  Stethoscope, 
  UserCheck, 
  Pill, 
  Shield,
  RefreshCw,
  Mail,
  Phone,
  Building,
  Filter,
  Calendar
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import StaffScheduleManager from './StaffScheduleManager';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  department: string | null;
  specialization: string | null;
  licenseNumber: string | null;
  createdAt: string;
}

const roleIcons: Record<string, React.ElementType> = {
  doctor: Stethoscope,
  nurse: UserCheck,
  receptionist: Users,
  pharmacist: Pill,
  admin: Shield,
};

const roleColors: Record<string, string> = {
  doctor: 'bg-primary/10 text-primary border-primary/20',
  nurse: 'bg-success/10 text-success border-success/20',
  receptionist: 'bg-info/10 text-info border-info/20',
  pharmacist: 'bg-warning/10 text-warning border-warning/20',
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
};

const StaffList: React.FC = () => {
  const { isRole } = useAuth();
  const isAdmin = isRole('admin');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<{
    id: string;
    name: string;
    type: 'doctor' | 'nurse';
    specialization?: string;
  } | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      // Get all profiles with their roles (excluding patients)
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .neq('role', 'patient');

      if (rolesError) throw rolesError;

      if (!rolesData || rolesData.length === 0) {
        setStaff([]);
        setLoading(false);
        return;
      }

      // Get profiles for these users
      const userIds = rolesData.map(r => r.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Get user emails from auth (we'll use the profiles data since we can't access auth.users directly)
      // For now, we'll construct staff data from profiles and roles
      const staffMembers: StaffMember[] = (profilesData || []).map(profile => {
        const roleInfo = rolesData.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: '', // We'll need to get this from a different source or add email to profiles
          phone: profile.phone,
          role: roleInfo?.role || 'unknown',
          department: profile.department,
          specialization: profile.specialization,
          licenseNumber: profile.license_number,
          createdAt: profile.created_at || '',
        };
      });

      setStaff(staffMembers);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const roleCounts = staff.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['doctor', 'nurse', 'receptionist', 'pharmacist', 'admin'].map((role) => {
          const Icon = roleIcons[role];
          const count = roleCounts[role] || 0;
          return (
            <Card key={role} className={`${roleColors[role]} border shadow-sm`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium opacity-70 capitalize">{role}s</p>
                    <p className="text-2xl font-bold">{loading ? '-' : count}</p>
                  </div>
                  <Icon className="w-8 h-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Table Card */}
      <Card className="shadow-elegant border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Registered Staff Members
              </CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `${filteredStaff.length} staff members found`}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchStaff}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, department, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-11 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="doctor">Doctors</SelectItem>
                  <SelectItem value="nurse">Nurses</SelectItem>
                  <SelectItem value="receptionist">Receptionists</SelectItem>
                  <SelectItem value="pharmacist">Pharmacists</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Staff Member</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Department</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Contact</TableHead>
                  <TableHead className="font-semibold hidden xl:table-cell">License</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Joined</TableHead>
                  {isAdmin && <TableHead className="font-semibold">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="w-32 h-4" />
                            <Skeleton className="w-24 h-3" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="w-20 h-6" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="w-24 h-4" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="w-28 h-4" /></TableCell>
                      <TableCell className="hidden xl:table-cell"><Skeleton className="w-20 h-4" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="w-24 h-4" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="w-10 h-10 opacity-30" />
                        <p className="font-medium">No staff members found</p>
                        <p className="text-sm">
                          {searchTerm || roleFilter !== 'all' 
                            ? 'Try adjusting your search or filters' 
                            : 'Create new staff accounts to see them here'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => {
                    const RoleIcon = roleIcons[member.role] || Users;
                    return (
                      <TableRow key={member.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className={`${roleColors[member.role]} font-semibold`}>
                                {getInitials(member.firstName, member.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground">
                                {member.firstName} {member.lastName}
                              </p>
                              {member.specialization && (
                                <p className="text-sm text-muted-foreground">
                                  {member.specialization}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${roleColors[member.role]} capitalize gap-1.5`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {member.department ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="w-4 h-4 text-muted-foreground" />
                              {member.department}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {member.phone ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              {member.phone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <span className="text-sm font-mono">
                            {member.licenseNumber || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(member.createdAt)}
                          </span>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            {(member.role === 'doctor' || member.role === 'nurse') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedStaff({
                                    id: member.id,
                                    name: `${member.firstName} ${member.lastName}`,
                                    type: member.role as 'doctor' | 'nurse',
                                    specialization: member.specialization || undefined
                                  });
                                  setScheduleDialogOpen(true);
                                }}
                                className="gap-1.5"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                Schedule
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Manager Dialog */}
      <StaffScheduleManager
        staff={selectedStaff || undefined}
        isOpen={scheduleDialogOpen}
        onClose={() => {
          setScheduleDialogOpen(false);
          setSelectedStaff(null);
        }}
      />
    </div>
  );
};

export default StaffList;
