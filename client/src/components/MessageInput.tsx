import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendChatMessage } from "@/lib/api";
import { VideoAnalysis, ChatMessage } from "@/types/video";

interface MessageInputProps {
  onMessage: (message: ChatMessage) => void;
  videoAnalysis: VideoAnalysis | null;
  disabled?: boolean;
}

export default function MessageInput({ onMessage, videoAnalysis, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !videoAnalysis) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    onMessage(userMessage);
    setMessage('');
    setIsLoading(true);

    try {
      // Send to n8n webhook
      const response = await sendChatMessage(message.trim(), videoAnalysis);
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        message: response.reply,
        timestamp: new Date().toISOString()
      };

      onMessage(assistantMessage);
    } catch (error) {
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };

      onMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Upload a video to start chatting..." : "Ask about specific events, violations, or get more details..."}
            className="resize-none min-h-[44px] max-h-32"
            rows={1}
            disabled={disabled || isLoading}
            data-testid="input-chat-message"
          />
        </div>
        <Button 
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-2xl flex-shrink-0"
          data-testid="button-send-message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
