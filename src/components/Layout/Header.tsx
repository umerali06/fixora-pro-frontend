import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle
} from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import LanguageSwitch from '../common/LanguageSwitch';
import { supportedLanguages } from '../../i18n';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, onSidebarToggle }) => {
  const theme = useTheme();
  const { i18n } = useTranslation();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // const user = useAppSelector((state) => state.auth.user);
  
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onSidebarToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          FIXORA PRO
          <Box 
            component="span" 
            sx={{ 
              fontSize: '0.8em', 
              opacity: 0.7,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            {supportedLanguages[i18n.language as keyof typeof supportedLanguages]?.flag || '🌐'}
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {i18n.language.toUpperCase()}
            </Typography>
          </Box>
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LanguageSwitch />
          
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
          >
            <AccountCircle />
          </IconButton>
        </Box>

        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
        >
          <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
          <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
          <MenuItem onClick={handleProfileMenuClose}>Logout</MenuItem>
        </Menu>

        <Menu
          anchorEl={notificationMenuAnchor}
          open={Boolean(notificationMenuAnchor)}
          onClose={handleNotificationMenuClose}
        >
          <MenuItem onClick={handleNotificationMenuClose}>New order received</MenuItem>
          <MenuItem onClick={handleNotificationMenuClose}>Repair completed</MenuItem>
          <MenuItem onClick={handleNotificationMenuClose}>Payment received</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 