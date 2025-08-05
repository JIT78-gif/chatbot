import { useState } from "react";
import NavigationHeader from "@/components/NavigationHeader";
import VideoUpload from "@/components/VideoUpload";
import VideoPlayer from "@/components/VideoPlayer";
import ComplianceScore from "@/components/ComplianceScore";
import InteractiveTimeline from "@/components/InteractiveTimeline";
import EventCards from "@/components/EventCards";
import ChatWindow from "@/components/ChatWindow";
import { VideoAnalysis, ChatMessage } from "@/types/video";

export default function Dashboard() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysis | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
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
      message: `I've analyzed your ${analysis.video.duration} video and detected ${analysis.events.length} events. The video shows ${analysis.compliance.violations.critical} critical violations and ${analysis.compliance.violations.minor} minor violations. Would you like me to explain any specific incident?`,
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

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const handleReset = () => {
    setVideoFile(null);
    setVideoAnalysis(null);
    setChatHistory([]);
    setSelectedEvent(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader onReset={handleReset} />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            
            {/* Left Column: Video Upload & Player */}
            <div className="lg:col-span-1 space-y-6">
              {!videoFile ? (
                <VideoUpload 
                  onUpload={handleVideoUpload}
                  onProcessingStart={() => setIsProcessing(true)}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              ) : (
                <VideoPlayer 
                  file={videoFile}
                  analysis={videoAnalysis}
                  selectedEvent={selectedEvent}
                  isProcessing={isProcessing}
                />
              )}
              
              {videoAnalysis && (
                <ComplianceScore analysis={videoAnalysis} />
              )}
            </div>

            {/* Middle Column: Timeline & Events */}
            <div className="lg:col-span-1 space-y-6">
              {videoAnalysis && (
                <>
                  <InteractiveTimeline 
                    analysis={videoAnalysis}
                    selectedEvent={selectedEvent}
                    onEventSelect={handleEventSelect}
                  />
                  <EventCards 
                    analysis={videoAnalysis}
                    selectedEvent={selectedEvent}
                    onEventSelect={handleEventSelect}
                  />
                </>
              )}
            </div>

            {/* Right Column: Chat Interface */}
            <div className="lg:col-span-1">
              <ChatWindow 
                chatHistory={chatHistory}
                videoAnalysis={videoAnalysis}
                onMessage={handleChatMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
