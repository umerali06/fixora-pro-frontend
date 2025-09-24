import React, { useState, useEffect } from 'react';
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
  CheckCircle as ApproveIcon,
  PlayArrow as ProcessIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { refundsAPI } from '../../services/api';
import { getOrgIdFromToken } from '../../utils/auth';
import toast from 'react-hot-toast';

interface Refund {
  id: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  refundMethod: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  order?: {
    id: string;
    orderNumber: string;
    total: number;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    total: number;
  };
  approvedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  processedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface RefundStats {
  total: number;
  pending: number;
  approved: number;
  processed: number;
  rejected: number;
  totalAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  processedAmount: number;
  rejectedAmount: number;
}

interface CreateRefundForm {
  customerId: string;
  orderId?: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  reason: string;
  refundMethod: string;
  referenceNumber: string;
  notes: string;
}

interface EditRefundForm {
  id: string;
  customerId: string;
  orderId?: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  reason: string;
  refundMethod: string;
  referenceNumber: string;
  notes: string;
  status: string;
}

const RefundsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // State
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Form state
  const [createForm, setCreateForm] = useState<CreateRefundForm>({
    customerId: '',
    orderId: '',
    invoiceId: '',
    amount: 0,
    currency: 'EUR',
    reason: '',
    refundMethod: '',
    referenceNumber: '',
    notes: ''
  });

  const [editForm, setEditForm] = useState<EditRefundForm>({
    id: '',
    customerId: '',
    orderId: '',
    invoiceId: '',
    amount: 0,
    currency: 'EUR',
    reason: '',
    refundMethod: '',
    referenceNumber: '',
    notes: '',
    status: 'PENDING'
  });

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
      setCustomers(data.data || data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  // Fetch data
  const fetchRefundsData = async () => {
    if (!isAuthenticated) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [refundsData, statsData] = await Promise.all([
        refundsAPI.getAll(),
        refundsAPI.getStats()
      ]);

      setRefunds(refundsData || []);
      setStats(statsData || null);
    } catch (err) {
      console.error('Error fetching refunds data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch refunds. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundsData();
    fetchCustomers();
  }, [isAuthenticated]);

  // Debug selectedRefund changes
  useEffect(() => {
    console.log('🔍 selectedRefund state changed:', selectedRefund);
  }, [selectedRefund]);

  // Filter refunds
  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = !searchTerm || 
      refund.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${refund.customer.firstName} ${refund.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreateRefund = async () => {
    // Validate required fields
    if (!createForm.customerId) {
      toast.error('Please select a customer');
      return;
    }
    if (!createForm.refundMethod) {
      toast.error('Please select a refund method');
      return;
    }
    if (!createForm.reason) {
      toast.error('Please enter a reason');
      return;
    }
    if (createForm.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare refund data, only include fields with valid values
      const refundData: any = {
        customerId: createForm.customerId,
        amount: createForm.amount,
        currency: createForm.currency,
        reason: createForm.reason,
        refundMethod: createForm.refundMethod,
        referenceNumber: createForm.referenceNumber,
        notes: createForm.notes
      };

      // Only include orderId if it's provided and not empty (skip dummy data)
      if (createForm.orderId && 
          createForm.orderId.trim() !== '' && 
          !createForm.orderId.match(/^\d{4,}$/) && // Don't send if it's just 4+ digits
          !createForm.orderId.match(/^ITEM-/i) && // Don't send if it starts with "ITEM-"
          !createForm.orderId.match(/^TEST/i) && // Don't send if it starts with "TEST"
          !createForm.orderId.match(/^DEMO/i) && // Don't send if it starts with "DEMO"
          createForm.orderId.length > 8) { // Must be longer than 8 characters to be a real ID
        refundData.orderId = createForm.orderId;
      }

      // Only include invoiceId if it's provided and not empty (skip dummy data)
      if (createForm.invoiceId && 
          createForm.invoiceId.trim() !== '' && 
          !createForm.invoiceId.match(/^\d{4,}$/) && // Don't send if it's just 4+ digits
          !createForm.invoiceId.match(/^ITEM-/i) && // Don't send if it starts with "ITEM-"
          !createForm.invoiceId.match(/^TEST/i) && // Don't send if it starts with "TEST"
          !createForm.invoiceId.match(/^DEMO/i) && // Don't send if it starts with "DEMO"
          createForm.invoiceId.length > 8) { // Must be longer than 8 characters to be a real ID
        refundData.invoiceId = createForm.invoiceId;
      }

      await refundsAPI.create(refundData);
      toast.success('Refund created successfully!');
      setCreateDialog(false);
      setCreateForm({
        customerId: '',
        orderId: '',
        invoiceId: '',
        amount: 0,
        currency: 'EUR',
        reason: '',
        refundMethod: '',
        referenceNumber: '',
        notes: ''
      });
      await fetchRefundsData();
    } catch (err) {
      console.error('Error creating refund:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create refund. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async (refundId: string) => {
    try {
      setLoading(true);
      await refundsAPI.approve(refundId);
      toast.success('Refund approved successfully!');
      await fetchRefundsData();
    } catch (err) {
      console.error('Error approving refund:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve refund. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (refundId: string) => {
    try {
      setLoading(true);
      await refundsAPI.process(refundId);
      toast.success('Refund processed successfully!');
      await fetchRefundsData();
    } catch (err) {
      console.error('Error processing refund:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process refund. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRefund = async (refundId: string) => {
    try {
      setLoading(true);
      await refundsAPI.delete(refundId);
      toast.success('Refund deleted successfully!');
      setDeleteDialog(false);
      await fetchRefundsData();
    } catch (err) {
      console.error('Error deleting refund:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete refund. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRefund = (refund: Refund) => {
    console.log('🔍 Viewing refund:', refund);
    console.log('🔍 selectedRefund in dialog:', refund);
    setSelectedRefund(refund);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedRefund(null);
  };

  const handleEditRefund = (refund: Refund) => {
    setEditForm({
      id: refund.id,
      customerId: refund.customer.id,
      orderId: refund.order?.id || '',
      invoiceId: refund.invoice?.id || '',
      amount: refund.amount,
      currency: refund.currency,
      reason: refund.reason,
      refundMethod: refund.refundMethod,
      referenceNumber: refund.referenceNumber || '',
      notes: refund.notes || '',
      status: refund.status
    });
    setEditDialog(true);
  };

  const handleUpdateRefund = async () => {
    try {
      setLoading(true);

      // Validation
      if (!editForm.customerId) {
        toast.error('Please select a customer');
        return;
      }
      if (!editForm.refundMethod) {
        toast.error('Please select a refund method');
        return;
      }
      if (!editForm.reason) {
        toast.error('Please enter a reason');
        return;
      }
      if (editForm.amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      const updateData: any = {
        customerId: editForm.customerId,
        amount: editForm.amount,
        currency: editForm.currency,
        reason: editForm.reason,
        refundMethod: editForm.refundMethod,
        referenceNumber: editForm.referenceNumber,
        notes: editForm.notes,
        status: editForm.status
      };

      // Only include orderId if it's provided and not dummy data
      if (editForm.orderId && 
          editForm.orderId.trim() !== '' && 
          !editForm.orderId.match(/^\d{4,}$/) && // Don't send if it's just 4+ digits
          !editForm.orderId.match(/^ITEM-/i) && // Don't send if it starts with "ITEM-"
          !editForm.orderId.match(/^TEST/i) && // Don't send if it starts with "TEST"
          !editForm.orderId.match(/^DEMO/i) && // Don't send if it starts with "DEMO"
          editForm.orderId.length > 8) { // Must be longer than 8 characters to be a real ID
        updateData.orderId = editForm.orderId;
      }

      // Only include invoiceId if it's provided and not dummy data
      if (editForm.invoiceId && 
          editForm.invoiceId.trim() !== '' && 
          !editForm.invoiceId.match(/^\d{4,}$/) && // Don't send if it's just 4+ digits
          !editForm.invoiceId.match(/^ITEM-/i) && // Don't send if it starts with "ITEM-"
          !editForm.invoiceId.match(/^TEST/i) && // Don't send if it starts with "TEST"
          !editForm.invoiceId.match(/^DEMO/i) && // Don't send if it starts with "DEMO"
          editForm.invoiceId.length > 8) { // Must be longer than 8 characters to be a real ID
        updateData.invoiceId = editForm.invoiceId;
      }

      await refundsAPI.update(editForm.id, updateData);
      toast.success('Refund updated successfully!');
      setEditDialog(false);
      await fetchRefundsData();
    } catch (err) {
      console.error('Error updating refund:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update refund. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, refund: Refund) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRefund(refund);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    // Don't clear selectedRefund here - let the individual handlers manage it
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'info';
      case 'processed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && refunds.length === 0) {
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
            Refunds Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
            sx={{
              backgroundColor: '#3BB2FF',
              '&:hover': { backgroundColor: '#2A9BEF' }
            }}
          >
            Create Refund
          </Button>
        </Box>

      {/* Refund Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                  Total Refunds
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.total || 0}
                </Typography>
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
                <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                  Pending
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.pending || 0}
                </Typography>
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
                <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                  Approved
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.approved || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                  Total Amount
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(stats.totalAmount || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filter */}
      <Card sx={{ mb: 3, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search refunds..."
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
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="processed">Processed</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchRefundsData}
                  fullWidth
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Refunds List ({filteredRefunds.length})
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRefunds.map((refund) => (
                  <TableRow key={refund.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, backgroundColor: '#3BB2FF' }}>
                          {refund.customer.firstName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {refund.customer.firstName} {refund.customer.lastName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {refund.customer.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatCurrency(refund.amount, refund.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {refund.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                        color={getStatusColor(refund.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {refund.refundMethod}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(refund.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuClick(e, refund)}
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

          {filteredRefunds.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: '#6B7280' }}>
                No refunds found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          selectedRefund && handleViewRefund(selectedRefund);
          handleMenuClose();
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          selectedRefund && handleEditRefund(selectedRefund);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        {selectedRefund?.status === 'pending' && (
          <MenuItem onClick={() => {
            handleApproveRefund(selectedRefund.id);
            handleMenuClose();
          }}>
            <ApproveIcon sx={{ mr: 1 }} />
            Approve
          </MenuItem>
        )}
        {selectedRefund?.status === 'approved' && (
          <MenuItem onClick={() => {
            handleProcessRefund(selectedRefund.id);
            handleMenuClose();
          }}>
            <ProcessIcon sx={{ mr: 1 }} />
            Process
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          setDeleteDialog(true);
          handleMenuClose();
        }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Refund Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Refund</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Customer</InputLabel>
                <Select
                  value={createForm.customerId}
                  label="Customer"
                  onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} ({customer.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Order ID (Optional - Leave empty if not applicable)"
                placeholder="Leave empty if not applicable"
                value={createForm.orderId}
                onChange={(e) => setCreateForm({ ...createForm, orderId: e.target.value })}
                helperText="Only enter if linking to an existing order"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Invoice ID (Optional - Leave empty if not applicable)"
                placeholder="Leave empty if not applicable"
                value={createForm.invoiceId}
                onChange={(e) => setCreateForm({ ...createForm, invoiceId: e.target.value })}
                helperText="Only enter if linking to an existing invoice"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={createForm.currency}
                  label="Currency"
                  onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
                >
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Refund Method</InputLabel>
                <Select
                  value={createForm.refundMethod}
                  label="Refund Method"
                  onChange={(e) => setCreateForm({ ...createForm, refundMethod: e.target.value })}
                >
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                  <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                  <MenuItem value="PAYPAL">PayPal</MenuItem>
                  <MenuItem value="CHECK">Check</MenuItem>
                  <MenuItem value="STORE_CREDIT">Store Credit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason"
                value={createForm.reason}
                onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                required
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reference Number"
                value={createForm.referenceNumber}
                onChange={(e) => setCreateForm({ ...createForm, referenceNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Notes"
                value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateRefund} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Create Refund'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Refund Details Dialog */}
      <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Refund Details</DialogTitle>
        <DialogContent>
          {selectedRefund ? (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Refund ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedRefund.id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Status
                </Typography>
                <Chip 
                  label={selectedRefund.status.toUpperCase()} 
                  color={getStatusColor(selectedRefund.status) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Amount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {formatCurrency(selectedRefund.amount, selectedRefund.currency)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Refund Method
                </Typography>
                <Typography variant="body1">
                  {selectedRefund.refundMethod.replace('_', ' ')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Customer
                </Typography>
                <Typography variant="body1">
                  {selectedRefund.customer.firstName} {selectedRefund.customer.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedRefund.customer.email}
                </Typography>
                {selectedRefund.customer.phone && (
                  <Typography variant="body2" color="textSecondary">
                    {selectedRefund.customer.phone}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Reference Number
                </Typography>
                <Typography variant="body1">
                  {selectedRefund.referenceNumber || 'N/A'}
                </Typography>
              </Grid>
              {selectedRefund.order && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Related Order
                  </Typography>
                  <Typography variant="body1">
                    {selectedRefund.order.orderNumber}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatCurrency(selectedRefund.order.total, selectedRefund.currency)}
                  </Typography>
                </Grid>
              )}
              {selectedRefund.invoice && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Related Invoice
                  </Typography>
                  <Typography variant="body1">
                    {selectedRefund.invoice.invoiceNumber}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatCurrency(selectedRefund.invoice.total, selectedRefund.currency)}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Reason
                </Typography>
                <Typography variant="body1">
                  {selectedRefund.reason}
                </Typography>
              </Grid>
              {selectedRefund.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body1">
                    {selectedRefund.notes}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Created At
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedRefund.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedRefund.updatedAt)}
                </Typography>
              </Grid>
              {selectedRefund.approvedByUser && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Approved By
                  </Typography>
                  <Typography variant="body1">
                    {selectedRefund.approvedByUser.firstName} {selectedRefund.approvedByUser.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedRefund.approvedByUser.email}
                  </Typography>
                </Grid>
              )}
              {selectedRefund.processedByUser && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Processed By
                  </Typography>
                  <Typography variant="body1">
                    {selectedRefund.processedByUser.firstName} {selectedRefund.processedByUser.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedRefund.processedByUser.email}
                  </Typography>
                </Grid>
              )}
            </Grid>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No refund selected
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Please select a refund to view details
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Refund Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Refund</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Customer</InputLabel>
                <Select
                  value={editForm.customerId}
                  label="Customer"
                  onChange={(e) => setEditForm({ ...editForm, customerId: e.target.value })}
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} ({customer.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editForm.status}
                  label="Status"
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="PROCESSED">Processed</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Order ID (Optional - Leave empty if not applicable)"
                placeholder="Leave empty if not applicable"
                value={editForm.orderId}
                onChange={(e) => setEditForm({ ...editForm, orderId: e.target.value })}
                helperText="Only enter if linking to an existing order"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Invoice ID (Optional - Leave empty if not applicable)"
                placeholder="Leave empty if not applicable"
                value={editForm.invoiceId}
                onChange={(e) => setEditForm({ ...editForm, invoiceId: e.target.value })}
                helperText="Only enter if linking to an existing invoice"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={editForm.currency}
                  label="Currency"
                  onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                >
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Refund Method</InputLabel>
                <Select
                  value={editForm.refundMethod}
                  label="Refund Method"
                  onChange={(e) => setEditForm({ ...editForm, refundMethod: e.target.value })}
                >
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                  <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                  <MenuItem value="PAYPAL">PayPal</MenuItem>
                  <MenuItem value="CHECK">Check</MenuItem>
                  <MenuItem value="STORE_CREDIT">Store Credit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reference Number"
                value={editForm.referenceNumber}
                onChange={(e) => setEditForm({ ...editForm, referenceNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason"
                value={editForm.reason}
                onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                required
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateRefund} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Update Refund'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Refund</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this refund? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedRefund && handleDeleteRefund(selectedRefund.id)} 
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

export default RefundsPage;