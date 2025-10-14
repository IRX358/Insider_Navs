import React from 'react';
import { mockFaculty } from '../data/mockData';
import './HodAvailability.css';

export const HodAvailability: React.FC = () => {
  const hods = mockFaculty.filter(faculty => faculty.role === 'HOD');

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
