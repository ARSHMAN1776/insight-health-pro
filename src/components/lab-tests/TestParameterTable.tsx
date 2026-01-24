import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Badge } from '../ui/badge';
import type { TestParameter } from '@/lib/labReportTemplates';
import { determineParameterStatus } from '@/lib/labReportTemplates';

interface TestParameterTableProps {
  parameters: TestParameter[];
  onChange: (parameters: TestParameter[]) => void;
  readOnly?: boolean;
}

const TestParameterTable: React.FC<TestParameterTableProps> = ({
  parameters,
  onChange,
  readOnly = false,
}) => {
  const addParameter = () => {
    onChange([
      ...parameters,
      {
        name: '',
        value: '',
        unit: '',
        normalRange: '',
        status: 'normal',
      },
    ]);
  };

  const removeParameter = (index: number) => {
    onChange(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, field: keyof TestParameter, value: string) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate status when value changes
    if (field === 'value' && updated[index].normalRange) {
      const { status, flag } = determineParameterStatus(value, updated[index].normalRange);
      updated[index].status = status;
      updated[index].flag = flag;
    }

    onChange(updated);
  };

  const getStatusBadge = (status: TestParameter['status'], flag?: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive" className="font-bold">{flag || 'Critical'}</Badge>;
      case 'high':
        return <Badge className="bg-warning text-warning-foreground">{flag || 'High'}</Badge>;
      case 'low':
        return <Badge className="bg-primary text-primary-foreground">{flag || 'Low'}</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  if (readOnly) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead className="font-bold">Parameter</TableHead>
              <TableHead className="font-bold text-center">Result</TableHead>
              <TableHead className="font-bold text-center">Unit</TableHead>
              <TableHead className="font-bold text-center">Reference Range</TableHead>
              <TableHead className="font-bold text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parameters.map((param, index) => (
              <TableRow 
                key={index}
                className={
                  param.status === 'critical' 
                    ? 'bg-destructive/10' 
                    : param.status === 'high' 
                    ? 'bg-orange-50 dark:bg-orange-950/20' 
                    : param.status === 'low' 
                    ? 'bg-blue-50 dark:bg-blue-950/20' 
                    : ''
                }
              >
                <TableCell className="font-medium">{param.name}</TableCell>
                <TableCell className={`text-center font-semibold ${
                  param.status === 'critical' ? 'text-destructive' :
                  param.status === 'high' ? 'text-orange-600' :
                  param.status === 'low' ? 'text-blue-600' : ''
                }`}>
                  {param.value}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">{param.unit}</TableCell>
                <TableCell className="text-center text-muted-foreground">{param.normalRange}</TableCell>
                <TableCell className="text-center">{getStatusBadge(param.status, param.flag)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[200px]">Parameter Name</TableHead>
              <TableHead className="w-[100px]">Result</TableHead>
              <TableHead className="w-[80px]">Unit</TableHead>
              <TableHead className="w-[120px]">Reference Range</TableHead>
              <TableHead className="w-[100px] text-center">Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parameters.map((param, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={param.name}
                    onChange={(e) => updateParameter(index, 'name', e.target.value)}
                    placeholder="Parameter name"
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={param.value}
                    onChange={(e) => updateParameter(index, 'value', e.target.value)}
                    placeholder="Value"
                    className={`h-8 text-center font-semibold ${
                      param.status === 'critical' ? 'border-destructive text-destructive' :
                      param.status === 'high' ? 'border-orange-500 text-orange-600' :
                      param.status === 'low' ? 'border-blue-500 text-blue-600' : ''
                    }`}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={param.unit}
                    onChange={(e) => updateParameter(index, 'unit', e.target.value)}
                    placeholder="Unit"
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={param.normalRange}
                    onChange={(e) => updateParameter(index, 'normalRange', e.target.value)}
                    placeholder="e.g., 10-20"
                    className="h-8"
                  />
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(param.status, param.flag)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParameter(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {parameters.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No parameters added. Click "Add Parameter" to start.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Button type="button" variant="outline" onClick={addParameter} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Parameter
      </Button>
    </div>
  );
};

export default TestParameterTable;
