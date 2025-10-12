import React, { useState } from 'react';
import { LogOut, User, CheckCircle, XCircle, Edit, Save, Phone, MapPin, GraduationCap, X, AlertCircle } from 'lucide-react';
import { mockFaculty } from '../data/mockData';

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
  location_id: number;
}

interface FacultyDashboardProps {
  facultyId: number;
  onLogout: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ 
  facultyId, 
  onLogout 
}) => {
  const initialFacultyData = mockFaculty.find(f => f.id === facultyId);
  
  const [currentFaculty, setCurrentFaculty] = useState<Faculty | undefined>(initialFacultyData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for the full profile editable form data
  const [formData, setFormData] = useState({
    name: currentFaculty?.name || '',
    department: currentFaculty?.department || '',
    designation: currentFaculty?.designation || '',
    role: currentFaculty?.role || '',
    cabin_number: currentFaculty?.cabin_number || '',
    phone_number: currentFaculty?.phone_number || '',
    courses_taken: currentFaculty?.courses_taken.join(', ') || '',
  });

  if (!currentFaculty) {
    return <div>Error: Faculty not found.</div>
  }

  // --- PRIMARY FUNCTION: AVAILABILITY TOGGLE ---
  const handleToggleAvailability = () => {
    if (!currentFaculty) return;

    setIsSaving(true);
    
    setTimeout(() => {
      const newAvailability = !currentFaculty.availability;
      
      const updatedData = { ...currentFaculty, availability: newAvailability } as Faculty;

      // Update the component's state
      setCurrentFaculty(updatedData);
      
      // Update the mockFaculty array directly to affect other components
      const mockIndex = mockFaculty.findIndex(f => f.id === facultyId);
      if (mockIndex !== -1) {
        mockFaculty[mockIndex].availability = newAvailability;
      }
      
      setIsSaving(false);
    }, 500);
  };
  

  const startEdit = () => {
    // Set form data based on current state before editing
    setFormData({
        name: currentFaculty.name,
        department: currentFaculty.department,
        designation: currentFaculty.designation,
        role: currentFaculty.role,
        cabin_number: currentFaculty.cabin_number,
        phone_number: currentFaculty.phone_number,
        courses_taken: currentFaculty.courses_taken.join(', '),
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = () => {
    if (!formData.name.trim() || !formData.department.trim()) {
      alert('Name and Department are required.');
      return;
    }

    setIsSaving(true);
    
    setTimeout(() => {
      const updatedData = {
        ...currentFaculty, 
        name: formData.name.trim(),
        department: formData.department.trim(),
        designation: formData.designation.trim(),
        role: formData.role.trim(),
        cabin_number: formData.cabin_number.trim(),
        phone_number: formData.phone_number.trim(),
        courses_taken: formData.courses_taken.split(',').map(c => c.trim()).filter(c => c),
      } as Faculty;

      setCurrentFaculty(updatedData);
      
      const mockIndex = mockFaculty.findIndex(f => f.id === facultyId);
      if (mockIndex !== -1) {
        mockFaculty[mockIndex] = updatedData;
      }

      setIsEditing(false);
      setIsSaving(false);
    }, 1000);
  };
  
  const { name, department, designation, role, cabin_number, phone_number, courses_taken, availability } = currentFaculty;

  // --- UI RENDERING ---
  return (
    <div className="space-y-6">
      {/* Header (unchanged) */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-white">Faculty Dashboard</h2>
                <p className="text-gray-400 text-sm">Welcome, {name}</p>
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

      {/* SECTION A: AVAILABILITY TOGGLE (ALWAYS VISIBLE & PRIMARY FOCUS) */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-3">
            <span className="flex items-center gap-2">
                <CheckCircle size={20} className={availability ? 'text-green-400' : 'text-red-400'} />
                Availability Status
            </span>
        </h3>
        
        <div className="flex items-center justify-between glass-panel p-4 rounded-xl border border-transparent">
          <span className={`text-lg font-medium ${availability ? 'text-green-400' : 'text-red-400'}`}>
            {availability ? 'CURRENTLY AVAILABLE' : 'CURRENTLY UNAVAILABLE'}
          </span>
          <button
            onClick={handleToggleAvailability}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
              ${availability
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'
              }
              ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              availability ? <X size={16} /> : <CheckCircle size={16} />
            )}
            {isSaving ? 'Saving...' : (availability ? 'Set Unavailable' : 'Set Available')}
          </button>
        </div>
      </div>

      {/* SECTION B: PROFILE DETAILS (VIEW/EDIT CONDITIONAL) */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        
        <div className="flex justify-between items-start border-b border-gray-700 pb-3 mb-4">
          <h3 className="text-lg font-semibold text-white">
            {isEditing ? 'Editing Profile Details' : 'View Profile Details'}
          </h3>
          
          {!isEditing && (
            <button
              onClick={startEdit}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                       bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            >
              <Edit size={16} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Full Details Form/Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Name */}
          <InputField 
            label="Name" 
            value={isEditing ? formData.name : name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            isEditing={isEditing}
          />
          {/* Department */}
          <InputField 
            label="Department" 
            value={isEditing ? formData.department : department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            isEditing={isEditing}
          />
           {/* Designation */}
           <InputField 
            label="Designation" 
            value={isEditing ? formData.designation : designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            isEditing={isEditing}
          />
           {/* Role */}
           <InputField 
            label="Role" 
            value={isEditing ? formData.role : role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            isEditing={isEditing}
          />
          {/* Cabin Number */}
          <InputField 
            label="Cabin Number" 
            value={isEditing ? formData.cabin_number : cabin_number}
            onChange={(e) => setFormData({ ...formData, cabin_number: e.target.value })}
            isEditing={isEditing}
          />
          {/* Phone Number */}
          <InputField 
            label="Phone Number" 
            value={isEditing ? formData.phone_number : phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            isEditing={isEditing}
          />
          
          {/* Courses Taken */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Courses Taught (comma separated)</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.courses_taken}
                onChange={(e) => setFormData({ ...formData, courses_taken: e.target.value })}
                className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                         focus:neon-border bg-black/30 text-white placeholder-gray-500"
                placeholder="Data Structures, Algorithms"
              />
            ) : (
              <p className="text-gray-300 py-2">
                {courses_taken.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving || !formData.name || !formData.department}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       bg-green-600 hover:bg-green-500 text-white transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       glass-panel text-gray-400 hover:text-gray-300 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


interface InputFieldProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isEditing: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, isEditing }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        {isEditing ? (
            <input
                type="text"
                value={value}
                onChange={onChange}
                className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                         focus:neon-border bg-black/30 text-white placeholder-gray-500"
                placeholder={`Enter ${label}`}
            />
        ) : (
            <p className="text-gray-300 py-2">{value}</p>
        )}
    </div>
);