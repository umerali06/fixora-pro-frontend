import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Euro,
  Refresh,
  Assessment as AssessmentIcon,
  Build as RepairIcon,
  People as CustomersIcon,
  Inventory as InventoryIcon,
  Receipt as InvoiceIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CompleteIcon,
  MonetizationOn as RevenueIcon,
  Notifications as AlertsIcon,
  ShowChart as AnalyticsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  activeRepairs: number;
  repairsChange: number;
  completedToday: number;
  completedChange: number;
  pendingEstimates: number;
  estimatesChange: number;
  lowStockItems: number;
  stockAlerts: number;
  customerSatisfaction: number;
  satisfactionChange: number;
}

interface RepairStatusData {
  pending: number;
  inProgress: number;
  awaitingParts: number;
  readyForPickup: number;
  completed: number;
}

interface QuickAction {
  title: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

const AdvancedDashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 45250.80,
    revenueChange: 12.5,
    activeRepairs: 23,
    repairsChange: -5.2,
    completedToday: 8,
    completedChange: 33.3,
    pendingEstimates: 12,
    estimatesChange: 8.7,
    lowStockItems: 5,
    stockAlerts: 3,
    customerSatisfaction: 4.8,
    satisfactionChange: 4.2,
  });

  const [repairStatus, setRepairStatus] = useState<RepairStatusData>({
    pending: 12,
    inProgress: 23,
    awaitingParts: 8,
    readyForPickup: 15,
    completed: 142,
  });

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      title: t('dashboard.createRepair'),
      icon: <RepairIcon />,
      color: theme.palette.primary.main,
      action: () => console.log('Create repair'),
    },
    {
      title: t('dashboard.addCustomer'),
      icon: <CustomersIcon />,
      color: theme.palette.secondary.main,
      action: () => console.log('Add customer'),
    },
    {
      title: t('dashboard.generateInvoice'),
      icon: <InvoiceIcon />,
      color: theme.palette.success.main,
      action: () => console.log('Generate invoice'),
    },
    {
      title: t('dashboard.checkInventory'),
      icon: <InventoryIcon />,
      color: theme.palette.warning.main,
      action: () => console.log('Check inventory'),
    },
  ];

  // Chart Data
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [32000, 35000, 28000, 42000, 39000, 45250],
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}20`,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const repairStatusChartData = {
    labels: ['Pending', 'In Progress', 'Awaiting Parts', 'Ready for Pickup'],
    datasets: [
      {
        data: [repairStatus.pending, repairStatus.inProgress, repairStatus.awaitingParts, repairStatus.readyForPickup],
        backgroundColor: [
          theme.palette.warning.main,
          theme.palette.info.main,
          theme.palette.error.main,
          theme.palette.success.main,
        ],
        hoverOffset: 4,
      },
    ],
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {value}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              {change >= 0 ? (
                <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
              ) : (
                <TrendingDown sx={{ color: theme.palette.error.main, fontSize: 16, mr: 0.5 }} />
              )}
              <Typography
                variant="body2"
                color={change >= 0 ? 'success.main' : 'error.main'}
                fontWeight="medium"
              >
                {Math.abs(change)}%
              </Typography>
            </Box>
          </Box>
          <Avatar
            sx={{
              bgcolor: color,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('dashboard.welcome')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('dashboard.subtitle')}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title={t('dashboard.refresh')}>
            <IconButton color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            {t('dashboard.customize')}
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalRevenue')}
            value={`€${stats.totalRevenue.toLocaleString()}`}
            change={stats.revenueChange}
            icon={<RevenueIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.activeRepairs')}
            value={stats.activeRepairs}
            change={stats.repairsChange}
            icon={<RepairIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.completedToday')}
            value={stats.completedToday}
            change={stats.completedChange}
            icon={<CompleteIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.pendingEstimates')}
            value={stats.pendingEstimates}
            change={stats.estimatesChange}
            icon={<ScheduleIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* Charts and Quick Actions Row */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '400px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.revenueOverview')}
              </Typography>
              <Box sx={{ height: '320px', position: 'relative' }}>
                <Line
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value: any) => `€${value.toLocaleString()}`,
                        },
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '400px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.quickActions')}
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {quickActions.map((action, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[4],
                        },
                      }}
                      onClick={action.action}
                    >
                      <Avatar
                        sx={{
                          bgcolor: action.color,
                          mx: 'auto',
                          mb: 1,
                        }}
                      >
                        {action.icon}
                      </Avatar>
                      <Typography variant="body2" textAlign="center">
                        {action.title}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row - Repair Status & Recent Activity */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Repair Status Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.repairStatus')}
              </Typography>
              <Box sx={{ height: '300px', position: 'relative' }}>
                <Doughnut
                  data={repairStatusChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.recentActivity')}
              </Typography>
              <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
                {[
                  { type: 'repair', message: 'iPhone 12 repair completed', time: '5 min ago', status: 'success' },
                  { type: 'customer', message: 'New customer John Doe added', time: '15 min ago', status: 'info' },
                  { type: 'inventory', message: 'Low stock alert: iPhone screens', time: '1 hour ago', status: 'warning' },
                  { type: 'invoice', message: 'Invoice #1234 paid', time: '2 hours ago', status: 'success' },
                ].map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: 
                              activity.status === 'success' ? theme.palette.success.main :
                              activity.status === 'warning' ? theme.palette.warning.main :
                              theme.palette.info.main,
                            width: 32,
                            height: 32,
                          }}
                        >
                          {activity.type === 'repair' && <RepairIcon fontSize="small" />}
                          {activity.type === 'customer' && <CustomersIcon fontSize="small" />}
                          {activity.type === 'inventory' && <InventoryIcon fontSize="small" />}
                          {activity.type === 'invoice' && <InvoiceIcon fontSize="small" />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.message}
                        secondary={activity.time}
                      />
                    </ListItem>
                    {index < 3 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedDashboard;

