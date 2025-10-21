import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Save, X, Phone, MapPin, AlertCircle, CheckCircle, RefreshCw, XCircle } from 'lucide-react'; // Added XCircle

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

// Interface matching DB/schemas
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
  location_id: string; // location_id is text
}

// Interface for locations dropdown
interface Location {
  id: string;
  label: string;
  subtitle: string;
  type: 'location';
}


export const FacultyManager: React.FC = () => {
  // State variables
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Used for Add/Edit form saving
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    school: '',
    designation: '',
    role: '',
    courses_taken: '',
    cabin_number: '',
    phone_number: '',
    availability: true,
    location_id: ''
   });
  const [togglingAvailabilityId, setTogglingAvailabilityId] = useState<number | null>(null);

  // Fetch initial faculty and locations
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [facultyRes, locationsRes] = await Promise.all([
        fetch('http://localhost:8000/api/faculty'),
        fetch('http://localhost:8000/api/locations')
      ]);
      if (!facultyRes.ok) throw new Error('Failed to fetch faculty');
      if (!locationsRes.ok) throw new Error('Failed to fetch locations');
      const facultyData: Faculty[] = await facultyRes.json();
      const locationsData: Location[] = await locationsRes.json();
      setFaculty(facultyData);
      setLocations(locationsData);
    } catch (err: any) {
      setError(err.message || 'Could not load initial data.');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  // --- CRUD Handlers ---

  const handleEdit = (facultyMember: Faculty) => {
    setEditingId(facultyMember.id);
    setFormData({ // Populate form for editing
      name: facultyMember.name || '',
      department: facultyMember.department || '',
      school: facultyMember.school || '',
      designation: facultyMember.designation || '',
      role: facultyMember.role || '',
      courses_taken: (facultyMember.courses_taken || []).join(', '),
      cabin_number: facultyMember.cabin_number || '',
      phone_number: facultyMember.phone_number || '',
      availability: facultyMember.availability,
      location_id: facultyMember.location_id || '',
    });
    setIsAdding(false);
    setError(null);
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name.trim() || !formData.department.trim()) {
      setError('Name and Department are required.');
      return;
    }
     // Validate location ID if provided
    if (formData.location_id && !locations.find(loc => loc.id === formData.location_id)) {
        setError('Selected Location ID is invalid.');
        return;
    }

    setIsSaving(true);
    setError(null);

    const url = isAdding
      ? 'http://localhost:8000/api/faculty'
      : `http://localhost:8000/api/faculty/${editingId}`;

    const method = isAdding ? 'POST' : 'PUT';

    // Prepare payload, ensuring null for empty selects
    const payload = {
        name: formData.name.trim(),
        department: formData.department.trim(),
        school: formData.school.trim() || null, // Send null if empty string
        designation: formData.designation.trim() || null, // Send null if empty string
        role: formData.role.trim() || null, // Send null if empty string
        courses_taken: formData.courses_taken.split(',').map(c => c.trim()).filter(c => c),
        cabin_number: formData.cabin_number.trim(),
        phone_number: formData.phone_number.trim(),
        availability: formData.availability,
        location_id: formData.location_id.trim() || null, // Send null if empty string
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.detail || `Failed to ${isAdding ? 'add' : 'update'} faculty`);
      }

      if (isAdding) {
        setFaculty(prev => [...prev, resultData]);
      } else {
        setFaculty(prev => prev.map(f => f.id === editingId ? resultData : f));
      }

      handleCancel(); // Reset form

    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ // Reset form completely
        name: '', department: '', school: '', designation: '', role: '',
        courses_taken: '', cabin_number: '', phone_number: '',
        availability: true, location_id: ''
    });
    setError(null);
  };

  const handleDelete = async (id: number) => {
     if (!confirm('Are you sure you want to delete this faculty member? This may also affect their login.')) {
        return;
    }
    setError(null);

    try {
        const response = await fetch(`http://localhost:8000/api/faculty/${id}`, {
            method: 'DELETE',
        });
        const resultData = await response.json();
        if (!response.ok) {
            throw new Error(resultData.detail || 'Failed to delete faculty member');
        }
        setFaculty(prev => prev.filter(f => f.id !== id)); // Remove from state
    } catch (err: any) {
        setError(err.message || 'An error occurred while deleting.');
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ // Reset form for adding
        name: '', department: '', school: '', designation: '', role: '',
        courses_taken: '', cabin_number: '', phone_number: '',
        availability: true, location_id: ''
    });
    setError(null);
  };

  const handleToggleAvailabilityAdmin = async (id: number, currentStatus: boolean) => {
    setTogglingAvailabilityId(id); // Set loading state for this specific faculty
    setError(null);
    const newAvailability = !currentStatus;

    try {
      const response = await fetch(`http://localhost:8000/api/faculty/${id}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: newAvailability }),
      });
      const updatedFacultyData = await response.json();
      if (!response.ok) {
        throw new Error(updatedFacultyData.detail || 'Failed to update availability');
      }
      // Update the faculty list state
      setFaculty(prev => prev.map(f => f.id === id ? updatedFacultyData : f));
    } catch (err: any) {
      setError(`Failed to update status for ${faculty.find(f => f.id === id)?.name}: ${err.message}`);
    } finally {
      setTogglingAvailabilityId(null); // Clear loading state
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return <div className="text-center p-6 text-gray-400">Loading faculty and location data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Faculty Management</h3>
        </div>
         {!isAdding && !editingId && (
            <button
                onClick={startAdding}
                className="btn-add" // Use className for styling consistency
            >
                <Plus size={16} />
                Add Faculty
            </button>
         )}
      </div>

      {/* General Error Display */}
       {error && !isAdding && !editingId && (
            <div className="error-banner"> {/* Use className */}
                <AlertCircle size={16} />
                {error}
            </div>
       )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-purple-500/30">
          <h4 className="text-md font-semibold text-white">
            {isAdding ? 'Add New Faculty Member' : 'Edit Faculty Member'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="input-label">Name*</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Prof. Jane Doe" required />
            </div>
            {/* Department */}
            <div>
              <label className="input-label">Department*</label>
              <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input-field" placeholder="Physics" required />
            </div>
             {/* School Dropdown */}
            <div>
              <label className="input-label">School</label>
              <select value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} className="input-field select-field" >
                 {SCHOOL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            {/* Designation Dropdown */}
            <div>
              <label className="input-label">Designation</label>
               <select value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="input-field select-field" >
                 {DESIGNATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            {/* Role Dropdown */}
            <div>
              <label className="input-label">Role</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input-field select-field" >
                 {ROLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            {/* Cabin Number */}
            <div>
              <label className="input-label">Cabin Number</label>
              <input type="text" value={formData.cabin_number} onChange={(e) => setFormData({ ...formData, cabin_number: e.target.value })} className="input-field" placeholder="C-305" />
            </div>
             {/* Location ID Dropdown */}
            <div>
              <label className="input-label">Assigned Location (Cabin)</label>
              <select value={formData.location_id} onChange={(e) => setFormData({ ...formData, location_id: e.target.value })} className="input-field select-field" >
                <option value="">-- Select Location --</option>
                {locations.map(loc => (<option key={loc.id} value={loc.id}>{loc.label} ({loc.id})</option>))}
              </select>
            </div>
            {/* Phone Number */}
            <div>
              <label className="input-label">Phone Number</label>
              <input type="tel" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="input-field" placeholder="+91-..." />
            </div>
             {/* Availability */}
            <div>
              <label className="input-label">
                  {isAdding ? 'Initial Availability' : 'Availability'}
              </label>
              <select value={formData.availability.toString()} onChange={(e) => setFormData({ ...formData, availability: e.target.value === 'true' })} className="input-field select-field" >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
            {/* Courses */}
            <div className="md:col-span-2">
              <label className="input-label">Courses (comma separated)</label>
              <input type="text" value={formData.courses_taken} onChange={(e) => setFormData({ ...formData, courses_taken: e.target.value })} className="input-field" placeholder="Quantum Mechanics, Thermodynamics" />
            </div>
          </div>
          {/* Form Error Display */}
           {error && (
                <div className="error-banner mt-4"> {/* Use className */}
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
          {/* Save/Cancel Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700/50 mt-4">
             <button onClick={handleSave} disabled={isSaving || !formData.name || !formData.department} className="btn-primary" >
              {isSaving ? <div className="spinner-small"></div> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleCancel} disabled={isSaving} className="btn-secondary" >
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Faculty List */}
      <div className="space-y-4">
         {faculty.length === 0 && !isLoading && !isAdding && !editingId && (
            <p className="text-gray-500 text-center py-4">No faculty members added yet.</p>
         )}
         {/* Filter out the one being edited */}
        {faculty.filter(f => f.id !== editingId).map((facultyMember) => (
          <div key={facultyMember.id} className="glass-panel rounded-2xl p-6 space-y-4">
             <div className="flex items-start justify-between gap-4">
               {/* Faculty Info */}
               <div className="flex items-start gap-4 flex-grow min-w-0">
                  <div className="faculty-icon"> {/* Use className */}
                    <Users size={24} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="faculty-name">{facultyMember.name}</h4> {/* Use className */}
                    <p className="faculty-details">{facultyMember.department} {facultyMember.school ? `(${facultyMember.school})` : ''}</p> {/* Use className */}
                    <p className="faculty-details">{facultyMember.designation} {facultyMember.role ? `• ${facultyMember.role}` : ''}</p> {/* Use className */}
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="faculty-actions"> {/* Use className */}
                  {/* Availability Toggle Button */}
                  <button
                    onClick={() => handleToggleAvailabilityAdmin(facultyMember.id, facultyMember.availability)}
                    disabled={togglingAvailabilityId === facultyMember.id}
                    className={`btn-toggle-small ${facultyMember.availability ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'} ${togglingAvailabilityId === facultyMember.id ? 'disabled' : ''}`}
                    title={facultyMember.availability ? 'Set Unavailable' : 'Set Available'}
                  >
                    {togglingAvailabilityId === facultyMember.id ? (
                        <RefreshCw size={14} className="animate-spin" />
                    ) : (
                         facultyMember.availability ? <XCircle size={14} /> : <CheckCircle size={14} />
                    )}
                    {facultyMember.availability ? 'AvA' : 'NA'}
                  </button>
                  {/* Edit Button */}
                  <button onClick={() => handleEdit(facultyMember)} className="btn-icon" title="Edit"> {/* Use className */}
                    <Edit size={16} />
                  </button>
                  {/* Delete Button */}
                  <button onClick={() => handleDelete(facultyMember.id)} className="btn-icon btn-icon-delete" title="Delete"> {/* Use className */}
                    <Trash2 size={16} />
                  </button>
               </div>
            </div>
            {/* Extra details */}
              <div className="faculty-extra-details"> {/* Use className */}
                  {facultyMember.cabin_number && <p><MapPin size={14} className="inline mr-1"/> Cabin: <span>{facultyMember.cabin_number}</span> {facultyMember.location_id && <span className="text-xs text-gray-500">(Loc: {facultyMember.location_id})</span>}</p>}
                  {facultyMember.phone_number && <p><Phone size={14} className="inline mr-1"/> Phone: <span>{facultyMember.phone_number}</span></p>}
                  {facultyMember.courses_taken && facultyMember.courses_taken.length > 0 && (<p>Courses: <span>{facultyMember.courses_taken.join(', ')}</span></p> )}
              </div>
          </div>
        ))}
      </div>
    </div>
  );
};