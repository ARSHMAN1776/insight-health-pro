import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Star, ThumbsUp, Clock, Stethoscope, MessageCircle, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppointmentFeedbackProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  onSubmitted?: () => void;
}

const feedbackCategories = [
  { id: 'wait_time', label: 'Wait Time', icon: Clock },
  { id: 'communication', label: 'Communication', icon: MessageCircle },
  { id: 'examination', label: 'Examination', icon: Stethoscope },
  { id: 'care_quality', label: 'Care Quality', icon: Heart },
  { id: 'staff_behavior', label: 'Staff Behavior', icon: ThumbsUp },
];

const AppointmentFeedback: React.FC<AppointmentFeedbackProps> = ({
  open,
  onOpenChange,
  appointmentId,
  patientId,
  doctorId,
  doctorName,
  onSubmitted,
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: 'Please select a rating', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('patient_feedback')
        .insert({
          appointment_id: appointmentId,
          patient_id: patientId,
          doctor_id: doctorId,
          rating,
          categories: selectedCategories,
          comments: comments.trim() || null,
          is_anonymous: isAnonymous,
        });

      if (error) throw error;

      toast({
        title: 'Thank you for your feedback! 🎉',
        description: 'Your feedback helps us improve our services.',
      });

      onOpenChange(false);
      onSubmitted?.();
      
      // Reset form
      setRating(0);
      setSelectedCategories([]);
      setComments('');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Feedback error:', error);
      toast({
        title: 'Failed to submit feedback',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Tap to rate';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Rate Your Visit</DialogTitle>
          <DialogDescription className="text-center">
            {doctorName ? `How was your experience with ${doctorName}?` : 'How was your appointment?'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Star Rating */}
          <div className="text-center space-y-2">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {getRatingLabel(hoveredRating || rating)}
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">What stood out? (optional)</p>
            <div className="flex flex-wrap gap-2">
              {feedbackCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <Badge
                    key={cat.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <Icon className="h-3.5 w-3.5 mr-1.5" />
                    {cat.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Additional comments (optional)</p>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us about your experience..."
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Anonymous toggle */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-muted-foreground">Submit anonymously</span>
          </label>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFeedback;
