import React from 'react';
import { Navigation, Clock, MapPin, ArrowRight, Stars as Stairs, Calculator as Elevator } from 'lucide-react';

interface RouteStep {
  order: number;
  text: string;
  type?: 'walk' | 'stairs' | 'elevator' | 'turn';
  floor?: number;
}

interface RouteResult {
  from: { id: number; name: string; floor: number };
  to: { id: number; name: string; floor: number };
  distance_m: number;
  estimated_time_min: number;
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

  const getFloorBadge = (floor: number) => (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-200 ml-2">
      Floor {floor}
    </span>
  );

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
                <span className="text-white font-medium">{route.from.name}</span>
                {getFloorBadge(route.from.floor)}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-red-400 flex-shrink-0" />
                <span className="text-gray-300">To:</span>
                <span className="text-white font-medium">{route.to.name}</span>
                {getFloorBadge(route.to.floor)}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <Navigation size={16} className="text-blue-400" />
                  <span className="text-gray-300">{route.distance_m}m</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-yellow-400" />
                  <span className="text-gray-300">{route.estimated_time_min} min</span>
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
              key={step.order}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                {step.order}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStepIcon(step)}
                  {step.floor && getFloorBadge(step.floor)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {step.text}
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