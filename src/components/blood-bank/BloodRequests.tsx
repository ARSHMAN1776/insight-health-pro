import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBloodRequests } from '@/hooks/useBloodBank';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, ClipboardList, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { getBloodTypeColor, getPriorityColor, COMPONENT_LABELS } from '@/lib/bloodCompatibility';

const BloodRequests: React.FC = () => {
  const { requests, loading, refetch } = useBloodRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.blood_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.request_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      approved: 'bg-blue-500',
      partially_fulfilled: 'bg-purple-500',
      fulfilled: 'bg-green-500',
      cancelled: 'bg-gray-500',
      rejected: 'bg-red-500'
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Blood Requests
          </CardTitle>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No blood requests found.</div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Required Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.patient ? `${req.patient.first_name} ${req.patient.last_name}` : 'Unknown'}</TableCell>
                    <TableCell><Badge className={`${getBloodTypeColor(req.blood_type as any)} text-white`}>{req.blood_type}</Badge></TableCell>
                    <TableCell>{COMPONENT_LABELS[req.component_type as keyof typeof COMPONENT_LABELS]}</TableCell>
                    <TableCell>{req.units_issued}/{req.units_requested}</TableCell>
                    <TableCell><Badge className={getPriorityColor(req.priority)}>{req.priority}</Badge></TableCell>
                    <TableCell>{format(new Date(req.required_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{getStatusBadge(req.request_status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BloodRequests;
