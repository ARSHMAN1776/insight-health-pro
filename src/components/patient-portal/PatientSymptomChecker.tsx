import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Brain, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Stethoscope,
  User,
  Calendar,
  Building2,
  HeartPulse,
  Lightbulb,
  ShieldAlert
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PossibleCondition {
  name: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  selfCareAdvice: string[];
}

interface SymptomCheckResult {
  possibleConditions: PossibleCondition[];
  recommendedDepartment: {
    name: string;
    reason: string;
  };
  availableDoctors: Array<{
    id: string;
    name: string;
    specialization: string;
    department: string;
  }>;
  urgency: 'routine' | 'urgent' | 'emergency';
  emergencyWarning?: string;
  generalAdvice: string[];
  disclaimer: string;
}

interface PatientSymptomCheckerProps {
  patientAge?: number;
  patientGender?: string;
  onBookAppointment?: (doctorId: string) => void;
}

const PatientSymptomChecker: React.FC<PatientSymptomCheckerProps> = ({
  patientAge,
  patientGender,
  onBookAppointment
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SymptomCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState(patientAge?.toString() || '');
  const [gender, setGender] = useState<string>(patientGender || '');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return { 
          color: 'bg-destructive text-destructive-foreground', 
          icon: ShieldAlert, 
          label: 'Emergency - Seek Immediate Care' 
        };
      case 'urgent':
        return { 
          color: 'bg-orange-500 text-white', 
          icon: AlertTriangle, 
          label: 'Urgent - See a Doctor Soon' 
        };
      default:
        return { 
          color: 'bg-green-500 text-white', 
          icon: CheckCircle, 
          label: 'Routine - Schedule an Appointment' 
        };
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'severe':
        return <Badge variant="destructive">Severe</Badge>;
      case 'moderate':
        return <Badge className="bg-orange-500">Moderate</Badge>;
      default:
        return <Badge variant="secondary">Mild</Badge>;
    }
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your symptoms",
        variant: "destructive"
      });
      return;
    }

    if (!age || parseInt(age) <= 0) {
      toast({
        title: "Missing Information",
        description: "Please enter your age",
        variant: "destructive"
      });
      return;
    }

    if (!gender) {
      toast({
        title: "Missing Information",
        description: "Please select your gender",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('patient-symptom-checker', {
        body: {
          symptoms,
          age: parseInt(age),
          gender,
          medicalHistory: medicalHistory || undefined,
          currentMedications: currentMedications || undefined
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);

      // Show toast for urgent/emergency cases
      if (data.urgency === 'emergency') {
        toast({
          title: "⚠️ Emergency Warning",
          description: "Your symptoms may require immediate medical attention. Please seek emergency care.",
          variant: "destructive"
        });
      } else if (data.urgency === 'urgent') {
        toast({
          title: "Urgent Attention Needed",
          description: "Please consult a doctor as soon as possible.",
        });
      }

    } catch (err) {
      console.error('Symptom check error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze symptoms';
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setSymptoms('');
    if (!patientAge) setAge('');
    if (!patientGender) setGender('');
    setMedicalHistory('');
    setCurrentMedications('');
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/20">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">AI Symptom Checker</CardTitle>
              <CardDescription className="text-base">
                Describe your symptoms and get personalized health guidance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!result ? (
        /* Input Form */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5" />
              Tell Us How You're Feeling
            </CardTitle>
            <CardDescription>
              The more details you provide, the better we can help you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Symptoms */}
            <div className="space-y-2">
              <Label htmlFor="symptoms" className="text-base font-medium">
                What symptoms are you experiencing? *
              </Label>
              <Textarea
                id="symptoms"
                placeholder="Describe your symptoms in detail. For example: I've had a headache for 3 days, feeling tired, and have a mild fever..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {/* Age and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-base font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Your Age *
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={1}
                  max={150}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-base font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Your Gender *
                </Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other / Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Optional Information */}
            <Accordion type="single" collapsible>
              <AccordionItem value="additional">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Additional Information (Optional)
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory">Medical History</Label>
                    <Textarea
                      id="medicalHistory"
                      placeholder="Any existing conditions, past surgeries, or ongoing health issues..."
                      value={medicalHistory}
                      onChange={(e) => setMedicalHistory(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Current Medications</Label>
                    <Textarea
                      id="medications"
                      placeholder="List any medications you're currently taking..."
                      value={currentMedications}
                      onChange={(e) => setCurrentMedications(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyze} 
              disabled={isLoading}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Your Symptoms...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Analyze My Symptoms
                </>
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Results Display */
        <div className="space-y-6">
          {/* Urgency Banner */}
          {result.urgency && (
            <Alert className={getUrgencyConfig(result.urgency).color}>
              {React.createElement(getUrgencyConfig(result.urgency).icon, { className: "h-5 w-5" })}
              <AlertTitle className="text-lg">
                {getUrgencyConfig(result.urgency).label}
              </AlertTitle>
              {result.emergencyWarning && (
                <AlertDescription className="mt-2 text-base">
                  {result.emergencyWarning}
                </AlertDescription>
              )}
            </Alert>
          )}

          {/* Possible Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Possible Explanations
              </CardTitle>
              <CardDescription>
                Based on your symptoms, here are some possibilities to discuss with your doctor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {result.possibleConditions.map((condition, index) => (
                  <AccordionItem key={index} value={`condition-${index}`}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-3 text-left">
                        <span className="font-medium">{condition.name}</span>
                        {getSeverityBadge(condition.severity)}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-muted-foreground">{condition.description}</p>
                      
                      {condition.selfCareAdvice && condition.selfCareAdvice.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Self-Care Tips:</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {condition.selfCareAdvice.map((advice, i) => (
                              <li key={i}>{advice}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Recommended Department */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Recommended Department
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="text-xl font-semibold text-primary">
                  {result.recommendedDepartment.name}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {result.recommendedDepartment.reason}
                </p>
              </div>

              {/* Available Doctors */}
              {result.availableDoctors && result.availableDoctors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Available Doctors
                  </h4>
                  <div className="grid gap-3">
                    {result.availableDoctors.map((doctor) => (
                      <div 
                        key={doctor.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{doctor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specialization}
                          </p>
                        </div>
                        {onBookAppointment && (
                          <Button 
                            size="sm"
                            onClick={() => onBookAppointment(doctor.id)}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Book
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!result.availableDoctors || result.availableDoctors.length === 0) && (
                <p className="text-muted-foreground text-sm">
                  No doctors currently available for this specialization. Please contact the hospital for assistance.
                </p>
              )}
            </CardContent>
          </Card>

          {/* General Advice */}
          {result.generalAdvice && result.generalAdvice.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  General Health Advice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.generalAdvice.map((advice, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Notice</AlertTitle>
            <AlertDescription>
              {result.disclaimer}
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              <Brain className="mr-2 h-4 w-4" />
              Check New Symptoms
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSymptomChecker;
