import { useState, useRef } from "react";
import { Send, Plus, Paperclip, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sendChatMessage, uploadVideo } from "@/lib/api";
import { VideoAnalysis, ChatMessage } from "@/types/video";

interface MessageInputProps {
  onMessage: (message: ChatMessage) => void;
  videoAnalysis: VideoAnalysis | null;
  onVideoUpload: (file: File) => void;
  onProcessingStart: () => void;
  onAnalysisComplete: (analysis: VideoAnalysis) => void;
  isProcessing: boolean;
}

export default function MessageInput({ 
  onMessage, 
  videoAnalysis, 
  onVideoUpload, 
  onProcessingStart, 
  onAnalysisComplete, 
  isProcessing 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!['video/mp4', 'video/webm'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP4 or WebM video file.",
        variant: "destructive"
      });
      return false;
    }

    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a video smaller than 100MB.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleVideoUpload = async (file: File) => {
    if (!validateFile(file)) return;

    onVideoUpload(file);
    onProcessingStart();

    try {
      const analysis = await uploadVideo(file);
      onAnalysisComplete(analysis);
      
      toast({
        title: "Video uploaded successfully",
        description: "Analysis complete. You can now ask questions about the video."
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleVideoUpload(files[0]);
      setShowAttachMenu(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

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
      if (videoAnalysis) {
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
      } else {
        // No video uploaded yet
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          message: 'Please upload a video first so I can analyze it and answer your questions.',
          timestamp: new Date().toISOString()
        };

        onMessage(assistantMessage);
      }
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
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3 p-3 bg-white border border-gray-300 rounded-2xl shadow-sm">
        {/* Attach Button */}
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            data-testid="button-attach"
          >
            <Plus className="w-4 h-4" />
          </Button>
          
          {showAttachMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-48">
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="w-full justify-start text-sm p-2 rounded-md hover:bg-gray-100"
                disabled={isProcessing}
                data-testid="button-upload-video"
              >
                <Video className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
              <p className="text-xs text-gray-500 mt-1 px-2">MP4, WebM • Max 2 minutes • Up to 100MB</p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="input-video-file"
          />
        </div>

        {/* Message Input */}
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Visual Understanding Assistant..."
            className="resize-none min-h-[20px] max-h-32 border-0 shadow-none focus:ring-0 p-0 text-base"
            rows={1}
            disabled={isLoading || isProcessing}
            data-testid="input-chat-message"
          />
        </div>

        {/* Send Button */}
        <Button 
          type="submit"
          disabled={!message.trim() || isLoading || isProcessing}
          className="p-2 rounded-full bg-black hover:bg-gray-800 text-white disabled:bg-gray-300 disabled:text-gray-500"
          data-testid="button-send-message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
      
      {/* Click outside to close attach menu */}
      {showAttachMenu && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setShowAttachMenu(false)}
        />
      )}
    </div>
  );
}
