import React, { useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Save, X } from 'lucide-react';
import { mockLocations } from '../data/mockData';

interface Location {
  id: string;
  label: string;
  subtitle: string;
  type: 'location';
}

export const LocationManager: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    subtitle: '',
  });

  const handleEdit = (location: Location) => {
    setEditingId(location.id);
    setFormData({
      label: location.label,
      subtitle: location.subtitle,
    });
  };

  const handleSave = () => {
    if (!formData.label.trim() || !formData.subtitle.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (isAdding) {
      const newLocation: Location = {
        id: Date.now().toString(),
        label: formData.label.trim(),
        subtitle: formData.subtitle.trim(),
        type: 'location',
      };
      setLocations([...locations, newLocation]);
      setIsAdding(false);
    } else if (editingId) {
      setLocations(locations.map(loc => 
        loc.id === editingId 
          ? { ...loc, label: formData.label.trim(), subtitle: formData.subtitle.trim() }
          : loc
      ));
      setEditingId(null);
    }
    setFormData({ label: '', subtitle: '' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ label: '', subtitle: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      setLocations(locations.filter(loc => loc.id !== id));
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setFormData({ label: '', subtitle: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin size={24} className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Location Management</h3>
        </div>
        <button
          onClick={startAdding}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                   neon-border bg-gradient-to-r from-purple-600 to-purple-500 text-white
                   hover:from-purple-500 hover:to-purple-400 transition-all duration-300"
        >
          <Plus size={16} />
          Add Location
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h4 className="text-md font-semibold text-white">Add New Location</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location Name
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                         focus:neon-border bg-black/30 text-white placeholder-gray-500"
                placeholder="e.g., A-101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                         focus:neon-border bg-black/30 text-white placeholder-gray-500"
                placeholder="e.g., Block A • Floor 1 • Classroom"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!formData.label || !formData.subtitle}
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

      {/* Locations List */}
      <div className="space-y-3">
        {locations.map((location) => (
          <div key={location.id} className="glass-panel rounded-2xl p-4">
            {editingId === location.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                             focus:neon-border bg-black/30 text-white placeholder-gray-500"
                  />
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                             focus:neon-border bg-black/30 text-white placeholder-gray-500"
                  />
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">{location.label}</h4>
                  <p className="text-sm text-gray-400">{location.subtitle}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(location)}
                    className="p-2 rounded-lg glass-panel text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="p-2 rounded-lg glass-panel text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};