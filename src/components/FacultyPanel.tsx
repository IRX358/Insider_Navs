
import React, { useState } from 'react';
import { FacultyLogin } from './FacultyLogin';
import { FacultyDashboard } from './FacultyDashboard';

export const FacultyPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentFacultyId, setCurrentFacultyId] = useState<number | null>(null);

  const handleLogin = (facultyId: number) => {
    setIsAuthenticated(true);
    setCurrentFacultyId(facultyId);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentFacultyId(null);
  };

  if (!isAuthenticated || currentFacultyId === null) {
    return <FacultyLogin onLogin={handleLogin} />;
  }

  return <FacultyDashboard facultyId={currentFacultyId} onLogout={handleLogout} />;
};