import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
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
  Grid,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { warrantiesAPI, repairTicketAPI } from '../../services/api';
import { getOrgIdFromToken } from '../../utils/auth';
import toast from 'react-hot-toast';

interface WarrantyCard {
  id: string;
  repairTicketId: string;
  repairTicket: {
    id: string;
    title: string;
    deviceBrand?: string;
    deviceModel?: string;
    deviceSerial?: string;
    customer: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
  };
  customerId: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  deviceInfo: string;
  repairDetails: string;
  warrantyPeriod: number;
  warrantyStartDate: string;
  warrantyEndDate: string;
  termsConditions?: string;
  qrCode?: string;
  pdfUrl?: string;
  createdAt: string;
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
}

interface WarrantyStats {
  totalWarranties: number;
  activeWarranties: number;
  expiringSoon: number;
  expired: number;
  averageWarrantyPeriod: number;
  byPeriod: Array<{
    period: number;
    count: number;
  }>;
  recentWarranties: WarrantyCard[];
}

interface CreateWarrantyForm {
  repairTicketId: string;
  customerId: string;
  deviceInfo: string;
  repairDetails: string;
  warrantyPeriod: number;
  warrantyStartDate: string;
  warrantyEndDate: string;
  termsConditions: string;
}

interface EditWarrantyForm {
  id: string;
  repairTicketId: string;
  customerId: string;
  deviceInfo: string;
  repairDetails: string;
  warrantyPeriod: number;
  warrantyStartDate: string;
  warrantyEndDate: string;
  termsConditions: string;
}

const WarrantiesPage: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // State
  const [warranties, setWarranties] = useState<WarrantyCard[]>([]);
  const [stats, setStats] = useState<WarrantyStats | null>(null);
  const [repairTickets, setRepairTickets] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyCard | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Form state
  const [createForm, setCreateForm] = useState<CreateWarrantyForm>({
    repairTicketId: '',
    customerId: '',
    deviceInfo: '',
    repairDetails: '',
    warrantyPeriod: 12,
    warrantyStartDate: new Date().toISOString().split('T')[0],
    warrantyEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    termsConditions: ''
  });

  // Handle repair ticket selection and auto-fill customer
  const handleRepairTicketChange = (repairTicketId: string) => {
    const selectedTicket = repairTickets.find(ticket => ticket.id === repairTicketId);
    if (selectedTicket) {
      // Use the customer from the repair ticket directly
      const customer = selectedTicket.customer;
      
      setCreateForm(prev => ({
        ...prev,
        repairTicketId,
        customerId: customer?.id || '',
        deviceInfo: `${selectedTicket.deviceBrand || ''} ${selectedTicket.deviceModel || ''}`.trim() || 'Device Information',
        repairDetails: selectedTicket.description || selectedTicket.title || 'Repair Details'
      }));
    } else {
      setCreateForm(prev => ({
        ...prev,
        repairTicketId,
        customerId: '',
        deviceInfo: '',
        repairDetails: ''
      }));
    }
  };

  const [editForm, setEditForm] = useState<EditWarrantyForm>({
    id: '',
    repairTicketId: '',
    customerId: '',
    deviceInfo: '',
    repairDetails: '',
    warrantyPeriod: 12,
    warrantyStartDate: '',
    warrantyEndDate: '',
    termsConditions: ''
  });

  // Fetch repair tickets
  const fetchRepairTickets = async () => {
    try {
      // Get orgId from token
      const orgId = getOrgIdFromToken();
      if (!orgId) {
        console.error('Organization ID not found');
        setRepairTickets([]);
        return;
      }
      
      console.log('🔍 Fetching repair tickets with orgId:', orgId);
      
      // Use the repairTicketAPI service
      const repairsData = await repairTicketAPI.getAll({ orgId });
      console.log('🔍 Repair tickets response:', repairsData);
      
      // Handle the response structure - it could be direct array or wrapped in data.repairTickets
      let repairTickets = [];
      if (repairsData && repairsData.repairTickets && Array.isArray(repairsData.repairTickets)) {
        repairTickets = repairsData.repairTickets;
      } else if (Array.isArray(repairsData)) {
        repairTickets = repairsData;
      } else if (repairsData && repairsData.data && Array.isArray(repairsData.data)) {
        repairTickets = repairsData.data;
      } else {
        console.warn('⚠️ Repair tickets data is not in expected format:', repairsData);
        repairTickets = [];
      }

      console.log('✅ Setting repair tickets:', repairTickets.length);
      setRepairTickets(repairTickets);
    } catch (err) {
      console.error('Error fetching repair tickets:', err);
      setRepairTickets([]); // Set empty array on error
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/v1/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('🔍 Customers response:', data);
      
      // Ensure we always have an array
      if (data && data.data && Array.isArray(data.data)) {
        setCustomers(data.data);
      } else if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        console.warn('⚠️ Customers data is not an array:', data);
        setCustomers([]);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]); // Set empty array on error
    }
  };

  // Fetch data
  const fetchWarrantiesData = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [warrantiesData, statsData] = await Promise.all([
        warrantiesAPI.getAll(),
        warrantiesAPI.getStats()
      ]);

      setWarranties(warrantiesData?.warranties || warrantiesData || []);
      setStats(statsData || null);
    } catch (err) {
      console.error('Error fetching warranties data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch warranties. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWarrantiesData();
    fetchRepairTickets();
    fetchCustomers();
  }, [isAuthenticated, fetchWarrantiesData]);

  // Filter warranties
  const filteredWarranties = warranties.filter(warranty => {
    const matchesSearch = !searchTerm || 
      warranty.deviceInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warranty.repairDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warranty.repairTicket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warranty.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warranty.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && warranty.isActive) ||
      (statusFilter === 'expired' && warranty.isExpired) ||
      (statusFilter === 'expiring_soon' && warranty.isActive && warranty.daysRemaining <= 30);

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreateWarranty = async () => {
    try {
      setLoading(true);

      // Validation
      if (!createForm.repairTicketId) {
        toast.error('Please select a repair ticket');
        return;
      }
      if (!createForm.customerId) {
        toast.error('Please select a customer');
        return;
      }
      if (!createForm.deviceInfo) {
        toast.error('Please enter device information');
        return;
      }
      if (!createForm.repairDetails) {
        toast.error('Please enter repair details');
        return;
      }
      if (createForm.warrantyPeriod <= 0) {
        toast.error('Please enter a valid warranty period');
        return;
      }

      await warrantiesAPI.create(createForm);
      toast.success('Warranty created successfully!');
      setCreateDialog(false);
      setCreateForm({
      repairTicketId: '',
        customerId: '',
      deviceInfo: '',
      repairDetails: '',
      warrantyPeriod: 12,
      warrantyStartDate: new Date().toISOString().split('T')[0],
        warrantyEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      termsConditions: ''
    });
      await fetchWarrantiesData();
    } catch (err) {
      console.error('Error creating warranty:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create warranty. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewWarranty = (warranty: WarrantyCard) => {
    console.log('🔍 Viewing warranty:', warranty);
    setSelectedWarranty(warranty);
    setViewDialog(true);
  };

  const handleEditWarranty = (warranty: WarrantyCard) => {
    setEditForm({
      id: warranty.id,
      repairTicketId: warranty.repairTicketId,
      customerId: warranty.customerId,
      deviceInfo: warranty.deviceInfo,
      repairDetails: warranty.repairDetails,
      warrantyPeriod: warranty.warrantyPeriod,
      warrantyStartDate: warranty.warrantyStartDate.split('T')[0],
      warrantyEndDate: warranty.warrantyEndDate.split('T')[0],
      termsConditions: warranty.termsConditions || ''
    });
    setEditDialog(true);
  };

  const handleUpdateWarranty = async () => {
    try {
      setLoading(true);

      // Validation
      if (!editForm.repairTicketId) {
        toast.error('Please select a repair ticket');
        return;
      }
      if (!editForm.customerId) {
        toast.error('Please select a customer');
        return;
      }
      if (!editForm.deviceInfo) {
        toast.error('Please enter device information');
        return;
      }
      if (!editForm.repairDetails) {
        toast.error('Please enter repair details');
        return;
      }
      if (editForm.warrantyPeriod <= 0) {
        toast.error('Please enter a valid warranty period');
        return;
      }

      const updateData = {
        repairTicketId: editForm.repairTicketId,
        customerId: editForm.customerId,
        deviceInfo: editForm.deviceInfo,
        repairDetails: editForm.repairDetails,
        warrantyPeriod: editForm.warrantyPeriod,
        warrantyStartDate: editForm.warrantyStartDate,
        warrantyEndDate: editForm.warrantyEndDate,
        termsConditions: editForm.termsConditions
      };

      await warrantiesAPI.update(editForm.id, updateData);
      toast.success('Warranty updated successfully!');
      setEditDialog(false);
      await fetchWarrantiesData();
    } catch (err) {
      console.error('Error updating warranty:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update warranty. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWarranty = async (warrantyId: string) => {
    try {
      setLoading(true);
      await warrantiesAPI.delete(warrantyId);
      toast.success('Warranty deleted successfully!');
      setDeleteDialog(false);
      await fetchWarrantiesData();
    } catch (err) {
      console.error('Error deleting warranty:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete warranty. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, warranty: WarrantyCard) => {
    setMenuAnchor(event.currentTarget);
    setSelectedWarranty(warranty);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    // Don't clear selectedWarranty here - let the individual handlers manage it
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedWarranty(null);
  };

  const getStatusColor = (warranty: WarrantyCard) => {
    if (warranty.isExpired) return 'error';
    if (warranty.daysRemaining <= 30) return 'warning';
    return 'success';
  };

  const getStatusText = (warranty: WarrantyCard) => {
    if (warranty.isExpired) return 'Expired';
    if (warranty.daysRemaining <= 30) return 'Expiring Soon';
    return 'Active';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateWarrantyEndDate = (startDate: string, period: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + period);
    return end.toISOString().split('T')[0];
  };

  if (loading && warranties.length === 0) {
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
            Warranties Management
            </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
            sx={{
              backgroundColor: '#3BB2FF',
              '&:hover': { backgroundColor: '#2A9CE8' }
            }}
          >
            Create Warranty
          </Button>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                        {stats.totalWarranties}
                      </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Warranties
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                        {stats.activeWarranties}
                      </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Active Warranties
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                        {stats.expiringSoon}
                      </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Expiring Soon
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                        {stats.expired}
                      </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Expired
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Search and Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search warranties..."
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
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Warranties</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="expiring_soon">Expiring Soon</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchWarrantiesData}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Warranties List */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Warranties List ({filteredWarranties.length})
                </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Device</TableCell>
                    <TableCell>Repair Details</TableCell>
                    <TableCell>Warranty Period</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {filteredWarranties.map((warranty) => (
                    <TableRow key={warranty.id}>
                          <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {warranty.customer.firstName[0]}
                          </Avatar>
                            <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {warranty.customer.firstName} {warranty.customer.lastName}
                              </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {warranty.customer.email}
                              </Typography>
                          </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {warranty.deviceInfo}
                                </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {warranty.repairTicket.title}
                                </Typography>
                          </TableCell>
                          <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {warranty.repairDetails}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                              {warranty.warrantyPeriod} months
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                          label={getStatusText(warranty)}
                          color={getStatusColor(warranty) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                        <Typography variant="body2">
                          {formatDate(warranty.warrantyStartDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                              {formatDate(warranty.warrantyEndDate)}
                            </Typography>
                        {warranty.isActive && (
                          <Typography variant="caption" color="textSecondary">
                            {warranty.daysRemaining} days left
                          </Typography>
                        )}
                          </TableCell>
                          <TableCell>
                              <IconButton
                          onClick={(e) => handleMenuClick(e, warranty)}
                                size="small"
                              >
                          <MoreVertIcon />
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
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            selectedWarranty && handleViewWarranty(selectedWarranty);
            handleMenuClose();
          }}>
            <ViewIcon sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => {
            selectedWarranty && handleEditWarranty(selectedWarranty);
            handleMenuClose();
          }}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={() => {
            setDeleteDialog(true);
            handleMenuClose();
          }} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Create Warranty Dialog */}
        <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Warranty</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Repair Ticket</InputLabel>
                  <Select
                    value={createForm.repairTicketId}
                    label="Repair Ticket"
                    onChange={(e) => handleRepairTicketChange(e.target.value)}
                  >
                    {Array.isArray(repairTickets) && repairTickets.map((ticket) => (
                      <MenuItem key={ticket.id} value={ticket.id}>
                        {ticket.title} - {ticket.customer?.firstName} {ticket.customer?.lastName} ({ticket.customer?.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                      </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={createForm.customerId}
                    label="Customer"
                    onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
                  >
                    {Array.isArray(customers) && customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName} ({customer.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Device Information"
                  value={createForm.deviceInfo}
                  onChange={(e) => setCreateForm({ ...createForm, deviceInfo: e.target.value })}
                          required
                          multiline
                  rows={2}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Repair Details"
                  value={createForm.repairDetails}
                  onChange={(e) => setCreateForm({ ...createForm, repairDetails: e.target.value })}
                          required
                          multiline
                          rows={3}
                        />
                      </Grid>
              <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Warranty Period (months)"
                          type="number"
                  value={createForm.warrantyPeriod}
                  onChange={(e) => {
                    const period = parseInt(e.target.value) || 0;
                    setCreateForm({ 
                      ...createForm, 
                      warrantyPeriod: period,
                      warrantyEndDate: calculateWarrantyEndDate(createForm.warrantyStartDate, period)
                    });
                  }}
                          required
                        />
                      </Grid>
              <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                  label="Start Date"
                          type="date"
                  value={createForm.warrantyStartDate}
                  onChange={(e) => {
                    const startDate = e.target.value;
                    setCreateForm({ 
                      ...createForm, 
                      warrantyStartDate: startDate,
                      warrantyEndDate: calculateWarrantyEndDate(startDate, createForm.warrantyPeriod)
                    });
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={createForm.warrantyEndDate}
                  onChange={(e) => setCreateForm({ ...createForm, warrantyEndDate: e.target.value })}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                  label="Terms & Conditions"
                  value={createForm.termsConditions}
                  onChange={(e) => setCreateForm({ ...createForm, termsConditions: e.target.value })}
                          multiline
                  rows={3}
                        />
                      </Grid>
                    </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateWarranty} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Create Warranty'}
                      </Button>
          </DialogActions>
        </Dialog>

        {/* View Warranty Details Dialog */}
        <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
          <DialogTitle>Warranty Details</DialogTitle>
          <DialogContent>
            {selectedWarranty ? (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Warranty ID
                      </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedWarranty.id}
                  </Typography>
                        </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip 
                    label={getStatusText(selectedWarranty)} 
                    color={getStatusColor(selectedWarranty) as any}
                    size="small"
                  />
                        </Grid>
                  <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Customer
                    </Typography>
                  <Typography variant="body1">
                    {selectedWarranty.customer.firstName} {selectedWarranty.customer.lastName}
                        </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedWarranty.customer.email}
                        </Typography>
                  {selectedWarranty.customer.phone && (
                    <Typography variant="body2" color="textSecondary">
                      {selectedWarranty.customer.phone}
                        </Typography>
                  )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Repair Ticket
                    </Typography>
                  <Typography variant="body1">
                    {selectedWarranty.repairTicket.title}
                      </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedWarranty.repairTicket.deviceBrand} {selectedWarranty.repairTicket.deviceModel}
                  </Typography>
                  </Grid>
                  <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Device Information
                    </Typography>
                  <Typography variant="body1">
                      {selectedWarranty.deviceInfo}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Repair Details
                    </Typography>
                  <Typography variant="body1">
                      {selectedWarranty.repairDetails}
                    </Typography>
                  </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Warranty Period
                  </Typography>
                  <Typography variant="body1">
                    {selectedWarranty.warrantyPeriod} months
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedWarranty.warrantyStartDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    End Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedWarranty.warrantyEndDate)}
                  </Typography>
                  {selectedWarranty.isActive && (
                    <Typography variant="body2" color="textSecondary">
                      {selectedWarranty.daysRemaining} days remaining
                    </Typography>
                  )}
                </Grid>
                  {selectedWarranty.termsConditions && (
                    <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Terms & Conditions
                      </Typography>
                    <Typography variant="body1">
                        {selectedWarranty.termsConditions}
                      </Typography>
                    </Grid>
                  )}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Created At
                      </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedWarranty.createdAt)}
                  </Typography>
                    </Grid>
                </Grid>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  No warranty selected
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Please select a warranty to view details
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Warranty Dialog */}
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Warranty</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Repair Ticket</InputLabel>
                  <Select
                    value={editForm.repairTicketId}
                    label="Repair Ticket"
                    onChange={(e) => {
                      const selectedTicket = repairTickets.find(ticket => ticket.id === e.target.value);
                      if (selectedTicket) {
                        const customer = selectedTicket.customer;
                        setEditForm(prev => ({
                          ...prev,
                          repairTicketId: e.target.value,
                          customerId: customer?.id || prev.customerId,
                          deviceInfo: `${selectedTicket.deviceBrand || ''} ${selectedTicket.deviceModel || ''}`.trim() || 'Device Information',
                          repairDetails: selectedTicket.description || selectedTicket.title || 'Repair Details'
                        }));
                      } else {
                        setEditForm(prev => ({ ...prev, repairTicketId: e.target.value }));
                      }
                    }}
                  >
                    {Array.isArray(repairTickets) && repairTickets.map((ticket) => (
                      <MenuItem key={ticket.id} value={ticket.id}>
                        {ticket.title} - {ticket.customer?.firstName} {ticket.customer?.lastName} ({ticket.customer?.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={editForm.customerId}
                    label="Customer"
                    onChange={(e) => setEditForm({ ...editForm, customerId: e.target.value })}
                  >
                    {Array.isArray(customers) && customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName} ({customer.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Device Information"
                  value={editForm.deviceInfo}
                  onChange={(e) => setEditForm({ ...editForm, deviceInfo: e.target.value })}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Repair Details"
                  value={editForm.repairDetails}
                  onChange={(e) => setEditForm({ ...editForm, repairDetails: e.target.value })}
                  required
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Warranty Period (months)"
                  type="number"
                  value={editForm.warrantyPeriod}
                  onChange={(e) => {
                    const period = parseInt(e.target.value) || 0;
                    setEditForm({ 
                      ...editForm, 
                      warrantyPeriod: period,
                      warrantyEndDate: calculateWarrantyEndDate(editForm.warrantyStartDate, period)
                    });
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={editForm.warrantyStartDate}
                  onChange={(e) => {
                    const startDate = e.target.value;
                    setEditForm({ 
                      ...editForm, 
                      warrantyStartDate: startDate,
                      warrantyEndDate: calculateWarrantyEndDate(startDate, editForm.warrantyPeriod)
                    });
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={editForm.warrantyEndDate}
                  onChange={(e) => setEditForm({ ...editForm, warrantyEndDate: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Terms & Conditions"
                  value={editForm.termsConditions}
                  onChange={(e) => setEditForm({ ...editForm, termsConditions: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateWarranty} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Update Warranty'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Delete Warranty</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this warranty? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
              <Button
              onClick={() => selectedWarranty && handleDeleteWarranty(selectedWarranty.id)} 
              color="error" 
                variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Delete'}
              </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default WarrantiesPage;