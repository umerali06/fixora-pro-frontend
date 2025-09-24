import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingDown,
  TrendingUp,
  Storefront as StorefrontIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Import the header component
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { useAppSelector } from '../../store/hooks';
import { dashboardAPI } from '../../services/api';
import { PermissionGate, usePermissions } from '../../utils/permissions';

// Dashboard Data Interfaces
interface DashboardStats {
  turnover: {
    current: number;
    previous: number;
    percentage: number;
  };
  unpaidInvoices: {
    current: number;
    previous: number;
    percentage: number;
  };
  stockValue: {
    current: number;
    previous: number;
    percentage: number;
  };
  serviceRequests: {
    current: number;
    previous: number;
    percentage: number;
  };
  completedJobs: {
    current: number;
    previous: number;
    percentage: number;
  };
  activeJobs: {
    onHold: number;
    inProgress: number;
    total: number;
  };
}

interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

interface RecentActivity {
  id: number;
  type: 'job' | 'invoice' | 'customer' | 'inventory';
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const sidebarContext = useOutletContext() as {
    sidebarOpen: boolean;
    handleSidebarToggle: () => void;
    handleSidebarClose: () => void;
  };
  const { handleSidebarToggle } = sidebarContext;
  
  // Get authentication state
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  
  // Dashboard State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [revenueTrendData, setRevenueTrendData] = useState<any[]>([]);
  const [monthlyPerformanceData, setMonthlyPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Data Fetching Functions
  const fetchDashboardData = useCallback(async () => {
    // Check authentication before making API calls
    if (!isAuthenticated || !token) {
      console.log('⚠️ Cannot fetch dashboard data: user not authenticated');
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Fetching dashboard data with token:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + '...'
      });
      
      // Use the authenticated API service
      const [statsData, overviewData, activityData, revenueData, performanceData] = await Promise.allSettled([
        dashboardAPI.getStats(),
        dashboardAPI.getOverview(),
        dashboardAPI.getRecentActivity(),
        dashboardAPI.getRevenueTrendData(),
        dashboardAPI.getMonthlyPerformanceData()
      ]);

      // Extract data from settled promises
      const stats = statsData.status === 'fulfilled' ? statsData.value as any : null;
      const overview = overviewData.status === 'fulfilled' ? overviewData.value as any : null;
      const activity = activityData.status === 'fulfilled' ? activityData.value as any : null;
      const revenue = revenueData.status === 'fulfilled' ? revenueData.value as any : null;
      const performance = performanceData.status === 'fulfilled' ? performanceData.value as any : null;

      console.log('📊 Dashboard data results:', {
        stats: stats ? 'success' : 'failed',
        overview: overview ? 'success' : 'failed',
        activity: activity ? 'success' : 'failed',
        revenue: revenue ? 'success' : 'failed',
        performance: performance ? 'success' : 'failed'
      });

      // Transform the data to match our frontend interface
      if (stats) {
        console.log('📊 Dashboard stats data received:', stats);
        const transformedStats: DashboardStats = {
          turnover: { 
            current: stats.turnover?.current || 0, 
            previous: stats.turnover?.previous || 0, 
            percentage: stats.turnover?.percentage || 0 
          },
          unpaidInvoices: { 
            current: stats.unpaidInvoices?.current || 0, 
            previous: stats.unpaidInvoices?.previous || 0, 
            percentage: stats.unpaidInvoices?.percentage || 0 
          },
          stockValue: { 
            current: stats.stockValue?.current || 0, 
            previous: stats.stockValue?.previous || 0, 
            percentage: stats.stockValue?.percentage || 0 
          },
          serviceRequests: { 
            current: stats.serviceRequests?.current || 0, 
            previous: stats.serviceRequests?.previous || 0, 
            percentage: stats.serviceRequests?.percentage || 0 
          },
          completedJobs: { 
            current: stats.completedJobs?.current || 0, 
            previous: stats.completedJobs?.previous || 0, 
            percentage: stats.completedJobs?.percentage || 0 
          },
          activeJobs: { 
            onHold: stats.activeJobs?.onHold || 0, 
            inProgress: stats.activeJobs?.inProgress || 0, 
            total: stats.activeJobs?.total || 0
          }
        };
        setStats(transformedStats);
        console.log('📊 Transformed stats:', transformedStats);
      } else {
        console.log('⚠️ No stats data received from API');
      }

      // Set todos and activity from the API responses
      if (overview?.todos) {
        setTodos(overview.todos);
      } else {
        setTodos([]);
      }
      if (activity) {
        setRecentActivity(activity);
      } else {
        setRecentActivity([]);
      }

      // Set chart data
      console.log('📈 Revenue data received:', revenue);
      console.log('📊 Performance data received:', performance);
      
      if (revenue && Array.isArray(revenue)) {
        setRevenueTrendData(revenue);
        console.log('📈 Revenue trend data set:', revenue);
      } else {
        console.log('⚠️ No revenue data or not an array');
        setRevenueTrendData([]);
      }

      if (performance && Array.isArray(performance)) {
        setMonthlyPerformanceData(performance);
        console.log('📊 Monthly performance data set:', performance);
      } else {
        console.log('⚠️ No performance data or not an array');
        setMonthlyPerformanceData([]);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data from database');
      // No fallback data - only show real database data
      setStats(null);
      setTodos([]);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);



  // Refresh data
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDashboardData();
    } else {
      console.log('⚠️ User not authenticated, skipping dashboard data fetch');
      setLoading(false);
    }
  }, [isAuthenticated, token, fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Real-time updates for critical data
  useEffect(() => {
    const realTimeInterval = setInterval(() => {
      // Only refresh stats, not all data to avoid performance issues
      if (isAuthenticated && token) {
        dashboardAPI.getStats()
          .then((statsData) => {
            if (statsData) {
              const transformedStats: DashboardStats = {
                turnover: { 
                  current: statsData.turnover?.current || 0, 
                  previous: statsData.turnover?.previous || 0, 
                  percentage: statsData.turnover?.percentage || 0 
                },
                unpaidInvoices: { 
                  current: statsData.unpaidInvoices?.current || 0, 
                  previous: statsData.unpaidInvoices?.previous || 0, 
                  percentage: statsData.unpaidInvoices?.percentage || 0 
                },
                stockValue: { 
                  current: statsData.stockValue?.current || 0, 
                  previous: statsData.stockValue?.previous || 0, 
                  percentage: statsData.stockValue?.percentage || 0 
                },
                serviceRequests: { 
                  current: statsData.serviceRequests?.current || 0, 
                  previous: statsData.serviceRequests?.previous || 0, 
                  percentage: statsData.serviceRequests?.percentage || 0 
                },
                completedJobs: { 
                  current: statsData.completedJobs?.current || 0, 
                  previous: statsData.completedJobs?.previous || 0, 
                  percentage: statsData.completedJobs?.percentage || 0 
                },
                activeJobs: { 
                  onHold: statsData.activeJobs?.onHold || 0, 
                  inProgress: statsData.activeJobs?.inProgress || 0, 
                  total: statsData.activeJobs?.total || 0
                }
              };
              setStats(transformedStats);
              setLastUpdated(new Date());
            }
          })
          .catch((error) => {
            console.error('Error refreshing dashboard stats:', error);
          });
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(realTimeInterval);
  }, [isAuthenticated, token]);

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Helper function to format percentage
  const formatPercentage = (percentage: number): string => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

    // Dashboard Content Component
  const DashboardContent = () => (
    <Box sx={{ 
      backgroundColor: 'transparent',
      width: '100%',
      maxWidth: '1360px',
      mx: 'auto',
      px: { xs: 2, sm: 3, md: 4, lg: 6 },
      py: { xs: 3, sm: 4, md: 6 }
    }}>
      {/* Dashboard Title and Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ 
            fontSize: { xs: '24px', sm: '28px', md: '32px' },
            fontWeight: 700,
            color: '#49566F'
          }}>
            Dashboard
          </Typography>
          <AccessTimeIcon sx={{ color: '#99A7BD', fontSize: '20px' }} />
        </Box>
        
        {/* Refresh Button and Last Updated */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ 
            fontSize: '12px',
            color: '#99A7BD',
            display: { xs: 'none', sm: 'block' }
          }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              borderColor: '#D1D5DB',
              color: '#6B7280',
              textTransform: 'none',
              fontSize: '12px'
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* No Data Alert */}
      {!loading && !stats && !error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No data available. Please ensure you have some repair tickets, orders, or customers in your system.
        </Alert>
      )}

        {/* Stats Cards */}
        {loading ? (
          <Grid container spacing={2} sx={{ mb: 4, width: '100%' }}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card sx={{ 
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E6ECF5',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  minHeight: '120px',
                  width: '100%'
                }}>
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={40} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2} sx={{ mb: 4, width: '100%' }}>
            {/* Turnover Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #E6ECF5',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                minHeight: '120px',
                width: '100%',
                '&:hover': { 
                  boxShadow: '0 8px 18px rgba(0, 0, 0, 0.08)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography sx={{ 
                      fontSize: '13px',
                      color: '#99A7BD',
                      fontWeight: 500
                    }}>
                      Turnover
                    </Typography>
                    <IconButton sx={{ 
                      backgroundColor: '#F3F4F6', 
                      color: '#6B7280',
                      width: 28,
                      height: 28,
                      p: 0
                    }}>
                      <CalendarTodayIcon sx={{ fontSize: '16px' }} />
                    </IconButton>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '26px',
                    fontWeight: 700,
                    color: '#49566F',
                    mb: 1.5
                  }}>
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      stats ? formatCurrency(stats.turnover.current) : '€0.00'
                    )}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {stats && stats.turnover.percentage >= 0 ? (
                      <TrendingUp sx={{ color: '#10B981', fontSize: '16px' }} />
                    ) : (
                      <TrendingDown sx={{ color: '#EF4444', fontSize: '16px' }} />
                    )}
                    <Typography sx={{ 
                      color: stats && stats.turnover.percentage >= 0 ? '#10B981' : '#EF4444', 
                      fontSize: '12px',
                      fontWeight: 600 
                    }}>
                      {stats ? formatPercentage(stats.turnover.percentage) : '0%'}
                    </Typography>
                    <Typography sx={{ 
                      color: '#99A7BD', 
                      fontSize: '11px',
                      fontWeight: 400 
                    }}>
                      vs last month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Unpaid Invoice Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #E6ECF5',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                minHeight: '120px',
                width: '100%',
                '&:hover': { 
                  boxShadow: '0 8px 18px rgba(0, 0, 0, 0.08)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography sx={{ 
                      fontSize: '13px',
                      color: '#99A7BD',
                      fontWeight: 500
                    }}>
                      Unpaid Invoices
                    </Typography>
                    <IconButton sx={{ 
                      backgroundColor: '#F3F4F6', 
                      color: '#6B7280',
                      width: 28,
                      height: 28,
                      p: 0
                    }}>
                      <CalendarTodayIcon sx={{ fontSize: '16px' }} />
                    </IconButton>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '26px',
                    fontWeight: 700,
                    color: '#49566F',
                    mb: 1.5
                  }}>
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      stats ? formatCurrency(stats.unpaidInvoices.current) : '€0.00'
                    )}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {stats && stats.unpaidInvoices.percentage >= 0 ? (
                      <TrendingUp sx={{ color: '#10B981', fontSize: '16px' }} />
                    ) : (
                      <TrendingDown sx={{ color: '#EF4444', fontSize: '16px' }} />
                    )}
                    <Typography sx={{ 
                      color: stats && stats.unpaidInvoices.percentage >= 0 ? '#10B981' : '#EF4444', 
                      fontSize: '12px',
                      fontWeight: 600 
                    }}>
                      {stats ? formatPercentage(stats.unpaidInvoices.percentage) : '0%'}
                    </Typography>
                    <Typography sx={{ 
                      color: '#99A7BD', 
                      fontSize: '11px',
                      fontWeight: 400 
                    }}>
                      vs last month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Stock Value Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #E6ECF5',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                minHeight: '120px',
                width: '100%',
                '&:hover': { 
                  boxShadow: '0 8px 18px rgba(0, 0, 0, 0.08)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography sx={{ 
                      fontSize: '13px',
                      color: '#99A7BD',
                      fontWeight: 500
                    }}>
                      Stock Value
                    </Typography>
                    <IconButton sx={{ 
                      backgroundColor: '#F3F4F6', 
                      color: '#6B7280',
                      width: 28,
                      height: 28,
                      p: 0
                    }}>
                      <CalendarTodayIcon sx={{ fontSize: '16px' }} />
                    </IconButton>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '26px',
                    fontWeight: 700,
                    color: '#49566F',
                    mb: 1.5
                  }}>
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      stats ? formatCurrency(stats.stockValue.current) : '€0.00'
                    )}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {stats && stats.stockValue.percentage >= 0 ? (
                      <TrendingUp sx={{ color: '#10B981', fontSize: '16px' }} />
                    ) : (
                      <TrendingDown sx={{ color: '#EF4444', fontSize: '16px' }} />
                    )}
                    <Typography sx={{ 
                      color: stats && stats.stockValue.percentage >= 0 ? '#10B981' : '#EF4444', 
                      fontSize: '12px',
                      fontWeight: 600 
                    }}>
                      {stats ? formatPercentage(stats.stockValue.percentage) : '0%'}
                    </Typography>
                    <Typography sx={{ 
                      color: '#99A7BD', 
                      fontSize: '11px',
                      fontWeight: 400 
                    }}>
                      vs last month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Medium Cards Section */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {/* Service Requests Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '18px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              minHeight: '140px',
              width: '100%',
              '&:hover': { 
                boxShadow: '0 8px 18px rgba(0, 0, 0, 0.15)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}>
              <CardContent sx={{ p: 3, color: 'white', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <StorefrontIcon sx={{ fontSize: '20px', mr: 1.5 }} />
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, opacity: 0.9 }}>
                      Web Form
                    </Typography>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '18px',
                    fontWeight: 600
                  }}>
                    Service Requests
                  </Typography>
                </Box>
                <Typography sx={{ 
                  fontSize: '42px',
                  fontWeight: 700
                }}>
                  {stats ? stats.serviceRequests.current : 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Completed Jobs Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E6ECF5',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              minHeight: '140px',
              width: '100%',
              '&:hover': { 
                boxShadow: '0 8px 18px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <WorkIcon sx={{ color: '#8B5CF6', fontSize: '20px', mr: 1.5 }} />
                    <Typography sx={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#99A7BD'
                    }}>
                      Completed Jobs
                    </Typography>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#49566F'
                  }}>
                    {stats ? stats.completedJobs.current : 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '13px', color: '#99A7BD' }}>
                    {new Date().toLocaleDateString('en-US', { 
                      month: '2-digit', 
                      day: '2-digit', 
                      year: 'numeric' 
                    })}
                  </Typography>
                  <CalendarTodayIcon sx={{ color: '#99A7BD', fontSize: '16px' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

                {/* Bottom Cards Section */}
        <Grid container spacing={2}>
          {/* To-Do Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E6ECF5',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              height: '280px',
              width: '100%',
              '&:hover': { 
                boxShadow: '0 8px 18px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ 
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#49566F'
                }}>
                  To-Do's
                </Typography>
                <PermissionGate permission="dashboard:read">
                  <Button
                    variant="text"
                    onClick={() => navigate('/todos')}
                    sx={{
                      color: '#764ba2',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '12px',
                    p: 0,
                    minWidth: 'auto'
                  }}
                >
                  View All
                </Button>
                </PermissionGate>
              </Box>
              
              {/* Todo List */}
              <Box sx={{ mb: 2 }}>
                {todos.length > 0 ? (
                  todos.slice(0, 3).map((todo) => (
                    <Box key={todo.id} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1,
                      p: 1,
                      backgroundColor: '#F9FAFB',
                      borderRadius: '8px'
                    }}>
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getPriorityColor(todo.priority),
                        mr: 1.5
                      }} />
                      <Typography sx={{ 
                        fontSize: '12px',
                        color: '#49566F',
                        flex: 1,
                        textDecoration: todo.completed ? 'line-through' : 'none'
                      }}>
                        {todo.title}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ 
                    fontSize: '12px',
                    color: '#99A7BD',
                    textAlign: 'center'
                  }}>
                    No todos yet
                  </Typography>
                )}
              </Box>
              
              {/* Illustration Placeholder */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                flex: 1,
                justifyContent: 'center'
              }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  backgroundColor: '#F3F4F6', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5
                }}>
                  <PersonIcon sx={{ fontSize: 24, color: '#99A7BD' }} />
                  </Box>
                <Typography sx={{ 
                  fontSize: '12px',
                  color: '#99A7BD',
                  textAlign: 'center'
                }}>
                  Start with your first priorities
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

                           {/* Activity Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E6ECF5',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              height: '280px',
              width: '100%',
              '&:hover': { 
                boxShadow: '0 8px 18px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ 
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#49566F'
                }}>
                  Activity
                </Typography>
                <PermissionGate permission="dashboard:read">
                  <Button
                    variant="text"
                    onClick={() => navigate('/activity')}
                    sx={{
                      color: '#764ba2',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '12px',
                      p: 0,
                      minWidth: 'auto'
                    }}
                  >
                    View All
                  </Button>
                </PermissionGate>
              </Box>
              
              {/* Recent Activity List */}
              <Box sx={{ flex: 1 }}>
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 3).map((activity) => (
                    <Box key={activity.id} sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      mb: 2,
                      p: 1.5,
                      backgroundColor: '#F9FAFB',
                      borderRadius: '8px'
                    }}>
                      <Typography sx={{ 
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#49566F',
                        mb: 0.5
                      }}>
                        {activity.title}
                      </Typography>
                      <Typography sx={{ 
                        fontSize: '11px',
                        color: '#99A7BD',
                        mb: 0.5
                      }}>
                        {activity.description}
                      </Typography>
                      <Typography sx={{ 
                        fontSize: '10px',
                        color: '#99A7BD'
                      }}>
                        {activity.timestamp}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    flex: 1,
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      backgroundColor: '#F3F4F6', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5
                    }}>
                      <AssignmentIcon sx={{ fontSize: 24, color: '#99A7BD' }} />
                    </Box>
                    <Typography sx={{ 
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#49566F',
                      textAlign: 'center',
                      mb: 0.5
                    }}>
                      No pending tasks
                    </Typography>
                    <Typography sx={{ 
                      fontSize: '12px',
                      color: '#99A7BD',
                      textAlign: 'center'
                    }}>
                      All repair tickets are up to date.
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
                  </Card>
                </Grid>

                           {/* Job Progress Card */}
          <Grid item xs={12} sm={6} md={4} mb={2}>
            <Card sx={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E6ECF5',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              height: '280px',
              width: '100%',
              '&:hover': { 
                boxShadow: '0 8px 18px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ 
                fontSize: '16px',
                fontWeight: 600,
                color: '#49566F',
                mb: 2
              }}>
                Job Progress
              </Typography>
              
              {/* Donut Chart Placeholder */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                flex: 1,
                justifyContent: 'center'
              }}>
                <Box sx={{ 
                  position: 'relative',
                  width: 100,
                  height: 100,
                  mb: 2
                }}>
                  {/* Center Circle */}
                  <Box sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 50,
                    height: 50,
                    backgroundColor: '#3B82F6',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700 }}>
                    {stats ? stats.activeJobs.total : 0}
                  </Typography>
                  <Typography sx={{ fontSize: '8px', fontWeight: 500 }}>
                    Active Jobs
                  </Typography>
                  </Box>
                  
                  {/* Outer Ring Placeholder */}
                  <Box sx={{ 
                    width: 100,
                    height: 100,
                    border: '6px solid #E5E7EB',
                    borderRadius: '50%',
                    borderTop: '6px solid #EF4444',
                    borderRight: '6px solid #FBBF24'
                  }} />
                </Box>
                
                {/* Legend */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, backgroundColor: '#EF4444', borderRadius: '2px' }} />
                    <Typography sx={{ fontSize: '11px', color: '#99A7BD' }}>
                      {stats ? stats.activeJobs.onHold : 0} On Hold
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, backgroundColor: '#FBBF24', borderRadius: '2px' }} />
                    <Typography sx={{ fontSize: '11px', color: '#99A7BD' }}>
                      {stats ? stats.activeJobs.inProgress : 0} Repair in Progress
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={2} sx={{ mb: 4, width: '100%' }}>
          {/* Revenue Trend Chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E6ECF5',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              height: '350px',
              width: '100%'
            }}>
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Typography sx={{ 
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#49566F',
                  mb: 2
                }}>
                  Revenue Trend
                </Typography>
                <Box sx={{ height: '280px', width: '100%' }}>
                  {loading ? (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%' 
                    }}>
                      <CircularProgress size={40} />
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueTrendData.length > 0 ? revenueTrendData : [
                        { month: 'No Data', revenue: 0, orders: 0 }
                      ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6B7280" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                      />
                      <YAxis 
                        stroke="#6B7280" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Repair Status Chart */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E6ECF5',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              height: '350px',
              width: '100%'
            }}>
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Typography sx={{ 
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#49566F',
                  mb: 2
                }}>
                  Repair Status
                </Typography>
                <Box sx={{ height: '280px', width: '100%' }}>
                  {loading ? (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%' 
                    }}>
                      <CircularProgress size={40} />
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: stats?.completedJobs.current || 0, color: '#10B981' },
                          { name: 'In Progress', value: stats?.activeJobs.inProgress || 0, color: '#F59E0B' },
                          { name: 'On Hold', value: stats?.activeJobs.onHold || 0, color: '#EF4444' },
                          { name: 'Pending', value: stats?.serviceRequests.current || 0, color: '#6B7280' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Completed', value: stats?.completedJobs.current || 0, color: '#10B981' },
                          { name: 'In Progress', value: stats?.activeJobs.inProgress || 0, color: '#F59E0B' },
                          { name: 'On Hold', value: stats?.activeJobs.onHold || 0, color: '#EF4444' },
                          { name: 'Pending', value: stats?.serviceRequests.current || 0, color: '#6B7280' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }} 
                      />
                    </PieChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Monthly Performance Chart */}
        <Grid container spacing={2} sx={{ mb: 4, width: '100%' }}>
          <Grid item xs={12}>
            <Card sx={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E6ECF5',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              height: '350px',
              width: '100%'
            }}>
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Typography sx={{ 
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#49566F',
                  mb: 2
                }}>
                  Monthly Performance
                </Typography>
                <Box sx={{ height: '280px', width: '100%' }}>
                  {loading ? (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%' 
                    }}>
                      <CircularProgress size={40} />
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyPerformanceData.length > 0 ? monthlyPerformanceData : [
                        { month: 'No Data', revenue: 0, repairs: 0, customers: 0 }
                      ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6B7280" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                      />
                      <YAxis 
                        stroke="#6B7280" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3B82F6" name="Revenue (€)" />
                      <Bar dataKey="repairs" fill="#10B981" name="Repairs" />
                      <Bar dataKey="customers" fill="#F59E0B" name="New Customers" />
                    </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  // Render the dashboard content
  const renderContent = () => {
    return <DashboardContent />;
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <DashboardHeader onMenuToggle={handleSidebarToggle} />
      {renderContent()}
    </Box>
  );
};

export default DashboardPage;

