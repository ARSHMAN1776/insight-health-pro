import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MessageCircle, Send, User, Check, CheckCheck, Plus, Search, ArrowLeft } from 'lucide-react';
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
    <Card>
      <CardHeader className="p-3 sm:p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Messages
          </CardTitle>
          {totalUnread > 0 && (
            <Badge variant="destructive" className="text-xs">{totalUnread}</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {allDoctors.length === 0 ? (
          <div className="text-center py-8 px-4 text-muted-foreground">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No doctors to message</p>
            <p className="text-xs mt-1">Book an appointment first</p>
          </div>
        ) : (
          <div className="h-[400px] flex">
            {/* Conversations List */}
            <div className={`${selectedDoctor ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-1/3 sm:min-w-[200px] border-r`}>
              <div className="p-2 border-b space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Chats</span>
                  {availableForNewChat.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewChat(!showNewChat)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 h-7 text-xs"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {showNewChat && (
                  <div className="p-2 border-b bg-muted/50">
                    <p className="text-[10px] font-medium mb-1.5 text-muted-foreground">New chat</p>
                    <Select onValueChange={(value) => {
                      const doctor = allDoctors.find(d => d.id === value);
                      if (doctor) startNewConversation(doctor);
                    }}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableForNewChat.map(doctor => (
                          <SelectItem key={doctor.id} value={doctor.id} className="text-xs">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {filteredConversations.length === 0 && !showNewChat ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-xs">No conversations</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowNewChat(true)}
                      className="text-xs h-auto p-0 mt-1"
                    >
                      Start a chat
                    </Button>
                  </div>
                ) : (
                  <div>
                    {filteredConversations.map(convo => (
                      <button
                        key={convo.id}
                        onClick={() => setSelectedDoctor(convo)}
                        className={`w-full p-2.5 text-left transition-colors border-b last:border-b-0 ${
                          selectedDoctor?.id === convo.id
                            ? 'bg-primary/10'
                            : 'hover:bg-muted/50 active:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium truncate">
                                Dr. {convo.first_name} {convo.last_name}
                              </span>
                              {convo.unread_count > 0 && (
                                <Badge variant="destructive" className="text-[10px] h-4 min-w-4 flex items-center justify-center ml-1">
                                  {convo.unread_count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {convo.last_message || convo.specialization}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className={`${selectedDoctor ? 'flex' : 'hidden sm:flex'} flex-col flex-1`}>
              {!selectedDoctor ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">Select a conversation</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="p-2.5 border-b flex items-center gap-2 bg-muted/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDoctor(null)}
                      className="sm:hidden h-8 w-8 p-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{selectedDoctor.specialization}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/20">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p className="text-xs">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_type === 'patient' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                              msg.sender_type === 'patient'
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-card border rounded-bl-md'
                            }`}
                          >
                            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${
                              msg.sender_type === 'patient' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                              {msg.sender_type === 'patient' && (
                                msg.read ? (
                                  <CheckCheck className="w-3 h-3 text-blue-300" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-2.5 border-t bg-background">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="min-h-[40px] max-h-[100px] text-sm resize-none flex-1"
                        rows={1}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        size="sm"
                        className="h-10 w-10 p-0"
                      >
                        <Send className="w-4 h-4" />
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
