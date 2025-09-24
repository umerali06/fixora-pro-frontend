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
  Avatar,
  Alert,
  CircularProgress,
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
  Refresh as RefreshIcon
} from '@mui/icons-material';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { repairTicketAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface RepairTicket {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  deviceBrand?: string;
  deviceModel?: string;
  deviceSerial?: string;
  totalCost?: number;
  estimatedCompletion?: string;
  actualCompletion?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
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

const RepairTrackingPage: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairTicket[]>([]);
  const [stats, setStats] = useState<RepairStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRepair, setSelectedRepair] = useState<RepairTicket | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Form state
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    deviceBrand: '',
    deviceModel: '',
    deviceSerial: '',
    priority: 'medium',
    status: 'pending',
    totalCost: 0,
    estimatedCompletion: '',
    customerId: '',
    assignedToId: ''
  });

  // Fetch data
  const fetchRepairsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get orgId from token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const orgId = payload.orgId || 'cmenqo0ay0000wfzcb3s8ch9g';
      
      console.log('🔍 Fetching repair tickets with orgId:', orgId);
      
      // Use the real repair tickets API
      const repairsData = await repairTicketAPI.getAll({ orgId });
      console.log('🔍 Repair tickets data:', repairsData);
      
      // Calculate stats
      const repairTickets = repairsData?.repairTickets || repairsData || [];
      const mockStats: RepairStats = {
        totalRepairs: repairTickets.length,
        pendingRepairs: repairTickets.filter((r: any) => r.status === 'PENDING').length,
        inProgressRepairs: repairTickets.filter((r: any) => ['IN_PROGRESS', 'DIAGNOSIS', 'WAITING_PARTS', 'TESTING'].includes(r.status)).length,
        completedRepairs: repairTickets.filter((r: any) => r.status === 'COMPLETED').length,
        totalRevenue: repairTickets.reduce((sum: number, r: any) => sum + (r.totalCost || 0), 0),
        averageRepairTime: 3.5, // days
        urgentRepairs: repairTickets.filter((r: any) => r.priority === 'URGENT').length,
        thisMonthRepairs: repairTickets.length
      };

      setRepairs(repairTickets);
      setStats(mockStats);
    } catch (err) {
      console.error('Error fetching repairs data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch repairs data. Please try again.');
      toast.error('Failed to load repair tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairsData();
  }, []);

  // Filter repairs
  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = !searchTerm || 
      repair.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.deviceBrand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.deviceModel?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || repair.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreateRepair = async () => {
    try {
      setLoading(true);

      // Get orgId from token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const orgId = payload.orgId || 'cmenqo0ay0000wfzcb3s8ch9g';

      const repairData = {
        orgId,
        customerId: createForm.customerId,
        title: createForm.title,
        description: createForm.description,
        deviceBrand: createForm.deviceBrand,
        deviceModel: createForm.deviceModel,
        deviceSerial: createForm.deviceSerial,
        priority: createForm.priority.toUpperCase(),
        status: createForm.status.toUpperCase(),
        totalCost: createForm.totalCost,
        estimatedCompletion: createForm.estimatedCompletion ? new Date(createForm.estimatedCompletion) : undefined
      };

      await repairTicketAPI.create(repairData);
      toast.success('Repair ticket created successfully!');
      setCreateDialog(false);
      setCreateForm({
        title: '',
        description: '',
        deviceBrand: '',
        deviceModel: '',
        deviceSerial: '',
        priority: 'medium',
        status: 'pending',
        totalCost: 0,
        estimatedCompletion: '',
        customerId: '',
        assignedToId: ''
      });
      await fetchRepairsData();
    } catch (err) {
      console.error('Error creating repair:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create repair. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRepair = (repair: RepairTicket) => {
    setSelectedRepair(repair);
    setViewDialog(true);
  };

  const handleEditRepair = (repair: RepairTicket) => {
    setCreateForm({
      title: repair.title,
      description: repair.description || '',
      deviceBrand: repair.deviceBrand || '',
      deviceModel: repair.deviceModel || '',
      deviceSerial: repair.deviceSerial || '',
      priority: repair.priority.toLowerCase(),
      status: repair.status.toLowerCase(),
      totalCost: repair.totalCost || 0,
      estimatedCompletion: repair.estimatedCompletion || '',
      customerId: repair.customer.id,
      assignedToId: repair.assignedTo?.id || ''
    });
    setSelectedRepair(repair);
    setEditDialog(true);
  };

  const handleUpdateRepair = async () => {
    if (!selectedRepair) return;

    try {
      setLoading(true);

      // Get orgId from token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const orgId = payload.orgId || 'cmenqo0ay0000wfzcb3s8ch9g';

      const updateData = {
        orgId: orgId,
        title: createForm.title,
        description: createForm.description,
        deviceBrand: createForm.deviceBrand,
        deviceModel: createForm.deviceModel,
        deviceSerial: createForm.deviceSerial,
        priority: createForm.priority.toUpperCase(),
        status: createForm.status.toUpperCase(),
        totalCost: createForm.totalCost,
        estimatedCompletion: createForm.estimatedCompletion ? new Date(createForm.estimatedCompletion) : undefined
      };

      await repairTicketAPI.update(selectedRepair.id, updateData);
      toast.success('Repair ticket updated successfully!');
      setEditDialog(false);
      setSelectedRepair(null);
      await fetchRepairsData();
    } catch (err) {
      console.error('Error updating repair:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update repair. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRepair = async (repairId: string) => {
    try {
      setLoading(true);

      // Get orgId from token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const orgId = payload.orgId || 'cmenqo0ay0000wfzcb3s8ch9g';

      await repairTicketAPI.delete(repairId, orgId);
      toast.success('Repair ticket deleted successfully!');
      setDeleteDialog(false);
      setSelectedRepair(null);
      await fetchRepairsData();
    } catch (err) {
      console.error('Error deleting repair:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete repair. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, repair: RepairTicket) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRepair(repair);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
      case 'diagnosis':
      case 'testing':
        return 'warning';
      case 'pending':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && repairs.length === 0) {
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
            Repair Tracking
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
            Create Repair Ticket
          </Button>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                    {stats.totalRepairs}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Repairs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                    {stats.inProgressRepairs}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    In Progress
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                    {stats.completedRepairs}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                    ${stats.totalRevenue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Revenue
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
                  placeholder="Search repairs..."
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
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchRepairsData}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Repairs List */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Repair Tickets ({filteredRepairs.length})
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
                    <TableCell>Issue</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRepairs.map((repair) => (
                    <TableRow key={repair.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {repair.customer.firstName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {repair.customer.firstName} {repair.customer.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {repair.customer.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {repair.deviceBrand} {repair.deviceModel}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {repair.deviceSerial}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {repair.title}
                        </Typography>
                        {repair.description && (
                          <Typography variant="caption" color="textSecondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                            {repair.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={repair.status}
                          color={getStatusColor(repair.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={repair.priority}
                          color={getPriorityColor(repair.priority) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ${repair.totalCost?.toFixed(2) || '0.00'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(repair.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuClick(e, repair)}
                          size="small"
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
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            selectedRepair && handleViewRepair(selectedRepair);
            handleMenuClose();
          }}>
            <ViewIcon sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => {
            selectedRepair && handleEditRepair(selectedRepair);
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

        {/* Create/Edit Repair Dialog */}
        <Dialog open={createDialog || editDialog} onClose={() => {
          setCreateDialog(false);
          setEditDialog(false);
          setSelectedRepair(null);
        }} maxWidth="md" fullWidth>
          <DialogTitle>{editDialog ? 'Edit Repair Ticket' : 'Create New Repair Ticket'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Device Brand"
                  value={createForm.deviceBrand}
                  onChange={(e) => setCreateForm({ ...createForm, deviceBrand: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Device Model"
                  value={createForm.deviceModel}
                  onChange={(e) => setCreateForm({ ...createForm, deviceModel: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Device Serial"
                  value={createForm.deviceSerial}
                  onChange={(e) => setCreateForm({ ...createForm, deviceSerial: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={createForm.priority}
                    label="Priority"
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={createForm.status}
                    label="Status"
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Cost"
                  type="number"
                  value={createForm.totalCost}
                  onChange={(e) => setCreateForm({ ...createForm, totalCost: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Estimated Completion"
                  type="date"
                  value={createForm.estimatedCompletion}
                  onChange={(e) => setCreateForm({ ...createForm, estimatedCompletion: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCreateDialog(false);
              setEditDialog(false);
              setSelectedRepair(null);
            }}>Cancel</Button>
            <Button 
              onClick={editDialog ? handleUpdateRepair : handleCreateRepair} 
              variant="contained" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : (editDialog ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Repair Details Dialog */}
        <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Repair Ticket Details</DialogTitle>
          <DialogContent>
            {selectedRepair ? (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Repair ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedRepair.id}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip 
                    label={selectedRepair.status} 
                    color={getStatusColor(selectedRepair.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Customer
                  </Typography>
                  <Typography variant="body1">
                    {selectedRepair.customer.firstName} {selectedRepair.customer.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedRepair.customer.email}
                  </Typography>
                  {selectedRepair.customer.phone && (
                    <Typography variant="body2" color="textSecondary">
                      {selectedRepair.customer.phone}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Device
                  </Typography>
                  <Typography variant="body1">
                    {selectedRepair.deviceBrand} {selectedRepair.deviceModel}
                  </Typography>
                  {selectedRepair.deviceSerial && (
                    <Typography variant="body2" color="textSecondary">
                      Serial: {selectedRepair.deviceSerial}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Issue
                  </Typography>
                  <Typography variant="body1">
                    {selectedRepair.title}
                  </Typography>
                  {selectedRepair.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {selectedRepair.description}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Priority
                  </Typography>
                  <Chip 
                    label={selectedRepair.priority} 
                    color={getPriorityColor(selectedRepair.priority) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Total Cost
                  </Typography>
                  <Typography variant="body1">
                    ${selectedRepair.totalCost?.toFixed(2) || '0.00'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedRepair.createdAt)}
                  </Typography>
                </Grid>
                {selectedRepair.estimatedCompletion && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Estimated Completion
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedRepair.estimatedCompletion)}
                    </Typography>
                  </Grid>
                )}
                {selectedRepair.actualCompletion && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Actual Completion
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedRepair.actualCompletion)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  No repair ticket selected
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Delete Repair Ticket</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this repair ticket? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => selectedRepair && handleDeleteRepair(selectedRepair.id)} 
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

export default RepairTrackingPage;
