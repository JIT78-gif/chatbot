import { useState } from "react";
import ChatWindow from "@/components/ChatWindow";
import { VideoAnalysis, ChatMessage } from "@/types/video";

export default function Dashboard() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysis | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVideoUpload = (file: File) => {
    setVideoFile(file);
  };

  const handleAnalysisComplete = (analysis: VideoAnalysis) => {
    setVideoAnalysis(analysis);
    setIsProcessing(false);
    
    // Add initial assistant message with summary
    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'assistant',
      message: `I've analyzed your ${Math.floor(analysis.video.duration / 60)}:${(Math.floor(analysis.video.duration % 60)).toString().padStart(2, '0')} video and detected ${analysis.events.length} events. The video shows ${analysis.compliance.violations.critical} critical violations and ${analysis.compliance.violations.minor} minor violations. Would you like me to explain any specific incident?`,
      timestamp: new Date().toISOString(),
      metadata: {
        type: 'summary',
        analysisId: analysis.id
      }
    };
    
    setChatHistory([initialMessage]);
  };

  const handleChatMessage = (message: ChatMessage) => {
    setChatHistory(prev => [...prev, message]);
  };

  const handleReset = () => {
    setVideoFile(null);
    setVideoAnalysis(null);
    setChatHistory([]);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark">
      <div className="max-w-4xl mx-auto">
        <ChatWindow 
          chatHistory={chatHistory}
          videoAnalysis={videoAnalysis}
          videoFile={videoFile}
          isProcessing={isProcessing}
          onMessage={handleChatMessage}
          onVideoUpload={handleVideoUpload}
          onProcessingStart={() => setIsProcessing(true)}
          onAnalysisComplete={handleAnalysisComplete}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
