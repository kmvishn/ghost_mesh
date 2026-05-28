import { useState, useEffect } from 'react';
import './App.css';
import LoginIn from './pages/LoginIn';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { CircularProgress, Box } from '@mui/material';
import { checkAuthStatus } from './apis/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuthenticated = await checkAuthStatus();
        setIsLoggedIn(isAuthenticated);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Clear the token from cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ background: '#05060b' }}
      >
        <CircularProgress sx={{ color: '#00f2fe' }} />
      </Box>
    );
  }

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#05060b',
        px: 3,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background glow meshes */}
      <div className="bg-glow-spot-1" />
      <div className="bg-glow-spot-2" />

      {isRegisterMode ? (
        <Register 
          onRegisterSuccess={() => setIsRegisterMode(false)} 
          onSwitchToLogin={() => setIsRegisterMode(false)} 
        />
      ) : (
        <LoginIn 
          onLoginSuccess={handleLoginSuccess} 
          onSwitchToRegister={() => setIsRegisterMode(true)} 
        />
      )}
    </Box>
  );
}

export default App;
