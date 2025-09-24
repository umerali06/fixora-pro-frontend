import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Badge,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  PointOfSale as POSIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Language as LanguageIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Assessment as AssessmentIcon,
  MiscellaneousServices as MiscellaneousServicesIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Notifications,
  Apps as AppsIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { useTranslation } from 'react-i18next';

import { logout } from '../../store/slices/authSlice';
import { setLanguage } from '../../store/slices/uiSlice';
import Logo from '../common/Logo';

const drawerWidth = 240;
const mobileDrawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const { language } = useAppSelector((state) => state.ui);

  const menuItems = [
    { text: t('navigation.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { text: t('navigation.tickets'), icon: <BuildIcon />, path: '/tickets' },
    { text: t('navigation.customers'), icon: <PeopleIcon />, path: '/customers' },
    { text: t('navigation.devices'), icon: <PhoneAndroidIcon />, path: '/devices' },
    { text: t('navigation.inventory'), icon: <InventoryIcon />, path: '/inventory' },
    { text: t('navigation.pos'), icon: <POSIcon />, path: '/pos' },
    { text: t('navigation.invoices'), icon: <ReceiptIcon />, path: '/invoices' },
    { text: t('navigation.repairTracking'), icon: <PublicIcon />, path: '/repair-tracking' },
    { text: t('navigation.apps'), icon: <AppsIcon />, path: '/apps', badge: 'New' },
    { text: t('navigation.settings'), icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'de' : 'en';
    dispatch(setLanguage(newLanguage));
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const menuItem = menuItems.find(item => item.path === path);
    return menuItem ? menuItem.text : t('navigation.dashboard');
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        py: 0, 
        px: { xs: 1, sm: 2 }, 
        minHeight: '64px !important', 
        height: '64px' 
      }}>
        <Logo 
          size="medium" 
          variant="circular" 
          sx={{ 
            mr: { xs: 1.5, sm: 2 },
            width: { xs: 40, sm: 50 },
            height: { xs: 40, sm: 50 }
          }} 
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}
          >
            FIXORA
          </Typography>
          <Typography 
            variant="caption" 
            noWrap 
            component="div" 
            sx={{ 
              fontWeight: 500, 
              color: 'primary.main', 
              lineHeight: 1,
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}
          >
            PRO
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: { xs: 1, sm: 0 } }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                minHeight: { xs: 44, sm: 48 },
                px: { xs: 1, sm: 2 },
                borderRadius: { xs: 1, sm: 0 },
                mx: { xs: 0.5, sm: 0 },
                mb: { xs: 0.5, sm: 0 },
                backgroundColor: location.pathname === item.path ? 'primary.main' : 'transparent',
                color: location.pathname === item.path ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: location.pathname === item.path ? 'primary.dark' : 'action.hover',
                }
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: { xs: 40, sm: 56 },
                  color: location.pathname === item.path ? 'white' : 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}
              />
              {item.badge && (
                <Chip 
                  label={item.badge} 
                  size="small" 
                  color="secondary"
                  sx={{ 
                    ml: 1,
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List sx={{ px: { xs: 1, sm: 0 } }}>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={toggleLanguage}
            sx={{
              minHeight: { xs: 44, sm: 48 },
              px: { xs: 1, sm: 2 },
              borderRadius: { xs: 1, sm: 0 },
              mx: { xs: 0.5, sm: 0 },
              mb: { xs: 0.5, sm: 0 }
            }}
          >
            <ListItemIcon sx={{ minWidth: { xs: 40, sm: 56 } }}>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText 
              primary={language === 'en' ? 'Deutsch' : 'English'}
              primaryTypographyProps={{
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              minHeight: { xs: 44, sm: 48 },
              px: { xs: 1, sm: 2 },
              borderRadius: { xs: 1, sm: 0 },
              mx: { xs: 0.5, sm: 0 },
              mb: { xs: 0.5, sm: 0 }
            }}
          >
            <ListItemIcon sx={{ minWidth: { xs: 40, sm: 56 } }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary={t('navigation.logout')}
              primaryTypographyProps={{
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  // Check if we're on the dashboard page
  const isDashboard = location.pathname === '/dashboard';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#f5f5f5',
          color: '#333',
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0',
          display: 'none' // Hide the default header since we have custom header in dashboard
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', height: '64px' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Left side - Back button and title */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
            <IconButton sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                color: '#333'
              }}
            >
              Media Player
            </Typography>
          </Box>

          {/* Center - Welcome message and search */}
          <Box sx={{ 
            display: { xs: 'none', lg: 'flex' }, 
            alignItems: 'center', 
            gap: 3,
            flex: 1,
            justifyContent: 'center'
          }}>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Welcome {user?.firstName || 'User'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: 'white',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              minWidth: 300
            }}>
              <SearchIcon sx={{ color: '#999', mr: 1 }} />
              <Typography variant="body2" sx={{ color: '#999' }}>
                Global Search
              </Typography>
            </Box>
          </Box>

          {/* Right side - Actions and user */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton>
              <PlayIcon />
            </IconButton>
            <IconButton>
              <AddIcon />
            </IconButton>
            <IconButton>
              <FilterIcon />
            </IconButton>
            <IconButton>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.firstName?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                  {user?.firstName || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {user?.lastName || 'Name'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ 
          width: { md: isDashboard ? 0 : drawerWidth }, 
          flexShrink: { md: 0 },
          display: isDashboard ? 'none' : 'block'
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: isDashboard ? 'none' : 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: mobileDrawerWidth,
              maxWidth: '80vw',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: isDashboard ? 'none' : 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              position: 'relative',
              whiteSpace: 'nowrap',
              backgroundColor: '#1e3a8a',
              borderRight: '1px solid #e0e0e0'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { 
            xs: '100%', 
            md: isDashboard ? '100%' : `calc(100% - ${drawerWidth}px)` 
          },
          minWidth: 0,
          mt: isDashboard ? 0 : '64px',
          overflow: 'auto',
          maxHeight: isDashboard ? '100vh' : 'calc(100vh - 64px)',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Box sx={{ 
          width: '100%', 
          maxWidth: '100%', 
          overflow: 'hidden' 
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 