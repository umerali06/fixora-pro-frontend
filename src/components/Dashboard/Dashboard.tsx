import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  IconButton,
  Chip,
  Avatar,
  Button,
  useTheme,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  TrendingDown,
  CalendarToday,
  Search,
  Add,
  FilterList,
  Notifications,
  Assignment,
  Work,
  Person,
  Feedback,
  CheckCircle,
  Build,
  Receipt,
  People
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import dashboardService, { DashboardOverview, DashboardStats, RecentActivity, SystemStatus } from '../../services/dashboardService';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [newTodo, setNewTodo] = useState('');
  
  // State for dashboard data
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [overviewData, statsData, activityData, statusData] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getStats(),
          dashboardService.getRecentActivity(5),
          dashboardService.getSystemStatus()
        ]);

        setOverview(overviewData);
        setStats(statsData);
        setRecentActivity(activityData);
        setSystemStatus(statusData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Fallback to mock data
        setOverview(dashboardService.getMockOverview());
        setStats(dashboardService.getMockStats());
        setRecentActivity(dashboardService.getMockRecentActivity());
        setSystemStatus(dashboardService.getMockSystemStatus());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Job progress chart data
  const jobProgressData = {
    labels: ['On Hold', 'Repair in Progress', 'Completed Today'],
    datasets: [
      {
        data: [
          overview?.pendingEstimates || 0,
          overview?.activeRepairs || 0,
          overview?.completedToday || 0
        ],
        backgroundColor: ['#FF6B6B', '#FFD93D', '#4ECDC4'],
        hoverOffset: 4,
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value}`;
          }
        }
      }
    },
    cutout: '70%'
  };

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      // Add todo logic here
      setNewTodo('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'repair':
        return <Build />;
      case 'order':
        return <Work />;
      case 'invoice':
        return <Receipt />;
      case 'customer':
        return <People />;
      default:
        return <Assignment />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'repair':
        return '#3B82F6';
      case 'order':
        return '#10B981';
      case 'invoice':
        return '#F59E0B';
      case 'customer':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        flexGrow: 1, 
        p: 3, 
        ml: '280px',
        backgroundColor: '#F8F9FA',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h6" color="text.secondary">
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3, 
      ml: '280px', // Account for sidebar width
      backgroundColor: '#F8F9FA',
      minHeight: '100vh'
    }}>
      {/* Top Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1F2937' }}>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            sx={{ 
              borderColor: '#E5E7EB',
              color: '#374151',
              '&:hover': { borderColor: '#3B82F6' }
            }}
          >
            New Job
          </Button>
          <Button
            variant="contained"
            startIcon={<Work />}
            sx={{ 
              backgroundColor: '#3B82F6',
              '&:hover': { backgroundColor: '#2563EB' }
            }}
          >
            Quick Repair
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            '&:hover': { boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#10B981', mr: 2 }}>
                  <TrendingDown />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Turnover
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatCurrency(overview?.totalRevenue || 0)}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={formatPercentage(overview?.revenueChange || 0)}
                size="small"
                sx={{
                  backgroundColor: (overview?.revenueChange || 0) >= 0 ? '#D1FAE5' : '#FEE2E2',
                  color: (overview?.revenueChange || 0) >= 0 ? '#065F46' : '#991B1B'
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            '&:hover': { boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#F59E0B', mr: 2 }}>
                  <Receipt />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Unpaid Invoice
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stats?.totalInvoices || 0}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label="Pending"
                size="small"
                sx={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            '&:hover': { boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#3B82F6', mr: 2 }}>
                  <Build />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Stock Value
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatCurrency(stats?.monthlyRevenue || 0)}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label="Active"
                size="small"
                sx={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            '&:hover': { boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#8B5CF6', mr: 2 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Customers
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stats?.totalCustomers || 0}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label="Growing"
                size="small"
                sx={{ backgroundColor: '#EDE9FE', color: '#5B21B6' }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Service Requests */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Service Requests
              </Typography>
              <List>
                {recentActivity.slice(0, 3).map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ 
                          backgroundColor: getActivityColor(activity.type),
                          width: 32,
                          height: 32
                        }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={`${activity.userName} • ${formatTimeAgo(activity.timestamp)}`}
                      />
                      <Chip
                        label={activity.action}
                        size="small"
                        sx={{ 
                          backgroundColor: getActivityColor(activity.type) + '20',
                          color: getActivityColor(activity.type)
                        }}
                      />
                    </ListItem>
                    {index < 2 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Completed Jobs */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Completed Jobs
              </Typography>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircle sx={{ fontSize: 48, color: '#10B981', mb: 2 }} />
                <Typography variant="h4" sx={{ color: '#10B981', fontWeight: 600 }}>
                  {overview?.completedToday || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Jobs completed today
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* To-Do's */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                To-Do's
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add new to-do..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                />
                <Button
                  variant="contained"
                  onClick={handleAddTodo}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <Add />
                </Button>
              </Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Follow up with customer about repair status"
                    secondary="Due today"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Order replacement parts for iPhone 12"
                    secondary="Due tomorrow"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Activity
              </Typography>
              <List>
                {recentActivity.slice(0, 3).map((activity) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Avatar sx={{ 
                        backgroundColor: getActivityColor(activity.type),
                        width: 24,
                        height: 24
                      }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={formatTimeAgo(activity.timestamp)}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Job Progress */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Job Progress
              </Typography>
              <Box sx={{ height: 200, position: 'relative' }}>
                <Doughnut data={jobProgressData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Feedback Button */}
      <Box sx={{ 
        position: 'fixed', 
        right: 20, 
        bottom: 20, 
        zIndex: 1000 
      }}>
        <Button
          variant="contained"
          startIcon={<Feedback />}
          sx={{
            backgroundColor: '#3B82F6',
            borderRadius: 3,
            px: 3,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            '&:hover': { backgroundColor: '#2563EB' }
          }}
        >
          Feedback
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;
