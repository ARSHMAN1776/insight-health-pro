import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, XCircle, Info } from 'lucide-react';
import { useDrugInteractions, InteractionCheckResult } from '@/hooks/useDrugInteractions';

interface DrugInteractionCheckerProps {
  medications: string[];
  onInteractionsFound?: (interactions: InteractionCheckResult[]) => void;
}

const DrugInteractionChecker: React.FC<DrugInteractionCheckerProps> = ({
  medications,
  onInteractionsFound
}) => {
  const { checkMultipleDrugs, getSeverityColor, getSeverityIcon } = useDrugInteractions();
  const [foundInteractions, setFoundInteractions] = useState<InteractionCheckResult[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkDrugs = async () => {
      if (medications.length < 2) {
        setFoundInteractions([]);
        return;
      }

      setChecking(true);
      const validMeds = medications.filter(m => m && m.trim().length > 0);
      const interactions = await checkMultipleDrugs(validMeds);
      setFoundInteractions(interactions);
      onInteractionsFound?.(interactions);
      setChecking(false);
    };

    const debounce = setTimeout(checkDrugs, 500);
    return () => clearTimeout(debounce);
  }, [medications, checkMultipleDrugs, onInteractionsFound]);

  if (checking) {
    return (
      <Card className="border-muted">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            <span>Checking drug interactions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (foundInteractions.length === 0) {
    if (medications.filter(m => m.trim()).length < 2) {
      return null;
    }
    return (
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
        <Info className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-700 dark:text-green-400">No Known Interactions</AlertTitle>
        <AlertDescription className="text-green-600 dark:text-green-300">
          No known drug interactions found between the selected medications.
        </AlertDescription>
      </Alert>
    );
  }

  const getSeverityIcon2 = (severity: string) => {
    switch (severity) {
      case 'contraindicated':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'major':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'moderate':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-yellow-500" />;
    }
  };

  const hasContraindicated = foundInteractions.some(i => i.interaction?.severity === 'contraindicated');
  const hasMajor = foundInteractions.some(i => i.interaction?.severity === 'major');

  return (
    <Card className={`border-2 ${hasContraindicated ? 'border-red-600' : hasMajor ? 'border-red-500' : 'border-amber-500'}`}>
      <CardHeader className={`pb-3 ${hasContraindicated ? 'bg-red-50 dark:bg-red-950' : hasMajor ? 'bg-red-50 dark:bg-red-950' : 'bg-amber-50 dark:bg-amber-950'}`}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className={`h-5 w-5 ${hasContraindicated || hasMajor ? 'text-red-600' : 'text-amber-600'}`} />
          Drug Interactions Detected ({foundInteractions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {foundInteractions.map((result, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSeverityIcon2(result.interaction?.severity || 'minor')}
                <span className="font-semibold">
                  {result.drug1} + {result.drug2}
                </span>
              </div>
              <Badge className={getSeverityColor(result.interaction?.severity || 'minor')}>
                {result.interaction?.severity?.toUpperCase()}
              </Badge>
            </div>
            
            <p className="text-sm text-foreground">
              {result.interaction?.description}
            </p>
            
            {result.interaction?.mechanism && (
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Mechanism: </span>
                <span className="text-foreground">{result.interaction.mechanism}</span>
              </div>
            )}
            
            {result.interaction?.management && (
              <div className="text-sm bg-muted p-2 rounded">
                <span className="font-medium">Recommended Action: </span>
                {result.interaction.management}
              </div>
            )}
          </div>
        ))}

        {hasContraindicated && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Contraindicated Combination!</AlertTitle>
            <AlertDescription>
              One or more drug combinations are contraindicated and should NOT be prescribed together. 
              Please review and modify the prescription.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DrugInteractionChecker;
