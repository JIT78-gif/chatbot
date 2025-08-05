import { Play } from "lucide-react";
import { VideoAnalysis } from "@/types/video";

interface VideoPlayerProps {
  file: File;
  analysis: VideoAnalysis | null;
  selectedEvent: string | null;
  isProcessing: boolean;
}

export default function VideoPlayer({ file, analysis, selectedEvent, isProcessing }: VideoPlayerProps) {
  const videoUrl = file ? URL.createObjectURL(file) : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Player</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-contain"
              data-testid="video-player"
            />
          ) : (
            <div className="text-center text-white">
              <Play className="w-16 h-16 mb-2 opacity-80 mx-auto" />
              <p className="text-sm opacity-80">No video loaded</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600" data-testid="text-video-name">
            {file?.name || 'No file selected'}
          </span>
          <span className={`text-sm font-medium ${
            isProcessing 
              ? 'text-primary-600 animate-pulse' 
              : analysis 
                ? 'text-green-600' 
                : 'text-gray-500'
          }`} data-testid="status-processing">
            {isProcessing ? 'Processing...' : analysis ? 'Processing Complete' : 'Ready to process'}
          </span>
        </div>
      </div>
    </div>
  );
}
