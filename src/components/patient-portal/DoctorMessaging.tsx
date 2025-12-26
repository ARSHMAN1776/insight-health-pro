import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MessageCircle, Send, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/lib/dataManager';

interface Message {
  id: string;
  patient_id: string;
  doctor_id: string;
  sender_type: 'patient' | 'doctor';
  message: string;
  read: boolean;
  created_at: string;
}

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
}

interface DoctorMessagingProps {
  patientData: Patient | null;
}

const DoctorMessaging: React.FC<DoctorMessagingProps> = ({ patientData }) => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (patientData?.id) {
      fetchDoctors();
    }
  }, [patientData?.id]);

  useEffect(() => {
    if (selectedDoctor && patientData?.id) {
      fetchMessages();
      // Mark messages as read
      markMessagesAsRead();
    }
  }, [selectedDoctor, patientData?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchDoctors = async () => {
    try {
      // Get doctors that the patient has had appointments with
      const { data: appointments } = await supabase
        .from('appointments')
        .select('doctor_id')
        .eq('patient_id', patientData?.id);

      const doctorIds = [...new Set(appointments?.map(a => a.doctor_id) || [])];

      if (doctorIds.length > 0) {
        const { data: doctorsData } = await supabase
          .from('doctors')
          .select('id, first_name, last_name, specialization')
          .in('id', doctorIds);

        setDoctors(doctorsData || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchMessages = async () => {
    if (!patientData?.id || !selectedDoctor) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patient_messages')
        .select('*')
        .eq('patient_id', patientData.id)
        .eq('doctor_id', selectedDoctor)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!patientData?.id || !selectedDoctor) return;
    
    await supabase
      .from('patient_messages')
      .update({ read: true })
      .eq('patient_id', patientData.id)
      .eq('doctor_id', selectedDoctor)
      .eq('sender_type', 'doctor')
      .eq('read', false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedDoctor || !patientData?.id) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('patient_messages')
        .insert({
          patient_id: patientData.id,
          doctor_id: selectedDoctor,
          sender_type: 'patient',
          message: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages();
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent to the doctor.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const selectedDoctorInfo = doctors.find(d => d.id === selectedDoctor);

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <span>Message Your Doctor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {doctors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No doctors to message yet</p>
            <p className="text-sm mt-2">Book an appointment first to start messaging your doctor</p>
          </div>
        ) : (
          <>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor to message" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedDoctor && (
              <div className="space-y-4">
                {/* Messages Container */}
                <div className="bg-accent/30 rounded-lg p-4 h-64 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_type === 'patient' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.sender_type === 'patient'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${
                              msg.sender_type === 'patient' 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {new Date(msg.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder={`Message Dr. ${selectedDoctorInfo?.last_name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[80px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || sending}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorMessaging;
