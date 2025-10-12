import React, { useState } from 'react';
import { SearchableDropdown } from './SearchableDropdown';
import { FacultyCard } from './FacultyCard';
import { mockFaculty } from '../data/mockData';

interface FindFacultyProps {
  onRouteToFaculty: (locationId: string, locationName: string) => void;
}

export const FindFaculty: React.FC<FindFacultyProps> = ({ onRouteToFaculty }) => {
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedDesignation, setSelectedDesignation] = useState<string | null>(null);

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

  const selectedFacultyData = mockFaculty.find(
    faculty => faculty.id.toString() === selectedFaculty
  );
  
  // Filter logic updated
  const filteredFaculty = (selectedRole !== null || selectedDesignation !== null) 
    ? mockFaculty.filter(faculty => {
        const roleMatch = selectedRole ? faculty.role === selectedRole : true;
        const designationMatch = selectedDesignation ? faculty.designation === selectedDesignation : true;
        return roleMatch && designationMatch;
      })
    : [];

  return (
    <div 
      className="space-y-6"
      role="tabpanel"
      id="faculty-panel"
      aria-labelledby="faculty-tab"
    >
      <SearchableDropdown
        label="Search Faculty by Name"
        options={facultyOptions}
        value={selectedFaculty}
        onChange={(value) => {
            setSelectedFaculty(value);
            // Clear filters when searching for a specific person
            setSelectedRole(null);
            setSelectedDesignation(null);
        }}
        placeholder="Type faculty name or department..."
      />

      <div className="flex gap-4">
        {/* Each dropdown is wrapped in a div to control its width */}
        <div className="w-1/2">
            <SearchableDropdown
                label="Role"
                options={roleOptions}
                value={selectedRole ?? ''}
                onChange={(value) => {
                    setSelectedRole(value);
                    setSelectedFaculty(''); // Clear specific search
                }}
                placeholder="Filter by role..."
            />
        </div>
        <div className="w-1/2">
            <SearchableDropdown
                label="Designation"
                options={designationOptions}
                value={selectedDesignation ?? ''}
                onChange={(value) => {
                    setSelectedDesignation(value)
                    setSelectedFaculty(''); // Clear specific search
                }}
                placeholder="Filter by designation..."
            />
        </div>
      </div>

      {/* Conditional Rendering Logic */}
      {selectedFacultyData ? (
        // If a specific faculty is selected, show only their card
        <FacultyCard
            faculty={selectedFacultyData}
            onRouteToFaculty={() => onRouteToFaculty(
            selectedFacultyData.location_id.toString(),
            selectedFacultyData.cabin_number
            )}
        />
      ) : (
        // Otherwise, show the list based on filters
        filteredFaculty.map(faculty => (
          <FacultyCard
            key={faculty.id}
            faculty={faculty}
            onRouteToFaculty={() => onRouteToFaculty(
              faculty.location_id.toString(),
              faculty.cabin_number
            )}
          />
        ))
      )}
    </div>
  );
};