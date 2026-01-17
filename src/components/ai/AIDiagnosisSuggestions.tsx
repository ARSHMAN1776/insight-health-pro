import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  TestTube,
  Activity,
  Info,
  Sparkles
} from 'lucide-react';

interface DiagnosisSuggestion {
  diagnosis: string;
  icdCode?: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  recommendedTests?: string[];
  redFlags?: string[];
}

interface DiagnosisResult {
  suggestions: DiagnosisSuggestion[];
  generalRecommendations?: string[];
  urgency?: 'routine' | 'urgent' | 'emergency';
  disclaimer: string;
}

interface AIDiagnosisSuggestionsProps {
  symptoms: string;
  patientAge?: number;
  patientGender?: string;
  medicalHistory?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    spo2?: number;
  };
  onDiagnosisSelect?: (diagnosis: string, icdCode?: string) => void;
}

const AIDiagnosisSuggestions: React.FC<AIDiagnosisSuggestionsProps> = ({
  symptoms,
  patientAge,
  patientGender,
  medicalHistory,
  vitalSigns,
  onDiagnosisSelect
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [manualSymptoms, setManualSymptoms] = useState(symptoms || '');
  const [error, setError] = useState<string | null>(null);

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return t('ai.high');
      case 'medium': return t('ai.medium');
      case 'low': return t('ai.low');
      default: return confidence;
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'emergency': return 'text-destructive';
      case 'urgent': return 'text-orange-500';
      default: return 'text-green-500';
    }
  };

  const fetchDiagnosisSuggestions = async () => {
    const symptomsToAnalyze = manualSymptoms || symptoms;
    
    if (!symptomsToAnalyze?.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter symptoms to analyze',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-diagnosis', {
        body: {
          symptoms: symptomsToAnalyze,
          patientAge,
          patientGender,
          medicalHistory,
          vitalSigns,
        },
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.error) {
        if (data.error.includes('Rate limit')) {
          toast({
            title: 'Rate Limit Exceeded',
            description: 'Too many requests. Please try again in a moment.',
            variant: 'destructive',
          });
        } else if (data.error.includes('credits')) {
          toast({
            title: 'Service Unavailable',
            description: 'AI service credits exhausted. Please contact administrator.',
            variant: 'destructive',
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setResult(data as DiagnosisResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get AI suggestions';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {t('ai.diagnosisSuggestions')}
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </CardTitle>
        <CardDescription>
          AI-powered clinical decision support based on symptoms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Symptoms Input */}
        <div className="space-y-2">
          <Textarea
            placeholder="Describe symptoms (e.g., fever, cough, headache for 3 days...)"
            value={manualSymptoms}
            onChange={(e) => setManualSymptoms(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button 
            onClick={fetchDiagnosisSuggestions} 
            disabled={loading || !manualSymptoms.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('ai.analyzing')}
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                {t('ai.getAiSuggestions')}
              </>
            )}
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Urgency Indicator */}
            {result.urgency && (
              <div className={`flex items-center gap-2 font-medium ${getUrgencyColor(result.urgency)}`}>
                <Activity className="h-4 w-4" />
                <span className="capitalize">Urgency: {result.urgency}</span>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {result.suggestions.map((suggestion, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <span className="font-medium">{suggestion.diagnosis}</span>
                        {suggestion.icdCode && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {suggestion.icdCode}
                          </Badge>
                        )}
                        <Badge variant={getConfidenceBadgeVariant(suggestion.confidence)}>
                          {getConfidenceLabel(suggestion.confidence)}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2">
                      {/* Reasoning */}
                      <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                      
                      {/* Recommended Tests */}
                      {suggestion.recommendedTests && suggestion.recommendedTests.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <TestTube className="h-4 w-4" />
                            {t('ai.recommendedTests')}:
                          </div>
                          <ul className="list-disc list-inside text-sm text-muted-foreground pl-5">
                            {suggestion.recommendedTests.map((test, i) => (
                              <li key={i}>{test}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Red Flags */}
                      {suggestion.redFlags && suggestion.redFlags.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm font-medium text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            {t('ai.redFlags')}:
                          </div>
                          <ul className="list-disc list-inside text-sm text-destructive/80 pl-5">
                            {suggestion.redFlags.map((flag, i) => (
                              <li key={i}>{flag}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Select Button */}
                      {onDiagnosisSelect && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDiagnosisSelect(suggestion.diagnosis, suggestion.icdCode)}
                          className="mt-2"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Use This Diagnosis
                        </Button>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground text-center py-4">{t('ai.noSuggestions')}</p>
            )}

            {/* General Recommendations */}
            {result.generalRecommendations && result.generalRecommendations.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm">General Recommendations:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {result.generalRecommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {result.disclaimer || t('ai.disclaimer')}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIDiagnosisSuggestions;
