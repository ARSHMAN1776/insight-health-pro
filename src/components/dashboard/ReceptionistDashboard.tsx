import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Calendar, DollarSign, Phone, UserPlus, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

const ReceptionistDashboard: React.FC = () => {
  const { user } = useAuth();

  const todayStats = [
    { title: 'Check-ins Today', value: '45', icon: Users, color: 'bg-medical-blue' },
    { title: 'Appointments', value: '67', icon: Calendar, color: 'bg-medical-green' },
    { title: 'Payments', value: '$12,450', icon: DollarSign, color: 'bg-medical-purple' },
    { title: 'Calls', value: '89', icon: Phone, color: 'bg-medical-orange' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-medical-blue to-medical-blue-dark rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.firstName}!</h1>
        <p className="text-blue-100">Front desk operations at your fingertips.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {todayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <UserPlus className="w-6 h-6" />
              <span className="text-sm">Register Patient</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Schedule</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Billing</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Phone className="w-6 h-6" />
              <span className="text-sm">Call Patient</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceptionistDashboard;