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
  SelectChangeEvent,
  TextField,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ReportData {
  totalRevenue: number;
  totalJobs: number;
  totalCustomers: number;
  averageJobValue: number;
  completionRate: number;
}

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [reportType, setReportType] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<string>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalJobs: 0,
    totalCustomers: 0,
    averageJobValue: 0,
    completionRate: 0
  });

  useEffect(() => {
    loadReportData();
  }, [reportType, dateRange, startDate, endDate]);

  const loadReportData = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data
    setReportData({
      totalRevenue: 45680,
      totalJobs: 156,
      totalCustomers: 89,
      averageJobValue: 293,
      completionRate: 91.2
    });
  };

  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setReportType(event.target.value);
  };

  const handleDateRangeChange = (event: SelectChangeEvent) => {
    setDateRange(event.target.value);
  };

  const generateReport = () => {
    // Handle report generation
    console.log('Generating report:', { reportType, dateRange, startDate, endDate });
  };

  const exportReport = () => {
    // Handle report export
    console.log('Exporting report:', reportType);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          {t('Reports & Analytics')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('Generate comprehensive reports and analyze business performance')}
        </Typography>
      </Box>

      {/* Report Configuration */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {t('Report Configuration')}
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('Report Type')}</InputLabel>
                <Select
                  value={reportType}
                  label={t('Report Type')}
                  onChange={handleReportTypeChange}
                >
                  <MenuItem value="overview">{t('Business Overview')}</MenuItem>
                  <MenuItem value="sales">{t('Sales Report')}</MenuItem>
                  <MenuItem value="repairs">{t('Repair Report')}</MenuItem>
                  <MenuItem value="customers">{t('Customer Report')}</MenuItem>
                  <MenuItem value="inventory">{t('Inventory Report')}</MenuItem>
                  <MenuItem value="financial">{t('Financial Report')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('Date Range')}</InputLabel>
                <Select
                  value={dateRange}
                  label={t('Date Range')}
                  onChange={handleDateRangeChange}
                >
                  <MenuItem value="today">{t('Today')}</MenuItem>
                  <MenuItem value="week">{t('This Week')}</MenuItem>
                  <MenuItem value="month">{t('This Month')}</MenuItem>
                  <MenuItem value="quarter">{t('This Quarter')}</MenuItem>
                  <MenuItem value="year">{t('This Year')}</MenuItem>
                  <MenuItem value="custom">{t('Custom Range')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {dateRange === 'custom' && (
              <>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    type="date"
                    label={t('Start Date')}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    type="date"
                    label={t('End Date')}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AssessmentIcon />}
                onClick={generateReport}
              >
                {t('Generate')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Overview Dashboard */}
      {reportType === 'overview' && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      ${reportData.totalRevenue.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('Total Revenue')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WorkIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {reportData.totalJobs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('Total Jobs')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {reportData.totalCustomers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('Total Customers')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {reportData.completionRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('Completion Rate')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Report Content */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('Report Results')}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportReport}
            >
              {t('Export Report')}
            </Button>
          </Box>
          
          <Box sx={{ 
            minHeight: 400, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: `2px dashed ${theme.palette.divider}`,
            borderRadius: 2
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('Report Content')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('Select a report type and generate to view detailed analytics')}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportsPage;


