import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatbotOptions {
  userRole: string | null;
  userName: string | null;
}

const getWelcomeMessage = (role: string | null, name: string | null): string => {
  if (role === 'doctor') {
    return `Hi${name ? ` ${name}` : ''}! 👋 I'm your HMS assistant. I can help you check today's patients, view schedules, or look up patient records. What would you like to know?`;
  }
  if (role === 'patient') {
    return `Hi${name ? ` ${name}` : ''}! 👋 I'm your healthcare assistant. I can help you check appointments, view prescriptions, or find doctor schedules. How can I help you today?`;
  }
  return "Hi! 👋 I'm your HealthCare HMS assistant. How can I help you today? I can answer questions about our features, pricing, or help you get started.";
};

export const useChatbot = ({ userRole, userName }: UseChatbotOptions) => {
  const [messages, setMessages] = useState<Message[]>(() => [
    { role: 'assistant', content: getWelcomeMessage(userRole, userName) }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Update welcome message when user context changes
  const updateWelcomeMessage = useCallback((role: string | null, name: string | null) => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ role: 'assistant', content: getWelcomeMessage(role, name) }];
      }
      return prev;
    });
  }, []);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = '';

    try {
      // Get the current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/chatbot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || supabaseAnonKey}`,
          },
          body: JSON.stringify({ 
            messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && prev.length > 1 && prev[prev.length - 2]?.role === 'user') {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again or contact support for assistance.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  return {
    messages,
    isLoading,
    sendMessage,
    updateWelcomeMessage,
  };
};
