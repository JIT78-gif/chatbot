import { RefreshCw, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationHeaderProps {
  onReset: () => void;
}

export default function NavigationHeader({ onReset }: NavigationHeaderProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Video className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Visual Understanding Assistant</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System Online</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              data-testid="button-reset"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
