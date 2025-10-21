import React from 'react';
import './HodAvailability.css';

// 1. Define the Faculty type again (or import from FindFaculty)
interface Faculty {
  id: number;
  name: string;
  role: string;
  availability: boolean;
}

// 2. Define props for the component
interface HodAvailabilityProps {
  allFaculty: Faculty[];
}

export const HodAvailability: React.FC<HodAvailabilityProps> = ({ allFaculty }) => {
  // 3. Filter the received prop
  const hods = allFaculty.filter(faculty => faculty.role === 'HOD');

  if (hods.length === 0) {
    return (
       <div className="hod-list-container glass-panel">
         <p className="text-gray-400 text-sm text-center p-4">No HODs found.</p>
       </div>
    );
  }

  return (
    <div className="hod-list-container glass-panel">
      <h4 className="hod-list-title">HOD Availability Status</h4>
      <ul className="hod-list">
        {hods.map(hod => (
          <li key={hod.id} className="hod-list-item">
            <span>{hod.name}</span>
            <span
              className={`availability-indicator ${hod.availability ? 'available' : 'unavailable'}`}
              title={hod.availability ? 'Available' : 'Not Available'}
            ></span>
          </li>
        ))}
      </ul>
    </div>
  );
};