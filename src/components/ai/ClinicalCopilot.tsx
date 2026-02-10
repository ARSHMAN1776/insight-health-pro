import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Loader2,
  FileText,
  Pill,
  Stethoscope,
  ClipboardList,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const COPILOT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clinical-copilot`;

type CopilotAction = 'soap_note' | 'treatment_plan' | 'prescription_draft' | 'differential' | 'summarize';

interface PatientData {
  age?: number;
  gender?: string;
  allergies?: string;
  medicalHistory?: string;
  currentMedications?: string;
}

interface ClinicalData {
  chiefComplaint?: string;
  symptoms?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    spo2?: number;
    respiratoryRate?: number;
    weight?: number;
  };
  examination?: string;
  labResults?: string;
  previousDiagnosis?: string;
}

interface ClinicalCopilotProps {
  patientData?: PatientData;
  clinicalData?: ClinicalData;
  onInsertText?: (text: string) => void;
  compact?: boolean;
}

const actions: { id: CopilotAction; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'soap_note', label: 'SOAP Note', icon: FileText, description: 'Generate structured clinical note' },
  { id: 'treatment_plan', label: 'Treatment', icon: ClipboardList, description: 'Comprehensive treatment plan' },
  { id: 'prescription_draft', label: 'Rx Draft', icon: Pill, description: 'Draft prescriptions with dosages' },
  { id: 'differential', label: 'DDx', icon: Stethoscope, description: 'Differential diagnosis analysis' },
  { id: 'summarize', label: 'Summary', icon: Zap, description: 'Clinical summary for handoff' },
];

const ClinicalCopilot: React.FC<ClinicalCopilotProps> = ({
  patientData = {},
  clinicalData = {},
  onInsertText,
  compact = false,
}) => {
  const { toast } = useToast();
  const [activeAction, setActiveAction] = useState<CopilotAction>('soap_note');
  const [isStreaming, setIsStreaming] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [symptoms, setSymptoms] = useState(clinicalData.symptoms || '');
  const [examination, setExamination] = useState(clinicalData.examination || '');
  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (clinicalData.symptoms) setSymptoms(clinicalData.symptoms);
    if (clinicalData.examination) setExamination(clinicalData.examination);
  }, [clinicalData.symptoms, clinicalData.examination]);

  const streamCopilot = useCallback(async () => {
    if (!symptoms.trim()) {
      toast({ title: 'Enter symptoms or chief complaint first', variant: 'destructive' });
      return;
    }

    setIsStreaming(true);
    setOutput('');
    abortRef.current = new AbortController();

    const mergedClinical: ClinicalData = {
      ...clinicalData,
      symptoms,
      chiefComplaint: symptoms,
      examination: examination || clinicalData.examination,
    };

    try {
      const resp = await fetch(COPILOT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: activeAction,
          patientData,
          clinicalData: mergedClinical,
        }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'AI service error' }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setOutput(fullText);
            }
          } catch {
            // partial JSON, wait for more
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const message = err instanceof Error ? err.message : 'Failed to generate';
      toast({ title: 'Copilot Error', description: message, variant: 'destructive' });
    } finally {
      setIsStreaming(false);
    }
  }, [activeAction, patientData, clinicalData, symptoms, examination, toast]);

  const stopStreaming = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied to clipboard' });
  };

  const insertOutput = () => {
    if (onInsertText && output) {
      onInsertText(output);
      toast({ title: 'Inserted into record' });
    }
  };

  // Simple markdown renderer for bold, headers, lists
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>;
      if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-sm mt-4 mb-1">{line.slice(3)}</h3>;
      if (line.startsWith('# ')) return <h2 key={i} className="font-bold mt-4 mb-2">{line.slice(2)}</h2>;
      // Bold markers
      const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      // List items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-4 text-sm list-disc" dangerouslySetInnerHTML={{ __html: boldProcessed.slice(2) }} />;
      }
      if (/^\d+\.\s/.test(line)) {
        return <li key={i} className="ml-4 text-sm list-decimal" dangerouslySetInnerHTML={{ __html: boldProcessed.replace(/^\d+\.\s/, '') }} />;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-sm" dangerouslySetInnerHTML={{ __html: boldProcessed }} />;
    });
  };

  return (
    <Card className={compact ? '' : 'h-full'}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-5 w-5 text-primary" />
          AI Clinical Copilot
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <Badge variant="secondary" className="ml-auto text-[10px]">AI-Powered</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Action Tabs */}
        <Tabs value={activeAction} onValueChange={(v) => setActiveAction(v as CopilotAction)}>
          <TabsList className="w-full grid grid-cols-5 h-auto">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <TabsTrigger
                  key={a.id}
                  value={a.id}
                  className="flex flex-col gap-0.5 py-1.5 px-1 text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  disabled={isStreaming}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {a.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Inputs */}
        <div className="space-y-2">
          <Textarea
            placeholder="Chief complaint / symptoms (e.g., 45M presenting with chest pain radiating to left arm, onset 2 hours ago...)"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={2}
            className="resize-none text-sm"
          />
          <Textarea
            placeholder="Examination findings (optional)"
            value={examination}
            onChange={(e) => setExamination(e.target.value)}
            rows={1}
            className="resize-none text-sm"
          />
        </div>

        {/* Patient Context Pills */}
        {(patientData.age || patientData.allergies || patientData.currentMedications) && (
          <div className="flex flex-wrap gap-1.5">
            {patientData.age && (
              <Badge variant="outline" className="text-[10px]">
                {patientData.age}y {patientData.gender || ''}
              </Badge>
            )}
            {patientData.allergies && patientData.allergies !== 'None' && (
              <Badge variant="destructive" className="text-[10px]">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                {patientData.allergies}
              </Badge>
            )}
            {patientData.currentMedications && (
              <Badge variant="secondary" className="text-[10px]">
                <Pill className="h-2.5 w-2.5 mr-0.5" />
                On meds
              </Badge>
            )}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex gap-2">
          {isStreaming ? (
            <Button variant="destructive" size="sm" onClick={stopStreaming} className="flex-1">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Stop
            </Button>
          ) : (
            <Button size="sm" onClick={streamCopilot} disabled={!symptoms.trim()} className="flex-1">
              <Brain className="h-3.5 w-3.5 mr-1.5" />
              Generate {actions.find(a => a.id === activeAction)?.label}
            </Button>
          )}
        </div>

        <Separator />

        {/* Output */}
        {(output || isStreaming) && (
          <div ref={outputRef}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                {isStreaming && <Loader2 className="h-3 w-3 animate-spin" />}
                {isStreaming ? 'Generating...' : 'Result'}
              </span>
              {output && !isStreaming && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={copyOutput}>
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  {onInsertText && (
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={insertOutput}>
                      <FileText className="h-3 w-3 mr-0.5" />
                      Insert
                    </Button>
                  )}
                </div>
              )}
            </div>
            <ScrollArea className="max-h-[400px] rounded-lg border bg-muted/30 p-3">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {renderMarkdown(output)}
                {isStreaming && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5" />}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Empty State */}
        {!output && !isStreaming && (
          <div className="text-center py-6 text-muted-foreground">
            <Brain className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs">Enter symptoms and select an action to get AI-powered clinical assistance</p>
            <p className="text-[10px] mt-1 opacity-60">Supports SOAP notes, treatment plans, Rx drafts, DDx, and summaries</p>
          </div>
        )}

        {/* Disclaimer */}
        <Alert className="py-2">
          <AlertDescription className="text-[10px] text-muted-foreground">
            ⚕️ AI-generated content is for decision support only. Always verify diagnoses, dosages, and treatment plans using clinical judgment and evidence-based guidelines.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ClinicalCopilot;
