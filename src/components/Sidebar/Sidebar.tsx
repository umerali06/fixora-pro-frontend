import React from 'react';
import {
  Box,
  Button,
  Typography,
  Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Receipt as ReceiptIcon,
  Public as PublicIcon,
  Apps as AppsIcon,
  Settings as SettingsIcon,
  Build as BuildIcon
} from '@mui/icons-material';

interface SidebarItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface SidebarProps {
  activeKey: string;
  onItemClick: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeKey, onItemClick }) => {
  const { t } = useTranslation();
  const navigationItems: SidebarItem[] = [
    { key: 'dashboard', label: t('navigation.dashboard'), icon: DashboardIcon },
    { key: 'jobs', label: t('navigation.jobs'), icon: WorkIcon },
    { key: 'contacts', label: t('navigation.contacts'), icon: PeopleIcon },
    { key: 'stock', label: t('navigation.stock'), icon: InventoryIcon },
    { key: 'services', label: t('navigation.services'), icon: AssignmentIcon },
    { key: 'invoices', label: t('navigation.invoices'), icon: ReceiptIcon },
    { key: 'repair-tracking', label: t('navigation.repairTracking'), icon: PublicIcon, badge: t('common.new') },
    { key: 'apps', label: t('navigation.apps'), icon: AppsIcon },
    { key: 'settings', label: t('navigation.settings'), icon: SettingsIcon },
  ];

  const footerItem: SidebarItem = {
    key: 'my-repaircms',
    label: t('navigation.myRepairCMS'),
    icon: BuildIcon,
  };

  // Get current date and time
  const now = new Date();
  const dateString = now.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  const timeString = now.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  return (
    <Box
      component="nav"
      sx={{
        width: 280,
        height: '100vh',
        backgroundColor: '#343A40',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #495057',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
        overflow: 'hidden',
        '& .sidebar-icon': {
          fontSize: '20px',
          marginBottom: '8px'
        }
      }}
      aria-label="Primary"
    >
      {/* Logo and Welcome Section */}
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        flexShrink: 0,
        borderBottom: '1px solid #495057'
      }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            backgroundColor: '#2F80ED',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            mb: 2
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '24px'
            }}
          >
            C
          </Typography>
        </Box>
        
        <Typography
          variant="body1"
          sx={{
            color: 'white',
            fontWeight: 500,
            textAlign: 'center',
            mb: 1
          }}
        >
          Welcome CompuStore
        </Typography>
        
        <Typography
          variant="caption"
          sx={{
            color: '#ADB5BD',
            textAlign: 'center',
            fontSize: '12px'
          }}
        >
          {dateString} {timeString}
        </Typography>
      </Box>

      {/* Navigation Items - Scrollable */}
      <Box sx={{ 
        flex: 1, 
        px: 2, 
        py: 3,
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#495057'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#6C757D',
          borderRadius: '3px'
        }
      }}>
        {navigationItems.map((item) => {
          const isActive = activeKey === item.key;
          const IconComponent = item.icon;
          
          return (
            <Button
              key={item.key}
              onClick={() => onItemClick(item.key)}
              sx={{
                width: '100%',
                minHeight: 64,
                height: 'auto',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.2s ease-in-out',
                backgroundColor: isActive ? '#E0F2F7' : 'transparent',
                color: isActive ? '#2F80ED' : 'white',
                py: 1.5,
                px: 1,
                '&:hover': {
                  backgroundColor: isActive ? '#E0F2F7' : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#2F80ED' : '#E5EAF3'
                },
                '&:focus': {
                  outline: 'none',
                  outlineOffset: 2,
                  outlineColor: '#2F80ED'
                }
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <IconComponent className="sidebar-icon" />
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  letterSpacing: '0.025em',
                  lineHeight: 1.2,
                  textAlign: 'center',
                  wordBreak: 'keep-all',
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  px: 0.5
                }}
              >
                {item.label}
              </Typography>
              
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    position: 'absolute',
                    right: -4,
                    top: '50%',
                    transform: 'translateY(-50%) translateX(50%)',
                    backgroundColor: '#D900FF',
                    color: 'white',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    height: 18,
                    '& .MuiChip-label': {
                      px: 0.75,
                      py: 0.25
                    }
                  }}
                />
              )}
            </Button>
          );
        })}
      </Box>

      {/* Footer Item */}
      <Box sx={{ 
        px: 2, 
        pb: 3,
        flexShrink: 0
      }}>
        <Button
          onClick={() => onItemClick(footerItem.key)}
          sx={{
            width: '100%',
            minHeight: 64,
            height: 'auto',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease-in-out',
            backgroundColor: activeKey === footerItem.key ? '#E0F2F7' : 'transparent',
            color: activeKey === footerItem.key ? '#2F80ED' : 'white',
            py: 1.5,
            px: 1,
            '&:hover': {
              backgroundColor: activeKey === footerItem.key ? '#E0F2F7' : 'rgba(255,255,255,0.08)',
              color: activeKey === footerItem.key ? '#2F80ED' : '#E5EAF3'
            },
            '&:focus': {
              outline: 'none',
              outlineOffset: 2,
              outlineColor: '#2F80ED'
            }
          }}
          aria-current={activeKey === footerItem.key ? 'page' : undefined}
        >
          <footerItem.icon className="sidebar-icon" />
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              letterSpacing: '0.025em',
              lineHeight: 1.2,
              textAlign: 'center',
              wordBreak: 'keep-all',
              maxWidth: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              px: 0.5
            }}
          >
            {footerItem.label}
          </Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
