import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Clock, Users, AlertTriangle, Bell, Check, X, 
  Calendar, User, Building2, RefreshCw, Phone, Mail 
} from 'lucide-react';
import { useWaitlist, WaitlistEntry } from '@/hooks/useWaitlist';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';

const WaitlistManagement: React.FC = () => {
  const { entries, loading, stats, fetchEntries, notifyPatient, markAsBooked, cancelEntry } = useWaitlist();
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'notify' | 'book' | 'cancel'>('notify');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      urgent: { variant: 'destructive', label: 'Urgent' },
      high: { variant: 'default', label: 'High' },
      normal: { variant: 'secondary', label: 'Normal' },
      low: { variant: 'outline', label: 'Low' },
    };
    const config = variants[priority] || variants.normal;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      waiting: { variant: 'outline', label: 'Waiting' },
      notified: { variant: 'default', label: 'Notified' },
      booked: { variant: 'secondary', label: 'Booked' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      expired: { variant: 'outline', label: 'Expired' },
    };
    const config = variants[status] || variants.waiting;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleAction = (entry: WaitlistEntry, action: 'notify' | 'book' | 'cancel') => {
    setSelectedEntry(entry);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedEntry) return;

    let success = false;
    switch (actionType) {
      case 'notify':
        success = await notifyPatient(selectedEntry.id);
        break;
      case 'book':
        success = await markAsBooked(selectedEntry.id);
        break;
      case 'cancel':
        success = await cancelEntry(selectedEntry.id);
        break;
    }

    if (success) {
      setActionDialogOpen(false);
      setSelectedEntry(null);
    }
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    // Status filter
    if (statusFilter === 'active') {
      if (!['waiting', 'notified'].includes(entry.status)) return false;
    } else if (statusFilter !== 'all') {
      if (entry.status !== statusFilter) return false;
    }

    // Priority filter
    if (priorityFilter !== 'all' && entry.priority !== priorityFilter) return false;

    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Waiting</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">active entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.urgent}</div>
            <p className="text-xs text-muted-foreground">need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notified</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notified}</div>
            <p className="text-xs text-muted-foreground">awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booked</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.booked}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Waitlist Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Appointment Waitlist</CardTitle>
              <CardDescription>Manage patients waiting for appointment slots</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchEntries}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="notified">Notified</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No waitlist entries found</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor/Department</TableHead>
                    <TableHead>Preferred Dates</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {entry.patient 
                              ? `${entry.patient.first_name} ${entry.patient.last_name}`
                              : 'Unknown Patient'
                            }
                          </div>
                          {entry.patient?.phone && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {entry.patient.phone}
                            </div>
                          )}
                          {entry.patient?.email && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {entry.patient.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {entry.doctor && (
                            <div className="text-sm">
                              Dr. {entry.doctor.first_name} {entry.doctor.last_name}
                            </div>
                          )}
                          {entry.department && (
                            <Badge variant="outline" className="text-xs">
                              <Building2 className="h-3 w-3 mr-1" />
                              {entry.department.department_name}
                            </Badge>
                          )}
                          {!entry.doctor && !entry.department && (
                            <span className="text-muted-foreground text-sm">Any available</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(entry.preferred_date_start), 'MMM d, yyyy')}
                            {entry.preferred_date_end && (
                              <> - {format(new Date(entry.preferred_date_end), 'MMM d')}</>
                            )}
                          </span>
                        </div>
                        {entry.reason && (
                          <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                            {entry.reason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getPriorityBadge(entry.priority)}</TableCell>
                      <TableCell>
                        {getStatusBadge(entry.status)}
                        {entry.notified_at && entry.status === 'notified' && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Notified {format(new Date(entry.notified_at), 'MMM d, h:mm a')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(entry.created_at), 'MMM d, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {entry.status === 'waiting' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(entry, 'notify')}
                            >
                              <Bell className="h-4 w-4 mr-1" />
                              Notify
                            </Button>
                          )}
                          {entry.status === 'notified' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(entry, 'book')}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Book
                            </Button>
                          )}
                          {['waiting', 'notified'].includes(entry.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction(entry, 'cancel')}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'notify' && 'Notify Patient'}
              {actionType === 'book' && 'Mark as Booked'}
              {actionType === 'cancel' && 'Cancel Waitlist Entry'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'notify' && (
                <>
                  This will send a notification to <strong>{selectedEntry?.patient?.first_name} {selectedEntry?.patient?.last_name}</strong> that an appointment slot is available. They will have 24 hours to respond.
                </>
              )}
              {actionType === 'book' && (
                <>
                  This will mark <strong>{selectedEntry?.patient?.first_name} {selectedEntry?.patient?.last_name}</strong>'s waitlist entry as booked and remove them from the active queue.
                </>
              )}
              {actionType === 'cancel' && (
                <>
                  Are you sure you want to cancel the waitlist entry for <strong>{selectedEntry?.patient?.first_name} {selectedEntry?.patient?.last_name}</strong>?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              variant={actionType === 'cancel' ? 'destructive' : 'default'}
            >
              {actionType === 'notify' && 'Send Notification'}
              {actionType === 'book' && 'Confirm Booking'}
              {actionType === 'cancel' && 'Cancel Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaitlistManagement;
