import React, { useState, useEffect } from 'react';
import './FlashNewsTicker.css';
import { Megaphone, ChevronDown, AlertCircle } from 'lucide-react';

// 1. Define the shape of the data coming from our API (matches schemas.py)
interface FlashNews {
  id: number;
  message: string;
}

export const FlashNewsTicker: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // 2. Add state for loading, error, and the news data
  const [news, setNews] = useState<FlashNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Use useEffect to fetch data when the component loads
  useEffect(() => {
    // Fetch data from your FastAPI backend
    fetch('http://localhost:8000/api/flash-news')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: FlashNews[]) => {
        setNews(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch flash news:", err);
        setError("Could not load news. Is the backend server running?");
        setIsLoading(false);
      });
  }, []); // The empty array [] means this runs only once on mount

  // 4. Handle Loading state
  if (isLoading) {
    return (
      <div className="ticker-container">
        <div className="ticker-wrap glass-panel">
          <Megaphone size={20} className="text-gray-500 animate-pulse" />
          <div className="ticker text-gray-400">Loading news...</div>
        </div>
      </div>
    );
  }

  // 5. Handle Error state
  if (error) {
    return (
      <div className="ticker-container">
        <div className="ticker-wrap glass-panel items-center gap-2 !bg-red-500/20 !border-red-500/30 text-red-400">
          <AlertCircle size={20} />
          <div className="ticker">{error}</div>
        </div>
      </div>
    );
  }
  
  // 6. Handle Empty state
  if (news.length === 0) {
    return (
      <div className="ticker-container">
        <div className="ticker-wrap glass-panel">
          <Megaphone size={20} className="text-gray-500 animate-pulse" />
          <div className="ticker text-gray-400">Nothing special buddy !!</div>
        </div>
      </div>
    );
  }

  // 7. Render the data if successful
  const newsItems = news.map(item => item.message).join(' • ');

  return (
    <div className="ticker-container">
      <div className="ticker-wrap">
        <button onClick={() => setIsOpen(!isOpen)} className="ticker-icon">
          <Megaphone size={20} />
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className="ticker">
          <div className="ticker-item">{newsItems}</div>
        </div>
      </div>
      <div className={`news-list ${isOpen ? 'open' : ''}`}>
        {news.map(item => (
          <div key={item.id} className="news-list-item">
            {item.message}
          </div>
        ))}
      </div>
    </div>
  );
};