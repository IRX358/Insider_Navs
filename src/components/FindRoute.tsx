import React, { useState, useEffect } from 'react';
import { SearchableDropdown } from './SearchableDropdown';
import { RouteSteps } from './RouteSteps';
import { Navigation, MapPin } from 'lucide-react'; //import an icon callled 'Settings' for the route preference segment icon 
import { mockLocations, mockRoute } from '../data/mockData';

interface FindRouteProps {
  initialFrom?: string | null;
  initialTo?: string | null;
  onLocationChange?: (from: string, to: string) => void;
}

export const FindRoute: React.FC<FindRouteProps> = ({ 
  initialFrom, 
  initialTo, 
  onLocationChange 
}) => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  // const [preferences, setPreferences] = useState<string>('normal');
  const [routeResult, setRouteResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialFrom) {
      setFromLocation(initialFrom);
    }
    if (initialTo) {
      setToLocation(initialTo);
    }
  }, [initialFrom, initialTo]);

  useEffect(() => {
    if (onLocationChange) {
      onLocationChange(fromLocation, toLocation);
    }
  }, [fromLocation, toLocation, onLocationChange]);

  const handleGetRoute = async () => {
    if (!fromLocation || !toLocation) return;
    
    if (fromLocation === toLocation) {
      alert('Please select different locations for "From" and "To"');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setRouteResult(mockRoute);
      setIsLoading(false);
    }, 1000);
  };

  // const handlePreferenceChange = (value: string) => {
  //   setPreferences(value);
  //   // Clear route result when preferences change to show updated route
  //   if (routeResult) {
  //     setRouteResult(null);
  //   }
  // };

  const handleSwapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
    setRouteResult(null); // Clear existing route
  };

  return (
    <div 
      className="space-y-6"
      role="tabpanel"
      id="route-panel"
      aria-labelledby="route-tab"
    >
      {/* From Location */}
      <SearchableDropdown
        label="From"
        options={mockLocations}
        value={fromLocation}
        onChange={(value) => setFromLocation(value)}
        placeholder="Select starting location..."
      />

      {/* Swap Button */}
      {(fromLocation || toLocation) && (
        <div className="flex justify-center">
          <button
            onClick={handleSwapLocations}
            className="p-2 rounded-xl glass-panel text-gray-400 hover:text-purple-400 
                     hover:border-purple-500/30 border border-transparent transition-all duration-300"
            title="Swap locations"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>
      )}

      {/* To Location */}
      <SearchableDropdown
        label="To"
        options={mockLocations}
        value={toLocation}
        onChange={(value) => setToLocation(value)}
        placeholder="Select destination..."
      />

      {/* Preferences */}
      {/* <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          <Settings size={16} className="inline mr-2" />
          Route Preferences
        </label>
        <div className="space-y-2">
          {[
            { value: 'normal', label: 'Normal Route' },
            { value: 'avoid_stairs', label: 'Avoid Stairs' },
            { value: 'prefer_elevator', label: 'Prefer Elevator' },
            { value: 'prefer_stairs', label: 'Prefer Stairs' },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center glass-panel rounded-lg p-3 cursor-pointer hover:border-purple-500/30 border border-transparent transition-colors"
            >
              <input
                type="radio"
                name="preferences"
                value={option.value}
                checked={preferences === option.value}
                onChange={(e) => handlePreferenceChange(e.target.value)}
                className="mr-3 accent-purple-500"
              />
              <span className="text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div> */}

      {/* Get Route Button */}
      <button
        onClick={handleGetRoute}
        disabled={!fromLocation || !toLocation || isLoading}
        className={`
          w-full py-4 px-6 rounded-2xl font-medium text-white
          transition-all duration-300 flex items-center justify-center gap-3
          ${(!fromLocation || !toLocation || isLoading)
            ? 'bg-gray-700 cursor-not-allowed opacity-50'
            : 'neon-border bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400'
          }
        `}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Navigation size={20} />
        )}
        {isLoading ? 'Finding Route...' : 'Get Route'}
      </button>

      {/* Route Results */}
      {routeResult && (
        <RouteSteps route={routeResult} />
      )}
    </div>
  );
};