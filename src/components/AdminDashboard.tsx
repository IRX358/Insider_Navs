import React, { useState } from 'react';
import { LocationManager } from './LocationManager';
import { FacultyManager } from './FacultyManager';
import { Dashboard } from './Dashboard';
import { FlashNewsManager } from './FlashNewsManager'; // Import the new component
import { LogOut, MapPin, Users, BarChart3, Bell, Database, RefreshCw } from 'lucide-react'; // Import Bell icon

interface AdminDashboardProps {
  currentUser: string;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentUser, 
  onLogout 
}) => {
  const [activeSection, setActiveSection] = useState<'locations' | 'faculty' | 'analytics' | 'news'>('locations');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleRegenerateSnapshot = async () => {
    setIsRegenerating(true);
    setStatusMessage(null);
    try {
      const response = await fetch('http://localhost:8000/api/admin/regenerate-snapshot', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setStatusMessage({ text: `Success: Snapshot ${data.version} created!`, type: 'success' });
      } else {
        setStatusMessage({ text: `Error: ${data.message}`, type: 'error' });
      }
    } catch (error) {
      console.error('Snapshot regeneration failed:', error);
      setStatusMessage({ text: 'Error: Failed to connect to server', type: 'error' });
    } finally {
      setIsRegenerating(false);
      // Clear message after 5 seconds
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
            <p className="text-gray-400 text-sm">Welcome back, {currentUser}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Snapshot Management Button */}
            <button
              onClick={handleRegenerateSnapshot}
              disabled={isRegenerating}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                transition-all duration-300 border
                ${isRegenerating 
                  ? 'glass-panel text-purple-400 border-purple-500/30' 
                  : 'glass-panel text-gray-400 hover:text-purple-400 border-transparent hover:border-purple-500/30'
                }
              `}
              title="Regenerate Faculty Parquet Snapshot"
            >
              {isRegenerating ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Database size={16} />
              )}
              {isRegenerating ? 'Regenerating...' : 'Regenerate Snapshot'}
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       glass-panel text-gray-400 hover:text-gray-300 border border-transparent 
                       hover:border-red-500/30 transition-all duration-300"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
        
        {/* Status Message */}
        {statusMessage && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-medium border animate-in fade-in slide-in-from-top-2 duration-300 ${
            statusMessage.type === 'success' 
              ? 'bg-green-500/10 text-green-400 border-green-500/30' 
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {statusMessage.text}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="glass-panel rounded-2xl p-1">
        <div className="grid grid-cols-4 gap-1"> {/* Update grid to 4 columns */}
          {[
            { id: 'locations', label: 'Locations', icon: MapPin },
            { id: 'faculty', label: 'Faculty', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'news', label: 'News', icon: Bell }, // Add News tab
          ].map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`
                  flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                  font-medium text-sm transition-all duration-300
                  ${isActive 
                    ? 'neon-border bg-gradient-to-r from-purple-600 to-purple-500 text-white' 
                    : 'text-gray-400 hover:text-gray-300'
                  }
                `}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeSection === 'locations' && <LocationManager />}
        {activeSection === 'faculty' && <FacultyManager />}
        {activeSection === 'analytics' && <Dashboard />}
        {activeSection === 'news' && <FlashNewsManager />} {/* Render the news manager */}
      </div>
    </div>
  );
};