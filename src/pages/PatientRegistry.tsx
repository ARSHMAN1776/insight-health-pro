import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, UserCheck, UserPlus, Calendar, TrendingUp, Activity } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

interface SignupUser {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  department: string | null;
  created_at: string;
}

interface PatientStats {
  totalUsers: number;
  newThisMonth: number;
  newThisWeek: number;
}

const PatientRegistry: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<SignupUser[]>([]);
  const [stats, setStats] = useState<PatientStats>({
    totalUsers: 0,
    newThisMonth: 0,
    newThisWeek: 0,
  });

  useEffect(() => {
    loadSignupData();
  }, []);

  const loadSignupData = async () => {
    try {
      setLoading(true);
      
      // Fetch all user profiles (signup data)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (profiles) {
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const totalUsers = profiles.length;
        
        const newThisMonth = profiles.filter(p => 
          new Date(p.created_at) >= oneMonthAgo
        ).length;
        
        const newThisWeek = profiles.filter(p => 
          new Date(p.created_at) >= oneWeekAgo
        ).length;

        setUsers(profiles);
        setStats({
          totalUsers,
          newThisMonth,
          newThisWeek,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load signup data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading patient registry data...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Registered Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-medical-blue',
      description: 'All signed up users'
    },
    {
      title: 'New This Month',
      value: stats.newThisMonth.toLocaleString(),
      icon: UserPlus,
      color: 'bg-medical-purple',
      description: 'Registered in last 30 days'
    },
    {
      title: 'New This Week',
      value: stats.newThisWeek.toLocaleString(),
      icon: Calendar,
      color: 'bg-medical-orange',
      description: 'Registered in last 7 days'
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Registry</h1>
          <p className="text-muted-foreground mt-1">
            All users who signed up to the patient portal from Supabase
          </p>
        </div>
        <Button onClick={loadSignupData} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="stat-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <div className={`w-14 h-14 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Signup Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Registered Users from Patient Portal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users have signed up yet
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Signup Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {user.id.slice(0, 8)}...
                        </code>
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientRegistry;
