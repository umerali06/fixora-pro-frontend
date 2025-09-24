import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  ListItemText,
  ListItemAvatar,
  Divider,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  Badge,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Build as RepairIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompleteIcon,
  Warning as WarningIcon,
  PhoneAndroid as PhoneIcon,
  Laptop as LaptopIcon,
  Tablet as TabletIcon,
  Watch as WatchIcon,
  AccountCircle,
  Euro as EuroIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useResponsiveData } from '../../hooks/useResponsiveData';
import ResponsiveGrid from '../../components/common/ResponsiveGrid';

interface RepairTicket {
  id: string;
  ticketNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  device: {
    type: 'phone' | 'laptop' | 'tablet' | 'watch';
    brand: string;
    model: string;
    imei?: string;
    serialNumber?: string;
  };
  issue: string;
  description: string;
  status: 'pending' | 'diagnostic' | 'approved' | 'in_progress' | 'awaiting_parts' | 'ready' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  technician?: string;
  estimatedCost: number;
  actualCost?: number;
  estimatedTime: string;
  dateCreated: string;
  dateUpdated: string;
  completedDate?: string;
  notes: string[];
}

const Tickets: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeTab, setActiveTab] = useState(0);
  const [openNewTicketDialog, setOpenNewTicketDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);

  // Dynamic data management
  const [ticketsData, ticketsActions] = useResponsiveData({
    endpoint: '/repair-tickets',
    realTime: false, // Disabled temporarily
    autoRefresh: false, // Disabled temporarily
    refreshInterval: 30000,
    pageSize: 10
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ready': return 'success';
      case 'in_progress': return 'primary';
      case 'approved': return 'info';
      case 'diagnostic': return 'warning';
      case 'awaiting_parts': return 'warning';
      case 'pending': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'phone': return <PhoneIcon />;
      case 'laptop': return <LaptopIcon />;
      case 'tablet': return <TabletIcon />;
      case 'watch': return <WatchIcon />;
      default: return <PhoneIcon />;
    }
  };

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      diagnostic: 0,
      approved: 0,
      in_progress: 0,
      awaiting_parts: 0,
      ready: 0,
      completed: 0,
      cancelled: 0
    };

    ticketsData.data.forEach(ticket => {
      counts[ticket.status as keyof typeof counts]++;
    });

    return counts;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    ticketsActions.setSearchQuery(event.target.value);
  };

  const handleStatusFilter = (status: string) => {
    ticketsActions.setFilters({ ...ticketsData.filters, status });
  };

  const handlePriorityFilter = (priority: string) => {
    ticketsActions.setFilters({ ...ticketsData.filters, priority });
  };

  const handleCreateTicket = async (ticketData: Omit<RepairTicket, 'id'>) => {
    try {
      await ticketsActions.createItem(ticketData);
      setOpenNewTicketDialog(false);
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const handleUpdateTicket = async (id: string, updates: Partial<RepairTicket>) => {
    try {
      await ticketsActions.updateItem(id, updates);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      await ticketsActions.deleteItem(id);
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    }
  };

  const handleViewTicket = (ticket: RepairTicket) => {
    setSelectedTicket(ticket);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderTicketCard = (ticket: RepairTicket) => (
    <Card key={ticket.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            {getDeviceIcon(ticket.device.type)}
          </Avatar>
          <IconButton size="small">
            <EditIcon />
          </IconButton>
        </Box>
        
        <Typography variant="h6" component="h3" gutterBottom>
          {ticket.ticketNumber}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {ticket.customer.name}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip 
            label={ticket.status.replace('_', ' ')} 
            color={getStatusColor(ticket.status) as any}
            size="small"
          />
          <Chip 
            label={ticket.priority} 
            color={getPriorityColor(ticket.priority) as any}
            size="small"
          />
      </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
          {ticket.device.brand} {ticket.device.model}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          {ticket.issue}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Created
          </Typography>
          <Typography variant="body2">
            {formatDate(ticket.dateCreated)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Estimated Cost
                    </Typography>
          <Typography variant="body2" color="primary">
            €{ticket.estimatedCost.toFixed(2)}
                    </Typography>
                  </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <IconButton size="small" onClick={() => handleViewTicket(ticket)}>
              <ViewIcon />
            </IconButton>
            <IconButton size="small" onClick={() => setSelectedTicket(ticket)}>
              <EditIcon />
            </IconButton>
          </Box>
          <IconButton size="small" onClick={() => handleDeleteTicket(ticket.id)}>
            <DeleteIcon />
          </IconButton>
                </Box>
              </CardContent>
            </Card>
  );

  const renderTicketTable = () => (
    <TableContainer component={Paper}>
      <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticket #</TableCell>
            <TableCell>Customer</TableCell>
                <TableCell>Device</TableCell>
            <TableCell>Issue</TableCell>
                <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
          {ticketsData.data.map((ticket) => (
            <TableRow key={ticket.id}>
                  <TableCell>
                <Typography variant="subtitle2">{ticket.ticketNumber}</Typography>
                  </TableCell>
              <TableCell>
                      <Box>
                  <Typography variant="subtitle2">{ticket.customer.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                    {ticket.customer.email}
                        </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getDeviceIcon(ticket.device.type)}
                  <Typography variant="body2">
                          {ticket.device.brand} {ticket.device.model}
                        </Typography>
                    </Box>
                  </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ticket.issue}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                  label={ticket.status.replace('_', ' ')}
                  color={getStatusColor(ticket.status) as any}
                      size="small"
                    />
                  </TableCell>
              <TableCell>
                    <Chip
                  label={ticket.priority}
                  color={getPriorityColor(ticket.priority) as any}
                      size="small"
                    />
                  </TableCell>
              <TableCell>
                      {formatDate(ticket.dateCreated)}
                  </TableCell>
                  <TableCell>
                        <IconButton size="small" onClick={() => handleViewTicket(ticket)}>
                  <ViewIcon />
                        </IconButton>
                <IconButton size="small" onClick={() => setSelectedTicket(ticket)}>
                  <EditIcon />
                        </IconButton>
                <IconButton size="small" onClick={() => handleDeleteTicket(ticket.id)}>
                  <DeleteIcon />
                        </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
  );

  const statusCounts = getStatusCounts();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Repair Tickets
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewTicketDialog(true)}
          >
            New Ticket
          </Button>
        </Box>
              </Box>

      {/* Status Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {statusCounts.pending}
                  </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
                    </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {statusCounts.in_progress + statusCounts.diagnostic}
                    </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
                    </Typography>
            </CardContent>
          </Card>
                </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {statusCounts.ready}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ready
                  </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {statusCounts.completed}
                    </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
                    </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search tickets..."
                value={ticketsData.searchQuery}
                onChange={handleSearch}
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
                  value={ticketsData.filters.status}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="diagnostic">Diagnostic</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="awaiting_parts">Awaiting Parts</MenuItem>
                  <MenuItem value="ready">Ready</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={ticketsData.filters.priority}
                  onChange={(e) => handlePriorityFilter(e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => ticketsActions.refreshData()}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading State */}
      {ticketsData.loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Loading tickets data...
                      </Typography>
        </Box>
      )}

      {/* Error State */}
      {ticketsData.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {ticketsData.error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Grid View" />
          <Tab label="Table View" />
          <Tab label="Pending" />
          <Tab label="In Progress" />
          <Tab label="Ready" />
        </Tabs>
                  </Box>

      {/* Content */}
      {activeTab === 0 && (
        <ResponsiveGrid
          data={ticketsData.data}
          renderItem={renderTicketCard}
          loading={ticketsData.loading}
          empty={ticketsData.data.length === 0}
          pagination={ticketsData.pagination}
          onPageChange={ticketsActions.goToPage}
          onPageSizeChange={ticketsActions.changePageSize}
          viewMode={ticketsData.viewMode}
          onViewModeChange={ticketsActions.setViewMode}
          onRefresh={ticketsActions.refreshData}
        />
      )}

      {activeTab === 1 && renderTicketTable()}

      {activeTab === 2 && (
        <ResponsiveGrid
          data={ticketsData.data.filter(t => t.status === 'pending')}
          renderItem={renderTicketCard}
          loading={ticketsData.loading}
          empty={ticketsData.data.filter(t => t.status === 'pending').length === 0}
          pagination={ticketsData.pagination}
          onPageChange={ticketsActions.goToPage}
          onPageSizeChange={ticketsActions.changePageSize}
          viewMode={ticketsData.viewMode}
          onViewModeChange={ticketsActions.setViewMode}
          onRefresh={ticketsActions.refreshData}
        />
      )}

      {activeTab === 3 && (
        <ResponsiveGrid
          data={ticketsData.data.filter(t => ['in_progress', 'diagnostic'].includes(t.status))}
          renderItem={renderTicketCard}
          loading={ticketsData.loading}
          empty={ticketsData.data.filter(t => ['in_progress', 'diagnostic'].includes(t.status)).length === 0}
          pagination={ticketsData.pagination}
          onPageChange={ticketsActions.goToPage}
          onPageSizeChange={ticketsActions.changePageSize}
          viewMode={ticketsData.viewMode}
          onViewModeChange={ticketsActions.setViewMode}
          onRefresh={ticketsActions.refreshData}
        />
      )}

      {activeTab === 4 && (
        <ResponsiveGrid
          data={ticketsData.data.filter(t => t.status === 'ready')}
          renderItem={renderTicketCard}
          loading={ticketsData.loading}
          empty={ticketsData.data.filter(t => t.status === 'ready').length === 0}
          pagination={ticketsData.pagination}
          onPageChange={ticketsActions.goToPage}
          onPageSizeChange={ticketsActions.changePageSize}
          viewMode={ticketsData.viewMode}
          onViewModeChange={ticketsActions.setViewMode}
          onRefresh={ticketsActions.refreshData}
        />
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={openNewTicketDialog} onClose={() => setOpenNewTicketDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Ticket</DialogTitle>
        <DialogContent>
          {/* Add form here */}
          <Typography>Ticket form will be implemented here</Typography>
            </DialogContent>
            <DialogActions>
          <Button onClick={() => setOpenNewTicketDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Ticket</Button>
            </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tickets;

