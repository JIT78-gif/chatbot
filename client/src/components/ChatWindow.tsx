import { useState } from "react";
import { Bot, User } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import MessageInput from "@/components/MessageInput";
import { Button } from "@/components/ui/button";
import { VideoAnalysis, ChatMessage as ChatMessageType } from "@/types/video";

interface ChatWindowProps {
  chatHistory: ChatMessageType[];
  videoAnalysis: VideoAnalysis | null;
  onMessage: (message: ChatMessageType) => void;
}

export default function ChatWindow({ chatHistory, videoAnalysis, onMessage }: ChatWindowProps) {
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    "Show all violations",
    "Explain compliance score", 
    "Timeline summary"
  ];

  const handleQuickAction = async (action: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      sender: 'user',
      message: action,
      timestamp: new Date().toISOString()
    };
    onMessage(userMessage);

    // Simulate typing
    setIsTyping(true);
    
    // Simulate assistant response after delay
    setTimeout(() => {
      let response = '';
      
      switch (action) {
        case "Show all violations":
          if (videoAnalysis) {
            const violations = videoAnalysis.events.filter(e => e.severity !== 'compliant');
            response = `I found ${violations.length} violations in the video:\n\n${violations.map(v => 
              `• ${v.title} at ${Math.floor(v.timestamp / 60)}:${(Math.floor(v.timestamp % 60)).toString().padStart(2, '0')} - ${v.severity}`
            ).join('\n')}`;
          } else {
            response = "Please upload and analyze a video first to see violations.";
          }
          break;
          
        case "Explain compliance score":
          if (videoAnalysis) {
            response = `Your video received a compliance score of ${videoAnalysis.compliance.score}%. This is based on ${videoAnalysis.compliance.violations.critical} critical violations, ${videoAnalysis.compliance.violations.minor} minor violations, and ${videoAnalysis.events.filter(e => e.severity === 'compliant').length} compliant events detected during the analysis.`;
          } else {
            response = "Please upload and analyze a video first to see the compliance score.";
          }
          break;
          
        case "Timeline summary":
          if (videoAnalysis) {
            response = `Here's a timeline summary of your ${Math.floor(videoAnalysis.video.duration / 60)}:${(Math.floor(videoAnalysis.video.duration % 60)).toString().padStart(2, '0')} video:\n\n${videoAnalysis.events.map(e => 
              `${Math.floor(e.timestamp / 60)}:${(Math.floor(e.timestamp % 60)).toString().padStart(2, '0')} - ${e.title}`
            ).join('\n')}`;
          } else {
            response = "Please upload and analyze a video first to see the timeline.";
          }
          break;
          
        default:
          response = "I'm here to help analyze your video content. What would you like to know?";
      }

      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        message: response,
        timestamp: new Date().toISOString()
      };
      
      setIsTyping(false);
      onMessage(assistantMessage);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-8rem)] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">Ask questions about the video analysis</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages">
        {chatHistory.length === 0 && !videoAnalysis && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Upload a video to start the conversation</p>
          </div>
        )}
        
        {chatHistory.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <Bot className="text-white w-4 h-4" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {videoAnalysis && (
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action}
                variant="secondary"
                size="sm"
                onClick={() => handleQuickAction(action)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 h-auto py-1 px-3 rounded-full"
                data-testid={`button-quick-action-${action.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <MessageInput 
        onMessage={onMessage} 
        videoAnalysis={videoAnalysis}
        disabled={!videoAnalysis}
      />
    </div>
  );
}
