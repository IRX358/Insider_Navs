import React from 'react';
import { 
  User, 
  GraduationCap, 
  MapPin, 
  Phone, 
  Navigation, 
  // CheckCircle, 
  // XCircle,
  // Building
} from 'lucide-react';

interface Faculty {
  id: number;
  name: string;
  department: string;
  courses_taken: string[];
  location_room: string;
  cabin_number: string;
  phone_number: string;
  // availability: boolean;
  location_id: number;
}

interface FacultyCardProps {
  faculty: Faculty;
  onRouteToFaculty: () => void;
}

export const FacultyCard: React.FC<FacultyCardProps> = ({ faculty, onRouteToFaculty }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl flex items-center justify-center neon-glow">
          <User size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-white mb-1">{faculty.name}</h3>
          <div className="flex items-center gap-2 text-gray-400">
            <GraduationCap size={16} />
            <span className="text-sm">{faculty.department}</span>
          </div>
        </div>
        {/* <div className="flex-shrink-0">
          {faculty.availability ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              <CheckCircle size={16} />
              Available
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
              <XCircle size={16} />
              Not Available
            </div>
          )}
        </div> */}
      </div>

      {/* Faculty Details */}
      <div className="space-y-4">
        {/* Courses */}
        <div>
          <div className="flex items-center gap-2 text-gray-300 mb-2">
            <GraduationCap size={16} />
            <span className="text-sm font-medium">Courses</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {faculty.courses_taken.map((course, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-200"
              >
                {course}
              </span>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center gap-2 text-gray-300 mb-2">
            <MapPin size={16} />
            <span className="text-sm font-medium">Location</span>
          </div>
          <div className="space-y-1 text-sm text-gray-400">
            <div>Room: <span className="text-white">{faculty.location_room}</span></div>
            <div>Cabin: <span className="text-white">{faculty.cabin_number}</span></div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <div className="flex items-center gap-2 text-gray-300 mb-2">
            <Phone size={16} />
            <span className="text-sm font-medium">Contact</span>
          </div>
          <a 
            href={`tel:${faculty.phone_number}`}
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
          >
            {faculty.phone_number}
          </a>
        </div>
      </div>

      {/* Route Button */}
      <div className="pt-4 border-t border-gray-700">
        {/* <button
          onClick={onRouteToFaculty}
          disabled={!faculty.availability}
          className="w-full py-4 px-6 rounded-2xl font-medium text-white
                   transition-all duration-300 flex items-center justify-center gap-3
                   disabled:opacity-50 disabled:cursor-not-allowed
                   ${faculty.availability 
                     ? 'neon-border bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400' 
                     : 'bg-gray-700 border border-gray-600'
                   }"
        >
          <Navigation size={20} />
          {faculty.availability ? 'Get Route to Faculty' : 'Faculty Not Available'}
        </button> */}
        <button
          onClick={onRouteToFaculty}
          className="w-full py-4 px-6 rounded-2xl font-medium text-white
             transition-all duration-300 flex items-center justify-center gap-3
             neon-border bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400"
          >
            <Navigation size={20} />
            Get Route to Faculty
          </button>
      </div>
    </div>
  );
};