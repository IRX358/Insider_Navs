import React, { useState, useEffect } from 'react';
import { LogoLoader } from './components/LogoLoader';
import { AppShell } from './components/AppShell';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Logo loader duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LogoLoader />;
  }

  return <AppShell />;
}

export default App;