import { useState, useEffect } from "react";
import { X, File, Video, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileAttachment } from "@/types/video";

interface FileCardProps {
  file: FileAttachment;
  onRemove?: () => void;
  showRemove?: boolean;
}

export default function FileCard({ file, onRemove, showRemove = false }: FileCardProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    // Generate thumbnail for images and videos
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file.file);
      setThumbnail(url);
      return () => URL.revokeObjectURL(url);
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        video.currentTime = 1; // Seek to 1 second
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        setThumbnail(canvas.toDataURL());
      };
      video.src = URL.createObjectURL(file.file);
      return () => URL.revokeObjectURL(video.src);
    }
  }, [file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('image/')) return Image;
    if (file.type.includes('text') || file.type.includes('document')) return FileText;
    return File;
  };

  const FileIcon = getFileIcon();

  const getFileTypeDisplay = () => {
    if (file.type.startsWith('video/')) return 'Video';
    if (file.type.startsWith('image/')) return 'Image';
    if (file.type.includes('pdf')) return 'PDF';
    if (file.type.includes('text')) return 'Text';
    return 'File';
  };

  const getFileDetails = () => {
    if (file.type.startsWith('video/')) {
      return 'MP4, WebM • Max 2 minutes • Up to 100MB';
    }
    return `${getFileTypeDisplay()} • ${formatFileSize(file.size)}`;
  };

  return (
    <div className="relative group bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-w-sm">
      {showRemove && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-gray-600 hover:bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          data-testid="button-remove-file"
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      <div className="flex items-center space-x-3">
        {/* Thumbnail or Icon */}
        <div className="flex-shrink-0">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={file.name}
              className="w-12 h-12 object-cover rounded-lg"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <FileIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {getFileTypeDisplay()}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getFileDetails()}
          </p>
        </div>
      </div>
    </div>
  );
}