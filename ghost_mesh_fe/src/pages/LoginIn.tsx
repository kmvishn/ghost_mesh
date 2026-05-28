import React, { useState } from 'react';
import { login } from '../apis/auth';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Link
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

interface LoginInProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

const LoginIn: React.FC<LoginInProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        onLoginSuccess();
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Paper
        elevation={0}
        className="glass-panel"
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 420,
          background: 'rgba(13, 16, 27, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 242, 254, 0.05)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #00f2fe, #b92b27)',
          }
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              letterSpacing: '-0.5px',
              background: 'linear-gradient(90deg, #00f2fe, #b92b27)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            GHOST MESH
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Re-establish contact with the digital net
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              background: 'rgba(185, 43, 39, 0.15)', 
              color: '#ff6b6b',
              border: '1px solid rgba(185, 43, 39, 0.3)',
              borderRadius: 2
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email/Username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              variant="outlined"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <AccountCircleOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.4)', mr: 1, fontSize: 20 }} />
                  ),
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 2,
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 242, 254, 0.4)' },
                  '&.Mui-focused fieldset': { 
                    borderColor: '#00f2fe',
                    boxShadow: '0 0 10px rgba(0, 242, 254, 0.2)'
                  },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#00f2fe' },
              }}
            />

            <TextField
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              variant="outlined"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <LockOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.4)', mr: 1, fontSize: 20 }} />
                  ),
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 2,
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 242, 254, 0.4)' },
                  '&.Mui-focused fieldset': { 
                    borderColor: '#00f2fe',
                    boxShadow: '0 0 10px rgba(0, 242, 254, 0.2)'
                  },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#00f2fe' },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(90deg, #00f2fe, #4facfe)',
                color: '#070913',
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: '0 4px 15px rgba(0, 242, 254, 0.25)',
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(90deg, #05d3de, #3e9ae6)',
                  boxShadow: '0 4px 20px rgba(0, 242, 254, 0.45)',
                }
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: '#070913' }} />
              ) : (
                'Sync Interface'
              )}
            </Button>
          </Box>
        </form>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            No terminal endpoint?{' '}
            <Link 
              component="button" 
              onClick={onSwitchToRegister}
              sx={{ 
                color: '#00f2fe', 
                fontWeight: 600, 
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline', color: '#4facfe' }
              }}
            >
              Register Terminal
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginIn;
