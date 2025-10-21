import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Bell, AlertCircle } from 'lucide-react';

interface FlashNews {
  id: number;
  message: string;
}

export const FlashNewsManager: React.FC = () => {
  const [news, setNews] = useState<FlashNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMessage, setNewMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false); 

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/flash-news');
      if (!response.ok) throw new Error('Failed to fetch flash news');
      const data: FlashNews[] = await response.json();
      setNews(data);
    } catch (err: any) {
      setError(err.message || 'Could not load news items.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []); 


  const handleAddNews = async () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) {
      setError('Please enter a news message.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/flash-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedMessage }),
      });
      const resultData = await response.json();
      if (!response.ok) {
        throw new Error(resultData.detail || 'Failed to add news item');
      }
      setNews(prev => [resultData, ...prev]);
      setNewMessage(''); 
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the news item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news item?')) {
      return;
    }
    setError(null); 
    try {
      const response = await fetch(`http://localhost:8000/api/flash-news/${id}`, {
        method: 'DELETE',
      });
      const resultData = await response.json();
      if (!response.ok) {
        throw new Error(resultData.detail || 'Failed to delete news item');
      }
      // Remove item from state
      setNews(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting.');
    } finally {
    }
  };
   if (isLoading) {
    return <div className="text-center p-6 text-gray-400">Loading flash news...</div>;
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bell size={24} className="text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Flash News Management</h3>
      </div>

       {/* General Error Display */}
       {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 text-red-400 rounded-xl text-sm">
                <AlertCircle size={16} />
                {error}
            </div>
       )}


      {/* Add News Form */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h4 className="text-md font-semibold text-white">Add New Flash News</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input-field flex-grow" 
            placeholder="Enter news message..."
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddNews(); }} 
          />
          <button
            onClick={handleAddNews}
            disabled={!newMessage.trim() || isSaving}
            className="btn-primary flex-shrink-0" 
          >
             {isSaving ? <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div> : <Save size={16} />}
             {isSaving ? 'Adding...' : 'Add News'}
          </button>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-3">
         {news.length === 0 && !isLoading && (
            <p className="text-gray-500 text-center py-4">No flash news items yet.</p>
         )}
        {news.map((item) => (
          <div key={item.id} className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4">
            <p className="text-white flex-grow min-w-0 break-words">{item.message}</p> 
            <button
              onClick={() => handleDelete(item.id)}
              className="p-2 rounded-lg glass-panel text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
              title="Delete News Item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};