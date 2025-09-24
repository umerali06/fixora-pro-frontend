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
  Business as BusinessIcon,
  Person as PersonIcon,
  Contacts as ContactsIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useAppSelector } from '../../store/hooks';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { customerAPI } from '../../services/api';
import { PermissionGate } from '../../utils/permissions';

// Types
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  customerType: 'INDIVIDUAL' | 'BUSINESS';
  notes: string | null;
  isActive: boolean;
  totalRepairs: number;
  totalSpent: number;
  lastVisit: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    repairTickets: number;
  };
}

interface ContactStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  newThisMonth: number;
  totalRevenue: number;
  totalRepairs: number;
  averageSpentPerCustomer: number;
}

interface CreateContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  customerType: 'INDIVIDUAL' | 'BUSINESS';
  notes: string;
  isActive: boolean;
}

interface FieldErrors {
  [key: string]: string;
}

// Main Component
const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Redux state
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);
  
  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Form states
  const [createForm, setCreateForm] = useState<CreateContactForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    customerType: 'INDIVIDUAL',
    notes: '',
    isActive: true
  });
  
  // Error states
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [editFieldErrors, setEditFieldErrors] = useState<FieldErrors>({});
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // API Base URL
  const apiBase = process.env.NODE_ENV === 'production' 
    ? 'https://your-production-api.com' 
    : 'http://localhost:5000';

  // Fetch contacts data
  const fetchContactsData = async () => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated, skipping contacts fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching contacts data...');
      const [contactsData, statsData] = await Promise.all([
        customerAPI.getAll(),
        customerAPI.getStats()
      ]);

      console.log('Contacts data received:', contactsData);
      console.log('Stats data received:', statsData);

      setContacts(Array.isArray(contactsData) ? contactsData : []);
      setStats(statsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching contacts data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      setError(errorMessage);
      toast.error(`Failed to fetch contacts: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Create new contact
  const handleCreateContact = async () => {
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

      // Prepare contact data for API
      const contactData = {
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim() || undefined,
        address: createForm.address.trim() || undefined,
        customerType: createForm.customerType,
        notes: createForm.notes.trim() || undefined,
        status: 'ACTIVE', // Required by API
        source: 'WALK_IN' // Optional but good to have
      };

      console.log('Creating contact with data:', contactData);
      const newContact = await customerAPI.create(contactData);
      console.log('Created contact:', newContact);
      
      setContacts(prev => [newContact, ...prev]);
      setCreateDialog(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        customerType: 'INDIVIDUAL',
        notes: '',
        isActive: true
      });
      toast.success('Contact created successfully!');
      
      // Refresh stats
      fetchContactsData();
    } catch (error: any) {
      console.error('Error creating contact:', error);
      
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
        const errorMessage = error.response?.data?.message || 'Failed to create contact';
        toast.error(errorMessage);
      }
    }
  };

  // Update contact
  const handleUpdateContact = async () => {
    if (!selectedContact) return;

    try {
      // Clear previous field errors
      setEditFieldErrors({});
      
      // Validate required fields
      if (!createForm.firstName.trim()) {
        setEditFieldErrors({ firstName: 'First name is required' });
        toast.error('First name is required');
        return;
      }
      
      if (!createForm.lastName.trim()) {
        setEditFieldErrors({ lastName: 'Last name is required' });
        toast.error('Last name is required');
        return;
      }
      
      if (!createForm.email.trim()) {
        setEditFieldErrors({ email: 'Email is required' });
        toast.error('Email is required');
        return;
      }

      // Prepare contact data for API
      const contactData = {
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim() || undefined,
        address: createForm.address.trim() || undefined,
        customerType: createForm.customerType,
        notes: createForm.notes.trim() || undefined,
        isActive: createForm.isActive
      };

      console.log('Updating contact with data:', contactData);
      const updatedContact = await customerAPI.update(selectedContact.id, contactData);
      console.log('Updated contact:', updatedContact);
      
      setContacts(prev => prev.map(contact => 
        contact.id === selectedContact.id ? updatedContact : contact
      ));
      setEditDialog(false);
      setSelectedContact(null);
      toast.success('Contact updated successfully!');
      
      // Refresh stats
      fetchContactsData();
    } catch (error: any) {
      console.error('Error updating contact:', error);
      
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
        const errorMessage = error.response?.data?.message || 'Failed to update contact';
        toast.error(errorMessage);
      }
    }
  };

  // Delete contact
  const handleDeleteContact = async (id: string) => {
    setSelectedContact(contacts.find(c => c.id === id) || null);
    setDeleteDialog(true);
  };

  // Confirm delete contact
  const handleConfirmDelete = async () => {
    if (!selectedContact) return;

    try {
      await customerAPI.delete(selectedContact.id);
      setContacts(prev => prev.filter(contact => contact.id !== selectedContact.id));
      setDeleteDialog(false);
      setSelectedContact(null);
      toast.success('Contact deleted successfully!');
      
      // Refresh stats
      fetchContactsData();
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete contact';
      toast.error(errorMessage);
    }
  };

  // Handle contact selection
  const handleContactSelect = (contact: Contact, action: 'view' | 'edit') => {
    setSelectedContact(contact);
    if (action === 'view') {
      setViewDialog(true);
    } else {
      setCreateForm({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email || '',
        phone: contact.phone || '',
        address: contact.address || '',
        customerType: contact.customerType,
        notes: contact.notes || '',
        isActive: contact.isActive
      });
      setEditDialog(true);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchContactsData();
  };

  // Filtered contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.includes(searchTerm)) ||
      (contact.address && contact.address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && contact.isActive) ||
      (statusFilter === 'INACTIVE' && !contact.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Load data on component mount
  useEffect(() => {
    fetchContactsData();
  }, []);

  // Fetch data when user is loaded and contacts array is empty
  useEffect(() => {
    if (user && contacts.length === 0) {
      fetchContactsData();
    }
  }, [user, contacts.length]);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'warning';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'ACTIVE' : 'INACTIVE';
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
            <ContactsIcon sx={{ color: '#3BB2FF', fontSize: 28 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1A202C' }}>
                {t('Contacts')}
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
                      {stats?.total || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                      Total Contacts
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                    color: 'white'
                  }}>
                    <ContactsIcon />
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
                      Active Contacts
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
                      {formatCurrency(stats?.totalRevenue || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                      Total Revenue
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: 'white'
                  }}>
                    <BusinessIcon />
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
                  placeholder="Search contacts..."
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
              
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="ALL">All Status</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                    <MenuItem value="BLOCKED">Blocked</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              
              <Grid item xs={12} md={5} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
                  <PermissionGate permission="customers:write">
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
                      Add Contact
                    </Button>
                  </PermissionGate>
                </Grid>
              </Grid>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card sx={{ 
          borderRadius: '16px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
          minHeight: '400px'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1A202C' }}>
              Contact List ({filteredContacts.length})
            </Typography>
            
            <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                  <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Contact Info</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Total Spent</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Repairs</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                    <TableRow key={contact.id} hover sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                        <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: contact.isActive ? '#3BB2FF' : '#99A7BD',
                            width: 40,
                            height: 40
                          }}>
                            {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                            </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#1A202C' }}>
                              {contact.firstName} {contact.lastName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                              ID: {contact.id.slice(-8)}
                            </Typography>
                          </Box>
                          </Box>
                        </TableCell>
                      
                        <TableCell>
                          <Box>
                          {contact.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <EmailIcon sx={{ fontSize: 16, color: '#99A7BD' }} />
                              <Typography variant="body2" sx={{ color: '#1A202C' }}>
                                {contact.email}
                              </Typography>
                            </Box>
                          )}
                          {contact.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon sx={{ fontSize: 16, color: '#99A7BD' }} />
                              <Typography variant="body2" sx={{ color: '#1A202C' }}>
                                {contact.phone}
                              </Typography>
                            </Box>
                          )}
                          </Box>
                        </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#1A202C' }}>
                          {contact.customerType}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#1A202C', fontWeight: 500 }}>
                          {formatCurrency(contact.totalSpent)}
                        </Typography>
                      </TableCell>
                      
                        <TableCell>
                        <Typography variant="body2" sx={{ color: '#1A202C', fontWeight: 500 }}>
                          {contact._count?.repairTickets || 0}
                        </Typography>
                        </TableCell>
                      
                        <TableCell>
                          <Chip 
                          label={getStatusText(contact.isActive)}
                            color={getStatusColor(contact.isActive) as any}
                            size="small"
                          sx={{ borderRadius: '8px' }}
                          />
                        </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                          {formatDate(contact.createdAt)}
                        </Typography>
                      </TableCell>
                      
                        <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <PermissionGate permission="customers:read">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleContactSelect(contact, 'view')}
                                sx={{ color: '#3BB2FF' }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </PermissionGate>
                          <PermissionGate permission="customers:write">
                            <Tooltip title="Edit Contact">
                              <IconButton
                                size="small"
                                onClick={() => handleContactSelect(contact, 'edit')}
                                sx={{ color: '#6A6BFF' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </PermissionGate>
                          <PermissionGate permission="customers:write">
                            <Tooltip title="Delete Contact">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteContact(contact.id)}
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
            
            {filteredContacts.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#99A7BD' }}>
                  No contacts found matching your criteria
                </Typography>
              </Box>
            )}
            </CardContent>
          </Card>

        {/* Create Contact Dialog */}
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
            Add New Contact
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
                label="Phone"
                value={createForm.phone}
                onChange={(e) => {
                  setCreateForm(prev => ({ ...prev, phone: e.target.value }));
                  if (fieldErrors.phone) {
                    setFieldErrors(prev => ({ ...prev, phone: '' }));
                  }
                }}
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  value={createForm.customerType}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, customerType: e.target.value as any }))}
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
                label="Address"
                value={createForm.address}
                onChange={(e) => {
                  setCreateForm(prev => ({ ...prev, address: e.target.value }));
                  if (fieldErrors.address) {
                    setFieldErrors(prev => ({ ...prev, address: '' }));
                  }
                }}
                error={!!fieldErrors.address}
                helperText={fieldErrors.address}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={createForm.isActive ? 'ACTIVE' : 'INACTIVE'}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, isActive: e.target.value === 'ACTIVE' }))}
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
                label="Notes"
                multiline
                rows={3}
                value={createForm.notes}
                onChange={(e) => {
                  setCreateForm(prev => ({ ...prev, notes: e.target.value }));
                  if (fieldErrors.notes) {
                    setFieldErrors(prev => ({ ...prev, notes: '' }));
                  }
                }}
                error={!!fieldErrors.notes}
                helperText={fieldErrors.notes}
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
              onClick={handleCreateContact}
              variant="contained"
              sx={{ 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
                }
              }}
            >
              Create Contact
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Contact Dialog */}
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
            background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
            color: 'white'
          }}>
            Edit Contact
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
                  label="Last Name *"
                  value={createForm.lastName}
                  onChange={(e) => {
                    setCreateForm(prev => ({ ...prev, lastName: e.target.value }));
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
                  label="Email *"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => {
                    setCreateForm(prev => ({ ...prev, email: e.target.value }));
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
                  value={createForm.phone}
                  onChange={(e) => {
                    setCreateForm(prev => ({ ...prev, phone: e.target.value }));
                    if (editFieldErrors.phone) {
                      setEditFieldErrors(prev => ({ ...prev, phone: '' }));
                    }
                  }}
                  error={!!editFieldErrors.phone}
                  helperText={editFieldErrors.phone}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Customer Type</InputLabel>
                  <Select
                    value={createForm.customerType}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, customerType: e.target.value as any }))}
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
                  label="Address"
                  value={createForm.address}
                  onChange={(e) => {
                    setCreateForm(prev => ({ ...prev, address: e.target.value }));
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
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={createForm.isActive ? 'ACTIVE' : 'INACTIVE'}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, isActive: e.target.value === 'ACTIVE' }))}
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
                  label="Notes"
                  multiline
                  rows={3}
                  value={createForm.notes}
                  onChange={(e) => {
                    setCreateForm(prev => ({ ...prev, notes: e.target.value }));
                    if (editFieldErrors.notes) {
                      setEditFieldErrors(prev => ({ ...prev, notes: '' }));
                    }
                  }}
                  error={!!editFieldErrors.notes}
                  helperText={editFieldErrors.notes}
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
                color: '#99A7BD',
                '&:hover': { backgroundColor: '#F1F5F9' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateContact}
              variant="contained"
              sx={{ 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
                }
              }}
            >
              Update Contact
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Contact Dialog */}
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
            Contact Details
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedContact && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                    Full Name
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1A202C', fontWeight: 500 }}>
                    {selectedContact.firstName} {selectedContact.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1A202C' }}>
                    {selectedContact.email || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                    Phone
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1A202C' }}>
                    {selectedContact.phone || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                    Customer Type
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1A202C' }}>
                    {selectedContact.customerType}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                    Address
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1A202C' }}>
                    {selectedContact.address || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                    Total Spent
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1A202C', fontWeight: 500 }}>
                    {formatCurrency(selectedContact.totalSpent)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                    Total Repairs
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1A202C', fontWeight: 500 }}>
                    {selectedContact._count?.repairTickets || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                    Status
                  </Typography>
                  <Chip
                    label={getStatusText(selectedContact.isActive)}
                    color={getStatusColor(selectedContact.isActive) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                    Last Visit
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1A202C' }}>
                    {selectedContact.lastVisit ? formatDate(selectedContact.lastVisit) : 'Never'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                    Created
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1A202C' }}>
                    {formatDate(selectedContact.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                    Last Updated
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1A202C' }}>
                    {formatDate(selectedContact.updatedAt)}
                  </Typography>
                </Grid>
                {selectedContact.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                      Notes
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1A202C' }}>
                      {selectedContact.notes}
                    </Typography>
                  </Grid>
                )}
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

      {/* Delete Contact Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
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
          Delete Contact
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ color: '#1A202C' }}>
            Are you sure you want to delete <strong>{selectedContact?.firstName} {selectedContact?.lastName}</strong>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setDeleteDialog(false)}
            sx={{ 
              borderRadius: '12px',
              color: '#99A7BD',
              '&:hover': { backgroundColor: '#F1F5F9' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
              }
            }}
          >
            Delete Contact
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default ContactsPage;