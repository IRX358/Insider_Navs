import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  subtitle: string;
  type: 'location' | 'faculty';
}

interface SearchableDropdownProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-3">
        {label}
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleToggle}
          className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                   focus:neon-border bg-black/30 text-white placeholder-gray-500 
                   transition-all duration-300 flex items-center justify-between"
        >
          <span className={selectedOption ? 'text-white' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 dropdown-panel rounded-xl shadow-2xl z-50 max-h-64 overflow-hidden">
            <div className="p-3 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 glass-panel rounded-lg border-2 border-transparent 
                           focus:neon-border bg-black/30 text-white placeholder-gray-500"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-purple-500/20 transition-colors border-b border-gray-700/30 last:border-b-0 ${
                      option.id === value ? 'bg-purple-500/20 text-purple-300' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-400">{option.subtitle}</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-400 text-center">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};