import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoAnalysis, VideoEvent } from "@/types/video";

interface EventCardsProps {
  analysis: VideoAnalysis;
  selectedEvent: string | null;
  onEventSelect: (eventId: string) => void;
}

export default function EventCards({ analysis, selectedEvent, onEventSelect }: EventCardsProps) {
  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          badgeColor: 'bg-red-100 text-red-800',
          buttonColor: 'text-red-600 hover:text-red-700'
        };
      case 'minor':
        return {
          bgColor: 'bg-orange-50 border-orange-200',
          textColor: 'text-orange-800',
          badgeColor: 'bg-orange-100 text-orange-800',
          buttonColor: 'text-orange-600 hover:text-orange-700'
        };
      case 'compliant':
        return {
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          badgeColor: 'bg-green-100 text-green-800',
          buttonColor: 'text-green-600 hover:text-green-700'
        };
      default:
        return {
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          badgeColor: 'bg-gray-100 text-gray-800',
          buttonColor: 'text-gray-600 hover:text-gray-700'
        };
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'traffic_violation':
        return '🚗';
      case 'pedestrian_violation':
        return '🚶';
      default:
        return '✅';
    }
  };

  // Show selected event first, then others
  const sortedEvents = [...analysis.events].sort((a, b) => {
    if (a.id === selectedEvent) return -1;
    if (b.id === selectedEvent) return 1;
    return 0;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {sortedEvents.map((event) => {
          const config = getSeverityConfig(event.severity);
          
          return (
            <div 
              key={event.id}
              className={`border rounded-lg p-4 transition-all cursor-pointer ${config.bgColor} ${
                selectedEvent === event.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              }`}
              onClick={() => onEventSelect(event.id)}
              data-testid={`card-event-${event.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="text-lg">
                    {getEventIcon(event.type)}
                  </div>
                  <div>
                    <h4 className={`font-medium ${config.textColor}`}>{event.title}</h4>
                    <p className={`text-sm ${config.textColor} opacity-80`}>
                      Timestamp: {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.badgeColor}`}>
                  {event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
                </span>
              </div>
              
              <p className={`text-sm ${config.textColor} mt-2 opacity-90`}>
                {event.description}
              </p>
              
              {event.metadata && (
                <div className={`text-xs ${config.textColor} opacity-75 mt-1`}>
                  {event.metadata.details}
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className={`mt-3 text-sm font-medium flex items-center space-x-1 ${config.buttonColor} h-auto p-0`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventSelect(event.id);
                }}
                data-testid={`button-view-timeline-${event.id}`}
              >
                <span>View in Timeline</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
