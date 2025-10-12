import React, { useState } from 'react';
import { mockFlashNews } from '../data/flashNewsData';
import './FlashNewsTicker.css';
import { Megaphone, ChevronDown } from 'lucide-react';

export const FlashNewsTicker: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (mockFlashNews.length === 0) {
    return null;
  }

  const newsItems = mockFlashNews.map(news => news.message).join(' • ');

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
        {mockFlashNews.map(news => (
          <div key={news.id} className="news-list-item">
            {news.message}
          </div>
        ))}
      </div>
    </div>
  );
};