import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, Save, X, Phone, MapPin } from 'lucide-react';
import { mockFaculty } from '../data/mockData';

interface Faculty {
  id: number;
  name: string;
  department: string;
  courses_taken: string[];
  location_room: string;
  cabin_number: string;
  phone_number: string;
  availability: boolean;
  location_id: number;
}

export const FacultyManager: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>(mockFaculty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    courses_taken: '',
    location_room: '',
    cabin_number: '',
    phone_number: '',
    availability: true,
  });

  const handleEdit = (facultyMember: Faculty) => {
    setEditingId(facultyMember.id);
    setFormData({
      name: facultyMember.name,
      department: facultyMember.department,
      courses_taken: facultyMember.courses_taken.join(', '),
      location_room: facultyMember.location_room,
      cabin_number: facultyMember.cabin_number,
      phone_number: facultyMember.phone_number,
      availability: facultyMember.availability,
    });
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.department.trim() || !formData.location_room.trim()) {
      alert('Please fill in all required fields (Name, Department, Location Room)');
      return;
    }

    const facultyData = {
      name: formData.name.trim(),
      department: formData.department.trim(),
      courses_taken: formData.courses_taken.split(',').map(c => c.trim()).filter(c => c),
      location_room: formData.location_room.trim(),
      cabin_number: formData.cabin_number.trim(),
      phone_number: formData.phone_number.trim(),
      availability: formData.availability,
      location_id: 331, // Default location ID
    };

    if (isAdding) {
      const newFaculty: Faculty = {
        id: Date.now(),
        ...facultyData,
      };
      setFaculty([...faculty, newFaculty]);
      setIsAdding(false);
    } else if (editingId) {
      setFaculty(faculty.map(f => 
        f.id === editingId 
          ? { ...f, ...facultyData }
          : f
      ));
      setEditingId(null);
    }
    setFormData({
      name: '',
      department: '',
      courses_taken: '',
      location_room: '',
      cabin_number: '',
      phone_number: '',
      availability: true,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      name: '',
      department: '',
      courses_taken: '',
      location_room: '',
      cabin_number: '',
      phone_number: '',
      availability: true,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this faculty member?')) {
      setFaculty(faculty.filter(f => f.id !== id));
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setFormData({
      name: '',
      department: '',
      courses_taken: '',
      location_room: '',
      cabin_number: '',
      phone_number: '',
      availability: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Faculty Management</h3>
        </div>
        <button
          onClick={startAdding}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                   neon-border bg-gradient-to-r from-purple-600 to-purple-500 text-white
                   hover:from-purple-500 hover:to-purple-400 transition-all duration-300"
        >
          <Plus size={16} />
          Add Faculty
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h4 className="text-md font-semibold text-white">Add New Faculty Member</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                         focus:neon-border bg-black/30 text-white placeholder-gray-500"
                placeholder="Prof. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                         focus:neon-border bg-black/30 text-white placeholder-gray-500"
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location Room</label>
              <input
                type="text"
                value={formData.location_room}
                onChange={(e) => setFormData({ ...formData, location_room: e.target.value })}
                className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                         focus:neon-border bg-black/30 text-white placeholder-gray-500"
                placeholder="A-101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cabin Number</label>
              <input
                type="text"
                value={formData.cabin_number}
                onChange={(e) => setFormData({ ...formData, cabin_number: e.target.value })}
                className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                         focus:neon-border bg-black/30 text-white placeholder-gray-500"
                placeholder="A-101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                         focus:neon-border bg-black/30 text-white placeholder-gray-500"
                placeholder="+91-90000-00000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Availability</label>
              <select
                value={formData.availability.toString()}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value === 'true' })}
                className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                         focus:neon-border bg-black/30 text-white"
              >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Courses (comma separated)</label>
              <input
                type="text"
                value={formData.courses_taken}
                onChange={(e) => setFormData({ ...formData, courses_taken: e.target.value })}
                className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                         focus:neon-border bg-black/30 text-white placeholder-gray-500"
                placeholder="Data Structures, Algorithms, Machine Learning"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.department}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       bg-green-600 hover:bg-green-500 text-white transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       glass-panel text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Faculty List */}
      <div className="space-y-4">
        {faculty.map((facultyMember) => (
          <div key={facultyMember.id} className="glass-panel rounded-2xl p-6">
            {editingId === facultyMember.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                             focus:neon-border bg-black/30 text-white placeholder-gray-500"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                             focus:neon-border bg-black/30 text-white placeholder-gray-500"
                    placeholder="Department"
                  />
                  <input
                    type="text"
                    value={formData.location_room}
                    onChange={(e) => setFormData({ ...formData, location_room: e.target.value })}
                    className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                             focus:neon-border bg-black/30 text-white placeholder-gray-500"
                    placeholder="Location Room"
                  />
                  <input
                    type="text"
                    value={formData.cabin_number}
                    onChange={(e) => setFormData({ ...formData, cabin_number: e.target.value })}
                    className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                             focus:neon-border bg-black/30 text-white placeholder-gray-500"
                    placeholder="Cabin Number"
                  />
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                             focus:neon-border bg-black/30 text-white placeholder-gray-500"
                    placeholder="Phone Number"
                  />
                  <select
                    value={formData.availability.toString()}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value === 'true' })}
                    className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                             focus:neon-border bg-black/30 text-white"
                  >
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={formData.courses_taken}
                      onChange={(e) => setFormData({ ...formData, courses_taken: e.target.value })}
                      className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                               focus:neon-border bg-black/30 text-white placeholder-gray-500"
                      placeholder="Courses (comma separated)"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                             bg-green-600 hover:bg-green-500 text-white transition-colors"
                  >
                    <Save size={14} />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                             glass-panel text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl flex items-center justify-center neon-glow">
                      <Users size={24} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{facultyMember.name}</h4>
                      <p className="text-gray-400">{facultyMember.department}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-gray-300">{facultyMember.location_room}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone size={14} className="text-gray-400" />
                          <span className="text-gray-300">{facultyMember.phone_number}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {facultyMember.availability ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                        Available
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                        Not Available
                      </span>
                    )}
                    <button
                      onClick={() => handleEdit(facultyMember)}
                      className="p-2 rounded-lg glass-panel text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(facultyMember.id)}
                      className="p-2 rounded-lg glass-panel text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Courses:</p>
                  <div className="flex flex-wrap gap-2">
                    {facultyMember.courses_taken.map((course, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-xs"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};