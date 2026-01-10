import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, Volume2 } from 'lucide-react';
import { useQueue } from '@/hooks/useQueue';
import { format } from 'date-fns';

const WaitingRoomDisplay: React.FC = () => {
  const { departmentId } = useParams<{ departmentId?: string }>();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [playSound, setPlaySound] = useState(false);
  const [lastCalledToken, setLastCalledToken] = useState<string | null>(null);

  const { 
    queues, 
    calledEntries, 
    inConsultationEntries,
    waitingEntries,
    stats 
  } = useQueue({ 
    departmentId: departmentId || undefined,
    realtime: true 
  });

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Play sound when new patient is called
  useEffect(() => {
    const currentlyCalled = calledEntries[0]?.token_number;
    if (currentlyCalled && currentlyCalled !== lastCalledToken) {
      setLastCalledToken(currentlyCalled);
      // Play notification sound
      if (playSound) {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      }
    }
  }, [calledEntries, lastCalledToken, playSound]);

  // Get currently serving entries (both called and in_consultation)
  const servingEntries = [...calledEntries, ...inConsultationEntries];
  const upNext = waitingEntries.slice(0, 8);

  // Group by doctor/queue
  const queuesByDoctor = queues.map(queue => ({
    queue,
    serving: servingEntries.find(e => e.queue_id === queue.id),
    waiting: waitingEntries.filter(e => e.queue_id === queue.id).slice(0, 5)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {departmentId ? queues[0]?.department?.department_name || 'Queue Display' : 'Hospital Queue'}
          </h1>
          <p className="text-muted-foreground">Patient Queue Status</p>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setPlaySound(!playSound)}
            className={`p-2 rounded-full ${playSound ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            <Volume2 className="h-6 w-6" />
          </button>
          <div className="text-right">
            <p className="text-4xl font-mono font-bold text-foreground">
              {format(currentTime, 'HH:mm')}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(currentTime, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Display Grid */}
      {queuesByDoctor.length === 1 ? (
        // Single doctor view - large display
        <SingleDoctorDisplay 
          queue={queuesByDoctor[0].queue}
          serving={queuesByDoctor[0].serving}
          waiting={queuesByDoctor[0].waiting}
          totalWaiting={stats.totalWaiting}
        />
      ) : (
        // Multiple doctors view - grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queuesByDoctor.map(({ queue, serving, waiting }) => (
            <DoctorQueueCard 
              key={queue.id}
              queue={queue}
              serving={serving}
              waiting={waiting}
            />
          ))}
        </div>
      )}

      {/* Footer Stats */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-lg">
                <strong>{stats.totalWaiting}</strong> patients waiting
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg">
                Avg. wait: <strong>~{stats.avgWaitTime} mins</strong>
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Auto-refreshing • Last update: {format(new Date(), 'HH:mm:ss')}
          </div>
        </div>
      </div>
    </div>
  );
};

// Single doctor large display
const SingleDoctorDisplay: React.FC<{
  queue: any;
  serving: any;
  waiting: any[];
  totalWaiting: number;
}> = ({ queue, serving, waiting, totalWaiting }) => {
  return (
    <div className="space-y-6 pb-24">
      {/* Doctor Info */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Dr. {queue.doctor?.first_name} {queue.doctor?.last_name}
        </h2>
        <p className="text-muted-foreground">{queue.doctor?.specialization}</p>
      </div>

      {/* Now Serving - Large */}
      <Card className="border-4 border-primary bg-primary/5">
        <CardContent className="p-12 text-center">
          <p className="text-xl text-muted-foreground mb-4">NOW SERVING</p>
          {serving ? (
            <>
              <p className="text-9xl font-bold text-primary tracking-wider mb-4 animate-pulse">
                {serving.token_number}
              </p>
              <p className="text-2xl text-foreground">
                {serving.patient?.first_name} {serving.patient?.last_name}
              </p>
              {serving.status === 'called' && (
                <Badge className="mt-4 text-lg px-4 py-1">Please proceed to consultation room</Badge>
              )}
            </>
          ) : (
            <p className="text-4xl text-muted-foreground">---</p>
          )}
        </CardContent>
      </Card>

      {/* Up Next */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-center">UP NEXT</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {waiting.map((entry, index) => (
            <div
              key={entry.id}
              className={`px-8 py-4 rounded-xl text-center ${
                index === 0 
                  ? 'bg-primary/20 border-2 border-primary text-2xl font-bold'
                  : 'bg-muted text-xl'
              }`}
            >
              {entry.token_number}
            </div>
          ))}
          {waiting.length === 0 && (
            <p className="text-muted-foreground">No patients waiting</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 mt-8">
        <div className="text-center">
          <p className="text-5xl font-bold text-foreground">{totalWaiting}</p>
          <p className="text-muted-foreground">Waiting</p>
        </div>
        <div className="text-center">
          <p className="text-5xl font-bold text-foreground">~{queue.avg_consultation_mins}m</p>
          <p className="text-muted-foreground">Avg. Wait</p>
        </div>
      </div>
    </div>
  );
};

// Multi-doctor card view
const DoctorQueueCard: React.FC<{
  queue: any;
  serving: any;
  waiting: any[];
}> = ({ queue, serving, waiting }) => {
  return (
    <Card className="overflow-hidden">
      {/* Doctor Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <h3 className="font-semibold">
          Dr. {queue.doctor?.first_name} {queue.doctor?.last_name}
        </h3>
        <p className="text-sm opacity-90">{queue.doctor?.specialization}</p>
      </div>

      <CardContent className="p-4">
        {/* Now Serving */}
        <div className="text-center py-6 border-b">
          <p className="text-sm text-muted-foreground mb-1">NOW SERVING</p>
          {serving ? (
            <p className="text-5xl font-bold text-primary animate-pulse">
              {serving.token_number}
            </p>
          ) : (
            <p className="text-3xl text-muted-foreground">---</p>
          )}
        </div>

        {/* Waiting List */}
        <div className="pt-4">
          <p className="text-sm text-muted-foreground mb-2">UP NEXT:</p>
          <div className="flex flex-wrap gap-2">
            {waiting.slice(0, 5).map((entry) => (
              <Badge key={entry.id} variant="outline" className="text-lg px-3 py-1">
                {entry.token_number}
              </Badge>
            ))}
            {waiting.length === 0 && (
              <span className="text-sm text-muted-foreground">No patients waiting</span>
            )}
          </div>
          {waiting.length > 5 && (
            <p className="text-sm text-muted-foreground mt-2">
              +{waiting.length - 5} more
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WaitingRoomDisplay;
