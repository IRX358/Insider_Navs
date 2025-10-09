import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    <div 
      className="relative glass-panel rounded-2xl p-1 w-full"
      role="tablist"
      aria-label="Navigation tabs"
    >
      <div 
        className="absolute top-1 bottom-1 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl transition-all duration-300 ease-out neon-glow"
        style={{
          left: `${(options.findIndex(opt => opt.value === value) * 100) / options.length}%`,
          width: `${100 / options.length}%`,
        }}
      />
      
      <div className="grid grid-cols-2 gap-0">
        {options.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;
        
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${option.value}-panel`}
            className={`
              relative z-10 flex items-center justify-center gap-2 py-3 px-2 rounded-xl
              font-medium text-sm transition-colors duration-300 whitespace-nowrap
              ${isActive 
                ? 'text-white' 
                : 'text-gray-400 hover:text-gray-300'
              }
            `}
            onClick={() => onChange(option.value)}
          >
            <Icon size={18} />
            <span>{option.label}</span>
          </button>
        );
        })}
      </div>
    </div>
  );
};