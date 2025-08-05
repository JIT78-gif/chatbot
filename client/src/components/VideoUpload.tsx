import { useState, useCallback } from "react";
import { CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { uploadVideo } from "@/lib/api";
import { VideoAnalysis } from "@/types/video";

interface VideoUploadProps {
  onUpload: (file: File) => void;
  onProcessingStart: () => void;
  onAnalysisComplete: (analysis: VideoAnalysis) => void;
}

export default function VideoUpload({ onUpload, onProcessingStart, onAnalysisComplete }: VideoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(0);
    onUpload(file);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      onProcessingStart();
      const analysis = await uploadVideo(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: "Video uploaded successfully",
        description: "Analysis will begin shortly"
      });

      setTimeout(() => {
        onAnalysisComplete(analysis);
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Upload</h2>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        data-testid="video-upload-area"
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
            <CloudUpload className="text-primary-500 w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">Drop your video here</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
            <p className="text-xs text-gray-400 mt-2">MP4, WebM • Max 2 minutes • Up to 100MB</p>
          </div>
          <div>
            <input
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleFileSelect}
              className="hidden"
              id="video-upload"
              data-testid="input-video-file"
            />
            <Button 
              asChild
              className="bg-primary-600 text-white hover:bg-primary-700"
              disabled={isUploading}
            >
              <label htmlFor="video-upload" className="cursor-pointer" data-testid="button-choose-file">
                Choose File
              </label>
            </Button>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Uploading video...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" data-testid="progress-upload" />
        </div>
      )}
    </div>
  );
}
