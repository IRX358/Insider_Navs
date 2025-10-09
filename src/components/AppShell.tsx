import React, { useState, useEffect } from 'react';
import { SegmentedControl } from './SegmentedControl';
import { FindRoute } from './FindRoute';
import { FindFaculty } from './FindFaculty';
import { AdminPanel } from './AdminPanel';
import { Navigation, MapPin, Settings, Code , User, Mail, Github, Linkedin,X,Bug} from 'lucide-react';
import mainLogo from '../assets/mainLogo.jpg';
import campusMap from '../assets/cammap.jpg';

export const AppShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'route' | 'faculty' | 'admin'>('route');
  const [fromLocation, setFromLocation] = useState<string | null>(null);
  const [toLocation, setToLocation] = useState<string | null>(null);
  const [showCampusMap, setShowCampusMap] = useState(false);
  const [activeBg, setActiveBg] = useState('main-bg');

  useEffect(() => {
    // Check URL parameters for QR code deep linking
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    if (fromParam) {
      setFromLocation(fromParam);
    }
  }, []);

  return (
    // <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
    
      <div className={`flex flex-col min-h-[90rem] bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 ${activeTab === 'admin' ? 'admin-bg' : 'main-bg'}`}>
      {showCampusMap ? (
      // When showCampusMap is TRUE, we render the map
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="relative glass-panel p-4 rounded-xl shadow-lg max-w-full lg:max-w-4xl">
          <button onClick={() => setShowCampusMap(false)} className="absolute top-4 right-4 p-2 rounded-full glass-panel text-gray-400 hover:text-white transition-colors z-20">
            <X size={20} />
          </button>
          <img 
            src={campusMap} 
            alt="Campus Map" 
            className="w-full h-auto rounded-lg neon-border" 
          />
        </div>
      </div>
    ) : (
      // When showCampusMap is FALSE, we render the main content
      <div className="container mx-auto px-10 py-10 max-w-md flex-grow">
        {/* Header */}
        <div className="text-center mb-8">
          {/* <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg neon-border bg-black/50">
              <span className="text-lg font-bold text-purple-400">N</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Insider Navs</h1>
          </div> */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg neon-border bg-black/50 overflow-hidden">
              <img src={mainLogo} alt="Insider Navs Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl text-white"><span className='font-bold electrolize-regular'>Insider Navs</span> <p className="text-gray-400 text-sm">Indoor Navigation & Faculty Discovery</p></h1>
          
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 space-y-4">
          <SegmentedControl
            options={[
              { value: 'route', label: 'Find Route', icon: Navigation },
              { value: 'faculty', label: 'Find Faculty', icon: MapPin }
            ]}
            value={activeTab === 'admin' ? 'route' : activeTab}
            onChange={(value) => setActiveTab(value as 'route' | 'faculty')}
          />
          
          {/* Admin Access Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setActiveTab(activeTab === 'admin' ? 'route' : 'admin')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                transition-all duration-300
                ${activeTab === 'admin'
                  ? 'neon-border bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                  : 'glass-panel text-gray-400 hover:text-gray-300 border border-transparent hover:border-purple-500/30'
                }
              `}
            >
              <Settings size={16} />
              {activeTab === 'admin' ? 'Exit Admin' : 'Admin Panel'}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'route' && (
            <FindRoute 
              initialFrom={fromLocation} 
              initialTo={toLocation}
              onLocationChange={(from, to) => {
                setFromLocation(from);
                setToLocation(to);
              }}
            />
          )}
          {activeTab === 'faculty' && (
            <FindFaculty onRouteToFaculty={(locationId, locationName) => {
              setToLocation(locationId);
              setActiveTab('route');
            }} />
          )}
          {activeTab === 'admin' && (
            <AdminPanel />
          )}
        </div>
      </div>

    )}
      {/* footer Content */}
      <footer className="relative z-10 py-12 px-6 glass-panel rounded-t-2xl border-t border-purple-500/30">
  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
    {/* Column 1: App Info */}
    <div className="text-center md:text-left">
      <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg flex items-center justify-center">
          <Code className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-semibold text-white">Insider Navs</span>
      </div>
      <p className="text-sm text-gray-400">
        Your tech-partner to explore Presidency University 📖
      </p>
    </div>

    {/* Column 2: Quick Links */}
    <div className="space-y-4 text-center md:text-left">
      <h4 className="text-md font-semibold text-white">Quick Links</h4>
      <ul className="space-y-2">
        <li>
          <button onClick={() => setShowCampusMap(true)} className="flex items-center justify-center md:justify-start gap-2 text-gray-400 hover:text-purple-400 transition-colors">
            <Code size={16} />
            <span>Campus Map</span>
          </button>
        </li>
        <li>
          <a href="#" className="flex items-center justify-center md:justify-start gap-2 text-gray-400 hover:text-purple-400 transition-colors">
            <MapPin size={16} />
            <span>Find Faculty</span>
          </a>
        </li>
        <li>
          <a href="mailto:insider2navs@gmail.com" className="flex items-center justify-center md:justify-start gap-2 text-gray-400 hover:text-purple-400 transition-colors">
            <Bug size={16} />
            <span>Report Bugs</span>
          </a>
        </li>
      </ul>
    </div>

    {/* Column 3: Connect */}
    <div className="space-y-4 text-center md:text-left">
      <h4 className="text-md font-semibold text-white">Connect</h4>
      <ul className="space-y-2">
        <li>
          <a href="https://github.com/IRX358" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-2 text-gray-400 hover:text-purple-400 transition-colors">
            <Github size={16} />
            <span>GitHub</span>
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/irfan358" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-2 text-gray-400 hover:text-purple-400 transition-colors">
            <Linkedin size={16} />
            <span>LinkedIn</span>
          </a>
        </li>
        <li>
          <a href="mailto:insider2navs@gmail.com" className="flex items-center justify-center md:justify-start gap-2 text-gray-400 hover:text-purple-400 transition-colors">
            <Mail size={16} />
            <span>Email Us</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
  <div className="mt-8 pt-8 border-t border-slate-700 text-center text-sm text-gray-500">
    <p className="mb-2">
      &copy; 2025 Irfan IR || Built with CURIOSITY
    </p>
    <p>
      "Building reliable, creative, and future-ready web solutions"
    </p>
  </div>
</footer>
    </div>
  );
};