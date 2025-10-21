import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Save, X, AlertCircle } from 'lucide-react';

interface Location {
  id: string;
  label: string;
  subtitle: string;
  type: 'location'; 
}

export const LocationManager: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const [formData, setFormData] = useState({
    id: '', 
    label: '',
    subtitle: '',
  });

  const fetchLocations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/locations');
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data: Location[] = await response.json();
      setLocations(data);
    } catch (err: any) {
      setError(err.message || 'Could not load locations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []); 

  const handleEdit = (location: Location) => {
    setEditingId(location.id);
    setFormData({
      id: location.id, // ID is not editable, but keep it for context
      label: location.label,
      subtitle: location.subtitle || '',
    });
    setIsAdding(false); 
    setError(null);
  };

  const handleSave = async () => {
    if (!formData.label.trim() || !formData.subtitle.trim()) {
      setError('Label and Description are required.');
      return;
    }
    if (isAdding && !formData.id.trim()) {
      setError('Location ID (e.g., A-101) is required when adding.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const url = isAdding
      ? 'http://localhost:8000/api/locations'
      : `http://localhost:8000/api/locations/${editingId}`;

    const method = isAdding ? 'POST' : 'PUT';

    const payload: any = {
        label: formData.label.trim(),
        subtitle: formData.subtitle.trim(),
    };
    if (isAdding) {
        payload.id = formData.id.trim(); 
    }


    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.detail || `Failed to ${isAdding ? 'add' : 'update'} location`);
      }

      if (isAdding) {
        setLocations(prev => [...prev, resultData]); 
      } else {
        setLocations(prev => prev.map(loc => loc.id === editingId ? resultData : loc));
      }

      handleCancel(); 

    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ id: '', label: '', subtitle: '' });
    setError(null); 
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location? This cannot be undone.')) {
        return;
    }

    setError(null);

    try {
        const response = await fetch(`http://localhost:8000/api/locations/${id}`, {
            method: 'DELETE',
        });

        const resultData = await response.json();

        if (!response.ok) {
            throw new Error(resultData.detail || 'Failed to delete location');
        }

        setLocations(prev => prev.filter(loc => loc.id !== id));

    } catch (err: any) {
        setError(err.message || 'An error occurred while deleting.');
    } finally {
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ id: '', label: '', subtitle: '' }); 
    setError(null);
  };

  if (isLoading) {
    return (
       <div className="text-center p-6 text-gray-400">Loading locations...</div>
    );
  }

  // to Display general errors (not related to specific add/edit)
   // We'll show specific add/edit errors within the forms

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin size={24} className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Location Management</h3>
        </div>
        {!isAdding && !editingId && ( 
             <button
            onClick={startAdding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                    neon-border bg-gradient-to-r from-purple-600 to-purple-500 text-white
                    hover:from-purple-500 hover:to-purple-400 transition-all duration-300"
            >
            <Plus size={16} />
            Add Location
            </button>
        )}
      </div>

       {/* General Error Display */}
       {error && !isAdding && !editingId && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 text-red-400 rounded-xl text-sm">
                <AlertCircle size={16} />
                {error}
            </div>
       )}


      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-purple-500/30">
          <h4 className="text-md font-semibold text-white">
            {isAdding ? 'Add New Location' : 'Edit Location'}
          </h4>
          <div className="grid grid-cols-1 gap-4">
             {isAdding && (
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location ID*
                    </label>
                    <input
                        type="text"
                        value={formData.id}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent
                                    focus:neon-border bg-black/30 text-white placeholder-gray-500"
                        placeholder="e.g., A-101 (Cannot be changed later)"
                        required
                    />
                 </div>
             )}
            {/* Label Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Label / Name*
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent
                         focus:neon-border bg-black/30 text-white placeholder-gray-500"
                placeholder="e.g., Classroom A-101"
                required
              />
            </div>
            {/* Subtitle Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description*
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent
                         focus:neon-border bg-black/30 text-white placeholder-gray-500"
                placeholder="e.g., Block A • Floor 1 • Classroom"
                required
              />
            </div>
          </div>
          {/* Form Error Display */}
           {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/20 text-red-400 rounded-xl text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
          {/* Save/Cancel Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.label || !formData.subtitle || (isAdding && !formData.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       bg-green-600 hover:bg-green-500 text-white transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
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
        {locations.length === 0 && !isLoading && !isAdding && !editingId && (
            <p className="text-gray-500 text-center py-4">No locations added yet.</p>
        )}
        {locations.map((location) => (
          // Only show list items if not editing that specific item
          editingId !== location.id && (
            <div key={location.id} className="glass-panel rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">{location.label} <span className="text-xs text-gray-500">({location.id})</span></h4>
                <p className="text-sm text-gray-400">{location.subtitle}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(location)}
                  className="p-2 rounded-lg glass-panel text-gray-400 hover:text-blue-400 transition-colors"
                  title="Edit Location"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(location.id)}
                  className="p-2 rounded-lg glass-panel text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete Location"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};