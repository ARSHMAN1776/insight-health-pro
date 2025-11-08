import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, UserCheck, UserPlus, Calendar, TrendingUp, Activity } from 'lucide-react';
import { dataManager } from '../lib/dataManager';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface PatientStats {
  totalPatients: number;
  activePatients: number;
  malePatients: number;
  femalePatients: number;
  newThisMonth: number;
  newThisWeek: number;
  averageAge: number;
}

const PatientRegistry: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PatientStats>({
    totalPatients: 0,
    activePatients: 0,
    malePatients: 0,
    femalePatients: 0,
    newThisMonth: 0,
    newThisWeek: 0,
    averageAge: 0,
  });

  useEffect(() => {
    loadPatientStats();
  }, []);

  const loadPatientStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all patients
      const { data: patients, error } = await supabase
        .from('patients')
        .select('*');

      if (error) throw error;

      if (patients) {
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const totalPatients = patients.length;
        const activePatients = patients.filter(p => p.status === 'active').length;
        const malePatients = patients.filter(p => p.gender === 'Male').length;
        const femalePatients = patients.filter(p => p.gender === 'Female').length;
        
        const newThisMonth = patients.filter(p => 
          new Date(p.created_at) >= oneMonthAgo
        ).length;
        
        const newThisWeek = patients.filter(p => 
          new Date(p.created_at) >= oneWeekAgo
        ).length;

        // Calculate average age
        const ages = patients
          .filter(p => p.date_of_birth)
          .map(p => {
            const birthDate = new Date(p.date_of_birth);
            const age = now.getFullYear() - birthDate.getFullYear();
            return age;
          });
        
        const averageAge = ages.length > 0 
          ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
          : 0;

        setStats({
          totalPatients,
          activePatients,
          malePatients,
          femalePatients,
          newThisMonth,
          newThisWeek,
          averageAge,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patient statistics",
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
      title: 'Total Registered Patients',
      value: stats.totalPatients.toLocaleString(),
      icon: Users,
      color: 'bg-medical-blue',
      description: 'All patients in system'
    },
    {
      title: 'Active Patients',
      value: stats.activePatients.toLocaleString(),
      icon: UserCheck,
      color: 'bg-medical-green',
      description: 'Currently active status'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Registry</h1>
          <p className="text-muted-foreground mt-1">
            Overview of all registered patients in the system
          </p>
        </div>
        <Button onClick={loadPatientStats} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Demographics */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-medical-blue" />
              <span>Demographics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Male Patients</span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{stats.malePatients}</Badge>
                <span className="text-sm font-medium">
                  {stats.totalPatients > 0 
                    ? `${Math.round((stats.malePatients / stats.totalPatients) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Female Patients</span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{stats.femalePatients}</Badge>
                <span className="text-sm font-medium">
                  {stats.totalPatients > 0
                    ? `${Math.round((stats.femalePatients / stats.totalPatients) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Average Age</span>
              <span className="text-lg font-bold text-foreground">{stats.averageAge} years</span>
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-medical-green" />
              <span>Status Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Status</span>
              <div className="flex items-center space-x-2">
                <Badge className="bg-success text-success-foreground">
                  {stats.activePatients}
                </Badge>
                <span className="text-sm font-medium">
                  {stats.totalPatients > 0
                    ? `${Math.round((stats.activePatients / stats.totalPatients) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Inactive Status</span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {stats.totalPatients - stats.activePatients}
                </Badge>
                <span className="text-sm font-medium">
                  {stats.totalPatients > 0
                    ? `${Math.round(((stats.totalPatients - stats.activePatients) / stats.totalPatients) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth Metrics */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-medical-purple" />
              <span>Growth Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weekly Growth</span>
                <Badge variant="outline" className="bg-primary/10">
                  +{stats.newThisWeek}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monthly Growth</span>
                <Badge variant="outline" className="bg-primary/10">
                  +{stats.newThisMonth}
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  {stats.newThisMonth > 0 
                    ? `${Math.round((stats.newThisMonth / stats.totalPatients) * 100)}% of total registered this month`
                    : 'No new registrations this month'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                Patient Registry Summary
              </h3>
              <p className="text-sm text-muted-foreground">
                Total of <span className="font-bold text-primary">{stats.totalPatients}</span> patients registered in the system.
                <span className="ml-1">
                  {stats.activePatients} are currently active ({stats.totalPatients > 0 ? Math.round((stats.activePatients / stats.totalPatients) * 100) : 0}%).
                </span>
              </p>
            </div>
            <Users className="w-16 h-16 text-primary/30" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientRegistry;
