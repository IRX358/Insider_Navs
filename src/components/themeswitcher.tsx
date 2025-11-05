import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeSwitcherProps {
  theme: string;
  toggleTheme: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 rounded-full bg-white/60 dark:bg-black/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 transition-all duration-300"
      title="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};
