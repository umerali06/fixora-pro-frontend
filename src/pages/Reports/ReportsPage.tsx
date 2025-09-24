import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';
// Simple chart components using Material-UI
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { reportingAPI } from '../../services/api';
import { getOrgIdFromToken } from '../../utils/auth';
import toast from 'react-hot-toast';

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  totalRepairs: number;
  totalCustomers: number;
  averageOrderValue: number;
  completionRate: number;
  revenueByPeriod?: Array<{ period: string; revenue: number; orders: number }>;
  topCustomers?: Array<{ customerId: string; customerName: string; totalSpent: number; orderCount: number }>;
  repairsByStatus?: Array<{ status: string; count: number; percentage: number }>;
  technicianPerformance?: Array<{ technicianId: string; technicianName: string; completedRepairs: number; averageTime: number }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const COLORS = ['#3BB2FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#F39C12', '#9B59B6', '#E74C3C'];

// Simple chart components
const SimpleBarChart: React.FC<{ data: Array<{ name: string; value: number }>; title: string }> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ minWidth: 100 }}>
              <Typography variant="body2">{item.name}</Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  height: 20,
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                  borderRadius: 1
                }}
              />
              <Typography variant="body2" sx={{ minWidth: 40 }}>
                {item.value}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const SimplePieChart: React.FC<{ data: Array<{ name: string; value: number; percentage: number }>; title: string }> = ({ data, title }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                backgroundColor: COLORS[index % COLORS.length],
                borderRadius: '50%'
              }}
            />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {item.name}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {item.value} ({item.percentage.toFixed(1)}%)
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};


const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reportType, setReportType] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<string>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Set default date range
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const orgId = getOrgIdFromToken();
      if (!orgId) {
        throw new Error('Organization ID not found. Please log in again.');
      }

      const params = {
        orgId,
        dateFrom: startDate,
        dateTo: endDate
      };

      let data;
      switch (reportType) {
        case 'sales':
          data = await reportingAPI.getSalesReport(params);
          break;
        case 'repairs':
          data = await reportingAPI.getRepairReport(params);
          break;
        case 'customers':
          data = await reportingAPI.getCustomerReport(params);
          break;
        case 'inventory':
          data = await reportingAPI.getInventoryReport(params);
          break;
        case 'financial':
          data = await reportingAPI.getFinancialReport(params);
          break;
        default:
          // For overview, we'll combine multiple reports
          const [salesData, repairData, customerData] = await Promise.all([
            reportingAPI.getSalesReport(params),
            reportingAPI.getRepairReport(params),
            reportingAPI.getCustomerReport(params)
          ]);
          data = {
            totalRevenue: salesData.totalRevenue || 0,
            totalOrders: salesData.totalOrders || 0,
            totalRepairs: repairData.totalRepairs || 0,
            totalCustomers: customerData.totalCustomers || 0,
            averageOrderValue: salesData.averageOrderValue || 0,
            completionRate: repairData.completionRate || 0,
            revenueByPeriod: salesData.revenueByPeriod || [],
            topCustomers: salesData.topCustomers || [],
            repairsByStatus: repairData.repairsByStatus || [],
            technicianPerformance: repairData.technicianPerformance || []
          };
      }

      console.log('📊 Report data:', data);
      setReportData(data);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch report data');
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, startDate, endDate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    const today = new Date();
    let start, end;

    switch (range) {
      case 'week':
        start = new Date(today.setDate(today.getDate() - 7));
        end = new Date();
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), quarter * 3, 1);
        end = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };


  // Export functionality
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    setExporting(true);
    setExportDialogOpen(false);
    
    const orgId = getOrgIdFromToken();
    if (!orgId) {
      toast.error('Organization ID not found. Please log in again.');
      setExporting(false);
      return;
    }
    
    const exportData = {
      orgId,
      reportType: reportType === 'overview' ? 'dashboard' : reportType,
      format,
      dateFrom: startDate,
      dateTo: endDate
    };

    try {
      reportingAPI.exportReport(exportData).then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const fileName = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success(`${format.toUpperCase()} report exported successfully!`);
      }).catch((error) => {
        console.error('Export error:', error);
        toast.error(`Failed to export ${format.toUpperCase()} report`);
      }).finally(() => {
        setExporting(false);
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${format.toUpperCase()} report`);
      setExporting(false);
    }
  };

  // Print functionality
  const handlePrint = () => {
    setPrintDialogOpen(true);
  };

  const handlePrintConfirm = () => {
    setPrintDialogOpen(false);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = generatePrintContent();
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  // Generate print content
  const generatePrintContent = () => {
    if (!reportData) return '';

    const currentDate = new Date().toLocaleDateString();
    const dateRange = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      : 'All Time';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3BB2FF; padding-bottom: 20px; }
          .header h1 { color: #2c3e50; margin-bottom: 10px; }
          .header p { color: #666; margin: 5px 0; }
          .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
          .summary-card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; }
          .summary-card h3 { color: #495057; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; }
          .summary-card .value { color: #3BB2FF; font-size: 24px; font-weight: bold; margin: 0; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #2c3e50; font-size: 20px; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef; }
          .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .data-table th { background: #3BB2FF; color: white; padding: 12px; text-align: left; font-weight: 600; }
          .data-table td { padding: 12px; border-bottom: 1px solid #e9ecef; }
          .data-table tr:nth-child(even) { background: #f8f9fa; }
          @media print { body { margin: 0; } .summary-cards { grid-template-columns: repeat(4, 1fr); } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
          <p>Period: ${dateRange}</p>
          <p>Generated: ${currentDate}</p>
        </div>
        
        <div class="summary-cards">
          ${reportData.totalRevenue !== undefined ? `
            <div class="summary-card">
              <h3>Total Revenue</h3>
              <p class="value">$${reportData.totalRevenue.toLocaleString()}</p>
            </div>
          ` : ''}
          ${reportData.totalOrders !== undefined ? `
            <div class="summary-card">
              <h3>Total Orders</h3>
              <p class="value">${reportData.totalOrders.toLocaleString()}</p>
            </div>
          ` : ''}
          ${reportData.totalRepairs !== undefined ? `
            <div class="summary-card">
              <h3>Total Repairs</h3>
              <p class="value">${reportData.totalRepairs.toLocaleString()}</p>
            </div>
          ` : ''}
          ${reportData.totalCustomers !== undefined ? `
            <div class="summary-card">
              <h3>Total Customers</h3>
              <p class="value">${reportData.totalCustomers.toLocaleString()}</p>
            </div>
          ` : ''}
        </div>
        
        ${reportData.revenueByPeriod && reportData.revenueByPeriod.length > 0 ? `
          <div class="section">
            <h2>Revenue by Period</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.revenueByPeriod.map(item => `
                  <tr>
                    <td>${item.period}</td>
                    <td>$${item.revenue.toLocaleString()}</td>
                    <td>${item.orders}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
        
        ${reportData.topCustomers && reportData.topCustomers.length > 0 ? `
          <div class="section">
            <h2>Top Customers</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total Spent</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.topCustomers.map(item => `
                  <tr>
                    <td>${item.customerName}</td>
                    <td>$${item.totalSpent.toLocaleString()}</td>
                    <td>${item.orderCount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      </body>
      </html>
    `;
  };

  if (loading && !reportData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Dashboard Header */}
      <DashboardHeader />
      
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C' }}>
            Reports & Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchReportData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export">
              <IconButton onClick={() => setExportDialogOpen(true)} disabled={exporting}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton onClick={handlePrint}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    label="Report Type"
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <MenuItem value="overview">Overview</MenuItem>
                    <MenuItem value="sales">Sales Report</MenuItem>
                    <MenuItem value="repairs">Repair Report</MenuItem>
                    <MenuItem value="customers">Customer Report</MenuItem>
                    <MenuItem value="inventory">Inventory Report</MenuItem>
                    <MenuItem value="financial">Financial Report</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRange}
                    label="Date Range"
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                  >
                    <MenuItem value="week">Last Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="quarter">This Quarter</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AssessmentIcon />}
                  onClick={fetchReportData}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Generate Report'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Report Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Overview" icon={<BarChartIcon />} />
              <Tab label="Charts" icon={<PieChartIcon />} />
              <Tab label="Details" icon={<TimelineIcon />} />
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={activeTab} index={0}>
            {reportData && (
              <>
                {/* Key Metrics */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                          {formatCurrency(reportData.totalRevenue)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Total Revenue
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                      <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                          {reportData.totalOrders}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Total Orders
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                      <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                          {reportData.totalRepairs}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Total Repairs
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                      <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                          {reportData.totalCustomers}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Total Customers
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                      <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                          {formatCurrency(reportData.averageOrderValue)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Avg Order Value
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
                      <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                          {reportData.completionRate}%
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Completion Rate
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Revenue Chart */}
                {reportData.revenueByPeriod && reportData.revenueByPeriod.length > 0 && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <SimpleBarChart
                        data={reportData.revenueByPeriod.map(item => ({
                          name: item.period,
                          value: item.revenue
                        }))}
                        title="Revenue Trend"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Top Customers */}
                {reportData.topCustomers && reportData.topCustomers.length > 0 && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Top Customers
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Customer</TableCell>
                              <TableCell>Orders</TableCell>
                              <TableCell>Total Spent</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reportData.topCustomers.map((customer, index) => (
                              <TableRow key={customer.customerId}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {customer.customerName}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={customer.orderCount} size="small" />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {formatCurrency(customer.totalSpent)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabPanel>

          {/* Charts Tab */}
          <TabPanel value={activeTab} index={1}>
            {reportData && (
              <Grid container spacing={3}>
                {/* Repair Status Chart */}
                {reportData.repairsByStatus && reportData.repairsByStatus.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <SimplePieChart
                          data={reportData.repairsByStatus.map(item => ({
                            name: item.status,
                            value: item.count,
                            percentage: item.percentage
                          }))}
                          title="Repair Status Distribution"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Technician Performance Chart */}
                {reportData.technicianPerformance && reportData.technicianPerformance.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <SimpleBarChart
                          data={reportData.technicianPerformance.map(item => ({
                            name: item.technicianName,
                            value: item.completedRepairs
                          }))}
                          title="Technician Performance"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            )}
          </TabPanel>

          {/* Details Tab */}
          <TabPanel value={activeTab} index={2}>
            {reportData && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Report Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="textSecondary">
                            Report Period
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(startDate)} - {formatDate(endDate)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="textSecondary">
                            Report Type
                          </Typography>
                          <Typography variant="body1">
                            {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="textSecondary">
                            Generated On
                          </Typography>
                          <Typography variant="body1">
                            {new Date().toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="textSecondary">
                            Data Points
                          </Typography>
                          <Typography variant="body1">
                            {Object.keys(reportData).length} metrics
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </TabPanel>
        </Card>
      </Box>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose the format for your report export:
          </Typography>
          <List>
            <ListItem 
              button 
              onClick={() => handleExport('pdf')}
              sx={{ borderRadius: 1, mb: 1, '&:hover': { backgroundColor: 'action.hover' } }}
            >
              <ListItemIcon>
                <PdfIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="PDF Document" 
                secondary="Professional formatted report with charts and tables"
              />
            </ListItem>
            <ListItem 
              button 
              onClick={() => handleExport('excel')}
              sx={{ borderRadius: 1, mb: 1, '&:hover': { backgroundColor: 'action.hover' } }}
            >
              <ListItemIcon>
                <ExcelIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Excel Spreadsheet" 
                secondary="Data in spreadsheet format for further analysis"
              />
            </ListItem>
            <ListItem 
              button 
              onClick={() => handleExport('csv')}
              sx={{ borderRadius: 1, '&:hover': { backgroundColor: 'action.hover' } }}
            >
              <ListItemIcon>
                <CsvIcon color="info" />
              </ListItemIcon>
              <ListItemText 
                primary="CSV File" 
                secondary="Comma-separated values for data import"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Print Dialog */}
      <Dialog open={printDialogOpen} onClose={() => setPrintDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Print Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will open a print preview of your report. You can then print it using your browser's print dialog.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              The report will include all visible data, charts, and tables in a print-friendly format.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePrintConfirm} variant="contained" startIcon={<PrintIcon />}>
            Print Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportsPage;
