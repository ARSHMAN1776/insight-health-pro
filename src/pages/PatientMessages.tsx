import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, User, Search, Check, CheckCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  patient_id: string;
  doctor_id: string;
  sender_type: 'patient' | 'doctor';
  message: string;
  read: boolean;
  created_at: string;
}

interface PatientConversation {
  patient_id: string;
  first_name: string;
  last_name: string;
  unread_count: number;
  last_message?: string;
  last_message_time?: string;
}

const PatientMessages: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientConversation[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchDoctorId();
    }
  }, [user?.id]);

  useEffect(() => {
    if (doctorId) {
      fetchPatientConversations();
    }
  }, [doctorId]);

  useEffect(() => {
    if (selectedPatient && doctorId) {
      fetchMessages();
      markMessagesAsRead();
    }
  }, [selectedPatient, doctorId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchDoctorId = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setDoctorId(data?.id || null);
    } catch (error) {
      console.error('Error fetching doctor ID:', error);
    }
  };

  const fetchPatientConversations = async () => {
    if (!doctorId) return;

    try {
      // Get all messages for this doctor
      const { data: messagesData, error: messagesError } = await supabase
        .from('patient_messages')
        .select('patient_id, message, created_at, read, sender_type')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Get unique patient IDs
      const patientIds = [...new Set(messagesData?.map(m => m.patient_id) || [])];

      if (patientIds.length === 0) {
        setPatients([]);
        return;
      }

      // Get patient info
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .in('id', patientIds);

      if (patientsError) throw patientsError;

      // Build conversations list
      const conversations: PatientConversation[] = (patientsData || []).map(patient => {
        const patientMessages = messagesData?.filter(m => m.patient_id === patient.id) || [];
        const unreadCount = patientMessages.filter(m => !m.read && m.sender_type === 'patient').length;
        const lastMessage = patientMessages[0];

        return {
          patient_id: patient.id,
          first_name: patient.first_name,
          last_name: patient.last_name,
          unread_count: unreadCount,
          last_message: lastMessage?.message,
          last_message_time: lastMessage?.created_at,
        };
      });

      // Sort by last message time
      conversations.sort((a, b) => {
        if (!a.last_message_time) return 1;
        if (!b.last_message_time) return -1;
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
      });

      setPatients(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async () => {
    if (!doctorId || !selectedPatient) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patient_messages')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('patient_id', selectedPatient.patient_id)
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
    if (!doctorId || !selectedPatient) return;

    await supabase
      .from('patient_messages')
      .update({ read: true })
      .eq('doctor_id', doctorId)
      .eq('patient_id', selectedPatient.patient_id)
      .eq('sender_type', 'patient')
      .eq('read', false);

    // Update local state
    setPatients(prev =>
      prev.map(p =>
        p.patient_id === selectedPatient.patient_id
          ? { ...p, unread_count: 0 }
          : p
      )
    );
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPatient || !doctorId) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('patient_messages')
        .insert({
          patient_id: selectedPatient.patient_id,
          doctor_id: doctorId,
          sender_type: 'doctor',
          message: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages();
      fetchPatientConversations();
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent to the patient.',
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

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = patients.reduce((sum, p) => sum + p.unread_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Messages</h1>
          <p className="text-muted-foreground mt-1">
            Communicate with your patients securely
          </p>
        </div>
        {totalUnread > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {totalUnread} unread message{totalUnread > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Patients List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Conversations
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPatients.map(patient => (
                  <button
                    key={patient.patient_id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedPatient?.patient_id === patient.patient_id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </span>
                      {patient.unread_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {patient.unread_count}
                        </Badge>
                      )}
                    </div>
                    {patient.last_message && (
                      <p className={`text-sm truncate mt-1 ${
                        selectedPatient?.patient_id === patient.patient_id
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}>
                        {patient.last_message}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              {selectedPatient
                ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
                : 'Select a conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4">
            {!selectedPatient ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Select a patient to view messages</p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto mb-4 bg-muted/30 rounded-lg p-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_type === 'doctor' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.sender_type === 'doctor'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background border'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${
                              msg.sender_type === 'doctor'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}>
                              <span className="text-xs">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {msg.sender_type === 'doctor' && (
                                msg.read ? (
                                  <CheckCheck className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <Check className="w-4 h-4 text-primary-foreground/50" />
                                )
                              )}
                            </div>
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
                    placeholder={`Reply to ${selectedPatient.first_name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[80px] resize-none"
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
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientMessages;
