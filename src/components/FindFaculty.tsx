import React, { useState, useEffect } from 'react';
import { SearchableDropdown } from './SearchableDropdown';
import { FacultyCard } from './FacultyCard';
import { HodAvailability } from './HodAvailability';
import { ChevronDown } from 'lucide-react';

// 1. Define the Faculty type from our API 
interface Faculty {
  id: number;
  name: string;
  department: string;
  school: string;
  designation: string;
  role: string;
  courses_taken: string[];
  cabin_number: string;
  phone_number: string;
  availability: boolean;
  location_id: string; 
}

export const FindFaculty: React.FC<FindFacultyProps> = ({ onRouteToFaculty }) => {
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedDesignation, setSelectedDesignation] = useState<string | null>(null);
  const [isHodListVisible, setIsHodListVisible] = useState(false);

  // 2. Add state for faculty data
  const [allFaculty, setAllFaculty] = useState<Faculty[]>([]);
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/faculty')
      .then(res => res.json())
      .then((data: Faculty[]) => {
        setAllFaculty(data);
        setIsLoadingFaculty(false);
      })
      .catch(err => {
        console.error("Failed to fetch faculty:", err);
        setIsLoadingFaculty(false);
      });
  }, []);

  const facultyOptions = allFaculty.map(faculty => ({
    id: faculty.id.toString(),
    label: faculty.name,
    subtitle: `${faculty.department} • ${faculty.designation}`,
    type: 'faculty' as const,
  }));

  const schoolOptions = [
      { id: '', label: 'All Schools', subtitle: '', type: 'faculty' as const},
      { id: 'SOCSE', label: 'SOCSE', subtitle: 'School of Computer Science and Engineering', type: 'faculty' as const},
      { id: 'SOM', label: 'SOM', subtitle: 'School of Management', type: 'faculty' as const},
      { id: 'SOD', label: 'SOD', subtitle: 'School of Design', type: 'faculty' as const},
      { id: 'SOE', label: 'SOE', subtitle: 'School of Engineering', type: 'faculty' as const},
      { id: 'SOIST', label: 'SOIST', subtitle: 'School of Information Science and Technology', type: 'faculty' as const},
  ];
   const roleOptions = [
      { id: '', label: 'All Roles', subtitle: '', type: 'faculty' as const},
      { id: 'CC', label: 'CC', subtitle: '', type: 'faculty' as const},
      { id: 'HOD', label: 'HOD', subtitle: '', type: 'faculty' as const},
      { id: 'Academic Coordinator', label: 'Academic Coordinator', subtitle: '', type: 'faculty' as const},
      { id: 'Reviewer', label: 'Reviewer', subtitle: '', type: 'faculty' as const},
      { id: 'NA', label: 'NA', subtitle: '', type: 'faculty' as const},
  ];

  const designationOptions = [
    { id: '', label: 'All Designations', subtitle: '', type: 'faculty' as const},
    { id: 'Professor', label: 'Professor', subtitle: '', type: 'faculty' as const},
    { id: 'Assistant Professor', label: 'Assistant Professor', subtitle: '', type: 'faculty' as const},
    { id: 'Trainer', label: 'Trainer', subtitle: '', type: 'faculty' as const},
    { id: 'Lecturer', label: 'Lecturer', subtitle: '', type: 'faculty' as const},
  ];


  const selectedFacultyData = allFaculty.find(
    faculty => faculty.id.toString() === selectedFaculty
  );
  
  const filteredFaculty = (selectedSchool !== null || selectedRole !== null || selectedDesignation !== null) 
    ? allFaculty.filter(faculty => {
        const schoolMatch = selectedSchool ? faculty.school === selectedSchool : true;
        const roleMatch = selectedRole ? faculty.role === selectedRole : true;
        const designationMatch = selectedDesignation ? faculty.designation === selectedDesignation : true;
        return schoolMatch && roleMatch && designationMatch;
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
            setSelectedSchool(null);
            setSelectedRole(null);
            setSelectedDesignation(null);
        }}
        placeholder={isLoadingFaculty ? "Loading faculty..." : "Type faculty name..."}
      />
      
    {/* HOD Availability Button and Collapsible Section */}
    <div>
      <button
        onClick={() => setIsHodListVisible(!isHodListVisible)}
        className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-purple-300 glass-panel rounded-xl hover:bg-purple-500/10 transition-colors"
      >
        <span>HOD Availability</span>
        <ChevronDown
          size={20}
          className={`transition-transform duration-300 ${isHodListVisible ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isHodListVisible ? 'max-h-96' : 'max-h-0'}`}
      >
        {/* 5. Pass fetched data to HodAvailability */}
        <HodAvailability allFaculty={allFaculty} />
      </div>
    </div>
      
      <div className="space-y-4">
        <SearchableDropdown
            label="School"
            options={schoolOptions}
            value={selectedSchool ?? ''}
            onChange={(value) => {
                setSelectedSchool(value);
                setSelectedFaculty('');
            }}
            placeholder="Filter by school..."
        />
        <div className="flex gap-4">
            <div className="w-1/2">
                <SearchableDropdown
                    label="Role"
                    options={roleOptions}
                    value={selectedRole ?? ''}
                    onChange={(value) => {
                        setSelectedRole(value);
                        setSelectedFaculty('');
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
                        setSelectedFaculty('');
                    }}
                    placeholder="Filter by designation..."
                />
            </div>
        </div>
      </div>
      
      {/* 6. Update card rendering logic */}
      {isLoadingFaculty ? (
        <div className="glass-panel rounded-2xl p-6 text-center text-gray-400">
          Loading faculty data...
        </div>
      ) : selectedFacultyData ? (
        <FacultyCard
            faculty={selectedFacultyData}
            onRouteToFaculty={() => onRouteToFaculty(
              selectedFacultyData.location_id.toString(),
              selectedFacultyData.cabin_number
            )}
        />
      ) : (
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

interface FindFacultyProps {
  onRouteToFaculty: (locationId: string, locationName: string) => void;
}