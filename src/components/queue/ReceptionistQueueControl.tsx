import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Monitor,
  UserPlus,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useQueue, QueueEntry, DailyQueue } from '@/hooks/useQueue';
import { format, differenceInMinutes } from 'date-fns';
import { Link } from 'react-router-dom';

const ReceptionistQueueControl: React.FC = () => {
  const { 
    loading, 
    queues, 
    entries,
    waitingEntries,
    calledEntries,
    inConsultationEntries,
    completedEntries,
    stats,
    cancelEntry,
    markNoShow,
    refetch 
  } = useQueue();

  const [selectedQueue, setSelectedQueue] = useState<string>('all');
  const [newEntryIds, setNewEntryIds] = useState<Set<string>>(new Set());
  const previousEntriesRef = useRef<string[]>([]);

  // Track new entries for animation
  useEffect(() => {
    const currentIds = waitingEntries.map(e => e.id);
    const newIds = currentIds.filter(id => !previousEntriesRef.current.includes(id));
    
    if (newIds.length > 0) {
      setNewEntryIds(prev => new Set([...prev, ...newIds]));
      
      // Clear highlight after 5 seconds
      setTimeout(() => {
        setNewEntryIds(prev => {
          const updated = new Set(prev);
          newIds.forEach(id => updated.delete(id));
          return updated;
        });
      }, 5000);
    }
    
    previousEntriesRef.current = currentIds;
  }, [waitingEntries]);

  // Filter entries by selected queue
  const filteredEntries = selectedQueue === 'all' 
    ? entries 
    : entries.filter(e => e.queue_id === selectedQueue);

  const filteredWaiting = selectedQueue === 'all'
    ? waitingEntries
    : waitingEntries.filter(e => e.queue_id === selectedQueue);

  const getWaitTime = (checkedInAt: string) => {
    const mins = differenceInMinutes(new Date(), new Date(checkedInAt));
    return mins < 1 ? '< 1m' : `${mins}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'text-destructive';
      case 'priority': return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="secondary">Waiting</Badge>;
      case 'called':
        return <Badge className="bg-blue-500">Called</Badge>;
      case 'in_consultation':
        return <Badge className="bg-green-500">In Consultation</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'no_show':
        return <Badge variant="destructive">No Show</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">Queue Control Center</h2>
          <p className="text-muted-foreground">Manage all doctor queues from one place</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/queue/check-in">
              <UserPlus className="h-4 w-4 mr-2" />
              Check In Patient
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/queue/display" target="_blank">
              <Monitor className="h-4 w-4 mr-2" />
              Open Display
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Waiting</p>
                <p className="text-2xl font-bold">{stats.totalWaiting}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Served Today</p>
                <p className="text-2xl font-bold">{stats.totalServed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Queues</p>
                <p className="text-2xl font-bold">{queues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Emergency</p>
                <p className="text-2xl font-bold">
                  {waitingEntries.filter(e => e.priority === 'emergency').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Filter */}
      <Tabs value={selectedQueue} onValueChange={setSelectedQueue}>
        <TabsList>
          <TabsTrigger value="all">All Queues</TabsTrigger>
          {queues.map(queue => (
            <TabsTrigger key={queue.id} value={queue.id}>
              Dr. {queue.doctor?.first_name} ({
                waitingEntries.filter(e => e.queue_id === queue.id).length
              })
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedQueue} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Waiting List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Waiting ({filteredWaiting.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredWaiting.map(entry => (
                      <QueueEntryCard 
                        key={entry.id} 
                        entry={entry} 
                        onCancel={() => cancelEntry(entry.id)}
                        onNoShow={() => markNoShow(entry.id)}
                        getWaitTime={getWaitTime}
                        queue={queues.find(q => q.id === entry.queue_id)}
                        isNew={newEntryIds.has(entry.id)}
                      />
                    ))}
                    {filteredWaiting.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No patients waiting
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Currently Being Served */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Being Served ({calledEntries.length + inConsultationEntries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {[...calledEntries, ...inConsultationEntries]
                      .filter(e => selectedQueue === 'all' || e.queue_id === selectedQueue)
                      .map(entry => (
                        <QueueEntryCard 
                          key={entry.id} 
                          entry={entry} 
                          onCancel={() => cancelEntry(entry.id)}
                          onNoShow={() => markNoShow(entry.id)}
                          getWaitTime={getWaitTime}
                          queue={queues.find(q => q.id === entry.queue_id)}
                        />
                      ))}
                    {calledEntries.length + inConsultationEntries.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No patients being served
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Completed */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  Completed ({completedEntries.filter(e => selectedQueue === 'all' || e.queue_id === selectedQueue).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {completedEntries
                      .filter(e => selectedQueue === 'all' || e.queue_id === selectedQueue)
                      .slice(0, 20)
                      .map(entry => (
                        <div 
                          key={entry.id}
                          className="p-3 rounded-lg border bg-muted/30"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-mono font-bold text-muted-foreground">
                                {entry.token_number}
                              </span>
                              <span className="mx-2">•</span>
                              <span className="text-sm">
                                {entry.patient?.first_name} {entry.patient?.last_name}
                              </span>
                            </div>
                            {entry.completed_at && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(entry.completed_at), 'HH:mm')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    {completedEntries.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No completed consultations
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Queue Entry Card Component
const QueueEntryCard: React.FC<{
  entry: QueueEntry;
  queue?: DailyQueue;
  onCancel: () => void;
  onNoShow: () => void;
  getWaitTime: (checkedInAt: string) => string;
  isNew?: boolean;
}> = ({ entry, queue, onCancel, onNoShow, getWaitTime, isNew = false }) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return <Badge variant="destructive" className="text-xs">Emergency</Badge>;
      case 'priority':
        return <Badge className="bg-orange-500 text-xs">Priority</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="secondary" className="text-xs">Waiting</Badge>;
      case 'called':
        return <Badge className="bg-blue-500 text-xs">Called</Badge>;
      case 'in_consultation':
        return <Badge className="bg-green-500 text-xs">In Consultation</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className={`p-3 rounded-lg border hover:bg-accent/50 transition-all duration-300 ${
      isNew ? 'animate-new-entry border-primary/50 bg-primary/5' : ''
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-primary text-lg">
            {entry.token_number}
          </span>
          {isNew && (
            <Badge className="bg-primary/20 text-primary text-xs animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              New
            </Badge>
          )}
          {getPriorityBadge(entry.priority)}
          {getStatusBadge(entry.status)}
        </div>
        <span className="text-xs text-muted-foreground">
          {getWaitTime(entry.checked_in_at)} wait
        </span>
      </div>

      <p className="font-medium">
        {entry.patient?.first_name} {entry.patient?.last_name}
      </p>
      
      {queue && (
        <p className="text-xs text-muted-foreground">
          Dr. {queue.doctor?.first_name} {queue.doctor?.last_name}
        </p>
      )}

      {entry.symptoms && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {entry.symptoms}
        </p>
      )}

      {['waiting', 'called'].includes(entry.status) && (
        <div className="flex gap-1 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs"
            onClick={onNoShow}
          >
            <XCircle className="h-3 w-3 mr-1" />
            No Show
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs text-destructive"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReceptionistQueueControl;
