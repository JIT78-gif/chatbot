import { useState } from "react";
import { Bot, Video, RotateCcw } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import MessageInput from "@/components/MessageInput";
import { Button } from "@/components/ui/button";
import { VideoAnalysis, ChatMessage as ChatMessageType } from "@/types/video";

interface ChatWindowProps {
  chatHistory: ChatMessageType[];
  videoAnalysis: VideoAnalysis | null;
  videoFile: File | null;
  isProcessing: boolean;
  onMessage: (message: ChatMessageType) => void;
  onVideoUpload: (file: File) => void;
  onProcessingStart: () => void;
  onAnalysisComplete: (analysis: VideoAnalysis) => void;
  onReset: () => void;
}

export default function ChatWindow({ 
  chatHistory, 
  videoAnalysis, 
  videoFile, 
  isProcessing, 
  onMessage, 
  onVideoUpload, 
  onProcessingStart, 
  onAnalysisComplete, 
  onReset 
}: ChatWindowProps) {
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
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Video className="text-white w-4 h-4" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Visual Understanding Assistant</h1>
        </div>
        {(videoFile || videoAnalysis) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            data-testid="button-reset"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4" data-testid="chat-messages">
        {chatHistory.length === 0 && !videoFile && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
              <Bot className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Visual Understanding Assistant</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">Upload a video to analyze traffic violations, pedestrian incidents, and compliance monitoring.</p>
          </div>
        )}

        {videoFile && !videoAnalysis && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Video className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isProcessing ? 'Analyzing Video...' : 'Video Uploaded'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isProcessing 
                  ? 'Processing your video for compliance violations and traffic incidents' 
                  : `Ready to analyze: ${videoFile.name}`
                }
              </p>
              {isProcessing && (
                <div className="mt-4">
                  <div className="flex space-x-1 justify-center">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {chatHistory.length > 0 && (
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            {chatHistory.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
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
        )}
      </div>

      {/* Quick Actions */}
      {videoAnalysis && chatHistory.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 h-auto py-2 px-4 rounded-full"
                  data-testid={`button-quick-action-${action.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <MessageInput 
            onMessage={onMessage} 
            videoAnalysis={videoAnalysis}
            onVideoUpload={onVideoUpload}
            onProcessingStart={onProcessingStart}
            onAnalysisComplete={onAnalysisComplete}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}
