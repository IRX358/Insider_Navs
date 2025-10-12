import React, { useState } from 'react';
import { LocationManager } from './LocationManager';
import { FacultyManager } from './FacultyManager';
import { Dashboard } from './Dashboard';
import { LogOut, MapPin, Users, BarChart3 } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: string;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentUser, 
  onLogout 
}) => {
  const [activeSection, setActiveSection] = useState<'locations' | 'faculty' | 'analytics'>('locations');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
            <p className="text-gray-400 text-sm">Welcome back, {currentUser}</p>
          </div>
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

      {/* Navigation */}
      <div className="glass-panel rounded-2xl p-1">
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'locations', label: 'Locations', icon: MapPin },
            { id: 'faculty', label: 'Faculty', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
        {activeSection === 'analytics' && (
          <Dashboard />
        )}
      </div>
    </div>
  );
};