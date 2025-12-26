import React from 'react';
import { Navigation, Clock, MapPin, ArrowRight, Stars as Stairs, Calculator as Elevator } from 'lucide-react';

interface RouteStep {
  instruction: string;
  distance: number;
  to_label: string;
  type?: 'walk' | 'stairs' | 'elevator' | 'turn';
}

interface RouteResult {
  from: string;
  to: string;
  totalDistance: number;
  steps: RouteStep[];
}

interface RouteStepsProps {
  route: RouteResult;
}

export const RouteSteps: React.FC<RouteStepsProps> = ({ route }) => {
  const getStepIcon = (step: RouteStep) => {
    switch (step.type) {
      case 'stairs':
        return <Stairs size={16} className="text-yellow-400" />;
      case 'elevator':
        return <Elevator size={16} className="text-blue-400" />;
      case 'turn':
        return <ArrowRight size={16} className="text-purple-400" />;
      default:
        return <Navigation size={16} className="text-green-400" />;
    }
  };

  // Estimate time: roughly 1 minute per 80 meters
  const estimatedTime = Math.max(1, Math.round(route.totalDistance / 80));

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      {/* Route Summary */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl flex items-center justify-center neon-glow">
            <Navigation size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2">Route Found</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-green-400 flex-shrink-0" />
                <span className="text-gray-300">From:</span>
                <span className="text-white font-medium">{route.from}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-red-400 flex-shrink-0" />
                <span className="text-gray-300">To:</span>
                <span className="text-white font-medium">{route.to}</span>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <Navigation size={16} className="text-blue-400" />
                  <span className="text-gray-300">{route.totalDistance}m</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-yellow-400" />
                  <span className="text-gray-300">{estimatedTime} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div>
        <h4 className="text-md font-semibold text-white mb-4">Turn-by-Turn Directions</h4>
        <div className="space-y-3">
          {route.steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStepIcon(step)}
                  <span className="text-xs text-gray-500">{step.distance}m</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {step.instruction}
                </p>
                <p className="text-xs text-purple-400 mt-1">
                  Towards: {step.to_label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Issue */}
      <div className="pt-4 border-t border-gray-700">
       <a href="mailto:insider2navs@gmail.com"><button className="w-full py-3 px-4 rounded-xl text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-800/30 transition-colors">
          Report incorrect route
        </button></a>
      </div>
    </div>
  );
};