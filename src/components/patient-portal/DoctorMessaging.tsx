import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MessageCircle, Send, User, Check, CheckCheck, Plus, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
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

interface DoctorConversation extends Doctor {
  unread_count: number;
  last_message?: string;
  last_message_time?: string;
}

interface DoctorMessagingProps {
  patientData: Patient | null;
}

const DoctorMessaging: React.FC<DoctorMessagingProps> = ({ patientData }) => {
  const { toast } = useToast();
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [conversations, setConversations] = useState<DoctorConversation[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (patientData?.id) {
      fetchDoctorsAndConversations();

      // Set up real-time subscription for messages
      const channel = supabase
        .channel('patient-messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'patient_messages',
            filter: `patient_id=eq.${patientData.id}`
          },
          (payload) => {
            console.log('Message update received:', payload);
            fetchDoctorsAndConversations();
            if (selectedDoctor) {
              fetchMessages();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [patientData?.id]);

  useEffect(() => {
    if (selectedDoctor && patientData?.id) {
      fetchMessages();
      markMessagesAsRead();
    }
  }, [selectedDoctor, patientData?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchDoctorsAndConversations = async () => {
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

        setAllDoctors(doctorsData || []);

        // Get all messages for this patient
        const { data: messagesData } = await supabase
          .from('patient_messages')
          .select('doctor_id, message, created_at, read, sender_type')
          .eq('patient_id', patientData?.id)
          .order('created_at', { ascending: false });

        // Get unique doctor IDs from messages (existing conversations)
        const messagedDoctorIds = [...new Set(messagesData?.map(m => m.doctor_id) || [])];

        // Build conversations list from doctors who have messages
        const convos: DoctorConversation[] = (doctorsData || [])
          .filter(doc => messagedDoctorIds.includes(doc.id))
          .map(doctor => {
            const doctorMessages = messagesData?.filter(m => m.doctor_id === doctor.id) || [];
            const unreadCount = doctorMessages.filter(m => !m.read && m.sender_type === 'doctor').length;
            const lastMessage = doctorMessages[0];

            return {
              ...doctor,
              unread_count: unreadCount,
              last_message: lastMessage?.message,
              last_message_time: lastMessage?.created_at,
            };
          });

        // Sort by last message time
        convos.sort((a, b) => {
          if (!a.last_message_time) return 1;
          if (!b.last_message_time) return -1;
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });

        setConversations(convos);
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
        .eq('doctor_id', selectedDoctor.id)
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
      .eq('doctor_id', selectedDoctor.id)
      .eq('sender_type', 'doctor')
      .eq('read', false);

    // Update local state
    setConversations(prev =>
      prev.map(c =>
        c.id === selectedDoctor.id
          ? { ...c, unread_count: 0 }
          : c
      )
    );
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedDoctor || !patientData?.id) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('patient_messages')
        .insert({
          patient_id: patientData.id,
          doctor_id: selectedDoctor.id,
          sender_type: 'patient',
          message: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages();
      fetchDoctorsAndConversations();
      setShowNewChat(false);
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

  const startNewConversation = (doctor: Doctor) => {
    const existingConvo = conversations.find(c => c.id === doctor.id);
    if (existingConvo) {
      setSelectedDoctor(existingConvo);
    } else {
      setSelectedDoctor({
        ...doctor,
        unread_count: 0,
        last_message: undefined,
        last_message_time: undefined,
      });
    }
    setShowNewChat(false);
  };

  // Doctors available for new conversations (not already in conversations)
  const availableForNewChat = allDoctors.filter(
    doc => !conversations.some(c => c.id === doc.id)
  );

  const filteredConversations = conversations.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  // Render read status ticks
  const renderReadStatus = (msg: Message) => {
    if (msg.sender_type !== 'patient') return null;
    
    return (
      <span className="ml-1 inline-flex">
        {msg.read ? (
          <CheckCheck className="w-4 h-4 text-blue-400" />
        ) : (
          <Check className="w-4 h-4 text-primary-foreground/50" />
        )}
      </span>
    );
  };

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <span>Message Your Doctor</span>
          </CardTitle>
          {totalUnread > 0 && (
            <Badge variant="destructive">{totalUnread} unread</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {allDoctors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No doctors to message yet</p>
            <p className="text-sm mt-2">Book an appointment first to start messaging your doctor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px]">
            {/* Conversations List */}
            <div className="lg:col-span-1 border rounded-lg flex flex-col">
              <div className="p-3 border-b space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Conversations</span>
                  {availableForNewChat.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewChat(!showNewChat)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 h-8 text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {showNewChat && (
                  <div className="mb-2 p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium mb-2">Start new conversation:</p>
                    <Select onValueChange={(value) => {
                      const doctor = allDoctors.find(d => d.id === value);
                      if (doctor) startNewConversation(doctor);
                    }}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableForNewChat.map(doctor => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            Dr. {doctor.first_name} {doctor.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {filteredConversations.length === 0 && !showNewChat ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <p>No conversations yet</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowNewChat(true)}
                      className="mt-1"
                    >
                      Start a new chat
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map(convo => (
                      <button
                        key={convo.id}
                        onClick={() => setSelectedDoctor(convo)}
                        className={`w-full p-2 rounded-lg text-left transition-all ${
                          selectedDoctor?.id === convo.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">
                            Dr. {convo.first_name} {convo.last_name}
                          </span>
                          {convo.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs h-5 min-w-5 flex items-center justify-center">
                              {convo.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs truncate ${
                          selectedDoctor?.id === convo.id
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}>
                          {convo.specialization}
                        </p>
                        {convo.last_message && (
                          <p className={`text-xs truncate mt-1 ${
                            selectedDoctor?.id === convo.id
                              ? 'text-primary-foreground/60'
                              : 'text-muted-foreground/80'
                          }`}>
                            {convo.last_message}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="lg:col-span-2 border rounded-lg flex flex-col">
              {!selectedDoctor ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Select a conversation or start a new one</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="p-3 border-b flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedDoctor.specialization}</p>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto p-3 bg-muted/20">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {messages.map(msg => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender_type === 'patient' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-2.5 ${
                                msg.sender_type === 'patient'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-background border'
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <div className={`flex items-center justify-end gap-1 mt-1 ${
                                msg.sender_type === 'patient' 
                                  ? 'text-primary-foreground/70' 
                                  : 'text-muted-foreground'
                              }`}>
                                <span className="text-xs">
                                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {renderReadStatus(msg)}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-3 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={`Message Dr. ${selectedDoctor.last_name}...`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 min-h-[60px] max-h-[100px] resize-none text-sm"
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
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter to send, Shift+Enter for new line
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorMessaging;
