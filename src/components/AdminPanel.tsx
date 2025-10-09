import React, { useState } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
};