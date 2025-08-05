import { VideoAnalysis } from "@/types/video";

const WEBHOOK_BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://your-n8n-webhook-url.com';

export async function uploadVideo(file: File): Promise<VideoAnalysis> {
  const formData = new FormData();
  formData.append('video', file);

  const response = await fetch(`${WEBHOOK_BASE_URL}/process-video`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  // For demo purposes, return mock analysis data
  // In production, this would come from the webhook response
  return {
    id: Date.now().toString(),
    video: {
      filename: file.name,
      duration: 105, // 1:45 in seconds
      size: file.size,
      format: file.type
    },
    events: [
      {
        id: '1',
        type: 'traffic_violation',
        title: 'Red Light Violation',
        description: 'Vehicle ignored red traffic signal',
        timestamp: 45,
        severity: 'critical',
        metadata: {
          details: 'White sedan with license plate ABC-1234 proceeded through intersection during red light phase.'
        }
      },
      {
        id: '2',
        type: 'pedestrian_violation',
        title: 'Pedestrian Jaywalking',
        description: 'Pedestrian crossed against walk signal',
        timestamp: 83,
        severity: 'minor',
        metadata: {
          details: 'Individual crossed street against pedestrian signal. No immediate danger detected.'
        }
      },
      {
        id: '3',
        type: 'normal_traffic',
        title: 'Normal Traffic Flow',
        description: 'Vehicles following traffic rules',
        timestamp: 95,
        severity: 'compliant',
        metadata: {
          details: 'Multiple vehicles observed following traffic signals correctly.'
        }
      }
    ],
    compliance: {
      score: 70,
      violations: {
        critical: 2,
        minor: 1
      }
    },
    summary: 'The video shows a busy intersection with 2 critical violations and 1 minor violation detected during analysis.',
    processedAt: new Date().toISOString()
  };
}

export async function sendChatMessage(message: string, videoAnalysis: VideoAnalysis): Promise<{ reply: string }> {
  const response = await fetch(`${WEBHOOK_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      videoAnalysis,
      context: {
        videoId: videoAnalysis.id,
        events: videoAnalysis.events,
        compliance: videoAnalysis.compliance
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.statusText}`);
  }

  // For demo purposes, return contextual responses
  // In production, this would come from the webhook response
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('red light') || lowerMessage.includes('00:45') || lowerMessage.includes('0:45')) {
    return {
      reply: 'At timestamp 0:45, a white sedan with license plate ABC-1234 proceeded through the intersection despite the traffic light being red for approximately 2.3 seconds. This poses significant safety risks to cross-traffic and pedestrians and is classified as a critical violation.'
    };
  }
  
  if (lowerMessage.includes('jaywalking') || lowerMessage.includes('pedestrian') || lowerMessage.includes('01:23') || lowerMessage.includes('1:23')) {
    return {
      reply: 'At timestamp 1:23, a pedestrian crossed the street against the walk signal. While this is a traffic violation, it was classified as minor since no immediate danger to the individual or traffic was detected.'
    };
  }
  
  if (lowerMessage.includes('compliance') || lowerMessage.includes('score')) {
    return {
      reply: `Your video received a compliance score of ${videoAnalysis.compliance.score}% based on the analysis of detected events. This score factors in ${videoAnalysis.compliance.violations.critical} critical violations, ${videoAnalysis.compliance.violations.minor} minor violations, and ${videoAnalysis.events.filter(e => e.severity === 'compliant').length} compliant events.`
    };
  }
  
  return {
    reply: 'I can help you understand the events detected in your video. Feel free to ask about specific violations, timestamps, or the overall compliance analysis.'
  };
}
