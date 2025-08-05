import { useState } from "react";
import { Filter, AlertTriangle, CheckCircle, XCircle, Car, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoAnalysis, VideoEvent } from "@/types/video";

interface InteractiveTimelineProps {
  analysis: VideoAnalysis;
  selectedEvent: string | null;
  onEventSelect: (eventId: string) => void;
}

export default function InteractiveTimeline({ analysis, selectedEvent, onEventSelect }: InteractiveTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'minor' | 'compliant'>('all');

  const getEventIcon = (event: VideoEvent) => {
    switch (event.type) {
      case 'traffic_violation':
        return <Car className="w-3 h-3 text-white" />;
      case 'pedestrian_violation':
        return <User className="w-3 h-3 text-white" />;
      default:
        return <CheckCircle className="w-3 h-3 text-white" />;
    }
  };

  const getEventColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'minor':
        return 'bg-orange-500';
      case 'compliant':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'minor':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredEvents = analysis.events.filter(event => {
    if (filter === 'all') return true;
    return event.severity === filter;
  });

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const timelineWidth = 100;
  const getEventPosition = (timestamp: number) => {
    return (timestamp / analysis.video.duration) * timelineWidth;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Event Timeline</h3>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
            data-testid="select-event-filter"
          >
            <option value="all">All Events</option>
            <option value="critical">Critical</option>
            <option value="minor">Minor</option>
            <option value="compliant">Compliant</option>
          </select>
          <Filter className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="relative mb-6">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {/* Timeline Events */}
        <div className="space-y-6">
          {filteredEvents.map((event) => (
            <div 
              key={event.id}
              className={`relative flex items-start space-x-4 cursor-pointer transition-all ${
                selectedEvent === event.id ? 'bg-blue-50 -mx-2 px-2 py-2 rounded-lg' : ''
              }`}
              onClick={() => onEventSelect(event.id)}
              data-testid={`event-timeline-${event.id}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 ${getEventColor(event.severity)} rounded-full flex items-center justify-center relative z-10`}>
                {getEventIcon(event)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900">{event.title}</div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                  <span>{formatTimestamp(event.timestamp)}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    {getSeverityIcon(event.severity)}
                    <span className="capitalize">{event.severity}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{event.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="bg-gray-100 rounded-full p-1">
        <div className="relative h-2 gradient-violation rounded-full">
          {analysis.events.map((event) => (
            <div
              key={event.id}
              className={`absolute top-0 w-4 h-4 bg-white border-2 ${
                selectedEvent === event.id ? 'border-blue-500' : 'border-gray-400'
              } rounded-full transform -translate-y-1 cursor-pointer shadow-sm transition-all`}
              style={{ left: `${getEventPosition(event.timestamp)}%` }}
              onClick={() => onEventSelect(event.id)}
              data-testid={`scrubber-event-${event.id}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0:00</span>
          <span>{formatTimestamp(analysis.video.duration / 2)}</span>
          <span>{formatTimestamp(analysis.video.duration)}</span>
        </div>
      </div>
    </div>
  );
}
