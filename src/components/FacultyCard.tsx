import React, { useState, useEffect } from 'react';
import { 
  User, 
  GraduationCap, 
  MapPin, 
  Contact, 
  Navigation, 
  CheckCircle, 
  XCircle,
  Briefcase,
  Award,
  Star
} from 'lucide-react';
import { isFavorite, toggleFavorite } from '../utils/favorites';

interface Faculty {
  id: number;
  name: string;
  department: string;
  designation: string;
  role: string;
  courses_taken: string[];
  cabin_number: string;
  phone_number: string;
  availability: boolean;
  location_id: string; // Standardized to string
  // Timetable fields
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  unavailable_message?: string;
}

// Helper to get today's timetable and free periods
const getTodayTimetable = (faculty: Faculty): string => {
  const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const dayMap: { [key: number]: string | undefined } = {
    1: faculty.mon,
    2: faculty.tue,
    3: faculty.wed,
    4: faculty.thu,
    5: faculty.fri,
  };
  return dayMap[dayIndex] || '00000000';
};

const getFreePeriods = (timetable: string): number[] => {
  const freePeriods: number[] = [];
  for (let i = 0; i < timetable.length; i++) {
    if (timetable[i] === '0') freePeriods.push(i + 1); // 1-indexed periods
  }
  return freePeriods;
};

const getNextFreePeriod = (timetable: string): number | null => {
  const now = new Date();
  const hour = now.getHours();
  
  // Period times (approximate): 9:50, 10:50, 11:40, 12:30, 1:30, 2:30, 3:20, 4:10
  const periodStartHours = [9, 10, 11, 12, 13, 14, 15, 16];
  
  // Find current period index (0-7)
  let currentPeriodIndex = -1;
  for (let i = 0; i < periodStartHours.length; i++) {
    if (hour >= periodStartHours[i] && (i === 7 || hour < periodStartHours[i + 1])) {
      currentPeriodIndex = i;
      break;
    }
  }
  
  // Find next free period after current
  for (let i = currentPeriodIndex + 1; i < timetable.length; i++) {
    if (timetable[i] === '0') return i + 1; // 1-indexed
  }
  return null;
};

interface FacultyCardProps {
  faculty: Faculty;
  onRouteToFaculty: () => void;
}

export const FacultyCard: React.FC<FacultyCardProps> = ({ faculty, onRouteToFaculty }) => {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isFavorite(faculty.id));
  }, [faculty.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = toggleFavorite(faculty.id);
    setIsFav(newStatus);
  };

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
          <div className="flex items-center gap-2 text-gray-400">
            <Briefcase size={16} />
            <span className="text-sm">{faculty.designation}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Award size={16} />
            <span className="text-sm">{faculty.role}</span>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          {faculty.availability ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              <CheckCircle size={16} />
              AvA
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
              <XCircle size={16} />
              NA
            </div>
          )}
          {/* Favorite Star Button */}
          <button
            onClick={handleToggleFavorite}
            className="p-1 rounded-lg transition-all duration-200 hover:bg-yellow-500/20"
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              size={20}
              className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500 hover:text-yellow-400'}
            />
          </button>
        </div>
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
            <div>Cabin: <span className="text-white">{faculty.cabin_number}</span></div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <div className="flex items-center gap-2 text-gray-300 mb-2">
            <Contact size={16} />
            <span className="text-sm font-medium">Contact / Email</span>
          </div>
          <a 
            href={`tel:${faculty.phone_number}`}
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
          >
            {faculty.phone_number}
          </a>
        </div>

        {/* Timetable - Free Periods Today */}
        {(() => {
          const todayTimetable = getTodayTimetable(faculty);
          const freePeriods = getFreePeriods(todayTimetable);
          const nextFree = getNextFreePeriod(todayTimetable);
          const isWeekend = [0, 6].includes(new Date().getDay());
          
          return (
            <>
              {!isWeekend && (
                <div>
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <span className="text-sm font-medium">Free Periods Today</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {freePeriods.length > 0 ? (
                      freePeriods.map((period) => (
                        <span
                          key={period}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold bg-green-500/30 text-green-300 border border-green-500/50"
                        >
                          {period}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No free periods today</span>
                    )}
                  </div>
                </div>
              )}

              {/* Info Box - Unavailable Message */}
              {!faculty.availability && (
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-yellow-300 text-sm">
                    {faculty.unavailable_message || 
                      (nextFree ? `In class, free at period ${nextFree}` : 'Unavailable for the day')}
                  </p>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Route Button */}
      <div className="pt-4 border-t border-gray-700">
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