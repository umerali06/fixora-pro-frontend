import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Build as BuildIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { techniciansAPI } from '../../services/api';
import { useAppSelector } from '../../store/hooks';
import toast from 'react-hot-toast';
import { PermissionGate } from '../../utils/permissions';

// Types
interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  title: string | null;
  department: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  skills?: string | string[];
  hourlyRate?: number;
  availability?: string;
  _count?: {
    assignedRepairTickets: number;
  };
}

interface TechnicianStats {
  totalTechnicians: number;
  activeTechnicians: number;
  techniciansWithJobs: number;
  topPerformers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    _count: {
      assignedRepairTickets: number;
    };
  }>;
}

interface CreateTechnicianForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  title: string;
  department: string;
  skills: string;
  hourlyRate: string;
  availability: string;
  isActive?: boolean;
}

// Main Component
const TechniciansPage: React.FC = () => {
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  
  // State
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  
  // Form states
  const [createForm, setCreateForm] = useState<CreateTechnicianForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    title: '',
    department: '',
    skills: '',
    hourlyRate: '',
    availability: ''
  });

  const [editForm, setEditForm] = useState<CreateTechnicianForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    title: '',
    department: '',
    skills: '',
    hourlyRate: '',
    availability: '',
    isActive: true
  });

  // Field error states
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [editFieldErrors, setEditFieldErrors] = useState<{[key: string]: string}>({});
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchTechniciansData();
    } else {
      setError('Authentication required');
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Fetch technicians data
  const fetchTechniciansData = async () => {
    // Check authentication before making API calls
    if (!isAuthenticated || !token) {
      console.log('⚠️ Cannot fetch technicians data: user not authenticated');
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Fetching technicians data with token:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + '...'
      });
      
      // Use authenticated API service
      const [techniciansData, statsData] = await Promise.all([
        techniciansAPI.getAll(),
        techniciansAPI.getStats()
      ]);

      setTechnicians(techniciansData || []);
      setStats(statsData || null);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Error fetching technicians data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch technicians data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create new technician
  const handleCreateTechnician = async () => {
    try {
      setFieldErrors({});
      
      // Validate required fields
      if (!createForm.firstName.trim()) {
        setFieldErrors({ firstName: 'First name is required' });
        toast.error('First name is required');
        return;
      }
      
      if (!createForm.lastName.trim()) {
        setFieldErrors({ lastName: 'Last name is required' });
        toast.error('Last name is required');
        return;
      }
      
      if (!createForm.email.trim()) {
        setFieldErrors({ email: 'Email is required' });
        toast.error('Email is required');
        return;
      }
      
      if (!createForm.password.trim()) {
        setFieldErrors({ password: 'Password is required' });
        toast.error('Password is required');
        return;
      }

      const technicianData = {
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim(),
        password: createForm.password.trim(),
        phone: createForm.phone.trim(),
        title: createForm.title.trim(),
        department: createForm.department.trim(),
        skills: createForm.skills.trim(),
        hourlyRate: createForm.hourlyRate ? parseFloat(createForm.hourlyRate) : 0,
        availability: createForm.availability.trim()
      };

      const newTechnician = await techniciansAPI.create(technicianData);
      setTechnicians(prev => [newTechnician, ...prev]);
      setCreateDialog(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        title: '',
        department: '',
        skills: '',
        hourlyRate: '',
        availability: ''
      });
      toast.success('Technician created successfully!');
    } catch (error: any) {
      console.error('Error creating technician:', error);
      
      // Handle field-specific validation errors
      if (error?.response?.data?.details && Array.isArray(error.response.data.details)) {
        const fieldErrors: {[key: string]: string} = {};
        error.response.data.details.forEach((detail: any) => {
          fieldErrors[detail.field] = detail.message;
        });
        setFieldErrors(fieldErrors);
        
        // Show the first field error as a toast
        const firstError = error.response.data.details[0];
        toast.error(`${firstError.field}: ${firstError.message}`);
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to create technician';
        toast.error(errorMessage);
      }
    }
  };

  // Handle technician selection
  const handleTechnicianSelect = (technician: Technician, action: 'view' | 'edit') => {
    setSelectedTechnician(technician);
    if (action === 'view') {
      setViewDialog(true);
    } else {
      // Populate edit form with technician data
      setEditForm({
        firstName: technician.firstName || '',
        lastName: technician.lastName || '',
        email: technician.email || '',
        password: '', // Don't populate password for security
        phone: technician.phone || '',
        title: technician.title || '',
        department: technician.department || '',
        skills: Array.isArray(technician.skills) ? technician.skills.join(', ') : technician.skills || '',
        hourlyRate: technician.hourlyRate?.toString() || '',
        availability: technician.availability || '',
        isActive: technician.isActive
      });
      setEditDialog(true);
    }
  };

  // Handle edit technician
  const handleEditTechnician = async () => {
    if (!selectedTechnician) return;

    try {
      setEditFieldErrors({});
      
      // Validate required fields
      if (!editForm.firstName.trim()) {
        setEditFieldErrors({ firstName: 'First name is required' });
        toast.error('First name is required');
        return;
      }
      
      if (!editForm.lastName.trim()) {
        setEditFieldErrors({ lastName: 'Last name is required' });
        toast.error('Last name is required');
        return;
      }
      
      if (!editForm.email.trim()) {
        setEditFieldErrors({ email: 'Email is required' });
        toast.error('Email is required');
        return;
      }

      const technicianData = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        title: editForm.title.trim(),
        department: editForm.department.trim(),
        skills: editForm.skills.trim(),
        hourlyRate: editForm.hourlyRate ? parseFloat(editForm.hourlyRate) : 0,
        availability: editForm.availability.trim(),
        isActive: editForm.isActive
      };

      const updatedTechnician = await techniciansAPI.update(selectedTechnician.id, technicianData);
      setTechnicians(prev => 
        prev.map(tech => tech.id === selectedTechnician.id ? updatedTechnician : tech)
      );
      setEditDialog(false);
      setSelectedTechnician(null);
      toast.success('Technician updated successfully!');
    } catch (error: any) {
      console.error('Error updating technician:', error);
      
      // Handle field-specific validation errors
      if (error?.response?.data?.details && Array.isArray(error.response.data.details)) {
        const fieldErrors: {[key: string]: string} = {};
        error.response.data.details.forEach((detail: any) => {
          fieldErrors[detail.field] = detail.message;
        });
        setEditFieldErrors(fieldErrors);
        
        // Show the first field error as a toast
        const firstError = error.response.data.details[0];
        toast.error(`${firstError.field}: ${firstError.message}`);
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to update technician';
        toast.error(errorMessage);
      }
    }
  };

  // Handle delete technician
  const handleDeleteTechnician = async (technician: Technician) => {
    if (window.confirm(`Are you sure you want to delete ${technician.firstName} ${technician.lastName}?`)) {
      try {
        await techniciansAPI.delete(technician.id);
        setTechnicians(prev => prev.filter(tech => tech.id !== technician.id));
        toast.success('Technician deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting technician:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete technician';
        toast.error(errorMessage);
      }
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchTechniciansData();
  };

  // Filtered technicians
  const filteredTechnicians = technicians.filter(technician => {
    const matchesSearch = 
      technician.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (technician.phone && technician.phone.includes(searchTerm));
    
    const matchesDepartment = filterDepartment === 'ALL' || technician.department === filterDepartment;
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' && technician.isActive) ||
      (filterStatus === 'INACTIVE' && !technician.isActive);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Load data on component mount
  useEffect(() => {
    fetchTechniciansData();
  }, []);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  if (loading) {
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
      
      <Box sx={{ p: 3, backgroundColor: '#EEF3FB', minHeight: 'calc(100vh - 64px)' }}>
        {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon sx={{ color: '#3BB2FF', fontSize: 28 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1A202C' }}>
              Technicians
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#99A7BD', ml: 2 }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            minHeight: '110px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 0.5 }}>
                    {stats?.totalTechnicians || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                    Total Technicians
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                  color: 'white'
                }}>
                  <BuildIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            minHeight: '110px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 0.5 }}>
                    {stats?.activeTechnicians || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                    Active Technicians
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white'
                }}>
                  <PersonIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            minHeight: '110px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 0.5 }}>
                    {stats?.techniciansWithJobs || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                    With Active Jobs
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: 'white'
                }}>
                  <PersonAddIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            minHeight: '110px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 0.5 }}>
                    {technicians.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                    Total Records
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  color: 'white'
                }}>
                  <BuildIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions and Search Bar */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search technicians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#99A7BD', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': {
                      borderColor: '#3BB2FF',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="ALL">All Departments</MenuItem>
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Mechanical">Mechanical</MenuItem>
                  <MenuItem value="Software">Software</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
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
                Refresh
              </Button>
              <PermissionGate permission="users:manage">
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setCreateDialog(true)}
                  sx={{ 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
                    }
                  }}
                >
                  Add Technician
                </Button>
              </PermissionGate>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Technicians Table */}
      <Card sx={{ 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        minHeight: '400px'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1A202C' }}>
            Technician List ({filteredTechnicians.length})
          </Typography>
          
          <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Technician</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Active Jobs</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTechnicians.map((technician) => (
                  <TableRow key={technician.id} hover sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: '#3BB2FF',
                          width: 40,
                          height: 40
                        }}>
                          {technician.firstName.charAt(0)}{technician.lastName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1A202C' }}>
                            {technician.firstName} {technician.lastName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                            {technician.title || 'Technician'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 16, color: '#99A7BD' }} />
                          <Typography variant="body2" sx={{ color: '#1A202C' }}>
                            {technician.email}
                          </Typography>
                        </Box>
                        {technician.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: '#99A7BD' }} />
                            <Typography variant="body2" sx={{ color: '#1A202C' }}>
                              {technician.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#1A202C' }}>
                        {technician.department || 'General'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#1A202C', fontWeight: 500 }}>
                        {technician._count?.assignedRepairTickets || 0}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={technician.isActive ? 'Active' : 'Inactive'}
                        color={getStatusColor(technician.isActive) as any}
                        size="small"
                        sx={{ borderRadius: '8px' }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                        {formatDate(technician.createdAt)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleTechnicianSelect(technician, 'view')}
                            sx={{ color: '#3BB2FF' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <PermissionGate permission="users:manage">
                          <Tooltip title="Edit Technician">
                            <IconButton
                              size="small"
                              onClick={() => handleTechnicianSelect(technician, 'edit')}
                              sx={{ color: '#6A6BFF' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </PermissionGate>
                        <PermissionGate permission="users:manage">
                          <Tooltip title="Delete Technician">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTechnician(technician)}
                              sx={{ color: '#EF4444' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </PermissionGate>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredTechnicians.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: '#99A7BD' }}>
                No technicians found matching your criteria
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Technician Dialog */}
      <Dialog 
        open={createDialog} 
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid #E2E8F0',
          background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
          color: 'white'
        }}>
          Add New Technician
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={createForm.firstName}
                onChange={(e) => {
                  setCreateForm(prev => ({ ...prev, firstName: e.target.value }));
                  if (fieldErrors.firstName) {
                    setFieldErrors(prev => ({ ...prev, firstName: '' }));
                  }
                }}
                error={!!fieldErrors.firstName}
                helperText={fieldErrors.firstName}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={createForm.lastName}
                onChange={(e) => {
                  setCreateForm(prev => ({ ...prev, lastName: e.target.value }));
                  if (fieldErrors.lastName) {
                    setFieldErrors(prev => ({ ...prev, lastName: '' }));
                  }
                }}
                error={!!fieldErrors.lastName}
                helperText={fieldErrors.lastName}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={createForm.email}
                onChange={(e) => {
                  setCreateForm(prev => ({ ...prev, email: e.target.value }));
                  if (fieldErrors.email) {
                    setFieldErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password *"
                type="password"
                value={createForm.password}
                onChange={(e) => {
                  setCreateForm(prev => ({ ...prev, password: e.target.value }));
                  if (fieldErrors.password) {
                    setFieldErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={createForm.phone}
                onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title"
                value={createForm.title}
                onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Department *</InputLabel>
                <Select
                  value={createForm.department}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, department: e.target.value }))}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Mechanical">Mechanical</MenuItem>
                  <MenuItem value="Software">Software</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hourly Rate"
                value={createForm.hourlyRate}
                onChange={(e) => setCreateForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Skills"
                value={createForm.skills}
                onChange={(e) => setCreateForm(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="e.g., iPhone repair, laptop repair, soldering"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Availability"
                value={createForm.availability}
                onChange={(e) => setCreateForm(prev => ({ ...prev, availability: e.target.value }))}
                placeholder="e.g., Monday-Friday, 9AM-6PM"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setCreateDialog(false)}
            sx={{ 
              borderRadius: '12px',
              color: '#99A7BD',
              '&:hover': { backgroundColor: '#F1F5F9' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTechnician}
            variant="contained"
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
              }
            }}
          >
            Create Technician
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Technician Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid #E2E8F0',
          background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
          color: 'white'
        }}>
          Technician Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedTechnician && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Full Name
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C', fontWeight: 500 }}>
                  {selectedTechnician.firstName} {selectedTechnician.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Title
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {selectedTechnician.title || 'Technician'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {selectedTechnician.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Phone
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {selectedTechnician.phone || 'Not provided'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Department
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {selectedTechnician.department || 'General'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Active Jobs
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C', fontWeight: 500 }}>
                  {selectedTechnician._count?.assignedRepairTickets || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Status
                </Typography>
                <Chip
                  label={selectedTechnician.isActive ? 'Active' : 'Inactive'}
                  color={getStatusColor(selectedTechnician.isActive) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Created
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {formatDate(selectedTechnician.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Last Updated
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {formatDate(selectedTechnician.updatedAt)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setViewDialog(false)}
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Technician Dialog */}
      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid #E2E8F0',
          background: 'linear-gradient(135deg, #6A6BFF 0%, #3BB2FF 100%)',
          color: 'white'
        }}>
          Edit Technician
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={editForm.firstName}
                onChange={(e) => {
                  setEditForm(prev => ({ ...prev, firstName: e.target.value }));
                  if (editFieldErrors.firstName) {
                    setEditFieldErrors(prev => ({ ...prev, firstName: '' }));
                  }
                }}
                error={!!editFieldErrors.firstName}
                helperText={editFieldErrors.firstName}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={editForm.lastName}
                onChange={(e) => {
                  setEditForm(prev => ({ ...prev, lastName: e.target.value }));
                  if (editFieldErrors.lastName) {
                    setEditFieldErrors(prev => ({ ...prev, lastName: '' }));
                  }
                }}
                error={!!editFieldErrors.lastName}
                helperText={editFieldErrors.lastName}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) => {
                  setEditForm(prev => ({ ...prev, email: e.target.value }));
                  if (editFieldErrors.email) {
                    setEditFieldErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                error={!!editFieldErrors.email}
                helperText={editFieldErrors.email}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={editForm.department}
                  onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Mechanical">Mechanical</MenuItem>
                  <MenuItem value="Software">Software</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editForm.isActive ? 'ACTIVE' : 'INACTIVE'}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.value === 'ACTIVE' }))}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Skills (comma-separated)"
                value={editForm.skills}
                onChange={(e) => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hourly Rate"
                type="number"
                value={editForm.hourlyRate}
                onChange={(e) => setEditForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Availability"
                value={editForm.availability}
                onChange={(e) => setEditForm(prev => ({ ...prev, availability: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setEditDialog(false)}
            sx={{ 
              borderRadius: '12px',
              color: '#6B7280',
              border: '1px solid #E5E7EB',
              '&:hover': {
                borderColor: '#D1D5DB',
                backgroundColor: '#F9FAFB'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditTechnician}
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6A6BFF 0%, #3BB2FF 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5A5BFF 0%, #2A9BFF 100%)',
              }
            }}
          >
            Update Technician
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default TechniciansPage;
