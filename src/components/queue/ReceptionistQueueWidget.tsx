import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Clock, ArrowRight, Activity } from 'lucide-react';
import { useQueue } from '@/hooks/useQueue';

const ReceptionistQueueWidget: React.FC = () => {
  const navigate = useNavigate();
  const { entries, loading } = useQueue();

  const waitingCount = entries.filter(e => e.status === 'waiting').length;
  const inProgressCount = entries.filter(e => e.status === 'in_consultation').length;
  const completedToday = entries.filter(e => e.status === 'completed').length;

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Queue Status
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/queue')}>
            Manage <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-warning/10 rounded-lg border border-warning/20">
            <p className="text-2xl font-bold text-warning">{waitingCount}</p>
            <p className="text-xs text-muted-foreground">Waiting</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-2xl font-bold text-primary">{inProgressCount}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
            <p className="text-2xl font-bold text-success">{completedToday}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Recent Check-ins</p>
          {entries.slice(0, 3).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-2 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">{entry.token_number}</Badge>
                <span className="text-sm">
                  {entry.patient?.first_name} {entry.patient?.last_name}
                </span>
              </div>
              <Badge 
                variant={entry.status === 'waiting' ? 'secondary' : 
                        entry.status === 'in_consultation' ? 'default' : 'outline'}
              >
                {entry.status?.replace('_', ' ')}
              </Badge>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">No patients in queue</p>
          )}
        </div>

        {/* Quick Check-in Button */}
        <Button 
          className="w-full" 
          onClick={() => navigate('/queue')}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Check In Patient
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReceptionistQueueWidget;
