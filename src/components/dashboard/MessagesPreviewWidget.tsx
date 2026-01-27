import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MessageCircle, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UnreadMessage {
  patient_id: string;
  patient_name: string;
  message_preview: string;
  created_at: string;
  unread_count: number;
}

interface MessagesPreviewWidgetProps {
  doctorId: string | null;
}

const MessagesPreviewWidget: React.FC<MessagesPreviewWidgetProps> = ({ doctorId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessage[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (doctorId) {
      fetchUnreadMessages();
    }
  }, [doctorId]);

  const fetchUnreadMessages = async () => {
    if (!doctorId) return;

    try {
      setLoading(true);

      // Get unread messages from patients
      const { data: messagesData, error: messagesError } = await supabase
        .from('patient_messages')
        .select('patient_id, message, created_at')
        .eq('doctor_id', doctorId)
        .eq('sender_type', 'patient')
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Get unique patient IDs with unread messages
      const patientUnreadMap = new Map<string, { count: number; latestMessage: string; latestTime: string }>();
      
      (messagesData || []).forEach(msg => {
        const existing = patientUnreadMap.get(msg.patient_id);
        if (existing) {
          existing.count++;
        } else {
          patientUnreadMap.set(msg.patient_id, {
            count: 1,
            latestMessage: msg.message,
            latestTime: msg.created_at,
          });
        }
      });

      const patientIds = Array.from(patientUnreadMap.keys());
      
      if (patientIds.length === 0) {
        setUnreadMessages([]);
        setTotalUnread(0);
        setLoading(false);
        return;
      }

      // Get patient names
      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .in('id', patientIds);

      const patientNameMap = new Map(
        (patientsData || []).map(p => [p.id, `${p.first_name} ${p.last_name}`])
      );

      const unreadList: UnreadMessage[] = [];
      let total = 0;

      patientUnreadMap.forEach((data, patientId) => {
        total += data.count;
        unreadList.push({
          patient_id: patientId,
          patient_name: patientNameMap.get(patientId) || 'Unknown Patient',
          message_preview: data.latestMessage.substring(0, 50) + (data.latestMessage.length > 50 ? '...' : ''),
          created_at: data.latestTime,
          unread_count: data.count,
        });
      });

      // Sort by latest message time
      unreadList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setUnreadMessages(unreadList.slice(0, 3));
      setTotalUnread(total);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-primary" />
            Patient Messages
            {totalUnread > 0 && (
              <Badge variant="destructive">{totalUnread}</Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => navigate('/patient-messages')}
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : unreadMessages.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No unread messages</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unreadMessages.map(msg => (
              <div
                key={msg.patient_id}
                className="flex items-start justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate('/patient-messages')}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{msg.patient_name}</span>
                    {msg.unread_count > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        {msg.unread_count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {msg.message_preview}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessagesPreviewWidget;
