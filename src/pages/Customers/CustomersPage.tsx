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
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewColumn as ViewColumnIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../../services/api';
import { PermissionGate, usePermissions } from '../../utils/permissions';
import { useAppSelector } from '../../store/hooks';
import toast from 'react-hot-toast';

// Types
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  customerType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  fullName?: string;
  displayName?: string;
  company?: string;
  mobile?: string;
  fax?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  state?: string;
  taxId?: string;
  vatNumber?: string;
  category?: string;
  source?: string;
  tags?: string;
  creditLimit?: number;
  paymentTerms?: string;
  discountRate?: number;
  preferredContact?: string;
  marketingOptIn?: boolean;
  newsletterOptIn?: boolean;
  internalNotes?: string;
  isVerified?: boolean;
  lastContact?: string;
  orderCount?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  _count?: {
    repairTickets: number;
  };
}

interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  newThisMonth: number;
  totalRevenue: number;
  totalRepairs: number;
  averageSpentPerCustomer: number;
  topCustomers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    _count?: {
      repairTickets: number;
    };
  }>;
}

interface CreateCustomerForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  customerType: string;
  notes: string;
}

// Main Component
const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);
  
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Form states
  const [createForm, setCreateForm] = useState<CreateCustomerForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    customerType: 'INDIVIDUAL',
    notes: ''
  });
  const [editForm, setEditForm] = useState<CreateCustomerForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    customerType: 'INDIVIDUAL',
    notes: ''
  });
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [editFieldErrors, setEditFieldErrors] = useState<{[key: string]: string}>({});
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCustomersData();
    } else if (token) {
      // If we have a token but not authenticated yet, wait a bit and try again
      const timer = setTimeout(() => {
        if (token) {
          fetchCustomersData();
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setError('Authentication required');
      setLoading(false);
    }
  }, [isAuthenticated, token, user]);

  // Additional effect to fetch data when user is loaded
  useEffect(() => {
    if (user && token && customers.length === 0) {
      console.log('🔄 User loaded, fetching customers data...');
      fetchCustomersData();
    }
  }, [user, token]);

  // Fetch customers data
  const fetchCustomersData = async () => {
    // Check if we have a token (more lenient than isAuthenticated)
    if (!token) {
      console.log('⚠️ Cannot fetch customers data: no token available');
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Fetching customers data with token:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + '...'
      });
      
      console.log('🔍 Current user data:', user);
      console.log('🔍 User orgId:', user?.orgId);

      const [customersData, statsData] = await Promise.all([
        customerAPI.getAll(),
        customerAPI.getStats()
      ]);

      console.log('🔍 CustomersPage - customersData:', customersData);
      console.log('🔍 CustomersPage - customersData length:', customersData?.length);
      console.log('🔍 CustomersPage - statsData:', statsData);
      console.log('🔍 CustomersPage - customersData type:', typeof customersData);
      console.log('🔍 CustomersPage - customersData isArray:', Array.isArray(customersData));

      // Ensure customersData is an array
      if (!Array.isArray(customersData)) {
        console.error('❌ customersData is not an array:', customersData);
        setCustomers([]);
        setError('Invalid data format received from server');
        return;
      }

      console.log('✅ Setting customers:', customersData);
      setCustomers(customersData);
      setStats(statsData);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Error fetching customers data:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch data';
      setError(errorMessage);
      toast.error(errorMessage);
      // Set empty array on error to prevent filter issues
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new customer
  const handleCreateCustomer = async () => {
    try {
      // Clear previous field errors
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
      
      if (!createForm.phone.trim()) {
        setFieldErrors({ phone: 'Phone is required' });
        toast.error('Phone is required');
        return;
      }

      // Add required fields for API validation
      const customerData = {
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        address: createForm.address.trim(),
        customerType: createForm.customerType,
        notes: createForm.notes.trim() || undefined, // Send undefined instead of empty string
        status: 'ACTIVE', // Required by API validation
        source: 'WALK_IN' // Optional but good to have
      };

      console.log('🔍 Creating customer with data:', customerData);
      const newCustomer = await customerAPI.create(customerData);
      console.log('✅ Created customer:', newCustomer);
      setCustomers(prev => [newCustomer, ...prev]);
      setCreateDialog(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        customerType: 'INDIVIDUAL',
        notes: ''
      });
      toast.success('Customer created successfully!');
    } catch (error: any) {
      console.error('Error creating customer:', error);
      
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
        const errorMessage = error?.response?.data?.error || error?.message || 'Failed to create customer';
        toast.error(errorMessage);
      }
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer, action: 'view' | 'edit') => {
    setSelectedCustomer(customer);
    if (action === 'view') {
      setViewDialog(true);
    } else {
      // Populate edit form with customer data
      setEditForm({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        customerType: customer.customerType || 'INDIVIDUAL',
        notes: customer.notes || ''
      });
      setEditFieldErrors({});
      setEditDialog(true);
    }
  };

  // Handle customer delete
  const handleCustomerDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteDialog(true);
  };

  // Handle edit customer
  const handleEditCustomer = async () => {
    if (!selectedCustomer) return;

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
      
      if (!editForm.phone.trim()) {
        setEditFieldErrors({ phone: 'Phone is required' });
        toast.error('Phone is required');
        return;
      }
      
      const customerData = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        customerType: editForm.customerType,
        notes: editForm.notes.trim() || undefined // Send undefined instead of empty string
      };

      await customerAPI.update(selectedCustomer.id, customerData);
      toast.success('Customer updated successfully');
      setEditDialog(false);
      setSelectedCustomer(null);
      // Refresh the customer list
      await fetchCustomersData();
    } catch (error: any) {
      console.error('Error updating customer:', error);
      
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
      } else if (error.response?.data?.errors) {
        const fieldErrors: {[key: string]: string} = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.path) {
            fieldErrors[err.path] = err.message;
          }
        });
        setEditFieldErrors(fieldErrors);
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to update customer';
      toast.error(errorMessage);
    }
  };

  // Confirm delete customer
  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;

    try {
      await customerAPI.delete(selectedCustomer.id);
      toast.success('Customer deleted successfully');
      setDeleteDialog(false);
      setSelectedCustomer(null);
      // Refresh the customer list
      await fetchCustomersData();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error(error.response?.data?.message || 'Failed to delete customer');
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchCustomersData();
  };

  const handleViewProfile = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  // Filtered customers - TEMPORARILY DISABLED FOR DEBUGGING
  const filteredCustomers = Array.isArray(customers) ? customers : [];
  
  // Original filtering logic (commented out for debugging)
  // const filteredCustomers = Array.isArray(customers) ? customers.filter(customer => {
  //   const matchesSearch = 
  //     customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //     (customer.phone && customer.phone.includes(searchTerm));
    
  //   const matchesType = filterType === 'ALL' || customer.customerType === filterType;
  //   const matchesStatus = filterStatus === 'ALL' || 
  //     (filterStatus === 'ACTIVE' && customer.isActive) ||
  //     (filterStatus === 'INACTIVE' && !customer.isActive);
    
  //   return matchesSearch && matchesType && matchesStatus;
  // }) : [];

  // Debug logging
  console.log('🔍 Filtered customers debug:', {
    totalCustomers: customers.length,
    filteredCustomers: filteredCustomers.length,
    searchTerm,
    filterType,
    filterStatus,
    customers: customers
  });

  // Load data on component mount
  useEffect(() => {
    fetchCustomersData();
  }, []);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL':
        return 'primary';
      case 'BUSINESS':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  if (loading || !Array.isArray(customers)) {
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
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ color: '#3BB2FF', fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#1A202C' }}>
                Customers
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#99A7BD', ml: 2 }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <PermissionGate permission="customers:manage">
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/customers/management')}
              >
                Manage Categories
              </Button>
            </PermissionGate>
            <PermissionGate permission="customers:create">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialog(true)}
                size="small"
              >
                Add Customer
              </Button>
            </PermissionGate>
          </Box>
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
                    {stats?.total || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                    Total Customers
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
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
                    {stats?.active || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                    Active Customers
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
                    {stats?.newThisMonth || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                    New This Month
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: 'white'
                }}>
                  <AddIcon />
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
                    {Array.isArray(customers) ? customers.length : 0}
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
                  <ViewColumnIcon />
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
                placeholder="Search customers..."
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
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="ALL">All Types</MenuItem>
                  <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                  <MenuItem value="BUSINESS">Business</MenuItem>
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialog(true)}
                sx={{ 
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
                  }
                }}
              >
                <PermissionGate permission="customers:create">
                  Add Customer
                </PermissionGate>
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card sx={{ 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        minHeight: '400px'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1A202C' }}>
            Customer List ({filteredCustomers.length})
          </Typography>
          
          <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Jobs</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} hover sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: customer.customerType === 'BUSINESS' ? '#6A6BFF' : '#3BB2FF',
                          width: 40,
                          height: 40
                        }}>
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1A202C' }}>
                            {customer.firstName} {customer.lastName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                            ID: {customer.id.slice(-8)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        {customer.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 16, color: '#99A7BD' }} />
                            <Typography variant="body2" sx={{ color: '#1A202C' }}>
                              {customer.email}
                            </Typography>
                          </Box>
                        )}
                        {customer.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: '#99A7BD' }} />
                            <Typography variant="body2" sx={{ color: '#1A202C' }}>
                              {customer.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={customer.customerType}
                        color={getCustomerTypeColor(customer.customerType) as any}
                        size="small"
                        sx={{ borderRadius: '8px' }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#1A202C', fontWeight: 500 }}>
                        {customer._count?.repairTickets || 0}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={customer.isActive ? 'Active' : 'Inactive'}
                        color={getStatusColor(customer.isActive) as any}
                        size="small"
                        sx={{ borderRadius: '8px' }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                        {formatDate(customer.createdAt)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleCustomerSelect(customer, 'view')}
                            sx={{ color: '#3BB2FF' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <PermissionGate permission="customers:write">
                          <Tooltip title="Edit Customer">
                            <IconButton
                              size="small"
                              onClick={() => handleCustomerSelect(customer, 'edit')}
                              sx={{ color: '#6A6BFF' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </PermissionGate>
                        <PermissionGate permission="customers:write">
                          <Tooltip title="Delete Customer">
                            <IconButton
                              size="small"
                              onClick={() => handleCustomerDelete(customer)}
                              sx={{ color: '#EF4444' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </PermissionGate>
                        <Tooltip title="View Profile">
                          <IconButton
                            size="small"
                            onClick={() => handleViewProfile(customer.id)}
                            sx={{ color: 'primary.main' }}
                          >
                            <PersonIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredCustomers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: '#99A7BD' }}>
                No customers found matching your criteria
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Customer Dialog */}
      <Dialog 
        open={createDialog} 
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
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
          Add New Customer
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
                label="Email"
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
                label="Phone"
                value={createForm.phone}
                onChange={(e) => {
                  setCreateForm(prev => ({ ...prev, phone: e.target.value }));
                  // Clear field error when user starts typing
                  if (fieldErrors.phone) {
                    setFieldErrors(prev => ({ ...prev, phone: '' }));
                  }
                }}
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone || 'Enter phone number (e.g., 03xxxxxxxx)'}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={createForm.address}
                onChange={(e) => setCreateForm(prev => ({ ...prev, address: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  value={createForm.customerType}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, customerType: e.target.value }))}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                  <MenuItem value="BUSINESS">Business</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={createForm.notes}
                onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
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
            onClick={handleCreateCustomer}
            variant="contained"
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
              }
            }}
          >
            Create Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
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
          Edit Customer
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
                onChange={(e) => {
                  setEditForm(prev => ({ ...prev, phone: e.target.value }));
                  if (editFieldErrors.phone) {
                    setEditFieldErrors(prev => ({ ...prev, phone: '' }));
                  }
                }}
                error={!!editFieldErrors.phone}
                helperText={editFieldErrors.phone}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={editForm.address}
                onChange={(e) => {
                  setEditForm(prev => ({ ...prev, address: e.target.value }));
                  if (editFieldErrors.address) {
                    setEditFieldErrors(prev => ({ ...prev, address: '' }));
                  }
                }}
                error={!!editFieldErrors.address}
                helperText={editFieldErrors.address}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  value={editForm.customerType}
                  onChange={(e) => setEditForm(prev => ({ ...prev, customerType: e.target.value }))}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                  <MenuItem value="BUSINESS">Business</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
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
            onClick={handleEditCustomer}
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6A6BFF 0%, #3BB2FF 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5A5BFF 0%, #2A9BFF 100%)',
              }
            }}
          >
            Update Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Customer Dialog */}
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
          Customer Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedCustomer && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Full Name
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C', fontWeight: 500 }}>
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Customer Type
                </Typography>
                <Chip
                  label={selectedCustomer.customerType}
                  color={getCustomerTypeColor(selectedCustomer.customerType) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {selectedCustomer.email || 'Not provided'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Phone
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {selectedCustomer.phone || 'Not provided'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Address
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {selectedCustomer.address || 'Not provided'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Total Jobs
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C', fontWeight: 500 }}>
                  {selectedCustomer._count?.repairTickets || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Status
                </Typography>
                <Chip
                  label={selectedCustomer.isActive ? 'Active' : 'Inactive'}
                  color={getStatusColor(selectedCustomer.isActive) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Created
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {formatDate(selectedCustomer.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Last Updated
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {formatDate(selectedCustomer.updatedAt)}
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

      {/* Delete Customer Confirmation Dialog */}
      <Dialog 
        open={deleteDialog} 
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid #E2E8F0',
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          color: 'white'
        }}>
          Delete Customer
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this customer?
          </Typography>
          {selectedCustomer && (
            <Typography variant="body2" color="text.secondary">
              <strong>{selectedCustomer.firstName} {selectedCustomer.lastName}</strong> ({selectedCustomer.email})
            </Typography>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setDeleteDialog(false)}
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
            onClick={handleConfirmDelete}
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
              }
            }}
          >
            Delete Customer
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default CustomersPage;
