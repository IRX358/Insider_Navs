import React, { useState, useEffect } from 'react';
import { SearchableDropdown } from './SearchableDropdown';
import { RouteSteps } from './RouteSteps';
import { Navigation, MapPin, AlertCircle } from 'lucide-react';
// Importing the new specific routes AND the generic route generator
import { 
  deansOfficeRoute, 
  prayerHallRoute, 
  internationalOfficeRoute,
  getGenericRoute 
} from '../data/mockData'; 

interface Location {
  id: string;
  label: string;
  subtitle: string;
  type: 'location' | 'faculty'; 
}

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
  const [routeResult, setRouteResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null); 

  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/locations')
      .then(res => res.json())
      .then((data: Location[]) => {
        const formattedLocations = data.map(loc => ({ ...loc, type: 'location' as const }));
        setLocations(formattedLocations);
        setIsLoadingLocations(false);
      })
      .catch(err => {
        console.error("Failed to fetch locations:", err);
        setIsLoadingLocations(false);
      });
  }, []);

  const handleGetRoute = async () => {
    if (!fromLocation || !toLocation) return;
    
    setRouteResult(null);
    setRouteError(null);

    if (fromLocation === toLocation) {
      setRouteError('Please select different locations for "From" and "To"');
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      let foundRoute = null;

      if (fromLocation === '101') { 
        if (toLocation === '100') { 
          foundRoute = deansOfficeRoute;
        } else if (toLocation === '504') { 
          foundRoute = prayerHallRoute;
        } else if (toLocation === '004') { 
          foundRoute = internationalOfficeRoute;
        }
      }
      
      // --- ADD GENERIC FALLBACK ---
      if (!foundRoute) {
        const fromObj = locations.find(loc => loc.id === fromLocation);
        const toObj = locations.find(loc => loc.id === toLocation);
        
        if (fromObj && toObj) {
          foundRoute = getGenericRoute(
            { id: fromObj.id, label: fromObj.label },
            { id: toObj.id, label: toObj.label }
          );
        }
      }
      // --- END GENERIC FALLBACK ---

      if (foundRoute) {
        setRouteResult(foundRoute);
      } else {
        setRouteError("Sorry, could not generate a route for this selection.");
      }
      
      setIsLoading(false);
    }, 1000);
  };
  
  const handleSwapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
    setRouteResult(null); 
    setRouteError(null);
  };
  
  const handleFromChange = (value: string) => {
    setFromLocation(value);
    setRouteResult(null);
    setRouteError(null);
  }
  
  const handleToChange = (value: string) => {
    setToLocation(value);
    setRouteResult(null);
    setRouteError(null);
  }

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
        options={locations} 
        value={fromLocation}
        onChange={handleFromChange} 
        placeholder={isLoadingLocations ? "Loading locations..." : "Select starting location..."}
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
        options={locations} 
        value={toLocation}
        onChange={handleToChange}
        placeholder={isLoadingLocations ? "Loading locations..." : "Select destination..."}
      />

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

      {/* Show Error if one exists */}
      {routeError && (
        <div className="flex items-center gap-2 p-3 bg-red-500/20 text-red-400 rounded-xl text-sm">
          <AlertCircle size={16} />
          {routeError}
        </div>
      )}

      {/* Show result if one exists */}
      {routeResult && (
        <RouteSteps route={routeResult} />
      )}
    </div>
  );
};