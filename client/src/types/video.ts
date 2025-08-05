export interface VideoFile {
  filename: string;
  duration: number;
  size: number;
  format: string;
}

export interface VideoEvent {
  id: string;
  type: 'traffic_violation' | 'pedestrian_violation' | 'normal_traffic' | string;
  title: string;
  description: string;
  timestamp: number; // in seconds
  severity: 'critical' | 'minor' | 'compliant';
  metadata?: {
    details?: string;
    confidence?: number;
    [key: string]: any;
  };
}

export interface ComplianceData {
  score: number; // 0-100
  violations: {
    critical: number;
    minor: number;
  };
}

export interface VideoAnalysis {
  id: string;
  video: VideoFile;
  events: VideoEvent[];
  compliance: ComplianceData;
  summary: string;
  processedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
  metadata?: {
    type?: 'summary' | 'event_details' | 'compliance';
    analysisId?: string;
    eventId?: string;
    [key: string]: any;
  };
}
