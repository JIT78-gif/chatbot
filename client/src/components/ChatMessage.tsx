import { Bot, User, AlertTriangle } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/types/video";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isUser = message.sender === 'user';
  const Icon = isUser ? User : Bot;

  // Check if message contains structured content
  const hasStructuredContent = message.metadata?.type === 'summary' || 
    message.message.includes('Critical Violation') ||
    message.message.includes('⚠️');

  const renderMessageContent = () => {
    if (hasStructuredContent && message.message.includes('Critical Violation')) {
      const parts = message.message.split('\n\n');
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-800">{parts[0]}</p>
          {parts.length > 1 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <p className="text-xs text-red-800 font-medium">Critical Violation</p>
              </div>
              <p className="text-xs text-red-600 mt-1">High risk incident - intersection violation</p>
            </div>
          )}
          {parts[2] && (
            <p className="text-sm text-gray-800">{parts[2]}</p>
          )}
        </div>
      );
    }

    // Format messages with line breaks
    return (
      <div className="whitespace-pre-line text-sm text-gray-800">
        {message.message}
      </div>
    );
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-gray-600' : 'bg-gradient-to-r from-purple-500 to-blue-500'
      }`}>
        <Icon className="text-white w-4 h-4" />
      </div>
      <div className="max-w-2xl">
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-gray-600 dark:bg-gray-700 text-white rounded-tr-sm' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
        }`}>
          {isUser ? (
            <p className="text-sm">{message.message}</p>
          ) : (
            renderMessageContent()
          )}
        </div>
        <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : ''}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
