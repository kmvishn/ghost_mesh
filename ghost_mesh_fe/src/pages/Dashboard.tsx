import React, { useState, useEffect } from 'react';
import { fetchUserProfile, type UserProfile as UserProfileType } from '../apis/api';
import ChatArena from './ChatArena';
import CharacterHub from './CharacterHub';
import UserProfile from './UserProfile';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  IconButton, 
  Avatar, 
  Divider, 
  useMediaQuery, 
  useTheme 
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';

interface DashboardProps {
  onLogout: () => void;
}

type TabType = 'chat' | 'characters' | 'profile';

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setUserProfile(data);
      } catch (err) {
        console.error('Failed to load profile parameters:', err);
      }
    };
    loadProfile();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { id: 'chat', label: 'Chat Arena', icon: <ChatBubbleOutlineIcon /> },
    { id: 'characters', label: 'AI Characters', icon: <PsychologyIcon /> },
    { id: 'profile', label: 'Profile Settings', icon: <AccountCircleOutlinedIcon /> },
  ];

  const sidebarContent = (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        background: 'rgba(10, 11, 20, 0.95)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        p: 2
      }}
    >
      {/* Title */}
      <Box sx={{ py: 3, px: 2, textAlign: 'center' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 900, 
            letterSpacing: '1px',
            background: 'linear-gradient(90deg, #00f2fe, #b92b27)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          GHOST MESH
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', fontSize: '9px', letterSpacing: 1.5, display: 'block', mt: 0.5 }}>
          Digital Persistence Grid
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', my: 2 }} />

      {/* Nav List */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  setActiveTab(item.id as TabType);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  background: isActive ? 'rgba(0, 242, 254, 0.06)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(0, 242, 254, 0.2)' : 'transparent'}`,
                  color: isActive ? '#00f2fe' : 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: 'white'
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#00f2fe' : 'rgba(255, 255, 255, 0.55)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 500 }}>
                      {item.label}
                    </Typography>
                  } 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', my: 2 }} />

      {/* Operator profile card at bottom */}
      <Box 
        sx={{ 
          p: 2, 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid rgba(255, 255, 255, 0.04)',
          borderRadius: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36, 
              background: 'linear-gradient(135deg, #00f2fe, #b92b27)',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            {userProfile ? userProfile.first_name.charAt(0).toUpperCase() : 'OP'}
          </Avatar>
          <Box sx={{ maxWidth: 110 }}>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userProfile ? `${userProfile.first_name}` : 'Operator'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userProfile ? userProfile.email : 'Connecting...'}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onLogout} sx={{ color: 'rgba(255, 255, 255, 0.4)', '&:hover': { color: '#b92b27' } }}>
          <ExitToAppIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#05060b', overflow: 'hidden' }}>
      {/* Background glow meshes */}
      <div className="bg-glow-spot-1" />
      <div className="bg-glow-spot-2" />

      {/* Mobile Top Menu Bar */}
      {!isDesktop && (
        <Box 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: 56, 
            background: 'rgba(10, 11, 20, 0.8)', 
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            zIndex: theme.zIndex.drawer + 1,
            display: 'flex',
            alignItems: 'center',
            px: 2
          }}
        >
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white', mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', fontSize: '1rem', letterSpacing: 0.5 }}>
            GHOST MESH
          </Typography>
        </Box>
      )}

      {/* Sidebar Navigation */}
      {isDesktop ? (
        <Box sx={{ width: 280, flexShrink: 0, height: '100vh' }}>
          {sidebarContent}
        </Box>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 280,
              background: 'transparent',
              borderRight: 'none'
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Central Screen Panel */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 4, 
          height: '100vh',
          overflowY: 'auto',
          pt: isDesktop ? 4 : 11
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {activeTab === 'chat' && <ChatArena />}
          {activeTab === 'characters' && <CharacterHub />}
          {activeTab === 'profile' && <UserProfile />}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
