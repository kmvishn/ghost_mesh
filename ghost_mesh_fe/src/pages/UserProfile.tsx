import React, { useState, useEffect } from 'react';
import { fetchUserProfile, changeUserPassword, type UserProfile as UserProfileType } from '../apis/api';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress, 
  Grid, 
  Divider 
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setProfile(data);
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : 'Failed to retrieve terminal profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setPassError('All password fields are required');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setPassError('New passwords do not match');
      return;
    }

    setPassLoading(true);
    try {
      await changeUserPassword(currentPassword, newPassword, newPasswordConfirm);
      setPassSuccess('Terminal credentials updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err) {
      setPassError(err instanceof Error ? err.message : 'Failed to update credentials');
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: '#00f2fe' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 800, 
          letterSpacing: '-0.5px',
          mb: 3, 
          background: 'linear-gradient(90deg, #00f2fe, #b92b27)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        TERMINAL PROFILE
      </Typography>

      {profileError && (
        <Alert severity="error" sx={{ mb: 3, background: 'rgba(185, 43, 39, 0.1)', color: '#ff6b6b' }}>
          {profileError}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Column: User details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper 
            className="glass-panel" 
            sx={{ 
              p: 4, 
              background: 'rgba(16, 20, 35, 0.4)', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 3,
              height: '100%'
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <AccountCircleIcon sx={{ fontSize: 48, color: '#00f2fe' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                  {profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown Operator'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  Grid Operator Profile
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Operator ID
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                  {profile?.id || 'N/A'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Registered Email
                </Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {profile?.email || 'N/A'}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mt={2} sx={{ color: 'rgba(0, 242, 254, 0.7)' }}>
                <ShieldIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Connection Security Level: Standard JWT Encrypted
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Password security */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper 
            className="glass-panel" 
            sx={{ 
              p: 4, 
              background: 'rgba(16, 20, 35, 0.4)', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 3
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <LockIcon sx={{ fontSize: 32, color: '#b92b27' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                SYNC CREDENTIALS
              </Typography>
            </Box>

            {passError && (
              <Alert severity="error" sx={{ mb: 2, background: 'rgba(185, 43, 39, 0.15)', color: '#ff6b6b' }}>
                {passError}
              </Alert>
            )}

            {passSuccess && (
              <Alert severity="success" sx={{ mb: 2, background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe' }}>
                {passSuccess}
              </Alert>
            )}

            <form onSubmit={handlePasswordChange}>
              <Box display="flex" flexDirection="column" gap={2.5}>
                <TextField
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 2,
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                      '&:hover fieldset': { borderColor: 'rgba(0, 242, 254, 0.3)' },
                      '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#00f2fe' },
                  }}
                />

                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 2,
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                      '&:hover fieldset': { borderColor: 'rgba(0, 242, 254, 0.3)' },
                      '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#00f2fe' },
                  }}
                />

                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 2,
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                      '&:hover fieldset': { borderColor: 'rgba(0, 242, 254, 0.3)' },
                      '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#00f2fe' },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={passLoading}
                  sx={{
                    py: 1.2,
                    background: 'linear-gradient(90deg, #b92b27, #ff5858)',
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #a3221f, #e54c4c)',
                    }
                  }}
                >
                  {passLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Update Code'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile;
