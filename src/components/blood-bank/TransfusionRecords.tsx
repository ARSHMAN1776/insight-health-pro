import React, { useState } from 'react';
import { useBloodTransfusions } from '@/hooks/useBloodBank';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Activity, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { getBloodTypeColor, COMPONENT_LABELS } from '@/lib/bloodCompatibility';

const TransfusionRecords: React.FC = () => {
  const { transfusions, loading, refetch } = useBloodTransfusions();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransfusions = transfusions.filter(t =>
    t.bag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOutcomeBadge = (outcome: string, hasReaction: boolean) => {
    if (hasReaction) return <Badge className="bg-orange-500"><AlertTriangle className="h-3 w-3 mr-1" />Reaction</Badge>;
    if (outcome === 'successful') return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Successful</Badge>;
    return <Badge variant="secondary">{outcome}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transfusion Records
          </CardTitle>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by bag number or patient..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredTransfusions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No transfusion records found.</div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bag Number</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Administered By</TableHead>
                  <TableHead>Outcome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfusions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-sm">{t.bag_number}</TableCell>
                    <TableCell>{t.patient ? `${t.patient.first_name} ${t.patient.last_name}` : 'Unknown'}</TableCell>
                    <TableCell><Badge className={`${getBloodTypeColor(t.blood_type as any)} text-white`}>{t.blood_type}</Badge></TableCell>
                    <TableCell>{COMPONENT_LABELS[t.component_type as keyof typeof COMPONENT_LABELS]}</TableCell>
                    <TableCell>{t.volume_ml} mL</TableCell>
                    <TableCell>{format(new Date(t.transfusion_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{t.administered_by}</TableCell>
                    <TableCell>{getOutcomeBadge(t.outcome, t.adverse_reaction)}</TableCell>
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

export default TransfusionRecords;
