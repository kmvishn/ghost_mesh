import React, { useState } from 'react';
import { registerUser } from '../apis/api';
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
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !firstName.trim() || !lastName.trim() || !password.trim()) {
      setError('Please fill in all terminal registration fields');
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      await registerUser(email, firstName, lastName, password);
      setSuccess(true);
      setTimeout(() => {
        onRegisterSuccess();
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during terminal registration');
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
            background: 'linear-gradient(90deg, #b92b27, #00f2fe)',
          }
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              letterSpacing: '-0.5px',
              background: 'linear-gradient(90deg, #b92b27, #00f2fe)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            REGISTER TERMINAL
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Initialize your profile on the Ghost Mesh grid
          </Typography>
        </Box>

        {success ? (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              background: 'rgba(0, 242, 254, 0.15)', 
              color: '#00f2fe',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              borderRadius: 2
            }}
          >
            Terminal successfully initialized! Relinking interface...
          </Alert>
        ) : (
          <>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Email Address"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  variant="outlined"
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <EmailOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.4)', mr: 1, fontSize: 20 }} />
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
                  label="First Name"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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
                  label="Last Name"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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
                    background: 'linear-gradient(90deg, #b92b27, #ff5858)',
                    color: 'white',
                    fontWeight: 700,
                    borderRadius: 2,
                    boxShadow: '0 4px 15px rgba(185, 43, 39, 0.25)',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #a3221f, #e54c4c)',
                      boxShadow: '0 4px 20px rgba(185, 43, 39, 0.45)',
                    }
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Initialize Soul'
                  )}
                </Button>
              </Box>
            </form>
          </>
        )}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Already synced?{' '}
            <Link 
              component="button" 
              onClick={onSwitchToLogin}
              sx={{ 
                color: '#00f2fe', 
                fontWeight: 600, 
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline', color: '#4facfe' }
              }}
            >
              Sync Credentials
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
