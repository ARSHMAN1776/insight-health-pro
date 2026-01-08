import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MessageCircle, Send, User, Check, CheckCheck, Plus, Search, ArrowLeft, Stethoscope } from 'lucide-react';
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
          () => {
            fetchDoctorsAndConversations();
            if (selectedDoctor) fetchMessages();
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
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

        const { data: messagesData } = await supabase
          .from('patient_messages')
          .select('doctor_id, message, created_at, read, sender_type')
          .eq('patient_id', patientData?.id)
          .order('created_at', { ascending: false });

        const messagedDoctorIds = [...new Set(messagesData?.map(m => m.doctor_id) || [])];

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

    setConversations(prev =>
      prev.map(c => c.id === selectedDoctor.id ? { ...c, unread_count: 0 } : c)
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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message.',
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
      setSelectedDoctor({ ...doctor, unread_count: 0 });
    }
    setShowNewChat(false);
  };

  const availableForNewChat = allDoctors.filter(
    doc => !conversations.some(c => c.id === doc.id)
  );

  const filteredConversations = conversations.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="p-4 pb-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            Messages
          </CardTitle>
          {totalUnread > 0 && (
            <Badge className="bg-primary text-primary-foreground font-bold shadow-md">
              {totalUnread} new
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {allDoctors.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No Doctors Available</h3>
            <p className="text-sm text-muted-foreground">Book an appointment first to message your doctor</p>
          </div>
        ) : (
          <div className="h-[450px] sm:h-[500px] flex flex-col sm:flex-row">
            {/* Conversations List */}
            <div className={`${selectedDoctor ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-2/5 sm:min-w-[220px] sm:max-w-[280px] border-r bg-muted/20`}>
              {/* Search & New Chat */}
              <div className="p-3 border-b space-y-2 bg-background">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chats</span>
                  {availableForNewChat.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewChat(!showNewChat)}
                      className="h-7 w-7 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm rounded-lg bg-muted/50 border-0 focus-visible:ring-1"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {showNewChat && (
                  <div className="p-3 border-b bg-primary/5">
                    <p className="text-xs font-semibold mb-2 text-primary">Start New Chat</p>
                    <Select onValueChange={(value) => {
                      const doctor = allDoctors.find(d => d.id === value);
                      if (doctor) startNewConversation(doctor);
                    }}>
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableForNewChat.map(doctor => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-3.5 h-3.5 text-muted-foreground" />
                              Dr. {doctor.first_name} {doctor.last_name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {filteredConversations.length === 0 && !showNewChat ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-sm text-muted-foreground mb-2">No conversations yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewChat(true)}
                      className="text-xs rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Start a chat
                    </Button>
                  </div>
                ) : (
                  <div>
                    {filteredConversations.map(convo => (
                      <button
                        key={convo.id}
                        onClick={() => setSelectedDoctor(convo)}
                        className={`w-full p-3 text-left transition-all border-b last:border-b-0 ${
                          selectedDoctor?.id === convo.id
                            ? 'bg-primary/10 border-l-4 border-l-primary'
                            : 'hover:bg-muted/50 active:bg-muted border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                            <Stethoscope className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold truncate">
                                Dr. {convo.first_name}
                              </span>
                              {convo.last_message_time && (
                                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                  {formatTime(convo.last_message_time)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className="text-xs text-muted-foreground truncate">
                                {convo.last_message || convo.specialization}
                              </p>
                              {convo.unread_count > 0 && (
                                <Badge className="bg-primary text-primary-foreground text-[10px] h-5 min-w-5 flex items-center justify-center rounded-full font-bold">
                                  {convo.unread_count}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className={`${selectedDoctor ? 'flex' : 'hidden sm:flex'} flex-col flex-1 bg-gradient-to-b from-muted/30 to-background`}>
              {!selectedDoctor ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center px-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm text-muted-foreground">Select a conversation to start messaging</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="p-3 sm:p-4 border-b flex items-center gap-3 bg-background shadow-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDoctor(null)}
                      className="sm:hidden h-9 w-9 p-0 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                      <Stethoscope className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">
                        Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{selectedDoctor.specialization}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">No messages yet</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">Send a message to start the conversation</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_type === 'patient' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                              msg.sender_type === 'patient'
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-card border border-border rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>
                            <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${
                              msg.sender_type === 'patient' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                              {msg.sender_type === 'patient' && (
                                msg.read ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-3 sm:p-4 border-t bg-background">
                    <div className="flex gap-2 items-end">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="min-h-[44px] max-h-[120px] resize-none rounded-xl border-2 focus-visible:border-primary text-sm"
                        rows={1}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="h-11 w-11 rounded-xl flex-shrink-0 shadow-lg shadow-primary/30"
                        size="icon"
                      >
                        {sending ? (
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
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
