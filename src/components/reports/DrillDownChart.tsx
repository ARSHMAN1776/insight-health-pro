import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface DrillDownLevel {
  id: string;
  label: string;
  data: any[];
  groupKey: string;
  valueKey: string;
}

interface DrillDownChartProps {
  title: string;
  description?: string;
  levels: DrillDownLevel[];
  colors?: string[];
  chartType?: 'bar' | 'pie';
  onDrillDown?: (level: number, item: any) => Promise<any[]>;
  showTable?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export const DrillDownChart: React.FC<DrillDownChartProps> = ({
  title,
  description,
  levels,
  colors = COLORS,
  chartType = 'bar',
  onDrillDown,
  showTable = true,
}) => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [currentData, setCurrentData] = useState(levels[0]?.data || []);
  const [loading, setLoading] = useState(false);

  const currentLevel = levels[currentLevelIndex];

  const handleDrillDown = async (item: any) => {
    if (currentLevelIndex >= levels.length - 1 && !onDrillDown) return;

    setLoading(true);
    try {
      let newData: any[];
      
      if (onDrillDown) {
        newData = await onDrillDown(currentLevelIndex + 1, item);
      } else {
        newData = levels[currentLevelIndex + 1]?.data || [];
      }

      setBreadcrumbs([...breadcrumbs, item[currentLevel.groupKey]]);
      setCurrentLevelIndex(currentLevelIndex + 1);
      setCurrentData(newData);
    } catch (error) {
      console.error('Drill-down error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (currentLevelIndex > 0) {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentLevelIndex(currentLevelIndex - 1);
      setCurrentData(levels[currentLevelIndex - 1]?.data || []);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setBreadcrumbs(breadcrumbs.slice(0, index));
    setCurrentLevelIndex(index);
    setCurrentData(levels[index]?.data || []);
  };

  const canDrillDown = currentLevelIndex < levels.length - 1 || !!onDrillDown;

  const renderChart = () => {
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={currentData}
              dataKey={currentLevel?.valueKey || 'value'}
              nameKey={currentLevel?.groupKey || 'name'}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              onClick={canDrillDown ? (_, index) => handleDrillDown(currentData[index]) : undefined}
              style={{ cursor: canDrillDown ? 'pointer' : 'default' }}
            >
              {currentData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={currentData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey={currentLevel?.groupKey || 'name'} 
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey={currentLevel?.valueKey || 'value'}
            fill={colors[0]}
            radius={[4, 4, 0, 0]}
            onClick={canDrillDown ? (data) => handleDrillDown(data) : undefined}
            style={{ cursor: canDrillDown ? 'pointer' : 'default' }}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {currentLevelIndex > 0 && (
                <Button variant="ghost" size="icon" onClick={handleGoBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {canDrillDown && (
            <Badge variant="outline" className="text-xs">
              Click to drill down
            </Badge>
          )}
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={() => handleBreadcrumbClick(0)}
            >
              All
            </Button>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="h-3 w-3" />
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm"
                  onClick={() => handleBreadcrumbClick(index + 1)}
                >
                  {crumb}
                </Button>
              </React.Fragment>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {renderChart()}

            {/* Data table */}
            {showTable && currentData.length > 0 && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{currentLevel?.groupKey || 'Category'}</TableHead>
                      <TableHead className="text-right">{currentLevel?.valueKey || 'Value'}</TableHead>
                      {canDrillDown && <TableHead className="w-[50px]" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.slice(0, 10).map((item, index) => (
                      <TableRow
                        key={index}
                        className={canDrillDown ? 'cursor-pointer hover:bg-muted/50' : ''}
                        onClick={canDrillDown ? () => handleDrillDown(item) : undefined}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            {item[currentLevel?.groupKey || 'name']}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {typeof item[currentLevel?.valueKey || 'value'] === 'number'
                            ? item[currentLevel?.valueKey || 'value'].toLocaleString()
                            : item[currentLevel?.valueKey || 'value']}
                        </TableCell>
                        {canDrillDown && (
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DrillDownChart;
