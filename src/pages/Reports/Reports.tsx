import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp,
  TrendingDown,
  Euro as EuroIcon,
  Assessment as ReportIcon,
  Build as RepairIcon,
  People as CustomersIcon,
  Inventory as InventoryIcon,
  Star as RatingIcon,
  Warning as AlertIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useResponsiveData } from '../../hooks/useResponsiveData';

interface ReportData {
  period: string;
  revenue: {
    total: number;
    change: number;
    byCategory: { category: string; amount: number; }[];
  };
  repairs: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    avgRepairTime: number;
    byType: { type: string; count: number; }[];
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    satisfaction: number;
    topCustomers: { name: string; repairs: number; spent: number; }[];
  };
  inventory: {
    totalValue: number;
    lowStock: number;
    topParts: { name: string; used: number; revenue: number; }[];
  };
  technicians: {
    performance: { name: string; completed: number; rating: number; avgTime: number; }[];
  };
}

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [currentTab, setCurrentTab] = useState(0);
  const [dateRange, setDateRange] = useState('30');
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [reportType, setReportType] = useState('overview');

  // Dynamic data management for reports
  const [reportsData, reportsActions] = useResponsiveData({
    endpoint: '/reports',
    realTime: false, // Disabled temporarily
    autoRefresh: false, // Disabled temporarily
    refreshInterval: 30000,
    pageSize: 10
  });

  const reportData = reportsData.data[0] || {
    period: 'Last 30 Days',
    revenue: {
      total: 0,
      change: 0,
      byCategory: []
    },
    repairs: {
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
      avgRepairTime: 0,
      byType: []
    },
    customers: {
      total: 0,
      new: 0,
      returning: 0,
      satisfaction: 0,
      topCustomers: []
    },
    inventory: {
      totalValue: 0,
      lowStock: 0,
      topParts: []
    },
    technicians: {
      performance: []
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    reportsActions.setFilters({ ...reportsData.filters, dateRange: range });
  };

  const handleReportTypeChange = (type: string) => {
    setReportType(type);
    reportsActions.setFilters({ ...reportsData.filters, reportType: type });
  };

  const generateReport = () => {
    reportsActions.refreshData();
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting report as ${format}`);
    // Implementation for export functionality
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, change, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {change >= 0 ? (
                  <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  color={change >= 0 ? 'success.main' : 'error.main'}
                  sx={{ fontWeight: 'medium' }}
                >
                  {Math.abs(change)}%
                </Typography>
              </Box>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Reports & Analytics
            </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={generateReport}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
          <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                    label="Date Range"
                >
                  <MenuItem value="7">Last 7 Days</MenuItem>
                  <MenuItem value="30">Last 30 Days</MenuItem>
                    <MenuItem value="90">Last 90 Days</MenuItem>
                  <MenuItem value="365">Last Year</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => handleReportTypeChange(e.target.value)}
                    label="Report Type"
                  >
                    <MenuItem value="overview">Overview</MenuItem>
                    <MenuItem value="revenue">Revenue</MenuItem>
                    <MenuItem value="repairs">Repairs</MenuItem>
                    <MenuItem value="customers">Customers</MenuItem>
                    <MenuItem value="inventory">Inventory</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            {dateRange === 'custom' && (
              <>
                  <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                  <Grid item xs={12} md={3}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
              </>
            )}
          </Grid>
          </CardContent>
        </Card>

        {/* Loading State */}
        {reportsData.loading && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Loading reports data...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {reportsData.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {reportsData.error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={`€${reportData.revenue.total.toFixed(2)}`}
              change={reportData.revenue.change}
              icon={<EuroIcon />}
              color={theme.palette.primary.main}
              subtitle={reportData.period}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Repairs"
              value={reportData.repairs.total}
              icon={<RepairIcon />}
              color={theme.palette.info.main}
              subtitle={`${reportData.repairs.completed} completed`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Customers"
              value={reportData.customers.total}
              icon={<CustomersIcon />}
              color={theme.palette.success.main}
              subtitle={`${reportData.customers.new} new this period`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Inventory Value"
              value={`€${reportData.inventory.totalValue.toFixed(2)}`}
              icon={<InventoryIcon />}
              color={theme.palette.warning.main}
              subtitle={`${reportData.inventory.lowStock} items low stock`}
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Revenue" />
            <Tab label="Repairs" />
            <Tab label="Customers" />
            <Tab label="Inventory" />
          </Tabs>
        </Box>

        {/* Content */}
        {currentTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue by Category
                  </Typography>
                  {reportData.revenue.byCategory.length > 0 ? (
                    <Doughnut
                      data={{
                        labels: reportData.revenue.byCategory.map((item: { category: string; amount: number }) => item.category),
                        datasets: [{
                          data: reportData.revenue.byCategory.map((item: { category: string; amount: number }) => item.amount),
                          backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF'
                          ]
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false
                      }}
                      height={300}
                    />
                  ) : (
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">No data available</Typography>
                  </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Repair Status
                  </Typography>
                  {reportData.repairs.byType.length > 0 ? (
                    <Bar
                      data={{
                        labels: reportData.repairs.byType.map((item: { type: string; count: number }) => item.type),
                        datasets: [{
                          label: 'Repairs',
                          data: reportData.repairs.byType.map((item: { type: string; count: number }) => item.count),
                          backgroundColor: '#36A2EB'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false
                      }}
                      height={300}
                    />
                  ) : (
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">No data available</Typography>
                  </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {currentTab === 1 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                Revenue Trends
                  </Typography>
              <Box sx={{ height: 400 }}>
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                      label: 'Revenue',
                      data: [12000, 19000, 15000, 25000, 22000, 30000],
                      borderColor: '#36A2EB',
                      backgroundColor: 'rgba(54, 162, 235, 0.1)'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </Box>
                </CardContent>
              </Card>
        )}

        {currentTab === 2 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                Repair Statistics
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                    <TableRow>
                      <TableCell>Total Repairs</TableCell>
                      <TableCell>{reportData.repairs.total}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Completed</TableCell>
                      <TableCell>{reportData.repairs.completed}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Pending</TableCell>
                      <TableCell>{reportData.repairs.pending}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Average Repair Time</TableCell>
                      <TableCell>{reportData.repairs.avgRepairTime} hours</TableCell>
                          </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
        )}

        {currentTab === 3 && (
          <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                Customer Analytics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Customer Satisfaction
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RatingIcon sx={{ color: 'warning.main' }} />
                    <Typography variant="h4">{reportData.customers.satisfaction}%</Typography>
                  </Box>
            </Grid>
            <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Top Customers
                  </Typography>
                  {reportData.customers.topCustomers.map((customer: { name: string; repairs: number; spent: number }, index: number) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{customer.name}</Typography>
                      <Typography variant="body2">€{customer.spent.toFixed(2)}</Typography>
                    </Box>
                  ))}
            </Grid>
          </Grid>
                </CardContent>
              </Card>
        )}

        {currentTab === 4 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                Inventory Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Top Parts
                  </Typography>
                  {reportData.inventory.topParts.map((part: { name: string; used: number; revenue: number }, index: number) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{part.name}</Typography>
                      <Typography variant="body2">{part.used} used</Typography>
                              </Box>
                  ))}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Low Stock Alert
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlertIcon sx={{ color: 'warning.main' }} />
                    <Typography variant="h4">{reportData.inventory.lowStock}</Typography>
                    <Typography variant="body2">items need restocking</Typography>
                              </Box>
                </Grid>
              </Grid>
                </CardContent>
              </Card>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Reports;

