import React, { useState } from 'react';
import { Plus, Trash2, Save, Bell } from 'lucide-react';
import { mockFlashNews, FlashNews } from '../data/flashNewsData';

export const FlashNewsManager: React.FC = () => {
  const [news, setNews] = useState<FlashNews[]>(mockFlashNews);
  const [newMessage, setNewMessage] = useState('');

  const handleAddNews = () => {
    if (!newMessage.trim()) {
      alert('Please enter a news message.');
      return;
    }
    const newEntry: FlashNews = {
      id: Date.now(),
      message: newMessage.trim(),
    };
    const updatedNews = [...news, newEntry];
    setNews(updatedNews);
    mockFlashNews.push(newEntry); // Update the shared mock data
    setNewMessage('');
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this news item?')) {
      const updatedNews = news.filter(item => item.id !== id);
      setNews(updatedNews);
      // Also update the shared mock data
      const indexToDelete = mockFlashNews.findIndex(item => item.id === id);
      if (indexToDelete > -1) {
        mockFlashNews.splice(indexToDelete, 1);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell size={24} className="text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Flash News Management</h3>
      </div>

      {/* Add News Form */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h4 className="text-md font-semibold text-white">Add New Flash News</h4>
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                     focus:neon-border bg-black/30 text-white placeholder-gray-500"
            placeholder="Enter news message..."
          />
          <button
            onClick={handleAddNews}
            disabled={!newMessage}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                     bg-green-600 hover:bg-green-500 text-white transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            Add
          </button>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-3">
        {news.map((item) => (
          <div key={item.id} className="glass-panel rounded-2xl p-4 flex items-center justify-between">
            <p className="text-white">{item.message}</p>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-2 rounded-lg glass-panel text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};