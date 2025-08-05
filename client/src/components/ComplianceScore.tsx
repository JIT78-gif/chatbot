import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { VideoAnalysis } from "@/types/video";

interface ComplianceScoreProps {
  analysis: VideoAnalysis;
}

export default function ComplianceScore({ analysis }: ComplianceScoreProps) {
  const { compliance } = analysis;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (compliance.score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Overview</h3>
      
      {/* Overall Score */}
      <div className="text-center mb-6">
        <div className="relative w-24 h-24 mx-auto">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle 
              cx="48" 
              cy="48" 
              r="40" 
              stroke="#e5e7eb" 
              strokeWidth="8" 
              fill="none"
            />
            <circle 
              cx="48" 
              cy="48" 
              r="40" 
              stroke={getStrokeColor(compliance.score)}
              strokeWidth="8" 
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getScoreColor(compliance.score)}`} data-testid="text-compliance-score">
              {compliance.score}%
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">Compliance Score</p>
      </div>

      {/* Violation Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-800">Critical Violations</span>
          </div>
          <span className="text-sm font-bold text-red-800" data-testid="text-critical-violations">
            {compliance.violations.critical}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-800">Minor Violations</span>
          </div>
          <span className="text-sm font-bold text-orange-800" data-testid="text-minor-violations">
            {compliance.violations.minor}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-800">Compliant Events</span>
          </div>
          <span className="text-sm font-bold text-green-800" data-testid="text-compliant-events">
            {analysis.events.filter(e => e.severity === 'compliant').length}
          </span>
        </div>
      </div>
    </div>
  );
}
