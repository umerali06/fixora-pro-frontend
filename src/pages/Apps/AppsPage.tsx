import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  useTheme,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Snackbar
} from '@mui/material';
import {
  Apps as AppsIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  PhoneAndroid as PhoneIcon,
  PointOfSale as POSIcon,
  ConfirmationNumber as TicketIcon,
  Timeline as TimelineIcon,
  Build as BuildIcon,
  Launch as LaunchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  IntegrationInstructions as IntegrationIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { appsAPI, AppModule as APIAppModule } from '../../services/appsAPI';

interface AppModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive' | 'coming_soon' | 'beta';
  category: 'core' | 'business' | 'tools' | 'integrations';
  features: string[];
  version: string;
  usage: number; // Usage percentage
  lastUpdated: string;
  developer: string;
  isInstalled: boolean;
  isConfigured: boolean;
  route?: string; // Navigation route
  permissions?: string[]; // Required permissions
  settings?: any; // App-specific settings
}

const AppsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'lastUpdated'>('name');
  const [installingApp, setInstallingApp] = useState<string | null>(null);
  const [configuringApp, setConfiguringApp] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppModule | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [appModules, setAppModules] = useState<AppModule[]>([]);
  const [appStats, setAppStats] = useState({
    total: 0,
    active: 0,
    beta: 0,
    comingSoon: 0,
    installed: 0,
    configured: 0,
    averageUsage: 0
  });

  // Static app modules as fallback
  const staticAppModules: AppModule[] = [
    {
      id: 'dashboard',
      name: t('Dashboard'),
      description: t('Business overview and key metrics'),
      icon: <AssessmentIcon />,
      status: 'active',
      category: 'core',
      features: [t('Real-time metrics'), t('Performance charts'), t('Quick actions')],
      version: '1.0.0',
      usage: 95,
      lastUpdated: '2025-01-15',
      developer: 'FIXORA PRO',
      isInstalled: true,
      isConfigured: true,
      route: '/dashboard',
      permissions: ['read:dashboard']
    },
    {
      id: 'jobs',
      name: t('Jobs Management'),
      description: t('Track and manage repair jobs'),
      icon: <WorkIcon />,
      status: 'active',
      category: 'core',
      features: [t('Job tracking'), t('Status updates'), t('Technician assignment')],
      version: '1.0.0',
      usage: 88,
      lastUpdated: '2025-01-20',
      developer: 'FIXORA PRO',
      isInstalled: true,
      isConfigured: true,
      route: '/jobs',
      permissions: ['read:jobs', 'write:jobs']
    },
    {
      id: 'contacts',
      name: t('Contacts'),
      description: t('Manage customers and suppliers'),
      icon: <PeopleIcon />,
      status: 'active',
      category: 'core',
      features: [t('Customer database'), t('Supplier management'), t('Communication history')],
      version: '1.0.0',
      usage: 92,
      lastUpdated: '2025-01-18',
      developer: 'FIXORA PRO',
      isInstalled: true,
      isConfigured: true,
      route: '/customers',
      permissions: ['read:customers', 'write:customers']
    },
    {
      id: 'stock',
      name: t('Stock Management'),
      description: t('Inventory tracking and management'),
      icon: <InventoryIcon />,
      status: 'active',
      category: 'core',
      features: [t('Stock levels'), t('Low stock alerts'), t('Parts tracking')],
      version: '1.0.0',
      usage: 85,
      lastUpdated: '2025-01-22',
      developer: 'FIXORA PRO',
      isInstalled: true,
      isConfigured: true,
      route: '/inventory',
      permissions: ['read:inventory', 'write:inventory']
    },
    {
      id: 'services',
      name: t('Services'),
      description: t('Manage repair services and pricing'),
      icon: <BuildIcon />,
      status: 'active',
      category: 'core',
      features: [t('Service catalog'), t('Pricing management'), t('Service templates')],
      version: '1.0.0',
      usage: 78,
      lastUpdated: '2025-01-25',
      developer: 'FIXORA PRO',
      isInstalled: true,
      isConfigured: true,
      route: '/services',
      permissions: ['read:services', 'write:services']
    },
    {
      id: 'invoices',
      name: t('Invoices'),
      description: t('Generate and manage invoices'),
      icon: <ReceiptIcon />,
      status: 'active',
      category: 'core',
      features: [t('Invoice generation'), t('Payment tracking'), t('Tax calculations')],
      version: '1.0.0',
      usage: 82,
      lastUpdated: '2025-01-19',
      developer: 'FIXORA PRO',
      isInstalled: true,
      isConfigured: true,
      route: '/invoices',
      permissions: ['read:invoices', 'write:invoices']
    },
    {
      id: 'repair-tracking',
      name: t('Repair Tracking'),
      description: t('Track repair progress and status'),
      icon: <TimelineIcon />,
      status: 'active',
      category: 'core',
      features: [t('Progress tracking'), t('Status updates'), t('Completion notifications')],
      version: '1.0.0',
      usage: 75,
      lastUpdated: '2025-01-23',
      developer: 'FIXORA PRO',
      isInstalled: true,
      isConfigured: true,
      route: '/repair-tracking',
      permissions: ['read:repairs', 'write:repairs']
    },
    {
      id: 'reports',
      name: t('Reports & Analytics'),
      description: t('Business intelligence and reporting'),
      icon: <AssessmentIcon />,
      status: 'active',
      category: 'core',
      features: [t('Performance reports'), t('Business analytics'), t('Data export')],
      version: '1.0.0',
      usage: 68,
      lastUpdated: '2025-01-21',
      developer: 'FIXORA PRO',
      isInstalled: true,
      isConfigured: true,
      route: '/reports',
      permissions: ['read:reports']
    },
    {
      id: 'devices',
      name: t('Device Management'),
      description: t('Track customer devices and history'),
      icon: <PhoneIcon />,
      status: 'active',
      category: 'business',
      features: [t('Device database'), t('Repair history'), t('Warranty tracking')],
      version: '1.0.0',
      usage: 72,
      lastUpdated: '2025-01-24',
      developer: 'FIXORA PRO',
      isInstalled: true,
      isConfigured: true,
      route: '/devices',
      permissions: ['read:devices', 'write:devices']
    },
    {
      id: 'pos',
      name: t('POS System'),
      description: t('Point of sale and transactions'),
      icon: <POSIcon />,
      status: 'active',
      category: 'business',
      features: [t('Sales transactions'), t('Payment processing'), t('Receipt generation')],
      version: '1.0.0',
      usage: 65,
      lastUpdated: '2025-01-26',
      developer: 'FIXORA PRO',
      isInstalled: true,
      isConfigured: true,
      route: '/pos',
      permissions: ['read:pos', 'write:pos']
    },
    {
      id: 'tickets',
      name: t('Support Tickets'),
      description: t('Customer support and issue tracking'),
      icon: <TicketIcon />,
      status: 'active',
      category: 'business',
      features: [t('Ticket creation'), t('Issue tracking'), t('Resolution management')],
      version: '1.0.0',
      usage: 58,
      lastUpdated: '2025-01-27',
      developer: 'FIXORA PRO',
      isInstalled: true,
      isConfigured: true,
      route: '/tickets',
      permissions: ['read:tickets', 'write:tickets']
    },
    {
      id: 'settings',
      name: t('Settings'),
      description: t('System configuration and preferences'),
      icon: <SettingsIcon />,
      status: 'active',
      category: 'tools',
      features: [t('Business settings'), t('User preferences'), t('System configuration')],
      version: '1.0.0',
      usage: 90,
      lastUpdated: '2025-01-28',
      developer: 'FIXORA PRO',
      isInstalled: true,
      isConfigured: true,
      route: '/settings',
      permissions: ['read:settings', 'write:settings']
    },
    {
      id: 'payment-integration',
      name: t('Payment Integration'),
      description: t('Secure payment processing and gateway integration'),
      icon: <IntegrationIcon />,
      status: 'beta',
      category: 'integrations',
      features: [t('Multiple gateways'), t('Secure transactions'), t('Auto-reconciliation')],
      version: '1.0.0',
      usage: 45,
      lastUpdated: '2025-01-29',
      developer: 'Third Party',
      isInstalled: true,
      isConfigured: false,
      route: '/integrations/payment',
      permissions: ['read:payments', 'write:payments']
    },
    {
      id: 'cloud-backup',
      name: t('Cloud Backup'),
      description: t('Automated cloud backup and data synchronization'),
      icon: <CloudIcon />,
      status: 'coming_soon',
      category: 'integrations',
      features: [t('Auto backup'), t('Data sync'), t('Version control')],
      version: '0.9.0',
      usage: 0,
      lastUpdated: '2025-01-30',
      developer: 'Third Party',
      isInstalled: false,
      isConfigured: false,
      route: '/integrations/backup',
      permissions: ['read:backup', 'write:backup']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'coming_soon':
        return 'warning';
      case 'beta':
        return 'info';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core':
        return 'primary';
      case 'business':
        return 'secondary';
      case 'tools':
        return 'info';
      case 'integrations':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('Active');
      case 'inactive':
        return t('Inactive');
      case 'coming_soon':
        return t('Coming Soon');
      case 'beta':
        return t('Beta');
      default:
        return t('Unknown');
    }
  };

  // Search and filter apps
  useEffect(() => {
    const searchApps = async () => {
      if (searchTerm || selectedCategory !== 'all') {
        try {
          const searchResults = await appsAPI.searchApps(searchTerm, selectedCategory);
          const appsWithIcons = searchResults.map((app: APIAppModule) => ({
            ...app,
            icon: getAppIcon(app.id)
          }));
          setAppModules(appsWithIcons);
        } catch (error) {
          console.error('Error searching apps:', error);
        }
      }
    };

    const timeoutId = setTimeout(searchApps, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  const filteredModules = appModules
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usage - a.usage;
        case 'lastUpdated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'core':
        return t('Core Modules');
      case 'business':
        return t('Business Tools');
      case 'tools':
        return t('System Tools');
      case 'integrations':
        return t('Integrations');
      default:
        return t('All Modules');
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'success';
    if (usage >= 60) return 'warning';
    if (usage >= 40) return 'info';
    return 'error';
  };

  // Load apps data
  useEffect(() => {
    const loadApps = async () => {
      setLoading(true);
      try {
        const [appsData, statsData] = await Promise.all([
          appsAPI.getApps(),
          appsAPI.getAppStats()
        ]);
        
        // Convert API data to local format with icons
        const appsWithIcons = appsData.map((app: APIAppModule) => ({
          ...app,
          icon: getAppIcon(app.id)
        }));
        
        setAppModules(appsWithIcons);
        setAppStats(statsData);
      } catch (error) {
        console.error('Error loading apps:', error);
        // Fallback to static data
        setAppModules(staticAppModules);
        setAppStats({
          total: staticAppModules.length,
          active: staticAppModules.filter(m => m.status === 'active').length,
          beta: staticAppModules.filter(m => m.status === 'beta').length,
          comingSoon: staticAppModules.filter(m => m.status === 'coming_soon').length,
          installed: staticAppModules.filter(m => m.isInstalled).length,
          configured: staticAppModules.filter(m => m.isConfigured).length,
          averageUsage: Math.round(staticAppModules.reduce((sum, app) => sum + app.usage, 0) / staticAppModules.length)
        });
        
        setSnackbar({
          open: true,
          message: 'Using offline data. Some features may be limited.',
          severity: 'warning'
        });
      } finally {
        setLoading(false);
      }
    };

    loadApps();
  }, []);

  // Get app icon by ID
  const getAppIcon = (appId: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'dashboard': <AssessmentIcon />,
      'jobs': <WorkIcon />,
      'contacts': <PeopleIcon />,
      'stock': <InventoryIcon />,
      'services': <BuildIcon />,
      'invoices': <ReceiptIcon />,
      'repair-tracking': <TimelineIcon />,
      'reports': <AssessmentIcon />,
      'devices': <PhoneIcon />,
      'pos': <POSIcon />,
      'tickets': <TicketIcon />,
      'settings': <SettingsIcon />,
      'payment-integration': <IntegrationIcon />,
      'cloud-backup': <CloudIcon />
    };
    return iconMap[appId] || <AppsIcon />;
  };

  // Handle loading state
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // App management functions
  const handleLaunchApp = (appId: string) => {
    const app = appModules.find(m => m.id === appId);
    if (app && app.route) {
      console.log(`Launching app: ${appId} -> ${app.route}`);
      navigate(app.route);
    } else {
      console.log(`Launching app: ${appId} (no route defined)`);
      setSnackbar({
        open: true,
        message: `Launching ${app?.name || appId}...`,
        severity: 'info'
      });
    }
  };

  const handleInstallApp = async (appId: string) => {
    setInstallingApp(appId);
    try {
      const result = await appsAPI.installApp(appId);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success'
        });
        
        // Refresh apps data
        const appsData = await appsAPI.getApps();
        const appsWithIcons = appsData.map((app: APIAppModule) => ({
          ...app,
          icon: getAppIcon(app.id)
        }));
        setAppModules(appsWithIcons);
      } else {
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Installation failed:', error);
      setSnackbar({
        open: true,
        message: 'Installation failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setInstallingApp(null);
    }
  };

  const handleConfigureApp = async (appId: string) => {
    const app = appModules.find(m => m.id === appId);
    if (app) {
      setSelectedApp(app);
      setConfigDialogOpen(true);
    }
  };

  const handleConfigSave = async () => {
    if (!selectedApp) return;
    
    setConfiguringApp(selectedApp.id);
    try {
      const config = {
        settings: 'custom', // This would come from the form
        permissions: selectedApp.permissions || [],
        notes: 'App configured via Apps page'
      };
      
      const result = await appsAPI.configureApp(selectedApp.id, config);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success'
        });
        
        // Refresh apps data
        const appsData = await appsAPI.getApps();
        const appsWithIcons = appsData.map((app: APIAppModule) => ({
          ...app,
          icon: getAppIcon(app.id)
        }));
        setAppModules(appsWithIcons);
        
        setConfigDialogOpen(false);
        setSelectedApp(null);
      } else {
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Configuration failed:', error);
      setSnackbar({
        open: true,
        message: 'Configuration failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setConfiguringApp(null);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [appsData, statsData] = await Promise.all([
        appsAPI.getApps(),
        appsAPI.getAppStats()
      ]);
      
      const appsWithIcons = appsData.map((app: APIAppModule) => ({
        ...app,
        icon: getAppIcon(app.id)
      }));
      
      setAppModules(appsWithIcons);
      setAppStats(statsData);
      
      setSnackbar({
        open: true,
        message: 'Apps data refreshed successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing apps:', error);
      setSnackbar({
        open: true,
        message: 'Failed to refresh apps data.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#EEF3FB', minHeight: '100vh' }}>
      <DashboardHeader />
      
      {/* Page Header */}
      <Box sx={{ 
        p: { xs: 2, sm: 3 }, 
        pt: 1 
      }}>
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AppsIcon sx={{ color: '#3BB2FF', fontSize: { xs: 24, sm: 28 } }} />
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              color: '#1A202C',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}>
              Apps & Modules
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ 
          color: '#99A7BD', 
          mb: 3,
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          Access all available business modules and applications
        </Typography>
        
        {/* Statistics Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              minHeight: { xs: '100px', sm: '110px' }, 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'row', sm: 'row' }
                }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#1A202C', 
                      mb: 0.5,
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}>
                      {appStats.total}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#99A7BD',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      Total Apps
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: { xs: 1, sm: 1.5 }, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                    color: 'white',
                    flexShrink: 0,
                    ml: 1
                  }}>
                    <AppsIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              minHeight: { xs: '100px', sm: '110px' }, 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'row', sm: 'row' }
                }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#1A202C', 
                      mb: 0.5,
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}>
                      {appStats.active}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#99A7BD',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      Active Apps
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: { xs: 1, sm: 1.5 }, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    flexShrink: 0,
                    ml: 1
                  }}>
                    <LaunchIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              minHeight: { xs: '100px', sm: '110px' }, 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'row', sm: 'row' }
                }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#1A202C', 
                      mb: 0.5,
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}>
                      {appStats.beta}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#99A7BD',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      Beta Apps
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: { xs: 1, sm: 1.5 }, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: 'white',
                    flexShrink: 0,
                    ml: 1
                  }}>
                    <TrendingUpIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              minHeight: { xs: '100px', sm: '110px' }, 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'row', sm: 'row' }
                }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#1A202C', 
                      mb: 0.5,
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}>
                      {appStats.comingSoon}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#99A7BD',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      Coming Soon
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: { xs: 1, sm: 1.5 }, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: 'white',
                    flexShrink: 0,
                    ml: 1
                  }}>
                    <BuildIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      {/* Search and Filters */}
        <Card sx={{ 
          mb: 3, 
          borderRadius: '16px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ position: 'relative' }}>
                  <SearchIcon sx={{ 
                    position: 'absolute', 
                    left: 12, 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#99A7BD',
                    fontSize: { xs: 18, sm: 20 }
                  }} />
                  <TextField
                    fullWidth
                    placeholder="Search apps..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        pl: 4,
                        height: { xs: 40, sm: 48 },
                        '&:hover fieldset': {
                          borderColor: '#3BB2FF',
                        },
                      },
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}>
                  <Chip
                    label={t('All')}
                    color={selectedCategory === 'all' ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory('all')}
                    clickable
                    size="small"
                    sx={{ borderRadius: '8px' }}
                  />
                  <Chip
                    label={t('Core')}
                    color={selectedCategory === 'core' ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory('core')}
                    clickable
                    size="small"
                    sx={{ borderRadius: '8px' }}
                  />
                  <Chip
                    label={t('Business')}
                    color={selectedCategory === 'business' ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory('business')}
                    clickable
                    size="small"
                    sx={{ borderRadius: '8px' }}
                  />
                  <Chip
                    label={t('Tools')}
                    color={selectedCategory === 'tools' ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory('tools')}
                    clickable
                    size="small"
                    sx={{ borderRadius: '8px' }}
                  />
                  <Chip
                    label={t('Integrations')}
                    color={selectedCategory === 'integrations' ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory('integrations')}
                    clickable
                    size="small"
                    sx={{ borderRadius: '8px' }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}>
                  <Chip
                    label={t('Name')}
                    color={sortBy === 'name' ? 'primary' : 'default'}
                    onClick={() => setSortBy('name')}
                    clickable
                    size="small"
                    sx={{ borderRadius: '8px' }}
                  />
                  <Chip
                    label={t('Usage')}
                    color={sortBy === 'usage' ? 'primary' : 'default'}
                    onClick={() => setSortBy('usage')}
                    clickable
                    size="small"
                    sx={{ borderRadius: '8px' }}
                  />
                  <Chip
                    label={t('Updated')}
                    color={sortBy === 'lastUpdated' ? 'primary' : 'default'}
                    onClick={() => setSortBy('lastUpdated')}
                    clickable
                    size="small"
                    sx={{ borderRadius: '8px' }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={2} sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: { xs: 'center', md: 'flex-end' },
                mt: { xs: 1, md: 0 }
              }}>
                <Tooltip title="Refresh">
                  <IconButton
                    onClick={handleRefresh}
                    size="small"
                    disabled={loading}
                    sx={{ 
                      borderRadius: '12px',
                      borderColor: '#3BB2FF',
                      color: '#3BB2FF',
                      '&:hover': {
                        borderColor: '#6A6BFF',
                        backgroundColor: 'rgba(59, 178, 255, 0.04)',
                      }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add New App">
                  <IconButton
                    size="small"
                    sx={{ 
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
                      }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Apps Grid */}
      <Box sx={{ px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {filteredModules.map((module) => (
            <Grid item xs={12} sm={6} lg={4} xl={3} key={module.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }
              }}
            >
              <CardContent sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                p: { xs: 2, sm: 3 },
                minHeight: 0
              }}>
                {/* Module Header */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  minHeight: 0
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: module.status === 'active' ? '#3BB2FF' : 
                             module.status === 'beta' ? '#F59E0B' :
                             module.status === 'coming_soon' ? '#8B5CF6' : '#99A7BD',
                      mr: 2,
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
                      flexShrink: 0
                    }}
                  >
                    {module.icon}
                  </Avatar>
                  <Box sx={{ 
                    flexGrow: 1, 
                    minWidth: 0,
                    overflow: 'hidden'
                  }}>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#1A202C',
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={module.name}
                    >
                      {module.name}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      flexWrap: 'wrap'
                    }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#99A7BD',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      >
                        v{module.version}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#99A7BD',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: { xs: '100px', sm: '120px' }
                        }}
                        title={module.developer}
                      >
                        • {module.developer}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Description */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#64748B', 
                    mb: 2, 
                    flexGrow: 1,
                    fontSize: { xs: '0.875rem', sm: '0.875rem' },
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={module.description}
                >
                  {module.description}
                </Typography>

                {/* Usage Progress */}
                {module.usage > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Usage
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#1A202C', fontWeight: 500 }}>
                        {module.usage}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={module.usage}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getUsageColor(module.usage) === 'success' ? '#10B981' :
                                         getUsageColor(module.usage) === 'warning' ? '#F59E0B' :
                                         getUsageColor(module.usage) === 'info' ? '#3BB2FF' : '#EF4444',
                          borderRadius: 3
                        }
                      }}
                    />
                  </Box>
                )}

                {/* Features */}
                <Box sx={{ 
                  mb: 2,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5
                }}>
                  {module.features.slice(0, 2).map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderRadius: '8px',
                        borderColor: '#E2E8F0',
                        color: '#64748B',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: 24, sm: 28 },
                        '& .MuiChip-label': {
                          px: { xs: 1, sm: 1.5 }
                        }
                      }}
                    />
                  ))}
                  {module.features.length > 2 && (
                    <Chip
                      label={`+${module.features.length - 2} more`}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderRadius: '8px',
                        borderColor: '#E2E8F0',
                        color: '#64748B',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: 24, sm: 28 },
                        '& .MuiChip-label': {
                          px: { xs: 1, sm: 1.5 }
                        }
                      }}
                    />
                  )}
                </Box>

                {/* Status and Category */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 2,
                  gap: 1,
                  flexWrap: 'wrap'
                }}>
                  <Chip
                    label={getStatusText(module.status)}
                    color={getStatusColor(module.status) as any}
                    size="small"
                    sx={{ 
                      borderRadius: '8px',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      height: { xs: 24, sm: 28 }
                    }}
                  />
                  <Chip
                    label={getCategoryLabel(module.category)}
                    color={getCategoryColor(module.category) as any}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderRadius: '8px',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      height: { xs: 24, sm: 28 },
                      maxWidth: { xs: '100px', sm: '120px' },
                      '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }}
                    title={getCategoryLabel(module.category)}
                  />
                </Box>

                {/* Last Updated */}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#99A7BD', 
                    mb: 2,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                >
                  Last updated: {new Date(module.lastUpdated).toLocaleDateString()}
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  mt: 'auto',
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  {module.isInstalled ? (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<LaunchIcon />}
                      disabled={module.status !== 'active'}
                      size="small"
                      onClick={() => handleLaunchApp(module.id)}
                      sx={{ 
                        borderRadius: '12px',
                        background: module.status === 'active' ? 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)' : '#E2E8F0',
                        color: module.status === 'active' ? 'white' : '#99A7BD',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        height: { xs: 36, sm: 40 },
                        '&:hover': {
                          background: module.status === 'active' ? 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)' : '#E2E8F0',
                        }
                      }}
                    >
                      {module.status === 'active' ? t('Launch') : 
                           module.status === 'coming_soon' ? t('Coming Soon') : 
                           module.status === 'beta' ? t('Try Beta') : t('Inactive')}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={installingApp === module.id ? <CircularProgress size={16} /> : <AddIcon />}
                      size="small"
                      disabled={installingApp === module.id}
                      onClick={() => handleInstallApp(module.id)}
                      sx={{ 
                        borderRadius: '12px',
                        borderColor: '#3BB2FF',
                        color: '#3BB2FF',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        height: { xs: 36, sm: 40 },
                        '&:hover': {
                          borderColor: '#6A6BFF',
                          backgroundColor: 'rgba(59, 178, 255, 0.04)',
                        }
                      }}
                    >
                      {installingApp === module.id ? t('Installing...') : t('Install')}
                    </Button>
                  )}
                  
                  {module.isInstalled && !module.isConfigured && (
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={configuringApp === module.id}
                      onClick={() => handleConfigureApp(module.id)}
                      startIcon={configuringApp === module.id ? <CircularProgress size={16} /> : undefined}
                      sx={{ 
                        borderRadius: '8px',
                        borderColor: '#F59E0B',
                        color: '#F59E0B',
                        minWidth: 'auto',
                        px: 2,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: 36, sm: 40 }
                      }}
                    >
                      {configuringApp === module.id ? t('Configuring...') : t('Configure')}
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        </Grid>
      </Box>

      {/* Coming Soon Section */}
      {selectedCategory === 'all' && (
        <Box sx={{ mt: 6, px: { xs: 2, sm: 3 } }}>
          <Card sx={{ 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: '#1A202C',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                {t('Coming Soon')}
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ 
                    opacity: 0.8,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: '#8B5CF6', 
                          mr: 2,
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 }
                        }}>
                          <TrendingUpIcon />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="h6" 
                            component="h3" 
                            sx={{ 
                              fontWeight: 600, 
                              color: '#1A202C',
                              fontSize: { xs: '1rem', sm: '1.25rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={t('Mobile App')}
                          >
                            {t('Mobile App')}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#99A7BD',
                              fontSize: { xs: '0.7rem', sm: '0.75rem' }
                            }}
                          >
                            {t('Coming Soon')}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#64748B', 
                          mb: 2,
                          flexGrow: 1,
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          lineHeight: 1.5
                        }}
                      >
                        {t('Native mobile application for iOS and Android')}
                      </Typography>
                      <Chip
                        label={t('Coming Soon')}
                        color="warning"
                        size="small"
                        sx={{ 
                          borderRadius: '8px',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          height: { xs: 24, sm: 28 }
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ 
                    opacity: 0.8,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: '#8B5CF6', 
                          mr: 2,
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 }
                        }}>
                          <IntegrationIcon />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="h6" 
                            component="h3" 
                            sx={{ 
                              fontWeight: 600, 
                              color: '#1A202C',
                              fontSize: { xs: '1rem', sm: '1.25rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={t('API Integration')}
                          >
                            {t('API Integration')}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#99A7BD',
                              fontSize: { xs: '0.7rem', sm: '0.75rem' }
                            }}
                          >
                            {t('Coming Soon')}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#64748B', 
                          mb: 2,
                          flexGrow: 1,
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          lineHeight: 1.5
                        }}
                      >
                        {t('Third-party integrations and API access')}
                      </Typography>
                      <Chip
                        label={t('Coming Soon')}
                        color="warning"
                        size="small"
                        sx={{ 
                          borderRadius: '8px',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          height: { xs: 24, sm: 28 }
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ 
                    opacity: 0.8,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: '#8B5CF6', 
                          mr: 2,
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 }
                        }}>
                          <SecurityIcon />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="h6" 
                            component="h3" 
                            sx={{ 
                              fontWeight: 600, 
                              color: '#1A202C',
                              fontSize: { xs: '1rem', sm: '1.25rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={t('Advanced Security')}
                          >
                            {t('Advanced Security')}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#99A7BD',
                              fontSize: { xs: '0.7rem', sm: '0.75rem' }
                            }}
                          >
                            {t('Coming Soon')}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#64748B', 
                          mb: 2,
                          flexGrow: 1,
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          lineHeight: 1.5
                        }}
                      >
                        {t('Enhanced security features and compliance tools')}
                      </Typography>
                      <Chip
                        label={t('Coming Soon')}
                        color="warning"
                        size="small"
                        sx={{ 
                          borderRadius: '8px',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          height: { xs: 24, sm: 28 }
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
          </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            p: 4,
            px: { xs: 2, sm: 3 }
          }}>
            <CircularProgress />
          </Box>
        )}

        {/* No Results */}
        {filteredModules.length === 0 && !loading && (
          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            <Card sx={{ 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
            }}>
              <CardContent sx={{ 
                p: { xs: 3, sm: 4 }, 
                textAlign: 'center' 
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#99A7BD', 
                    mb: 1,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  {t('No apps found')}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#64748B',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {t('Try adjusting your search or filter criteria')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Configuration Dialog */}
        <Dialog 
          open={configDialogOpen} 
          onClose={() => setConfigDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Configure {selectedApp?.name}
          </DialogTitle>
          <DialogContent>
            {selectedApp && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="body2" sx={{ mb: 3, color: '#64748B' }}>
                  {selectedApp.description}
                </Typography>
                
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <FormLabel component="legend">App Settings</FormLabel>
                  <RadioGroup defaultValue="default">
                    <FormControlLabel 
                      value="default" 
                      control={<Radio />} 
                      label="Use default settings" 
                    />
                    <FormControlLabel 
                      value="custom" 
                      control={<Radio />} 
                      label="Configure custom settings" 
                    />
                  </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <FormLabel component="legend">Permissions</FormLabel>
                  {selectedApp.permissions?.map((permission, index) => (
                    <FormControlLabel
                      key={index}
                      control={<Switch defaultChecked />}
                      label={permission}
                    />
                  ))}
                </FormControl>

                <TextField
                  fullWidth
                  label="App Configuration"
                  multiline
                  rows={4}
                  placeholder="Enter any specific configuration notes..."
                  sx={{ mb: 2 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfigSave}
              variant="contained"
              disabled={configuringApp === selectedApp?.id}
              startIcon={configuringApp === selectedApp?.id ? <CircularProgress size={16} /> : undefined}
            >
              {configuringApp === selectedApp?.id ? 'Configuring...' : 'Save Configuration'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
    </Box>
  );
};

export default AppsPage;


