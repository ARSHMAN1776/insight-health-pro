import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Play, Clock, ArrowRight } from 'lucide-react';
import { useQueue } from '@/hooks/useQueue';

const DoctorQueueWidget: React.FC = () => {
  const navigate = useNavigate();
  const { entries, currentEntry, callNextPatient, queues, loading } = useQueue();

  const waitingCount = entries.filter(e => e.status === 'waiting').length;

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            My Queue
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/queue')}>
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Patient */}
        {currentEntry ? (
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Now Serving</p>
                <p className="font-semibold text-lg">{currentEntry.token_number}</p>
                <p className="text-sm text-muted-foreground">
                  {currentEntry.patient?.first_name} {currentEntry.patient?.last_name}
                </p>
              </div>
              <Badge variant="default" className="bg-primary">In Progress</Badge>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">No patient currently being served</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-accent/50 rounded-lg">
            <p className="text-2xl font-bold">{waitingCount}</p>
            <p className="text-xs text-muted-foreground">Waiting</p>
          </div>
          <div className="text-center p-3 bg-accent/50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">~{waitingCount * 15}</p>
            </div>
            <p className="text-xs text-muted-foreground">Est. mins</p>
          </div>
        </div>

        {/* Call Next Button */}
        <Button 
          className="w-full" 
          onClick={() => {
            const queueId = queues[0]?.id;
            if (queueId) callNextPatient(queueId);
          }}
          disabled={loading || waitingCount === 0 || queues.length === 0}
        >
          <Play className="mr-2 h-4 w-4" />
          Call Next Patient
        </Button>
      </CardContent>
    </Card>
  );
};

export default DoctorQueueWidget;
