import React, { useState } from 'react';
import { LogIn, User, AlertCircle } from 'lucide-react';

interface FacultyLoginProps {
  onLogin: (facultyId: number) => void;
}
export const FacultyLogin: React.FC<FacultyLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/faculty/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.toLowerCase().trim() }), 
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLogin(data.faculty_id); 
      } else {
        setError(data.message || 'Login failed. Please check your username.');
      }
    } catch (err) {
      console.error('Faculty login error:', err);
      setError('Could not connect to the server. Please check if it is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-8 space-y-6">
      {/* ... header ... */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 neon-glow">
          <LogIn size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Faculty Profile Access</h2>
        <p className="text-gray-400 text-sm">Enter your Unique UserId to edit profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
       {/* ... username input ... */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User size={16} className="inline mr-2" />
            Unique UserId
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent
                     focus:neon-border bg-black/30 text-white placeholder-gray-500
                     transition-all duration-300"
            placeholder="Innavs UserId"
            required
          />
        </div>

        {/* ... error display ... */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 text-red-400 rounded-xl text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* ... submit button ... */}
         <button
          type="submit"
          disabled={isLoading || !username}
          className={`
            w-full py-4 px-6 rounded-2xl font-medium text-white
            transition-all duration-300 flex items-center justify-center gap-3
            ${(isLoading || !username)
              ? 'bg-gray-700 cursor-not-allowed opacity-50'
              : 'neon-border bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400'
            }
          `}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn size={20} />
          )}
          {isLoading ? 'Logging In...' : 'Login'}
        </button>
      </form>
      {/* ... footer ... */}
       <div className="text-center pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Forgot unique UserId ? Contact Admins
        </p>
      </div>
    </div>
  );
};