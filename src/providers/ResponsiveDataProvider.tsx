import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { useAppSelector } from '../store/hooks';

interface ResponsiveDataContextType {
  isConnected: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  reconnect: () => void;
  refreshAll: () => void;
}

const ResponsiveDataContext = createContext<ResponsiveDataContextType | undefined>(undefined);

interface ResponsiveDataProviderProps {
  children: ReactNode;
}

export const ResponsiveDataProvider: React.FC<ResponsiveDataProviderProps> = ({ children }) => {
  const theme = useTheme();
  const { token } = useAppSelector((state) => state.auth);
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  // Connection state
  const [isConnected] = useState(false);
  const [connectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');

  // Initialize real-time connection
  useEffect(() => {
    // Temporarily disable real-time connection to prevent errors
    // if (!token) return;

    // const initConnection = async () => {
    //   try {
    //     setConnectionStatus('connecting');
    //     await realTimeService.connect();
    //     setIsConnected(true);
    //     setConnectionStatus('connected');
    //   } catch (error) {
    //     console.error('Failed to establish real-time connection:', error);
    //     setConnectionStatus('error');
    //     setIsConnected(false);
    //   }
    // };

    // initConnection();

    // return () => {
    //   realTimeService.disconnect();
    // };
  }, [token]);

  // Monitor connection status
  useEffect(() => {
    // Temporarily disable connection monitoring
    // const checkConnection = () => {
    //   const status = realTimeService.isConnected();
    //   setIsConnected(status);
    //   setConnectionStatus(status ? 'connected' : 'disconnected');
    // };

    // const interval = setInterval(checkConnection, 5000);
    // return () => clearInterval(interval);
  }, []);

  // Reconnect function
  const reconnect = async () => {
    // Temporarily disabled
    console.log('Reconnect function disabled temporarily');
    // try {
    //   setConnectionStatus('connecting');
    //   await realTimeService.connect();
    //   setIsConnected(true);
    //   setConnectionStatus('connected');
    // } catch (error) {
    //   console.error('Reconnection failed:', error);
    //   setConnectionStatus('error');
    //   setIsConnected(false);
    // }
  };

  // Refresh all data
  const refreshAll = () => {
    // This would trigger refresh of all data across the app
    window.location.reload();
  };

  const value: ResponsiveDataContextType = {
    isConnected,
    isMobile,
    isTablet,
    isDesktop,
    connectionStatus,
    reconnect,
    refreshAll
  };

  return (
    <ResponsiveDataContext.Provider value={value}>
      {children}
    </ResponsiveDataContext.Provider>
  );
};

export const useResponsiveData = () => {
  const context = useContext(ResponsiveDataContext);
  if (context === undefined) {
    throw new Error('useResponsiveData must be used within a ResponsiveDataProvider');
  }
  return context;
};
