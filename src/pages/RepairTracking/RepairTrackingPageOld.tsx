import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Avatar,
  Fab,
  LinearProgress,
  Alert,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Switch,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  LocalShipping as ShippingIcon,
  Done as DoneIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import RepairIntakeForm from '../../components/Repair/RepairIntakeForm';
import OrderConfirmation from '../../components/Repair/OrderConfirmation';
import DeliveryNote from '../../components/Repair/DeliveryNote';
import { repairTicketAPI } from '../../services/api';

interface Repair {
  id: string;
  repairNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issue: string;
  status: 'pending' | 'diagnosis' | 'in_progress' | 'waiting_parts' | 'testing' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCompletion: string;
  actualCompletion?: string;
  assignedTechnician?: string;
  createdAt: string;
  updatedAt: string;
  notes: string[];
  cost: number;
}

interface RepairStats {
  totalRepairs: number;
  pendingRepairs: number;
  inProgressRepairs: number;
  completedRepairs: number;
  totalRevenue: number;
  averageRepairTime: number;
  urgentRepairs: number;
  thisMonthRepairs: number;
}

interface CreateRepairForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCompletion: string;
  assignedTechnician: string;
  notes: string;
  cost: number;
}

const RepairTrackingPage: React.FC = () => {
  const { t } = useTranslation();
  
  // State Management
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [stats, setStats] = useState<RepairStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');
  
  // Dialog Management
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Form Management
  const [createForm, setCreateForm] = useState<CreateRepairForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deviceType: '',
    deviceBrand: '',
    deviceModel: '',
    issue: '',
    priority: 'medium',
    estimatedCompletion: '',
    assignedTechnician: '',
    notes: '',
    cost: 0
  });

  // Add new state for repair intake
  const [repairIntakeOpen, setRepairIntakeOpen] = useState(false);
  const [orderConfirmationOpen, setOrderConfirmationOpen] = useState(false);
  const [deliveryNoteOpen, setDeliveryNoteOpen] = useState(false);
  const [selectedRepairForDocuments, setSelectedRepairForDocuments] = useState<Repair | null>(null);

  useEffect(() => {
    fetchRepairsData();
  }, []);

  const fetchRepairsData = async () => {
    try {
    setLoading(true);
      setError(null);
      
      const [repairsResponse, statsResponse] = await Promise.all([
        fetch('/api/v1/repairs'),
        fetch('/api/v1/repairs/stats')
      ]);

      if (!repairsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch repairs data');
      }

      const repairsData = await repairsResponse.json();
      const statsData = await statsResponse.json();

      setRepairs(repairsData.data || []);
      setStats(statsData.data || null);
    } catch (err) {
      console.error('Error fetching repairs data:', err);
      setError('Failed to load repairs data');
      
      // Fallback to mock data for development
    const mockRepairs: Repair[] = [
      {
        id: 'REP-001',
        repairNumber: 'R-2024-001',
        customerName: 'John Doe',
        customerEmail: 'john.doe@email.com',
        customerPhone: '+1-555-0123',
        deviceType: 'Smartphone',
        deviceBrand: 'Apple',
        deviceModel: 'iPhone 12',
        issue: 'Screen cracked and not responding to touch',
        status: 'in_progress',
        priority: 'high',
        estimatedCompletion: '2024-01-20',
        assignedTechnician: 'Mike Johnson',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        notes: [
          'Customer dropped phone, screen shattered',
          'Ordered replacement screen from supplier',
          'Screen replacement in progress'
        ],
        cost: 150.00
      },
      {
        id: 'REP-002',
        repairNumber: 'R-2024-002',
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@email.com',
        customerPhone: '+1-555-0456',
        deviceType: 'Tablet',
        deviceBrand: 'Samsung',
        deviceModel: 'Galaxy Tab S7',
        issue: 'Battery not charging, device shuts down randomly',
        status: 'diagnosis',
        priority: 'medium',
        estimatedCompletion: '2024-01-22',
        assignedTechnician: 'Sarah Wilson',
        createdAt: '2024-01-16T09:15:00Z',
        updatedAt: '2024-01-16T16:45:00Z',
        notes: [
          'Battery test shows 15% capacity',
          'Charging port appears to be working',
          'Need to order replacement battery'
        ],
        cost: 89.99
      },
      {
        id: 'REP-003',
        repairNumber: 'R-2024-003',
        customerName: 'Bob Johnson',
        customerEmail: 'bob.johnson@email.com',
        customerPhone: '+1-555-0789',
        deviceType: 'Laptop',
        deviceBrand: 'Dell',
        deviceModel: 'XPS 13',
        issue: 'Keyboard not working, some keys unresponsive',
        status: 'waiting_parts',
        priority: 'low',
        estimatedCompletion: '2024-01-25',
        assignedTechnician: 'Mike Johnson',
        createdAt: '2024-01-14T11:45:00Z',
        updatedAt: '2024-01-16T10:30:00Z',
        notes: [
          'Diagnosed as faulty keyboard assembly',
          'Ordered replacement keyboard',
          'Waiting for parts delivery'
        ],
        cost: 120.00
      }
    ];
    
    const mockStats: RepairStats = {
      totalRepairs: mockRepairs.length,
      pendingRepairs: mockRepairs.filter(r => r.status === 'pending').length,
      inProgressRepairs: mockRepairs.filter(r => ['diagnosis', 'in_progress', 'waiting_parts', 'testing'].includes(r.status)).length,
      completedRepairs: mockRepairs.filter(r => r.status === 'completed').length,
      totalRevenue: mockRepairs.reduce((sum, r) => sum + r.cost, 0),
      averageRepairTime: 3.5, // days
      urgentRepairs: mockRepairs.filter(r => r.priority === 'urgent').length,
      thisMonthRepairs: mockRepairs.length
    };
    
    setRepairs(mockRepairs);
    setStats(mockStats);
    } finally {
    setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, repair: Repair) => {
    setAnchorEl(event.currentTarget);
    setSelectedRepair(repair);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRepair(null);
  };

  const handleAction = (action: string) => {
    if (!selectedRepair) return;
    
    switch (action) {
      case 'view':
        setViewDialog(true);
        setAnchorEl(null); // Close menu but keep selectedRepair
        break;
      case 'edit':
        setCreateForm({
          customerName: selectedRepair.customerName,
          customerEmail: selectedRepair.customerEmail,
          customerPhone: selectedRepair.customerPhone,
          deviceType: selectedRepair.deviceType,
          deviceBrand: selectedRepair.deviceBrand,
          deviceModel: selectedRepair.deviceModel,
          issue: selectedRepair.issue,
          priority: selectedRepair.priority,
          estimatedCompletion: selectedRepair.estimatedCompletion,
          assignedTechnician: selectedRepair.assignedTechnician || '',
          notes: selectedRepair.notes.join('\n'),
          cost: selectedRepair.cost
        });
        setCreateDialog(true);
        handleMenuClose();
        break;
      case 'delete':
        handleDeleteRepair(selectedRepair);
        handleMenuClose();
        break;
    }
  };

  const handleDeleteRepair = async (repair: Repair) => {
    if (!window.confirm(t('Are you sure you want to delete this repair?'))) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/v1/repairs/${repair.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete repair');
      }

      setRepairs(prev => prev.filter(r => r.id !== repair.id));
      fetchRepairsData(); // Refresh stats
      
    } catch (err) {
      console.error('Error deleting repair:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete repair. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRepair = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = selectedRepair 
        ? `/api/v1/repairs/${selectedRepair.id}`
        : '/api/v1/repairs';
      
      const method = selectedRepair ? 'PUT' : 'POST';

      // Convert form data to match API structure
      const repairData = {
        ...createForm,
        notes: createForm.notes ? [createForm.notes] : [] // Convert string to array
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repairData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save repair');
      }

      const savedRepair = await response.json();
      
      if (selectedRepair) {
        setRepairs(prev => prev.map(r => r.id === selectedRepair.id ? savedRepair.data : r));
      } else {
        setRepairs(prev => [...prev, savedRepair.data]);
      }

      setCreateDialog(false);
      setSelectedRepair(null);
      resetCreateForm();
      fetchRepairsData(); // Refresh stats
      
    } catch (err) {
      console.error('Error saving repair:', err);
      setError(err instanceof Error ? err.message : 'Failed to save repair. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      deviceType: '',
      deviceBrand: '',
      deviceModel: '',
      issue: '',
      priority: 'medium',
      estimatedCompletion: '',
      assignedTechnician: '',
      notes: '',
      cost: 0
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'diagnosis':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'waiting_parts':
        return 'secondary';
      case 'testing':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'diagnosis':
        return 1;
      case 'in_progress':
        return 2;
      case 'waiting_parts':
        return 2;
      case 'testing':
        return 3;
      case 'completed':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = 
      repair.repairNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.deviceModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || repair.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || repair.priority === priorityFilter;
    const matchesTechnician = technicianFilter === 'all' || repair.assignedTechnician === technicianFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTechnician;
  });

  const getRepairSummary = () => {
    const totalRepairs = repairs.length;
    const pendingRepairs = repairs.filter(r => r.status === 'pending').length;
    const inProgressRepairs = repairs.filter(r => r.status === 'in_progress').length;
    const completedRepairs = repairs.filter(r => r.status === 'completed').length;
    
    return { totalRepairs, pendingRepairs, inProgressRepairs, completedRepairs };
  };

  const summary = getRepairSummary();

  const handleNewRepairIntake = () => {
    setRepairIntakeOpen(true);
  };

  const handleRepairIntakeSave = async (repairData: any) => {
    try {
      setLoading(true);
      setError(null);

      // Generate repair number
      const repairNumber = `R-${new Date().getFullYear()}-${String(repairs.length + 1).padStart(3, '0')}`;

      // Create repair object
      const newRepair: Repair = {
        id: Date.now().toString(),
        repairNumber,
        customerName: `${repairData.customer.firstName} ${repairData.customer.lastName}`,
        customerEmail: repairData.customer.email,
        customerPhone: repairData.customer.phone,
        deviceType: repairData.devices[0]?.deviceType || '',
        deviceBrand: repairData.devices[0]?.deviceBrand || '',
        deviceModel: repairData.devices[0]?.deviceModel || '',
        issue: repairData.devices[0]?.issue || '',
        status: 'pending',
        priority: repairData.priority.toLowerCase() as any,
        estimatedCompletion: repairData.estimatedCompletion,
        assignedTechnician: repairData.assignedTechnician,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: repairData.devices[0]?.notes ? [repairData.devices[0].notes] : [],
        cost: repairData.totalEstimatedCost
      };

      // Save to backend
      const response = await fetch('/api/v1/repairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRepair),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create repair');
      }

      // Add to local state
      setRepairs(prev => [...prev, newRepair]);
      setRepairIntakeOpen(false);
      fetchRepairsData(); // Refresh stats
      
      // Show success message
      setError(null);
      
    } catch (err) {
      console.error('Error creating repair:', err);
      setError(err instanceof Error ? err.message : 'Failed to create repair. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrderConfirmation = (repair: Repair) => {
    setSelectedRepairForDocuments(repair);
    setOrderConfirmationOpen(true);
  };

  const handleViewDeliveryNote = (repair: Repair) => {
    setSelectedRepairForDocuments(repair);
    setDeliveryNoteOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Implementation for PDF download
    console.log('Downloading PDF...');
  };

  const handleSendEmail = () => {
    // Implementation for sending email
    console.log('Sending email...');
  };

  if (loading) {
    return (
      <Box>
        <DashboardHeader />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Dashboard Header */}
      <DashboardHeader />
      
      <Box sx={{ p: 3, backgroundColor: '#EEF3FB', minHeight: 'calc(100vh - 64px)' }}>
      {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon sx={{ color: '#3BB2FF', fontSize: 28 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1A202C' }}>
          {t('Repair Tracking')}
        </Typography>
          </Box>
          {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewRepairIntake}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            New Repair Intake
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRepairsData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

              {/* Repair Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                      {stats?.totalRepairs || summary.totalRepairs}
                  </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('Total Repairs')}
                  </Typography>
                </Box>
                  <BuildIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                      {stats?.pendingRepairs || summary.pendingRepairs}
                  </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('Pending')}
                  </Typography>
                </Box>
                  <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white'
            }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                      {stats?.inProgressRepairs || summary.inProgressRepairs}
                  </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('In Progress')}
                  </Typography>
                </Box>
                  <WarningIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white'
            }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                      {stats?.completedRepairs || summary.completedRepairs}
                  </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('Completed')}
                  </Typography>
                </Box>
                  <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Statistics Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                      ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {t('Total Revenue')}
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 32, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              color: '#1A202C'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                      {stats?.averageRepairTime?.toFixed(1) || '0.0'} {t('days')}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      {t('Avg Repair Time')}
                    </Typography>
                  </Box>
                  <TimelineIcon sx={{ fontSize: 32, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              color: '#1A202C'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                      {stats?.urgentRepairs || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      {t('Urgent Repairs')}
                    </Typography>
                  </Box>
                  <ErrorIcon sx={{ fontSize: 32, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              color: '#1A202C'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                      {stats?.thisMonthRepairs || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      {t('This Month')}
                    </Typography>
                  </Box>
                  <AssignmentIcon sx={{ fontSize: 32, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder={t('Search repairs...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('Status')}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t('Status')}
                  onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('All Statuses')}</MenuItem>
                  <MenuItem value="pending">{t('Pending')}</MenuItem>
                  <MenuItem value="diagnosis">{t('Diagnosis')}</MenuItem>
                  <MenuItem value="in_progress">{t('In Progress')}</MenuItem>
                  <MenuItem value="waiting_parts">{t('Waiting Parts')}</MenuItem>
                  <MenuItem value="testing">{t('Testing')}</MenuItem>
                  <MenuItem value="completed">{t('Completed')}</MenuItem>
                  <MenuItem value="cancelled">{t('Cancelled')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('Priority')}</InputLabel>
                <Select
                  value={priorityFilter}
                  label={t('Priority')}
                  onChange={(e: SelectChangeEvent) => setPriorityFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('All Priorities')}</MenuItem>
                  <MenuItem value="urgent">{t('Urgent')}</MenuItem>
                  <MenuItem value="high">{t('High')}</MenuItem>
                  <MenuItem value="medium">{t('Medium')}</MenuItem>
                  <MenuItem value="low">{t('Low')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('Technician')}</InputLabel>
                <Select
                  value={technicianFilter}
                  label={t('Technician')}
                  onChange={(e: SelectChangeEvent) => setTechnicianFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('All Technicians')}</MenuItem>
                  <MenuItem value="Mike Johnson">{t('Mike Johnson')}</MenuItem>
                  <MenuItem value="Sarah Wilson">{t('Sarah Wilson')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedRepair(null);
                  setCreateForm({
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    deviceType: '',
                    deviceBrand: '',
                    deviceModel: '',
                    issue: '',
                    priority: 'medium',
                    estimatedCompletion: '',
                    assignedTechnician: '',
                    notes: '',
                    cost: 0
                  });
                  setCreateDialog(true);
                }}
              >
                {t('New Repair')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Repairs Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>{t('Repair')}</strong></TableCell>
                  <TableCell><strong>{t('Customer')}</strong></TableCell>
                  <TableCell><strong>{t('Device')}</strong></TableCell>
                  <TableCell><strong>{t('Issue')}</strong></TableCell>
                  <TableCell><strong>{t('Status')}</strong></TableCell>
                  <TableCell><strong>{t('Priority')}</strong></TableCell>
                  <TableCell><strong>{t('Technician')}</strong></TableCell>
                  <TableCell><strong>{t('Progress')}</strong></TableCell>
                  <TableCell><strong>{t('Actions')}</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRepairs.map((repair) => (
                  <TableRow key={repair.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: '#3BB2FF' }}>
                          <BuildIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {repair.repairNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('ID')}: {repair.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {repair.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {repair.customerEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {repair.deviceBrand} {repair.deviceModel}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {repair.deviceType}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {repair.issue}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(repair.status.replace('_', ' '))}
                        color={getStatusColor(repair.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(repair.priority)}
                        color={getPriorityColor(repair.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {repair.assignedTechnician || t('Unassigned')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={getStatusStep(repair.status) * 25}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(getStatusStep(repair.status) * 25)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, repair)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <ViewIcon sx={{ mr: 1 }} />
          {t('View Details')}
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>
          <EditIcon sx={{ mr: 1 }} />
          {t('Edit Repair')}
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('Delete Repair')}
        </MenuItem>
      </Menu>

      {/* Create/Edit Repair Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedRepair ? t('Edit Repair') : t('Create New Repair')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Customer Name')}
                value={createForm.customerName}
                onChange={(e) => setCreateForm(prev => ({ ...prev, customerName: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Customer Email')}
                type="email"
                value={createForm.customerEmail}
                onChange={(e) => setCreateForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Customer Phone')}
                value={createForm.customerPhone}
                onChange={(e) => setCreateForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Device Type')}
                value={createForm.deviceType}
                onChange={(e) => setCreateForm(prev => ({ ...prev, deviceType: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Device Brand')}
                value={createForm.deviceBrand}
                onChange={(e) => setCreateForm(prev => ({ ...prev, deviceBrand: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Device Model')}
                value={createForm.deviceModel}
                onChange={(e) => setCreateForm(prev => ({ ...prev, deviceModel: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('Issue Description')}
                multiline
                rows={3}
                value={createForm.issue}
                onChange={(e) => setCreateForm(prev => ({ ...prev, issue: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('Priority')}</InputLabel>
                <Select
                  value={createForm.priority}
                  label={t('Priority')}
                  onChange={(e: SelectChangeEvent) => setCreateForm(prev => ({ ...prev, priority: e.target.value as any }))}
                >
                  <MenuItem value="low">{t('Low')}</MenuItem>
                  <MenuItem value="medium">{t('Medium')}</MenuItem>
                  <MenuItem value="high">{t('High')}</MenuItem>
                  <MenuItem value="urgent">{t('Urgent')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Estimated Completion')}
                type="date"
                value={createForm.estimatedCompletion}
                onChange={(e) => setCreateForm(prev => ({ ...prev, estimatedCompletion: e.target.value }))}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Assigned Technician')}
                value={createForm.assignedTechnician}
                onChange={(e) => setCreateForm(prev => ({ ...prev, assignedTechnician: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Cost')}
                type="number"
                value={createForm.cost}
                onChange={(e) => setCreateForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('Notes')}
                multiline
                rows={3}
                value={createForm.notes}
                onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t('Additional notes about the repair...')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            onClick={handleSaveRepair} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : (selectedRepair ? t('Update') : t('Create'))}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Repair Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => {
          setViewDialog(false);
          setSelectedRepair(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BuildIcon sx={{ color: '#3BB2FF', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedRepair?.repairNumber}
          </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('Repair Details')}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRepair && (
            <Grid container spacing={3}>
              {/* Status and Priority */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip
                    label={t(selectedRepair.status.replace('_', ' '))}
                    color={getStatusColor(selectedRepair.status) as any}
                    size="medium"
                  />
                  <Chip
                    label={t(selectedRepair.priority)}
                    color={getPriorityColor(selectedRepair.priority) as any}
                    size="medium"
                  />
                </Box>
              </Grid>

              {/* Customer Information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1A202C' }}>
                      {t('Customer Information')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>{t('Name')}:</strong> {selectedRepair.customerName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('Email')}:</strong> {selectedRepair.customerEmail}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('Phone')}:</strong> {selectedRepair.customerPhone}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Device Information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1A202C' }}>
                      {t('Device Information')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>{t('Type')}:</strong> {selectedRepair.deviceType}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('Brand')}:</strong> {selectedRepair.deviceBrand}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('Model')}:</strong> {selectedRepair.deviceModel}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Issue and Progress */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1A202C' }}>
                      {t('Issue & Progress')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>{t('Issue')}:</strong> {selectedRepair.issue}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>{t('Progress')}: {Math.round(getStatusStep(selectedRepair.status) * 25)}%</strong>
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={getStatusStep(selectedRepair.status) * 25}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2">
                      <strong>{t('Estimated Completion')}:</strong> {selectedRepair.estimatedCompletion}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Repair Details */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1A202C' }}>
                      {t('Repair Details')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>{t('Assigned Technician')}:</strong> {selectedRepair.assignedTechnician || t('Not assigned')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('Created Date')}:</strong> {new Date(selectedRepair.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('Last Updated')}:</strong> {new Date(selectedRepair.updatedAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('Repair Cost')}:</strong> ${selectedRepair.cost.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Additional Info */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1A202C' }}>
                      {t('Timeline')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>{t('Status')}:</strong> 
                        <Chip
                          label={t(selectedRepair.status.replace('_', ' '))}
                          color={getStatusColor(selectedRepair.status) as any}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('Priority')}:</strong> 
                        <Chip
                          label={t(selectedRepair.priority)}
                          color={getPriorityColor(selectedRepair.priority) as any}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      {selectedRepair.actualCompletion && (
                        <Typography variant="body2">
                          <strong>{t('Completed')}:</strong> {new Date(selectedRepair.actualCompletion).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Notes */}
              {selectedRepair.notes && selectedRepair.notes.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: '#1A202C' }}>
                        {t('Repair Notes')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {selectedRepair.notes.map((note, index) => (
                          <Box key={index} sx={{ 
                            p: 2, 
                            borderLeft: '4px solid #3BB2FF', 
                            backgroundColor: '#F8FAFC',
                            borderRadius: '0 8px 8px 0'
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                              {t('Note')} #{index + 1}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {note}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setViewDialog(false);
            setSelectedRepair(null);
          }}>
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Repair Intake Form Dialog */}
      <RepairIntakeForm
        open={repairIntakeOpen}
        onClose={() => setRepairIntakeOpen(false)}
        onSave={handleRepairIntakeSave}
        loading={loading}
      />

      {/* Order Confirmation Dialog */}
      <Dialog
        open={orderConfirmationOpen}
        onClose={() => setOrderConfirmationOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Order Confirmation</DialogTitle>
        <DialogContent>
          {selectedRepairForDocuments && (
            <OrderConfirmation
              repairData={{
                customer: {
                  firstName: selectedRepairForDocuments.customerName.split(' ')[0],
                  lastName: selectedRepairForDocuments.customerName.split(' ').slice(1).join(' '),
                  email: selectedRepairForDocuments.customerEmail,
                  phone: selectedRepairForDocuments.customerPhone,
                  company: '',
                  address: {
                    street: '',
                    city: '',
                    zipCode: '',
                    country: ''
                  }
                },
                devices: [{
                  id: selectedRepairForDocuments.id,
                  deviceType: selectedRepairForDocuments.deviceType,
                  deviceBrand: selectedRepairForDocuments.deviceBrand,
                  deviceModel: selectedRepairForDocuments.deviceModel,
                  deviceSerial: '',
                  deviceCondition: 'GOOD',
                  issue: selectedRepairForDocuments.issue,
                  estimatedCost: selectedRepairForDocuments.cost,
                  notes: selectedRepairForDocuments.notes.join(', ')
                }],
                priority: selectedRepairForDocuments.priority.toUpperCase() as any,
                estimatedCompletion: selectedRepairForDocuments.estimatedCompletion,
                assignedTechnician: selectedRepairForDocuments.assignedTechnician || 'Unassigned',
                customerNotes: '',
                internalNotes: '',
                signatureUrl: '',
                totalEstimatedCost: selectedRepairForDocuments.cost,
                repairNumber: selectedRepairForDocuments.repairNumber,
                createdAt: selectedRepairForDocuments.createdAt
              }}
              onPrint={handlePrint}
              onDownloadPDF={handleDownloadPDF}
              onSendEmail={handleSendEmail}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderConfirmationOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delivery Note Dialog */}
      <Dialog
        open={deliveryNoteOpen}
        onClose={() => setDeliveryNoteOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Delivery Note</DialogTitle>
        <DialogContent>
          {selectedRepairForDocuments && (
            <DeliveryNote
              repairData={{
                customer: {
                  firstName: selectedRepairForDocuments.customerName.split(' ')[0],
                  lastName: selectedRepairForDocuments.customerName.split(' ').slice(1).join(' '),
                  email: selectedRepairForDocuments.customerEmail,
                  phone: selectedRepairForDocuments.customerPhone,
                  company: '',
                  address: {
                    street: '',
                    city: '',
                    zipCode: '',
                    country: ''
                  }
                },
                devices: [{
                  id: selectedRepairForDocuments.id,
                  deviceType: selectedRepairForDocuments.deviceType,
                  deviceBrand: selectedRepairForDocuments.deviceBrand,
                  deviceModel: selectedRepairForDocuments.deviceModel,
                  deviceSerial: '',
                  deviceCondition: 'GOOD',
                  issue: selectedRepairForDocuments.issue,
                  actualCost: selectedRepairForDocuments.cost,
                  warrantyInfo: {
                    warrantyPeriod: 90,
                    warrantyExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                    warrantyTerms: 'Standard 90-day warranty on parts and labor'
                  }
                }],
                repairNumber: selectedRepairForDocuments.repairNumber,
                completedAt: selectedRepairForDocuments.actualCompletion || new Date().toISOString(),
                assignedTechnician: selectedRepairForDocuments.assignedTechnician || 'Unassigned',
                customerNotes: '',
                internalNotes: '',
                totalActualCost: selectedRepairForDocuments.cost,
                paymentStatus: 'PENDING',
                warrantyInfo: {
                  warrantyPeriod: 90,
                  warrantyExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                  warrantyTerms: 'Standard 90-day warranty on parts and labor'
                }
              }}
              onPrint={handlePrint}
              onDownloadPDF={handleDownloadPDF}
              onSendEmail={handleSendEmail}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeliveryNoteOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="create repair"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => {
          setSelectedRepair(null);
          resetCreateForm();
          setCreateDialog(true);
        }}
      >
        <AddIcon />
      </Fab>
      </Box>
    </Box>
  );
};

export default RepairTrackingPage;
