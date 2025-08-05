import { useState, useRef } from "react";
import { Send, Link, Paperclip, Video, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sendChatMessage, uploadVideo } from "@/lib/api";
import { VideoAnalysis, ChatMessage, FileAttachment } from "@/types/video";
import FileCard from "./FileCard";

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
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'video/mp4', 'video/webm', 'video/quicktime',
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/csv',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a supported file type (video, image, PDF, or document).",
        variant: "destructive"
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 100MB.",
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
      // Add loading toast
      toast({
        title: "Processing video...",
        description: "Analyzing your video for traffic violations and compliance."
      });

      const analysis = await uploadVideo(file);
      onAnalysisComplete(analysis);
      
      toast({
        title: "Video uploaded successfully",
        description: "Analysis complete. You can now ask questions about the video."
      });
    } catch (error) {
      console.error('Video upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your video. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createFileAttachment = (file: File): FileAttachment => {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      if (file.type.startsWith('video/')) {
        // Handle video upload for analysis
        handleVideoUpload(file);
      } else {
        // Add as attachment
        const attachment = createFileAttachment(file);
        setAttachments(prev => [...prev, attachment]);
      }
    }
    setShowAttachMenu(false);
    if (e.target) e.target.value = '';
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      const attachment = createFileAttachment(file);
      setAttachments(prev => [...prev, attachment]);
    }
    setShowAttachMenu(false);
    if (e.target) e.target.value = '';
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      const attachment = createFileAttachment(file);
      setAttachments(prev => [...prev, attachment]);
    }
    setShowAttachMenu(false);
    if (e.target) e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    // Add user message immediately
    onMessage(userMessage);
    setMessage('');
    setAttachments([]); // Clear attachments after sending
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
      {/* File Attachments Display */}
      {attachments.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <FileCard
                key={attachment.id}
                file={attachment}
                onRemove={() => removeAttachment(attachment.id)}
                showRemove={true}
              />
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-sm">
        {/* Attach Button */}
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            data-testid="button-attach"
          >
            <Link className="w-4 h-4" />
          </Button>
          
          {showAttachMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-2 min-w-48 z-20">
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="w-full justify-start text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                disabled={isProcessing}
                data-testid="button-upload-video"
              >
                <Video className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => imageInputRef.current?.click()}
                className="w-full justify-start text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                data-testid="button-upload-image"
              >
                <Image className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => documentInputRef.current?.click()}
                className="w-full justify-start text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                data-testid="button-upload-document"
              >
                <File className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">Videos, Images, PDFs, Documents • Up to 100MB</p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="input-video-file"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageSelect}
            className="hidden"
            data-testid="input-image-file"
          />
          <input
            ref={documentInputRef}
            type="file"
            accept="application/pdf,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleDocumentSelect}
            className="hidden"
            data-testid="input-document-file"
          />
        </div>

        {/* Message Input */}
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Chat Assistant..."
            className="resize-none min-h-[24px] max-h-32 border-0 shadow-none focus:ring-0 p-0 text-base bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            rows={1}
            disabled={isLoading || isProcessing}
            data-testid="input-chat-message"
          />
        </div>

        {/* Send Button */}
        <Button 
          type="submit"
          disabled={!message.trim() || isLoading || isProcessing}
          className="p-2 rounded-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
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
