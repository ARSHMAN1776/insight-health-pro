import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Play, 
  CheckCircle, 
  XCircle, 
  SkipForward, 
  Clock, 
  User,
  Phone,
  AlertTriangle,
  Coffee,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQueue, QueueEntry } from '@/hooks/useQueue';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInMinutes } from 'date-fns';

const DoctorQueueView: React.FC = () => {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);

  // Get doctor ID
  useEffect(() => {
    const fetchDoctorId = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (data) setDoctorId(data.id);
    };
    fetchDoctorId();
  }, [user?.id]);

  const { 
    loading, 
    queues,
    waitingEntries, 
    calledEntries,
    inConsultationEntries,
    completedEntries,
    stats,
    callNextPatient,
    startConsultation,
    completeConsultation,
    markNoShow,
    refetch
  } = useQueue({ doctorId: doctorId || undefined });

  const currentQueue = queues[0];
  const currentPatient = inConsultationEntries[0] || calledEntries[0];

  const handleCallNext = async () => {
    if (!currentQueue) return;
    await callNextPatient(currentQueue.id);
  };

  const handleStartConsultation = async () => {
    if (!currentPatient) return;
    await startConsultation(currentPatient.id);
  };

  const handleComplete = async () => {
    if (!currentPatient) return;
    await completeConsultation(currentPatient.id);
  };

  const handleNoShow = async (entry: QueueEntry) => {
    await markNoShow(entry.id);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return <Badge variant="destructive">Emergency</Badge>;
      case 'priority':
        return <Badge className="bg-orange-500">Priority</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getWaitTime = (checkedInAt: string) => {
    const mins = differenceInMinutes(new Date(), new Date(checkedInAt));
    return mins < 1 ? 'Just now' : `${mins}m`;
  };

  if (!doctorId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading doctor information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Waiting</p>
              <p className="text-2xl font-bold">{stats.totalWaiting}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Served Today</p>
              <p className="text-2xl font-bold">{stats.totalServed}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Time</p>
              <p className="text-2xl font-bold">{stats.avgWaitTime}m</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <Button
              variant={isOnBreak ? 'default' : 'outline'}
              className="w-full h-full"
              onClick={() => setIsOnBreak(!isOnBreak)}
            >
              <Coffee className="h-5 w-5 mr-2" />
              {isOnBreak ? 'Resume Queue' : 'Take Break'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Patient */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Now Serving</CardTitle>
            <CardDescription>Current patient in consultation</CardDescription>
          </CardHeader>
          <CardContent>
            {currentPatient ? (
              <div className="space-y-4">
                <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl font-bold text-primary">
                          {currentPatient.token_number}
                        </span>
                        {getPriorityBadge(currentPatient.priority)}
                        <Badge variant="outline">{currentPatient.entry_type}</Badge>
                      </div>
                      <h3 className="text-xl font-semibold">
                        {currentPatient.patient?.first_name} {currentPatient.patient?.last_name}
                      </h3>
                      {currentPatient.patient?.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {currentPatient.patient.phone}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Wait: {getWaitTime(currentPatient.checked_in_at)}</p>
                      {currentPatient.consultation_started_at && (
                        <p>Started: {format(new Date(currentPatient.consultation_started_at), 'HH:mm')}</p>
                      )}
                    </div>
                  </div>

                  {currentPatient.symptoms && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Symptoms:</p>
                      <p className="text-sm">{currentPatient.symptoms}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {currentPatient.status === 'called' && (
                      <Button onClick={handleStartConsultation} className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Start Consultation
                      </Button>
                    )}
                    {currentPatient.status === 'in_consultation' && (
                      <Button onClick={handleComplete} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Consultation
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => handleNoShow(currentPatient)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      No Show
                    </Button>
                  </div>
                </div>

                {/* Call Next Button */}
                {!inConsultationEntries.length && waitingEntries.length > 0 && (
                  <Button 
                    onClick={handleCallNext} 
                    size="lg" 
                    className="w-full"
                    disabled={isOnBreak}
                  >
                    <SkipForward className="h-5 w-5 mr-2" />
                    Call Next Patient
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                {waitingEntries.length > 0 ? (
                  <>
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {waitingEntries.length} patients waiting
                    </p>
                    <Button onClick={handleCallNext} size="lg" disabled={isOnBreak}>
                      <Play className="h-5 w-5 mr-2" />
                      Call First Patient
                    </Button>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <p className="text-muted-foreground">No patients waiting</p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Waiting List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Waiting Queue</CardTitle>
              <CardDescription>{waitingEntries.length} patients</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {waitingEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No patients in queue
                  </p>
                ) : (
                  waitingEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary">
                            {entry.token_number}
                          </span>
                          {entry.priority === 'emergency' && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getWaitTime(entry.checked_in_at)}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {entry.patient?.first_name} {entry.patient?.last_name}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {getPriorityBadge(entry.priority)}
                        <Badge variant="outline" className="text-xs">
                          {entry.entry_type}
                        </Badge>
                      </div>
                      {entry.symptoms && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {entry.symptoms}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Completed Today */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Today</CardTitle>
          <CardDescription>{completedEntries.length} consultations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {completedEntries.slice(0, 20).map((entry) => (
              <Badge key={entry.id} variant="outline" className="py-1">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                {entry.token_number} - {entry.patient?.first_name}
              </Badge>
            ))}
            {completedEntries.length === 0 && (
              <p className="text-sm text-muted-foreground">No completed consultations yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorQueueView;
