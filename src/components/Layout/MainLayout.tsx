import React, { useState } from 'react';
import { Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useNotificationPolling } from '../../hooks/useNotificationPolling';
import { startNotificationGenerator } from '../../services/notificationGenerator';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Start notification polling
  useNotificationPolling(30000); // Poll every 30 seconds

  // Start notification generator for testing (remove in production)
  React.useEffect(() => {
    const stopGenerator = startNotificationGenerator(60000); // Generate every minute
    return stopGenerator;
  }, []);

  // Auto-open sidebar on desktop, keep closed on mobile/tablet
  React.useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  };

  // Pass sidebar state to children
  const sidebarContext = {
    sidebarOpen,
    handleSidebarToggle,
    handleSidebarClose
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', position: 'relative' }}>
      <CssBaseline />
      

      
      {/* Sidebar - Fixed Position */}
      <Box sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 1200,
        display: { xs: 'block', sm: 'block', md: 'block' },
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: theme.transitions.create(['transform'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        })
      }}>
        <Sidebar 
          open={sidebarOpen}
          onClose={handleSidebarClose}
          variant={isMobile ? 'temporary' : 'persistent'}
        />
      </Box>

      {/* Mobile Overlay */}
      {sidebarOpen && (isMobile || isTablet) && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1100,
            display: { xs: 'block', sm: 'block', md: 'none' }
          }}
          onClick={handleSidebarClose}
        />
      )}
      
      {/* Main Content - Full Width */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: {
            xs: 0,
            sm: 0,
            md: sidebarOpen ? '85px' : 0,
            lg: sidebarOpen ? '85px' : 0,
            xl: sidebarOpen ? '85px' : 0
          },
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          width: '100%',
          maxWidth: '100%',
          position: 'relative'
        }}
      >
        {/* Background Container - Extends beyond viewport */}
        <Box sx={{ 
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#EEF3FB',
          position: 'relative',
          backgroundAttachment: 'fixed'
        }}>
          <Outlet context={sidebarContext} />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;


