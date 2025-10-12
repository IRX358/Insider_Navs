import React, { useState } from 'react';
import { SearchableDropdown } from './SearchableDropdown';
import { FacultyCard } from './FacultyCard';
import { mockFaculty } from '../data/mockData';

interface FindFacultyProps {
  onRouteToFaculty: (locationId: string, locationName: string) => void;
}

export const FindFaculty: React.FC<FindFacultyProps> = ({ onRouteToFaculty }) => {
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');

  const facultyOptions = mockFaculty.map(faculty => ({
    id: faculty.id.toString(),
    label: faculty.name,
    subtitle: `${faculty.department} • ${faculty.designation}`,
    type: 'faculty' as const,
  }));

  const roleOptions = [
      { id: '', label: 'All Roles', subtitle: '', type: 'faculty' as const},
      { id: 'CC', label: 'CC', subtitle: '', type: 'faculty' as const},
      { id: 'HOD', label: 'HOD', subtitle: '', type: 'faculty' as const},
      { id: 'Academic Coordinator', label: 'Academic Coordinator', subtitle: '', type: 'faculty' as const},
      { id: 'Reviewer', label: 'Reviewer', subtitle: '', type: 'faculty' as const},
      { id: 'NA', label: 'NA', subtitle: '', type: 'faculty' as const},
  ]

  const designationOptions = [
    { id: '', label: 'All Designations', subtitle: '', type: 'faculty' as const},
    { id: 'Professor', label: 'Professor', subtitle: '', type: 'faculty' as const},
    { id: 'Assistant Professor', label: 'Assistant Professor', subtitle: '', type: 'faculty' as const},
    { id: 'Trainer', label: 'Trainer', subtitle: '', type: 'faculty' as const},
    { id: 'Lecturer', label: 'Lecturer', subtitle: '', type: 'faculty' as const},
  ]

  const filteredFaculty = mockFaculty.filter(faculty => {
    return (
      (selectedRole ? faculty.role === selectedRole : true) &&
      (selectedDesignation ? faculty.designation === selectedDesignation : true)
    );
  });

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

      <div className="flex gap-4">
        <SearchableDropdown
            label="Role"
            options={roleOptions}
            value={selectedRole}
            onChange={setSelectedRole}
            placeholder="Filter by role..."
        />
        <SearchableDropdown
            label="Designation"
            options={designationOptions}
            value={selectedDesignation}
            onChange={setSelectedDesignation}
            placeholder="Filter by designation..."
        />
      </div>


      {filteredFaculty.map(faculty => (
        <FacultyCard
          key={faculty.id}
          faculty={faculty}
          onRouteToFaculty={() => onRouteToFaculty(
            faculty.location_id.toString(),
            faculty.cabin_number
          )}
        />
      ))}
    </div>
  );
};