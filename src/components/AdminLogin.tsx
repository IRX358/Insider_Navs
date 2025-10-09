import React, { useState } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';
import { adminCredentials } from '../data/adminCredentials';

interface AdminLoginProps {
  onLogin: (username: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      const admin = adminCredentials.find(
        admin => admin.username === username && admin.password === password
      );

      if (admin) {
        onLogin(username);
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="glass-panel rounded-2xl p-8 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 neon-glow">
          <Lock size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
        <p className="text-gray-400 text-sm">Enter your credentials to access the admin panel</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User size={16} className="inline mr-2" />
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && password) {
                handleSubmit(e);
              }
            }}
            className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                     focus:neon-border bg-black/30 text-white placeholder-gray-500 
                     transition-all duration-300"
            placeholder="Enter username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Lock size={16} className="inline mr-2" />
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && username) {
                handleSubmit(e);
              }
            }}
            className="w-full px-4 py-3 glass-panel rounded-xl border-2 border-transparent 
                     focus:neon-border bg-black/30 text-white placeholder-gray-500 
                     transition-all duration-300"
            placeholder="Enter password"
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 text-red-400 rounded-xl text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !username || !password}
          className={`
            w-full py-4 px-6 rounded-2xl font-medium text-white
            transition-all duration-300 flex items-center justify-center gap-3
            ${(isLoading || !username || !password)
              ? 'bg-gray-700 cursor-not-allowed opacity-50'
              : 'neon-border bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400'
            }
          `}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Lock size={20} />
          )}
          {isLoading ? 'Authenticating...' : 'Login'}
        </button>
      </form>

      <div className="text-center pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Contact IR if u need admin credentials
        </p>
      </div>
    </div>
  );
};