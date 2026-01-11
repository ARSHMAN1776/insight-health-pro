import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, TicketCheck, Bell, Printer, PartyPopper } from 'lucide-react';
import { QueueEntry } from '@/hooks/useQueue';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface QueueStatusViewProps {
  patientId?: string;
}

const QueueStatusView: React.FC<QueueStatusViewProps> = ({ patientId }) => {
  const { user } = useAuth();
  const [myPatientId, setMyPatientId] = useState<string | null>(patientId || null);
  const [myQueueEntry, setMyQueueEntry] = useState<QueueEntry | null>(null);
  const [currentlyServing, setCurrentlyServing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get patient ID for current user if not provided
  useEffect(() => {
    const fetchPatientId = async () => {
      if (patientId) {
        setMyPatientId(patientId);
        return;
      }
      
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setMyPatientId(data.id);
      }
    };
    
    fetchPatientId();
  }, [user?.id, patientId]);

  // Fetch queue entry for current patient
  const fetchMyQueueEntry = useCallback(async () => {
    if (!myPatientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('queue_entries')
        .select(`
          *,
          patient:patients(id, first_name, last_name),
          queue:daily_queues(
            *,
            doctor:doctors(id, first_name, last_name, specialization),
            department:departments(department_id, department_name)
          )
        `)
        .eq('patient_id', myPatientId)
        .in('status', ['waiting', 'called', 'in_consultation'])
        .order('checked_in_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setMyQueueEntry(data as QueueEntry);
        
        // Fetch currently serving token for this queue
        if (data.queue_id) {
          const { data: servingData } = await supabase
            .from('queue_entries')
            .select('token_number')
            .eq('queue_id', data.queue_id)
            .eq('status', 'in_consultation')
            .limit(1)
            .maybeSingle();
          
          setCurrentlyServing(servingData?.token_number || null);
        }
      } else {
        setMyQueueEntry(null);
      }
    } catch (error) {
      console.error('Error fetching queue entry:', error);
    } finally {
      setLoading(false);
    }
  }, [myPatientId]);

  useEffect(() => {
    fetchMyQueueEntry();

    // Set up real-time subscription
    if (!myPatientId) return;

    const channel = supabase
      .channel('patient-queue-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `patient_id=eq.${myPatientId}`
        },
        () => {
          fetchMyQueueEntry();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myPatientId, fetchMyQueueEntry]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="py-8 text-center">
          <div className="rounded-full h-8 w-8 border-b-2 border-primary mx-auto animate-spin"></div>
          <p className="text-sm text-muted-foreground mt-2">Checking queue status...</p>
        </CardContent>
      </Card>
    );
  }

  if (!myQueueEntry) {
    return null; // Don't show anything if not in queue
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'waiting':
        return { label: 'Waiting', color: 'bg-warning text-warning-foreground', icon: Clock };
      case 'called':
        return { label: 'Your Turn!', color: 'bg-primary text-primary-foreground animate-pulse', icon: Bell };
      case 'in_consultation':
        return { label: 'In Consultation', color: 'bg-success text-success-foreground', icon: Users };
      default:
        return { label: status, color: 'bg-muted text-muted-foreground', icon: TicketCheck };
    }
  };

  const getWaitMessage = () => {
    const position = myQueueEntry.position_in_queue || 0;
    const waitMins = myQueueEntry.estimated_wait_mins || 0;
    
    if (myQueueEntry.status === 'called') {
      return {
        primary: "🎉 It's Your Turn!",
        secondary: "Please proceed to the consultation room now"
      };
    }
    
    if (myQueueEntry.status === 'in_consultation') {
      return {
        primary: "Consultation in Progress",
        secondary: "You are currently with the doctor"
      };
    }
    
    if (position === 1) {
      return {
        primary: "You're Next!",
        secondary: "Get ready, you'll be called any moment"
      };
    }
    
    if (position <= 3) {
      return {
        primary: "Almost There!",
        secondary: `Just ${position - 1} patient${position - 1 !== 1 ? 's' : ''} ahead of you`
      };
    }
    
    return {
      primary: `Expected Wait: ~${waitMins} mins`,
      secondary: `${position - 1} patients ahead of you`
    };
  };

  const statusInfo = getStatusDisplay(myQueueEntry.status);
  const StatusIcon = statusInfo.icon;
  const waitMessage = getWaitMessage();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className={`overflow-hidden border-2 transition-all duration-300 ${
      myQueueEntry.status === 'called' 
        ? 'border-primary shadow-lg shadow-primary/20 animate-pulse' 
        : 'border-border'
    }`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TicketCheck className="h-5 w-5 text-primary" />
          Your Queue Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Token Display */}
        <div className="text-center py-4 bg-primary/10 rounded-xl relative overflow-hidden">
          {myQueueEntry.status === 'called' && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-shimmer" />
          )}
          <p className="text-xs text-muted-foreground mb-1">Your Token</p>
          <p className="text-4xl font-bold text-primary tracking-wider relative">{myQueueEntry.token_number}</p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge className={`${statusInfo.color} text-sm px-4 py-1.5 flex items-center gap-2`}>
            <StatusIcon className="h-4 w-4" />
            {statusInfo.label}
          </Badge>
        </div>

        {/* Dynamic Wait Message */}
        <div className="text-center p-4 bg-muted/30 rounded-xl">
          <p className="text-lg font-semibold text-foreground">{waitMessage.primary}</p>
          <p className="text-sm text-muted-foreground mt-1">{waitMessage.secondary}</p>
        </div>

        {/* Queue Info */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-accent/50 rounded-lg">
            <p className="text-2xl font-bold">{myQueueEntry.position_in_queue || '-'}</p>
            <p className="text-xs text-muted-foreground">Position</p>
          </div>
          <div className="p-3 bg-accent/50 rounded-lg">
            <p className="text-2xl font-bold">~{myQueueEntry.estimated_wait_mins || 0}</p>
            <p className="text-xs text-muted-foreground">Est. mins</p>
          </div>
        </div>

        {/* Currently Serving */}
        {currentlyServing && myQueueEntry.status === 'waiting' && (
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Now Serving</p>
            <p className="font-mono font-bold text-lg">{currentlyServing}</p>
          </div>
        )}

        {/* Doctor Info */}
        {myQueueEntry.queue?.doctor && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Doctor</p>
            <p className="font-medium">
              Dr. {myQueueEntry.queue.doctor.first_name} {myQueueEntry.queue.doctor.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {myQueueEntry.queue.doctor.specialization}
            </p>
          </div>
        )}

        {/* Called Alert */}
        {myQueueEntry.status === 'called' && (
          <div className="p-4 bg-primary/20 border-2 border-primary rounded-xl text-center">
            <PartyPopper className="h-8 w-8 mx-auto mb-2 text-primary animate-bounce" />
            <p className="font-bold text-primary text-lg">It's your turn!</p>
            <p className="text-sm text-muted-foreground">Please proceed to the consultation room</p>
          </div>
        )}

        {/* Print Button */}
        <Button variant="outline" size="sm" className="w-full" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Token
        </Button>
      </CardContent>
    </Card>
  );
};

export default QueueStatusView;
