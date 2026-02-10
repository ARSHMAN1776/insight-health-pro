import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { format } from 'date-fns';

interface LabResultTrendingProps {
  patientId: string;
  testName: string;
  currentParameters?: any[];
}

interface HistoricalResult {
  date: string;
  displayDate: string;
  parameters: Record<string, number>;
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const LabResultTrending: React.FC<LabResultTrendingProps> = ({
  patientId,
  testName,
  currentParameters,
}) => {
  const [historicalData, setHistoricalData] = useState<HistoricalResult[]>([]);
  const [parameterNames, setParameterNames] = useState<string[]>([]);
  const [selectedParam, setSelectedParam] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalData();
  }, [patientId, testName]);

  const fetchHistoricalData = async () => {
    try {
      const { data: tests } = await supabase
        .from('lab_tests')
        .select('test_date, test_parameters, results, created_at')
        .eq('patient_id', patientId)
        .eq('test_name', testName)
        .in('status', ['completed', 'verified'])
        .is('deleted_at', null)
        .order('test_date', { ascending: true })
        .limit(20);

      if (!tests || tests.length < 2) {
        setLoading(false);
        return;
      }

      const allParams = new Set<string>();
      const results: HistoricalResult[] = [];

      tests.forEach(test => {
        const params: Record<string, number> = {};
        const testParams = test.test_parameters as any[];
        
        if (Array.isArray(testParams)) {
          testParams.forEach((p: any) => {
            if (p.name && p.value && !isNaN(parseFloat(p.value))) {
              const name = p.name;
              allParams.add(name);
              params[name] = parseFloat(p.value);
            }
          });
        }

        if (Object.keys(params).length > 0) {
          results.push({
            date: test.test_date || test.created_at,
            displayDate: format(new Date(test.test_date || test.created_at), 'MMM dd'),
            parameters: params,
          });
        }
      });

      const paramNames = Array.from(allParams);
      setParameterNames(paramNames);
      setSelectedParam(paramNames[0] || '');
      setHistoricalData(results);
    } catch (error) {
      console.error('Error fetching historical lab data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrend = (paramName: string): 'up' | 'down' | 'stable' => {
    if (historicalData.length < 2) return 'stable';
    const last = historicalData[historicalData.length - 1]?.parameters[paramName];
    const prev = historicalData[historicalData.length - 2]?.parameters[paramName];
    if (!last || !prev) return 'stable';
    const diff = ((last - prev) / prev) * 100;
    if (Math.abs(diff) < 2) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  if (loading) return null;
  if (historicalData.length < 2) return null;

  const chartData = historicalData.map(h => ({
    date: h.displayDate,
    value: h.parameters[selectedParam] || null,
  })).filter(d => d.value !== null);

  // Get reference range from current parameters
  const currentParam = currentParameters?.find((p: any) => p.name === selectedParam);
  let refMin: number | undefined;
  let refMax: number | undefined;
  if (currentParam?.normalRange) {
    const rangeMatch = currentParam.normalRange.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
    if (rangeMatch) {
      refMin = parseFloat(rangeMatch[1]);
      refMax = parseFloat(rangeMatch[2]);
    }
  }

  const trend = getTrend(selectedParam);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Historical Trend
          </CardTitle>
          <div className="flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="h-4 w-4 text-amber-500" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4 text-blue-500" />}
            {trend === 'stable' && <Minus className="h-4 w-4 text-emerald-500" />}
            <span className="text-xs text-muted-foreground capitalize">{trend}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Parameter selector */}
        <div className="flex flex-wrap gap-1.5">
          {parameterNames.map((param) => (
            <Badge
              key={param}
              variant={selectedParam === param ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setSelectedParam(param)}
            >
              {param}
            </Badge>
          ))}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            {refMin !== undefined && (
              <ReferenceLine y={refMin} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Low', fontSize: 10 }} />
            )}
            {refMax !== undefined && (
              <ReferenceLine y={refMax} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'High', fontSize: 10 }} />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <p className="text-[11px] text-muted-foreground text-center">
          {historicalData.length} results over time • Green/Red lines show reference range
        </p>
      </CardContent>
    </Card>
  );
};

export default LabResultTrending;
