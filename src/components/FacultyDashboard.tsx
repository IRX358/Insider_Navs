import React, { useState, useEffect } from 'react';
import { LogOut, User, CheckCircle, XCircle, Edit, Save, Phone, MapPin, GraduationCap, X, AlertCircle } from 'lucide-react';

// --- Define Dropdown Options ---
const SCHOOL_OPTIONS = [
  { value: '', label: '-- Select School --' },
  { value: 'SOCSE', label: 'SOCSE (Comp Sci)' },
  { value: 'SOM', label: 'SOM (Management)' },
  { value: 'SOD', label: 'SOD (Design)' },
  { value: 'SOE', label: 'SOE (Engineering)' },
  { value: 'SOL', label: 'SOL (Law)'},
  { value: 'SOIST', label: 'SOIST (Info Sci & Tech)' },
  // Add other schools as needed
];

const ROLE_OPTIONS = [
  { value: '', label: '-- Select Role --' },
  { value: 'HOD', label: 'HOD' },
  { value: 'CC', label: 'CC (Class Coordinator)' },
  { value: 'Academic Coordinator', label: 'Academic Coordinator' },
  { value: 'Reviewer', label: 'Reviewer' },
  { value: 'NA', label: 'NA (Not Applicable)' },
  // Add other roles as needed
];

const DESIGNATION_OPTIONS = [
  { value: '', label: '-- Select Designation --' },
  { value: 'Professor', label: 'Professor' },
  { value: 'Associate Professor', label: 'Associate Professor' },
  { value: 'Assistant Professor', label: 'Assistant Professor' },
  { value: 'Lecturer', label: 'Lecturer' },
  { value: 'Trainer', label: 'Trainer' },
  // Add other designations as needed
];
// ---

// Interface matching DB/schemas
interface Faculty {
  id: number;
  name: string;
  department: string;
  school: string; // Added school
  designation: string;
  role: string;
  courses_taken: string[];
  cabin_number: string;
  phone_number: string;
  availability: boolean;
  location_id: string; // location_id is text
}

interface FacultyDashboardProps {
  facultyId: number;
  onLogout: () => void;
}

// Helper component for displaying fields and providing edit inputs/selects
interface FieldProps {
    label: string;
    value: string | null | undefined; // Allow null/undefined
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    isEditing: boolean;
    type?: 'text' | 'tel' | 'select';
    options?: { value: string; label: string }[];
    placeholder?: string;
    required?: boolean;
}

const FieldDisplayEdit: React.FC<FieldProps> = ({ label, value, onChange, isEditing, type = 'text', options = [], placeholder, required = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}{required && '*'}</label>
        {isEditing ? (
            type === 'select' ? (
                <select
                    value={value || ''} // Handle null/undefined for select value
                    onChange={onChange}
                    className="input-field select-field"
                    required={required}
                >
                    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    value={value || ''} // Handle null/undefined for input value
                    onChange={onChange}
                    className="input-field"
                    placeholder={placeholder || `Enter ${label}`}
                    required={required}
                />
            )
        ) : (
            // Display '-' if value is missing or empty, handle select labels
            <p className="text-gray-300 py-2">
                {type === 'select'
                 ? (options.find(opt => opt.value === value)?.label || '-') // Show '-' if no match or value is empty/null
                 : (value || '-')} {/* Show '-' if value is empty/null */}
            </p>
        )}
    </div>
);


export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  facultyId,
  onLogout
}) => {
  const [currentFaculty, setCurrentFaculty] = useState<Faculty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form data state needs to include school now
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    school: '', // Added school
    designation: '',
    role: '',
    cabin_number: '',
    phone_number: '',
    courses_taken: '',
  });

  // Fetch faculty data on load
  useEffect(() => {
    if (!facultyId) return;
    setIsLoading(true);
    setError(null);
    fetch(`http://localhost:8000/api/faculty/${facultyId}`)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) throw new Error(`Faculty with ID ${facultyId} not found.`);
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: Faculty) => {
        setCurrentFaculty(data);
        // Initialize form data correctly including school
        setFormData({
            name: data.name || '',
            department: data.department || '',
            school: data.school || '', // Add school
            designation: data.designation || '',
            role: data.role || '',
            cabin_number: data.cabin_number || '',
            phone_number: data.phone_number || '',
            courses_taken: (data.courses_taken || []).join(', '),
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch faculty details:", err);
        setError(err.message || "Could not load faculty data.");
        setIsLoading(false);
      });
  }, [facultyId]);

  // Handler to toggle availability
  const handleToggleAvailability = async () => {
    if (!currentFaculty) return;
    const newAvailability = !currentFaculty.availability;
    const previousAvailability = currentFaculty.availability; // Store previous state
    setCurrentFaculty({ ...currentFaculty, availability: newAvailability }); // Optimistic update
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/faculty/${facultyId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: newAvailability }),
      });
      const updatedFacultyData = await response.json();
      if (!response.ok) {
        setCurrentFaculty(prev => prev ? { ...prev, availability: previousAvailability } : null); // Revert on fail
        throw new Error(updatedFacultyData.detail || 'Failed to update availability');
      }
      setCurrentFaculty(updatedFacultyData); // Confirm with server data
    } catch (err: any) {
      console.error('Failed to toggle availability:', err);
      setError(err.message || 'Could not save availability status.');
       setCurrentFaculty(prev => prev ? { ...prev, availability: previousAvailability } : null); // Revert on fail
    } finally {
      setIsSaving(false);
    }
  };

  // Handler to start editing
  const startEdit = () => {
    if (!currentFaculty) return;
    // Ensure form data is set correctly from currentFaculty state
    setFormData({
        name: currentFaculty.name || '',
        department: currentFaculty.department || '',
        school: currentFaculty.school || '', // Include school
        designation: currentFaculty.designation || '',
        role: currentFaculty.role || '',
        cabin_number: currentFaculty.cabin_number || '',
        phone_number: currentFaculty.phone_number || '',
        courses_taken: (currentFaculty.courses_taken || []).join(', '),
    });
    setIsEditing(true);
    setError(null); // Clear errors when starting edit
  };

  // Handler to cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setError(null); // Clear errors on cancel
    // Optionally reset formData if needed, but startEdit does this
  };

  // Handler to save profile changes
  const handleSaveProfile = async () => {
    if (!currentFaculty || !formData.name.trim() || !formData.department.trim()) {
      alert('Name and Department are required.');
      return;
    }
    const previousFacultyState = { ...currentFaculty }; // Store for potential revert

    // Prepare payload including school, ensure null for empty selects
    const updatePayload = {
        name: formData.name.trim(),
        department: formData.department.trim(),
        school: formData.school.trim() || null, // Send null if empty string
        designation: formData.designation.trim() || null, // Send null if empty string
        role: formData.role.trim() || null, // Send null if empty string
        courses_taken: formData.courses_taken.split(',').map(c => c.trim()).filter(c => c),
        cabin_number: formData.cabin_number.trim(),
        phone_number: formData.phone_number.trim(),
    };

    // Optimistic UI Update
    setCurrentFaculty(prev => prev ? { ...prev, ...updatePayload } as Faculty : null);
    setIsEditing(false);
    setIsSaving(true);
    setError(null);

    try {
        const response = await fetch(`http://localhost:8000/api/faculty/${facultyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload),
        });
        const updatedFacultyData = await response.json();
        if (!response.ok) {
            setCurrentFaculty(previousFacultyState); // Revert UI
            setIsEditing(true); // Re-open edit form
            throw new Error(updatedFacultyData.detail || 'Failed to update profile');
        }
        setCurrentFaculty(updatedFacultyData); // Confirm with server data
    } catch (err: any) {
        console.error('Failed to save profile:', err);
        setError(err.message || 'Could not save profile changes.');
        // Revert UI change handled in if (!response.ok) block
    } finally {
        setIsSaving(false);
    }
  };


  // --- Render Logic ---
  if (isLoading) {
    return ( <div className="loading-container"> <div className="spinner"></div> Loading Profile... </div> );
  }

  if (error && !currentFaculty) { // Show error prominently if faculty couldn't load at all
    return ( <div className="error-container"> <AlertCircle size={20} /> Error: {error} <button onClick={onLogout} className="logout-button-error">Logout</button> </div> );
  }

  if (!currentFaculty) {
    return <div>Error: Faculty data could not be loaded.</div>; // Fallback
  }

  // Destructure after checks, include school
  const { name, department, school, designation, role, cabin_number, phone_number, courses_taken, availability } = currentFaculty;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Faculty Dashboard</h2>
            <p className="text-gray-400 text-sm">Welcome, {name}</p>
          </div>
          <button onClick={onLogout} className="btn-logout"> <LogOut size={16} /> Logout </button>
        </div>
      </div>

       {/* General Save/Toggle Errors */}
       {error && !isEditing && (
          <div className="error-banner"> <AlertCircle size={16} /> {error} </div>
       )}

      {/* Availability Section */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
         <h3 className="section-title"> <CheckCircle size={20} className={availability ? 'text-green-400' : 'text-red-400'} /> Availability Status </h3>
         <div className="availability-display">
            <span className={`status-text ${availability ? 'text-green-400' : 'text-red-400'}`}>
              {availability ? 'CURRENTLY AVAILABLE' : 'CURRENTLY UNAVAILABLE'}
            </span>
            <button onClick={handleToggleAvailability} disabled={isSaving} className={`btn-toggle ${availability ? 'btn-red' : 'btn-green'} ${isSaving ? 'disabled' : ''}`} >
              {isSaving ? ( <div className="spinner-small"></div> ) : ( availability ? <X size={16} /> : <CheckCircle size={16} /> )}
              {isSaving ? 'Saving...' : (availability ? 'Set Unavailable' : 'Set Available')}
            </button>
         </div>
      </div>

      {/* Profile Details Section */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="section-header">
          <h3 className="text-lg font-semibold text-white"> {isEditing ? 'Editing Profile Details' : 'View Profile Details'} </h3>
          {!isEditing && ( <button onClick={startEdit} className="btn-edit"> <Edit size={16} /> Edit Profile </button> )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldDisplayEdit label="Name" value={isEditing ? formData.name : name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} isEditing={isEditing} required={true} />
          <FieldDisplayEdit label="Department" value={isEditing ? formData.department : department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} isEditing={isEditing} required={true} />
          <FieldDisplayEdit label="School" value={isEditing ? formData.school : school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} isEditing={isEditing} type="select" options={SCHOOL_OPTIONS} />
          <FieldDisplayEdit label="Designation" value={isEditing ? formData.designation : designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} isEditing={isEditing} type="select" options={DESIGNATION_OPTIONS} />
          <FieldDisplayEdit label="Role" value={isEditing ? formData.role : role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} isEditing={isEditing} type="select" options={ROLE_OPTIONS} />
          <FieldDisplayEdit label="Cabin Number" value={isEditing ? formData.cabin_number : cabin_number} onChange={(e) => setFormData({ ...formData, cabin_number: e.target.value })} isEditing={isEditing} />
          <FieldDisplayEdit label="Phone Number" value={isEditing ? formData.phone_number : phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} isEditing={isEditing} type="tel" />

          {/* Courses Taken */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Courses Taught (comma separated)</label>
            {isEditing ? (
              <input type="text" value={formData.courses_taken} onChange={(e) => setFormData({ ...formData, courses_taken: e.target.value })} className="input-field" placeholder="Data Structures, Algorithms" />
            ) : (
              <p className="text-gray-300 py-2">{(courses_taken || []).join(', ') || '-'}</p> // Show '-' if empty
            )}
          </div>
        </div>

        {/* Save/Cancel Buttons and Edit Errors */}
        {isEditing && (
           <>
             {error && ( <div className="error-banner mt-4"> <AlertCircle size={16} /> Save Error: {error} </div> )}
             <div className="form-actions">
               <button onClick={handleSaveProfile} disabled={isSaving || !formData.name || !formData.department} className="btn-primary" >
                 {isSaving ? <div className="spinner-small"></div> : <Save size={16} />} {isSaving ? 'Saving...' : 'Save Profile'}
               </button>
               <button onClick={handleCancel} disabled={isSaving} className="btn-secondary" > Cancel </button>
             </div>
           </>
        )}
      </div>
    </div>
  );
};
