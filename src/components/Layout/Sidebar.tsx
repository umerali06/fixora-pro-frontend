import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon,
  TrackChanges as TrackChangesIcon,
  Apps as AppsIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Language as LanguageIcon,
  Assessment as AssessmentIcon,
  Tune as ConfigurationIcon,
  Widgets as BookingIcon,
  Label as LabelIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../i18n';
import { PermissionGate } from '../PermissionGate';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: 'persistent' | 'temporary';
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageMenuAnchor(null);
  };

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      
      // Update document direction for RTL languages
      if (['ar', 'he', 'fa'].includes(languageCode)) {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
      
      handleLanguageClose();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon, active: location.pathname === '/dashboard', permission: 'dashboard:read' },
    { path: '/jobs', label: 'Jobs', icon: WorkIcon, active: location.pathname === '/jobs', permission: 'repairs:read' },
    { path: '/customers', label: 'Customers', icon: PeopleIcon, active: location.pathname === '/customers', permission: 'customers:read' },
    { path: '/technicians', label: 'Technicians', icon: BuildIcon, active: location.pathname === '/technicians', permission: 'users:read' },
    { path: '/contacts', label: 'Contacts', icon: PeopleIcon, active: location.pathname === '/contacts', permission: 'customers:read' },
    { path: '/stock', label: 'Stock', icon: InventoryIcon, active: location.pathname === '/stock', permission: 'inventory:read' },
    { path: '/services', label: 'Services', icon: BuildIcon, active: location.pathname === '/services', permission: 'repairs:read' },
    { path: '/invoices', label: 'Invoices', icon: ReceiptIcon, active: location.pathname === '/invoices', permission: 'invoices:read' },
    { path: '/refunds', label: 'Refunds', icon: ReceiptIcon, active: location.pathname === '/refunds', permission: 'invoices:read' },
    { path: '/warranties', label: 'Warranties', icon: BuildIcon, active: location.pathname === '/warranties', permission: 'repairs:read' },
    { path: '/expenses', label: 'Expenses', icon: ReceiptIcon, active: location.pathname === '/expenses', permission: 'reports:read' },
    { path: '/repair-tracking', label: 'Repair Tracking', icon: TrackChangesIcon, active: location.pathname === '/repair-tracking', permission: 'repairs:read' },
    { path: '/reports', label: 'Reports', icon: AssessmentIcon, active: location.pathname === '/reports', permission: 'reports:read' },
    { path: '/admin', label: 'Admin', icon: BusinessIcon, active: location.pathname === '/admin', permission: 'users:read' },
    { path: '/apps', label: 'Apps', icon: AppsIcon, active: location.pathname === '/apps', hasNewBadge: true, permission: 'dashboard:read' },
    { path: '/booking-widgets', label: 'Booking', icon: BookingIcon, active: location.pathname === '/booking-widgets', permission: 'settings:write' },
    { path: '/labels', label: 'Labels', icon: LabelIcon, active: location.pathname === '/labels', permission: 'inventory:write' },
    { path: '/configuration', label: 'Configuration', icon: ConfigurationIcon, active: location.pathname === '/configuration', permission: 'settings:write' },
    { path: '/settings', label: 'Settings', icon: SettingsIcon, active: location.pathname === '/settings', permission: 'settings:read' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  return (
    <Box
      sx={{
        width: '85px', // Fixed slim width
        height: '100vh',
        background: 'linear-gradient(180deg, #2f3a53 0%, #2a344a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '2px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(255, 255, 255, 0.4)',
        }
      }}
    >
      {/* Top Brand Badge */}
      <Box sx={{ 
        mt: 3, 
        mb: 2,
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3bb2ff 0%, #6a6bff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(59, 178, 255, 0.3)'
      }}>
        <BusinessIcon sx={{ color: 'white', fontSize: '24px' }} />
      </Box>

      {/* First Separator */}
      <Divider sx={{ 
        width: '60px', 
        backgroundColor: '#3a4661',
        height: '1px',
        mb: 2
      }} />


      {/* Navigation Items */}
      <List sx={{ 
        width: '100%', 
        p: 0, 
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {navigationItems.map((item) => {
          return (
            <PermissionGate key={item.path} permission={item.permission}>
              <ListItem sx={{ p: 0, mb: 1, width: '100%' }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    minHeight: 'auto',
                    py: 1.5,
                    px: 0,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
              {/* New Badge for Apps */}
              {item.hasNewBadge && (
                <Box sx={{
                  position: 'absolute',
                  top: '2px',
                  right: '8px',
                  backgroundColor: '#ff2db8',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 600,
                  px: 1,
                  py: 0.5,
                  borderRadius: '8px',
                  lineHeight: 1,
                  zIndex: 1
                }}>
                  New
                </Box>
              )}

              {/* Active State Pill Background */}
              {item.active && (
                <Box sx={{
                  position: 'absolute',
                  left: '8px',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '32px',
                  background: 'linear-gradient(90deg, #3bb2ff 0%, #6a6bff 100%)',
                  borderRadius: '16px',
                  zIndex: 0
                }} />
              )}

              {/* Icon */}
              <ListItemIcon sx={{
                minWidth: 'auto',
                mb: 0.5,
                zIndex: 1,
                color: item.active ? 'white' : '#cdd7e6'
              }}>
                <item.icon sx={{ fontSize: '26px' }} />
              </ListItemIcon>

              {/* Label */}
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: item.active ? 'white' : '#9aa7be',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      zIndex: 1,
                      position: 'relative'
                    }}
                  >
                    {item.label}
                  </Typography>
                }
                sx={{ 
                  m: 0, 
                  textAlign: 'center',
                  '& .MuiListItemText-primary': { margin: 0 }
                }}
              />
            </ListItemButton>
            </ListItem>
          </PermissionGate>
          );
        })}
      </List>

      {/* Second Separator */}
      <Divider sx={{ 
        width: '60px', 
        backgroundColor: '#3a4661',
        height: '1px',
        mb: 2
      }} />

      {/* Language Switch */}
      <Box 
        onClick={handleLanguageClick}
        sx={{ 
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8
          }
        }}
      >
        <LanguageIcon sx={{ 
          color: '#9aa7be', 
          fontSize: '20px',
          mb: 0.5
        }} />
        <Typography sx={{
          fontSize: '10px',
          color: '#9aa7be',
          textAlign: 'center',
          lineHeight: 1.2
        }}>
          {i18n.language === 'en' ? 'EN' : i18n.language === 'de' ? 'DE' : i18n.language.toUpperCase()}
        </Typography>
      </Box>

      {/* Language Selection Menu */}
      <Menu
        anchorEl={languageMenuAnchor}
        open={Boolean(languageMenuAnchor)}
        onClose={handleLanguageClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            maxHeight: 400,
            overflow: 'auto',
            backgroundColor: '#2f3a53',
            border: '1px solid #3a4661',
            '& .MuiMenuItem-root': {
              color: '#cdd7e6',
              '&:hover': {
                backgroundColor: '#3a4661',
              },
              '&.Mui-selected': {
                backgroundColor: '#3bb2ff',
                color: 'white',
              },
            },
          },
        }}
      >
        {Object.entries(supportedLanguages).map(([code, lang]) => (
          <MenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            selected={code === i18n.language}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6">{lang.flag}</Typography>
              <Typography variant="body2">{lang.nativeName}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Footer Link */}
      <Box sx={{ 
        mb: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.8
        }
      }}>
        <BusinessIcon sx={{ 
          color: '#9aa7be', 
          fontSize: '20px',
          mb: 0.5
        }} />
        <Typography sx={{
          fontSize: '10px',
          color: '#9aa7be',
          textAlign: 'center',
          lineHeight: 1.2
        }}>
          My RepairCMS
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar; 
