import React, { useState } from 'react';
import { SearchableDropdown } from './SearchableDropdown';
import { FacultyCard } from './FacultyCard';
import { mockFaculty } from '../data/mockData';

interface FindFacultyProps {
  onRouteToFaculty: (locationId: string, locationName: string) => void;
}

export const FindFaculty: React.FC<FindFacultyProps> = ({ onRouteToFaculty }) => {
  const [selectedFaculty, setSelectedFaculty] = useState('');

  const facultyOptions = mockFaculty.map(faculty => ({
    id: faculty.id.toString(),
    label: faculty.name,
    subtitle: `${faculty.department} • ${faculty.location_room}`,
    type: 'faculty' as const,
  }));

  const selectedFacultyData = mockFaculty.find(
    faculty => faculty.id.toString() === selectedFaculty
  );

  return (
    <div 
      className="space-y-6"
      role="tabpanel"
      id="faculty-panel"
      aria-labelledby="faculty-tab"
    >
      <SearchableDropdown
        label="Search Faculty"
        options={facultyOptions}
        value={selectedFaculty}
        onChange={(value) => setSelectedFaculty(value)}
        placeholder="Type faculty name or department..."
      />

      {selectedFacultyData && (
        <FacultyCard
          faculty={selectedFacultyData}
          onRouteToFaculty={() => onRouteToFaculty(
            selectedFacultyData.location_id.toString(),
            selectedFacultyData.cabin_number
          )}
        />
      )}
    </div>
  );
};