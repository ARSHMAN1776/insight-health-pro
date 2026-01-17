import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Search, 
  FileText, 
  User, 
  Calendar, 
  Eye,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string;
  performed_by: string;
  performer_name: string | null;
  performer_role: string | null;
  patient_id: string | null;
  old_values: unknown;
  new_values: unknown;
  changed_fields: string[] | null;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  created_at: string;
}

const AuditLogViewer: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const isAdmin = user?.role === 'admin';

  const fetchLogs = useCallback(async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('phi_audit_log')
        .select('*')
        .gte('created_at', `${dateFrom}T00:00:00`)
        .lte('created_at', `${dateTo}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(500);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (tableFilter !== 'all') {
        query = query.eq('table_name', tableFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch audit logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, dateFrom, dateTo, actionFilter, tableFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
      case 'INSERT':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'UPDATE':
      case 'EDIT':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'DELETE':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'VIEW':
      case 'READ':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    const actionUpper = action.toUpperCase();
    switch (actionUpper) {
      case 'CREATE':
      case 'INSERT':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">{action}</Badge>;
      case 'UPDATE':
      case 'EDIT':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">{action}</Badge>;
      case 'DELETE':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">{action}</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      log.performer_name?.toLowerCase().includes(search) ||
      log.table_name.toLowerCase().includes(search) ||
      log.record_id.toLowerCase().includes(search) ||
      log.action.toLowerCase().includes(search)
    );
  });

  const exportToCSV = () => {
    const headers = ['Date/Time', 'Action', 'Table', 'Record ID', 'Performed By', 'Role', 'Changed Fields'];
    const rows = filteredLogs.map(log => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.action,
      log.table_name,
      log.record_id,
      log.performer_name || log.performed_by,
      log.performer_role || 'N/A',
      log.changed_fields?.join(', ') || 'N/A'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phi_audit_log_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailsDialog(true);
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            You do not have permission to view PHI audit logs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">PHI Audit Log</h2>
            <p className="text-muted-foreground">HIPAA-compliant access tracking</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToCSV} disabled={filteredLogs.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label className="text-xs mb-1.5 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Action Type</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="VIEW">View</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Table</Label>
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  <SelectItem value="patients">Patients</SelectItem>
                  <SelectItem value="medical_records">Medical Records</SelectItem>
                  <SelectItem value="prescriptions">Prescriptions</SelectItem>
                  <SelectItem value="lab_tests">Lab Tests</SelectItem>
                  <SelectItem value="appointments">Appointments</SelectItem>
                  <SelectItem value="patient_vitals">Vitals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Audit Entries ({filteredLogs.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Loading audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No audit logs found</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Changed Fields</TableHead>
                    <TableHead className="w-[80px]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{format(new Date(log.created_at), 'MMM dd, HH:mm')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          {getActionBadge(log.action)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {log.table_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">
                            {log.performer_name || log.performed_by.slice(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {log.performer_role || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
                          {log.changed_fields?.join(', ') || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Audit Log Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this PHI access event
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Action</Label>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Table</Label>
                  <p className="font-mono">{selectedLog.table_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Record ID</Label>
                  <p className="font-mono text-sm truncate">{selectedLog.record_id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Timestamp</Label>
                  <p>{format(new Date(selectedLog.created_at), 'PPpp')}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Performed By</Label>
                  <p>{selectedLog.performer_name || selectedLog.performed_by}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <p>{selectedLog.performer_role || 'N/A'}</p>
                </div>
              </div>

              {selectedLog.reason && (
                <div>
                  <Label className="text-xs text-muted-foreground">Reason</Label>
                  <p className="mt-1 p-3 bg-muted/50 rounded-lg">{selectedLog.reason}</p>
                </div>
              )}

              {selectedLog.changed_fields && selectedLog.changed_fields.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Changed Fields</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedLog.changed_fields.map((field, i) => (
                      <Badge key={i} variant="outline">{field}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.ip_address && (
                <div>
                  <Label className="text-xs text-muted-foreground">IP Address</Label>
                  <p className="font-mono text-sm">{selectedLog.ip_address}</p>
                </div>
              )}

              {(selectedLog.old_values || selectedLog.new_values) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedLog.old_values && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Previous Values</Label>
                      <pre className="mt-1 p-3 bg-red-500/5 rounded-lg text-xs overflow-auto max-h-[200px]">
                        {JSON.stringify(selectedLog.old_values, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.new_values && (
                    <div>
                      <Label className="text-xs text-muted-foreground">New Values</Label>
                      <pre className="mt-1 p-3 bg-green-500/5 rounded-lg text-xs overflow-auto max-h-[200px]">
                        {JSON.stringify(selectedLog.new_values, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogViewer;
