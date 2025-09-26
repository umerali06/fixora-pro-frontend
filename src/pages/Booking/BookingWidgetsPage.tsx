import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Divider,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as PreviewIcon,
  Code as CodeIcon,
  Widgets as WidgetIcon,
  Analytics as AnalyticsIcon,
  CalendarToday as CalendarTodayIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DashboardHeader from '../../components/Layout/DashboardHeader';

interface BookingWidget {
  id: string;
  name: string;
  settings: any;
  services: any[];
  isActive: boolean;
  embedCode: string;
  createdAt: string;
  updatedAt: string;
  bookingCount: number;
}

interface WidgetSettings {
  theme: string;
  primaryColor: string;
  workingHours: {
    start: number;
    end: number;
  };
  slotDuration: number;
  maxBookingsPerSlot: number;
  requireEmail: boolean;
  requirePhone: boolean;
  allowRescheduling: boolean;
  confirmationMessage: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

const BookingWidgetsPage: React.FC = () => {
  const [widgets, setWidgets] = useState<BookingWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWidget, setEditingWidget] = useState<BookingWidget | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [previewWidget, setPreviewWidget] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    settings: {
      theme: 'default',
      primaryColor: '#3B82F6',
      workingHours: { start: 9, end: 17 },
      slotDuration: 30,
      maxBookingsPerSlot: 3,
      requireEmail: true,
      requirePhone: true,
      allowRescheduling: true,
      confirmationMessage: 'Thank you for your booking! We will contact you soon to confirm your appointment.',
      emailNotifications: true,
      smsNotifications: false
    } as WidgetSettings,
    services: [] as any[]
  });

  // Default settings for safety
  const defaultSettings: WidgetSettings = {
    theme: 'default',
    primaryColor: '#3B82F6',
    workingHours: { start: 9, end: 17 },
    slotDuration: 30,
    maxBookingsPerSlot: 3,
    requireEmail: true,
    requirePhone: true,
    allowRescheduling: true,
    confirmationMessage: 'Thank you for your booking! We will contact you soon to confirm your appointment.',
    emailNotifications: true,
    smsNotifications: false
  };

  const themes = [
    { value: 'default', label: 'Default', preview: '#3B82F6' },
    { value: 'dark', label: 'Dark', preview: '#6366F1' },
    { value: 'minimal', label: 'Minimal', preview: '#000000' }
  ];

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const loadWidgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Mock data for now - replace with actual API call
      const mockWidgets: BookingWidget[] = [
        {
          id: '1',
          name: 'Main Website Widget',
          settings: { theme: 'default', primaryColor: '#3B82F6' },
          services: [],
          isActive: true,
          embedCode: '<div id="repair-booking-widget-1"></div>',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          bookingCount: 45
        },
        {
          id: '2',
          name: 'Facebook Page Widget',
          settings: { theme: 'dark', primaryColor: '#6366F1' },
          services: [],
          isActive: true,
          embedCode: '<div id="repair-booking-widget-2"></div>',
          createdAt: '2024-01-10T14:30:00Z',
          updatedAt: '2024-01-10T14:30:00Z',
          bookingCount: 23
        },
        {
          id: '3',
          name: 'Instagram Widget',
          settings: { theme: 'minimal', primaryColor: '#000000' },
          services: [],
          isActive: false,
          embedCode: '<div id="repair-booking-widget-3"></div>',
          createdAt: '2024-01-05T09:15:00Z',
          updatedAt: '2024-01-05T09:15:00Z',
          bookingCount: 12
        }
      ];
      setWidgets(mockWidgets);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading widgets:', error);
      setError('Failed to load booking widgets. Please try again.');
      showSnackbar('Failed to load widgets', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWidgets();
  }, [loadWidgets]);

  const handleRefresh = () => {
    loadWidgets();
  };

  const handleCreateWidget = () => {
    setEditingWidget(null);
    setFormData({
      name: '',
      settings: {
        theme: 'default',
        primaryColor: '#3B82F6',
        workingHours: { start: 9, end: 17 },
        slotDuration: 30,
        maxBookingsPerSlot: 3,
        requireEmail: true,
        requirePhone: true,
        allowRescheduling: true,
        confirmationMessage: 'Thank you for your booking! We will contact you soon to confirm your appointment.',
        emailNotifications: true,
        smsNotifications: false
      },
      services: []
    });
    setOpenDialog(true);
  };

  const handleEditWidget = (widget: BookingWidget) => {
    setEditingWidget(widget);
    setFormData({
      name: widget.name,
      settings: widget.settings,
      services: widget.services
    });
    setOpenDialog(true);
  };

  const handleSaveWidget = async () => {
    // Validation
    if (!formData.name.trim()) {
      showSnackbar('Widget name is required', 'error');
      return;
    }

    const workingHours = formData.settings?.workingHours || defaultSettings.workingHours;
    if (workingHours.start >= workingHours.end) {
      showSnackbar('End time must be after start time', 'error');
      return;
    }

    const settings = formData.settings || defaultSettings;
    if (settings.slotDuration < 15 || settings.slotDuration > 240) {
      showSnackbar('Slot duration must be between 15 and 240 minutes', 'error');
      return;
    }

    if (settings.maxBookingsPerSlot < 1 || settings.maxBookingsPerSlot > 10) {
      showSnackbar('Max bookings per slot must be between 1 and 10', 'error');
      return;
    }

    try {
      if (editingWidget) {
        // Update existing widget
        setWidgets(prev => prev.map(w => 
          w.id === editingWidget.id 
            ? { ...w, ...formData, updatedAt: new Date().toISOString() }
            : w
        ));
        showSnackbar('Widget updated successfully', 'success');
      } else {
        // Create new widget
        const newWidget: BookingWidget = {
          id: Date.now().toString(),
          ...formData,
          isActive: true,
          embedCode: `<div id="repair-booking-widget-${Date.now()}"></div>`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bookingCount: 0
        };
        setWidgets(prev => [...prev, newWidget]);
        showSnackbar('Widget created successfully', 'success');
      }
      setOpenDialog(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error saving widget:', error);
      showSnackbar('Failed to save widget', 'error');
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      try {
        setWidgets(prev => prev.filter(w => w.id !== widgetId));
        showSnackbar('Widget deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting widget:', error);
        showSnackbar('Failed to delete widget', 'error');
      }
    }
  };

  const handleToggleActive = async (widgetId: string) => {
    try {
      setWidgets(prev => prev.map(w => 
        w.id === widgetId ? { ...w, isActive: !w.isActive } : w
      ));
      showSnackbar('Widget status updated', 'success');
    } catch (error) {
      console.error('Error toggling widget status:', error);
      showSnackbar('Failed to update widget status', 'error');
    }
  };

  const copyEmbedCode = (embedCode: string) => {
    navigator.clipboard.writeText(embedCode);
    showSnackbar('Embed code copied to clipboard', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderWidgetList = () => (
    <TableContainer component={Paper} sx={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Widget Details</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Theme</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Bookings</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Created</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {widgets.map((widget) => (
            <TableRow 
              key={widget.id}
              sx={{ 
                '&:hover': { backgroundColor: '#F9FAFB' },
                '&:last-child td': { borderBottom: 0 }
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: '8px', 
                    backgroundColor: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <WidgetIcon sx={{ color: '#3B82F6', fontSize: '20px' }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600} sx={{ color: '#1F2937' }}>
                    {widget.name}
                  </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '12px' }}>
                      ID: {widget.id}
                  </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                  sx={{ 
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: widget.settings?.primaryColor || '#3B82F6'
                    }}
                  />
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {widget.settings?.theme || 'default'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch
                  checked={widget.isActive}
                  onChange={() => handleToggleActive(widget.id)}
                  color="primary"
                    size="small"
                  />
                  <Chip
                    label={widget.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={widget.isActive ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ fontSize: '11px' }}
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon sx={{ fontSize: '16px', color: '#6B7280' }} />
                  <Typography variant="body2" fontWeight={500}>
                    {widget.bookingCount}
                </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {new Date(widget.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Preview Widget">
                    <IconButton 
                      size="small" 
                      onClick={() => setPreviewWidget(widget.id)}
                      sx={{ 
                        color: '#6B7280',
                        '&:hover': { color: '#3B82F6', backgroundColor: '#EEF2FF' }
                      }}
                    >
                      <PreviewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy Embed Code">
                    <IconButton 
                      size="small" 
                      onClick={() => copyEmbedCode(widget.embedCode)}
                      sx={{ 
                        color: '#6B7280',
                        '&:hover': { color: '#10B981', backgroundColor: '#ECFDF5' }
                      }}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Widget">
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditWidget(widget)}
                      sx={{ 
                        color: '#6B7280',
                        '&:hover': { color: '#F59E0B', backgroundColor: '#FFFBEB' }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Widget">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteWidget(widget.id)}
                      sx={{ 
                        color: '#6B7280',
                        '&:hover': { color: '#EF4444', backgroundColor: '#FEF2F2' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderStatsCards = () => {
    const totalBookings = widgets.reduce((sum, w) => sum + w.bookingCount, 0);
    const activeWidgets = widgets.filter(w => w.isActive).length;
    const totalWidgets = widgets.length;
    const avgBookingsPerWidget = totalWidgets > 0 ? Math.round(totalBookings / totalWidgets) : 0;

    return (
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '14px', opacity: 0.9, mb: 1 }}>
                    Total Bookings
                  </Typography>
                  <Typography sx={{ fontSize: '28px', fontWeight: 700 }}>
                    {totalBookings}
                  </Typography>
                </Box>
                <CalendarTodayIcon sx={{ fontSize: '32px', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '14px', opacity: 0.9, mb: 1 }}>
                    Active Widgets
                  </Typography>
                  <Typography sx={{ fontSize: '28px', fontWeight: 700 }}>
                    {activeWidgets}
                  </Typography>
                </Box>
                <WidgetIcon sx={{ fontSize: '32px', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '14px', opacity: 0.9, mb: 1 }}>
                    Total Widgets
                  </Typography>
                  <Typography sx={{ fontSize: '28px', fontWeight: 700 }}>
                    {totalWidgets}
                  </Typography>
                </Box>
                <CodeIcon sx={{ fontSize: '32px', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '14px', opacity: 0.9, mb: 1 }}>
                    Avg per Widget
                  </Typography>
                  <Typography sx={{ fontSize: '28px', fontWeight: 700 }}>
                    {avgBookingsPerWidget}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: '32px', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderAnalytics = () => {
    const totalBookings = widgets.reduce((sum, w) => sum + w.bookingCount, 0);
    const activeWidgets = widgets.filter(w => w.isActive).length;
    const totalWidgets = widgets.length;
    const avgBookingsPerWidget = totalWidgets > 0 ? Math.round(totalBookings / totalWidgets) : 0;


    const widgetPerformance = widgets.map(widget => ({
      name: widget.name,
      bookings: widget.bookingCount,
      status: widget.isActive ? 'Active' : 'Inactive'
    }));

    return (
    <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#6B7280', fontSize: '14px' }}>
                    Total Bookings
                  </Typography>
                  <Typography variant="h3" sx={{ color: '#1F2937', fontWeight: 700 }}>
                    {totalBookings}
                  </Typography>
                </Box>
                <CalendarTodayIcon sx={{ fontSize: 32, color: '#3B82F6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#6B7280', fontSize: '14px' }}>
                    Active Widgets
                  </Typography>
                  <Typography variant="h3" sx={{ color: '#1F2937', fontWeight: 700 }}>
                    {activeWidgets}
                  </Typography>
                </Box>
                <WidgetIcon sx={{ fontSize: 32, color: '#10B981' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#6B7280', fontSize: '14px' }}>
                    Total Widgets
                  </Typography>
                  <Typography variant="h3" sx={{ color: '#1F2937', fontWeight: 700 }}>
                    {totalWidgets}
                  </Typography>
                </Box>
                <CodeIcon sx={{ fontSize: 32, color: '#8B5CF6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#6B7280', fontSize: '14px' }}>
                    Avg per Widget
                  </Typography>
                  <Typography variant="h3" sx={{ color: '#1F2937', fontWeight: 700 }}>
                    {avgBookingsPerWidget}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 32, color: '#F59E0B' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Widget Performance Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, color: '#1F2937', fontWeight: 600 }}>
                Widget Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Widget Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Bookings</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {widgetPerformance.map((widget, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WidgetIcon sx={{ color: '#6B7280', fontSize: '20px' }} />
                            <Typography variant="body2" fontWeight={500}>
                              {widget.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={widget.status}
                            size="small"
                            color={widget.status === 'Active' ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {widget.bookings}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              width: 60, 
                              height: 8, 
                              backgroundColor: '#E5E7EB', 
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <Box sx={{ 
                                width: `${Math.min((widget.bookings / Math.max(...widgetPerformance.map(w => w.bookings))) * 100, 100)}%`,
                                height: '100%',
                                backgroundColor: widget.status === 'Active' ? '#10B981' : '#6B7280',
                                transition: 'width 0.3s ease'
                              }} />
                            </Box>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                              {Math.round((widget.bookings / Math.max(...widgetPerformance.map(w => w.bookings))) * 100)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderCalendar = () => {
    // Mock calendar data
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Generate calendar days
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate();
      const mockBookings = Math.floor(Math.random() * 5); // Random bookings for demo
      calendarDays.push({
        day,
        isToday,
        bookings: mockBookings,
        isCurrentMonth: true
      });
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#1F2937', fontWeight: 600 }}>
                  Booking Calendar - {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small">
                    Previous Month
                  </Button>
                  <Button variant="outlined" size="small">
                    Next Month
                  </Button>
                </Box>
              </Box>
              
              {/* Calendar Grid */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: 1,
                mb: 2
              }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Box key={day} sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    fontWeight: 600, 
                    color: '#6B7280',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px'
                  }}>
                    {day}
                  </Box>
                ))}
                
                {calendarDays.map((dayData, index) => (
                  <Box key={index} sx={{ 
                    p: 2, 
                    minHeight: 80,
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    backgroundColor: dayData?.isToday ? '#EEF2FF' : 'white',
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: dayData?.isToday ? '#DBEAFE' : '#F9FAFB'
                    }
                  }}>
                    {dayData && (
                      <>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: dayData.isToday ? 700 : 500,
                            color: dayData.isToday ? '#3B82F6' : '#374151'
                          }}
                        >
                          {dayData.day}
                        </Typography>
                        {dayData.bookings > 0 && (
                          <Box sx={{ 
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: '#10B981',
                            color: 'white',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 600
                          }}>
                            {dayData.bookings}
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                ))}
              </Box>
              
              {/* Legend */}
              <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    backgroundColor: '#EEF2FF', 
                    borderRadius: '2px' 
                  }} />
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    Today
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    backgroundColor: '#10B981', 
                    borderRadius: '50%' 
                  }} />
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    Has Bookings
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Upcoming Bookings */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
              <Typography variant="h6" sx={{ mb: 3, color: '#1F2937', fontWeight: 600 }}>
                Upcoming Bookings
            </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { time: '9:00 AM', customer: 'John Doe', service: 'iPhone Repair', status: 'Confirmed' },
                  { time: '10:30 AM', customer: 'Jane Smith', service: 'Laptop Service', status: 'Pending' },
                  { time: '2:00 PM', customer: 'Mike Johnson', service: 'Screen Replacement', status: 'Confirmed' },
                  { time: '3:30 PM', customer: 'Sarah Wilson', service: 'Battery Replacement', status: 'Pending' }
                ].map((booking, index) => (
                  <Box key={index} sx={{ 
                    p: 2, 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    backgroundColor: '#F9FAFB'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {booking.time}
            </Typography>
                      <Chip 
                        label={booking.status} 
                        size="small" 
                        color={booking.status === 'Confirmed' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                      {booking.customer} - {booking.service}
                    </Typography>
                  </Box>
                ))}
              </Box>
          </CardContent>
        </Card>
      </Grid>
        
        {/* Booking Statistics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
              <Typography variant="h6" sx={{ mb: 3, color: '#1F2937', fontWeight: 600 }}>
                This Week's Statistics
            </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Total Bookings
            </Typography>
                  <Typography variant="h6" sx={{ color: '#1F2937', fontWeight: 600 }}>
                    24
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Confirmed
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#10B981', fontWeight: 600 }}>
                    18
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Pending
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#F59E0B', fontWeight: 600 }}>
                    6
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Cancelled
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#EF4444', fontWeight: 600 }}>
                    2
                  </Typography>
                </Box>
              </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
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
            <WidgetIcon sx={{ color: '#3BB2FF', fontSize: { xs: 24, sm: 28 } }} />
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              color: '#1A202C',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}>
          Booking Widgets
        </Typography>
          </Box>
          
          {/* Refresh Button and Last Updated */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
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

        <Typography variant="body1" sx={{ 
          color: '#99A7BD', 
          mb: 3,
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          Create and manage booking widgets for your website and social media
        </Typography>
        
        {/* Statistics Cards */}
        {renderStatsCards()}
        
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* No Data Alert */}
        {!loading && widgets.length === 0 && !error && (
          <Alert severity="info" sx={{ mb: 3 }}>
            No booking widgets found. Create your first widget to get started.
          </Alert>
        )}

        {/* Main Content */}
        <Box sx={{ 
          backgroundColor: 'transparent',
          width: '100%',
          maxWidth: '1360px',
          mx: 'auto'
        }}>
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Widgets" icon={<WidgetIcon />} />
          <Tab label="Analytics" icon={<AnalyticsIcon />} />
              <Tab label="Calendar" icon={<CalendarTodayIcon />} />
        </Tabs>
      </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {activeTab === 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#374151' }}>
                    Manage Your Widgets
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateWidget}
                    sx={{
                      backgroundColor: '#3B82F6',
                      '&:hover': { backgroundColor: '#2563EB' }
                    }}
                  >
                    Create Widget
                  </Button>
                </Box>
              )}
      {activeTab === 0 && renderWidgetList()}
      {activeTab === 1 && renderAnalytics()}
              {activeTab === 2 && renderCalendar()}
            </>
          )}
        </Box>
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2, 
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WidgetIcon sx={{ color: '#3B82F6' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {editingWidget ? 'Edit Widget' : 'Create New Widget'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Widget Name"
                placeholder="Enter a descriptive name for your widget"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
                Appearance Settings
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={formData.settings?.theme || defaultSettings.theme}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { 
                      ...(prev.settings || defaultSettings), 
                      theme: e.target.value 
                    }
                  }))}
                  sx={{
                    borderRadius: '8px'
                  }}
                >
                  {themes.map((theme) => (
                    <MenuItem key={theme.value} value={theme.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: theme.preview
                          }}
                        />
                        <Typography>{theme.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Primary Color"
                type="color"
                value={formData.settings?.primaryColor || defaultSettings.primaryColor}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { 
                    ...(prev.settings || defaultSettings), 
                    primaryColor: e.target.value 
                  }
                }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
                Working Hours & Availability
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Start Time</InputLabel>
                <Select
                  value={formData.settings?.workingHours?.start || defaultSettings.workingHours.start}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      workingHours: { 
                        ...(prev.settings?.workingHours || defaultSettings.workingHours), 
                        start: e.target.value as number 
                      }
                    }
                  }))}
                  sx={{ borderRadius: '8px' }}
                >
                  {timeSlots.map((hour) => (
                    <MenuItem key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}:00
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>End Time</InputLabel>
                <Select
                  value={formData.settings?.workingHours?.end || defaultSettings.workingHours.end}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      workingHours: { 
                        ...(prev.settings?.workingHours || defaultSettings.workingHours), 
                        end: e.target.value as number 
                      }
                    }
                  }))}
                  sx={{ borderRadius: '8px' }}
                >
                  {timeSlots.map((hour) => (
                    <MenuItem key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}:00
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Slot Duration (minutes)"
                type="number"
                inputProps={{ min: 15, max: 240 }}
                value={formData.settings?.slotDuration || defaultSettings.slotDuration}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { 
                    ...(prev.settings || defaultSettings), 
                    slotDuration: parseInt(e.target.value) || 30 
                  }
                }))}
                helperText="Duration between 15-240 minutes"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Bookings Per Slot"
                type="number"
                inputProps={{ min: 1, max: 10 }}
                value={formData.settings?.maxBookingsPerSlot || defaultSettings.maxBookingsPerSlot}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { 
                    ...(prev.settings || defaultSettings), 
                    maxBookingsPerSlot: parseInt(e.target.value) || 1 
                  }
                }))}
                helperText="Maximum 1-10 bookings per time slot"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
                Form Settings
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings?.requireEmail ?? defaultSettings.requireEmail}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { 
                        ...(prev.settings || defaultSettings), 
                        requireEmail: e.target.checked 
                      }
                    }))}
                  />
                }
                label="Require Email"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings?.requirePhone ?? defaultSettings.requirePhone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { 
                        ...(prev.settings || defaultSettings), 
                        requirePhone: e.target.checked 
                      }
                    }))}
                  />
                }
                label="Require Phone"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings?.allowRescheduling ?? defaultSettings.allowRescheduling}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { 
                        ...(prev.settings || defaultSettings), 
                        allowRescheduling: e.target.checked 
                      }
                    }))}
                  />
                }
                label="Allow Rescheduling"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings?.emailNotifications ?? defaultSettings.emailNotifications}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { 
                        ...(prev.settings || defaultSettings), 
                        emailNotifications: e.target.checked 
                      }
                    }))}
                  />
                }
                label="Email Notifications"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirmation Message"
                multiline
                rows={3}
                placeholder="Thank you for your booking! We will contact you soon to confirm your appointment."
                value={formData.settings?.confirmationMessage || defaultSettings.confirmationMessage}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { 
                    ...(prev.settings || defaultSettings), 
                    confirmationMessage: e.target.value 
                  }
                }))}
                helperText="This message will be shown to customers after they complete their booking"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
          gap: 1
        }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{
              color: '#6B7280',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveWidget}
            sx={{
              backgroundColor: '#3B82F6',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': { backgroundColor: '#2563EB' }
            }}
          >
            {editingWidget ? 'Update Widget' : 'Create Widget'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog 
        open={!!previewWidget} 
        onClose={() => setPreviewWidget(null)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2, 
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PreviewIcon sx={{ color: '#3B82F6' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Widget Preview
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ 
            border: '2px dashed #D1D5DB', 
            borderRadius: '12px', 
            p: 4, 
            backgroundColor: '#F9FAFB',
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <WidgetIcon sx={{ fontSize: 48, color: '#9CA3AF', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#374151', mb: 1 }}>
              Widget Preview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This is where your booking widget would appear. The actual widget will be interactive and allow customers to book appointments.
            </Typography>
            <Box sx={{ 
              p: 3, 
              backgroundColor: 'white', 
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              width: '100%',
              maxWidth: 300
            }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#374151' }}>
                Sample Booking Form
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField size="small" placeholder="Your Name" disabled />
                <TextField size="small" placeholder="Email Address" disabled />
                <TextField size="small" placeholder="Phone Number" disabled />
                <TextField size="small" placeholder="Select Date" disabled />
                <TextField size="small" placeholder="Select Time" disabled />
                <Button variant="contained" disabled sx={{ mt: 1 }}>
                  Book Appointment
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB'
        }}>
          <Button 
            onClick={() => setPreviewWidget(null)}
            sx={{
              color: '#6B7280',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookingWidgetsPage;
