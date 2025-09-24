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
  useTheme,
  Fab,
  Badge,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Support as SupportIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  PriorityHigh as PriorityIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Ticket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  lastResponse?: string;
  responseTime?: string;
}

const TicketsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'create' | 'edit' | 'view'>('create');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data
    const mockTickets: Ticket[] = [
      {
        id: 'TKT-001',
        ticketNumber: 'T-2024-001',
        customerName: 'John Doe',
        customerEmail: 'john.doe@email.com',
        customerPhone: '+1-555-0123',
        subject: 'iPhone screen not responding after repair',
        description: 'I had my iPhone screen replaced last week and now it\'s not responding to touch. The screen works but touch input is completely dead.',
        status: 'in_progress',
        priority: 'high',
        category: 'Technical Support',
        assignedTo: 'Mike Johnson',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        lastResponse: 'We are investigating the touch issue. This might be a calibration problem.',
        responseTime: '2 hours'
      },
      {
        id: 'TKT-002',
        ticketNumber: 'T-2024-002',
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@email.com',
        customerPhone: '+1-555-0456',
        subject: 'Battery replacement quote request',
        description: 'I need a quote for replacing the battery in my Samsung Galaxy S21. The battery is draining very quickly.',
        status: 'open',
        priority: 'medium',
        category: 'Quote Request',
        createdAt: '2024-01-16T09:15:00Z',
        updatedAt: '2024-01-16T09:15:00Z'
      },
      {
        id: 'TKT-003',
        ticketNumber: 'T-2024-003',
        customerName: 'Bob Johnson',
        customerEmail: 'bob.johnson@email.com',
        customerPhone: '+1-555-0789',
        subject: 'Water damage assessment needed',
        description: 'My iPhone fell in the pool yesterday. I turned it off immediately and put it in rice. Can you assess the damage?',
        status: 'waiting_customer',
        priority: 'urgent',
        category: 'Water Damage',
        assignedTo: 'Sarah Wilson',
        createdAt: '2024-01-14T11:45:00Z',
        updatedAt: '2024-01-16T10:30:00Z',
        lastResponse: 'Please bring your device in immediately. Water damage requires urgent attention.',
        responseTime: '1 hour'
      },
      {
        id: 'TKT-004',
        ticketNumber: 'T-2024-004',
        customerName: 'Alice Brown',
        customerEmail: 'alice.brown@email.com',
        customerPhone: '+1-555-0321',
        subject: 'Software update issue',
        description: 'My iPad won\'t update to the latest iOS version. It keeps showing an error message.',
        status: 'resolved',
        priority: 'low',
        category: 'Software Support',
        assignedTo: 'Mike Johnson',
        createdAt: '2024-01-13T14:20:00Z',
        updatedAt: '2024-01-15T16:45:00Z',
        lastResponse: 'Issue resolved by clearing storage space and restarting the device.',
        responseTime: '4 hours'
      }
    ];
    
    setTickets(mockTickets);
    setLoading(false);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, ticket: Ticket) => {
    setAnchorEl(event.currentTarget);
    setSelectedTicket(ticket);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTicket(null);
  };

  const handleAction = (action: string) => {
    if (!selectedTicket) return;
    
    switch (action) {
      case 'view':
        setDialogType('view');
        setOpenDialog(true);
        break;
      case 'edit':
        setDialogType('edit');
        setOpenDialog(true);
        break;
      case 'delete':
        // Handle delete
        break;
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'waiting_customer':
        return 'secondary';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technical Support':
        return 'primary';
      case 'Quote Request':
        return 'secondary';
      case 'Water Damage':
        return 'warning';
      case 'Software Support':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    const matchesAssigned = assignedFilter === 'all' || ticket.assignedTo === assignedFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssigned;
  });

  const getTicketSummary = () => {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;
    
    return { totalTickets, openTickets, inProgressTickets, resolvedTickets, urgentTickets };
  };

  const summary = getTicketSummary();

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          {t('Support Tickets')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('Manage customer support tickets and inquiries')}
        </Typography>
      </Box>

      {/* Ticket Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SupportIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                    {summary.totalTickets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('Total Tickets')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                    {summary.openTickets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('Open')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                    {summary.inProgressTickets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('In Progress')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                    {summary.resolvedTickets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('Resolved')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PriorityIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                    {summary.urgentTickets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('Urgent')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {summary.urgentTickets > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('You have {{count}} urgent tickets that require immediate attention.', { count: summary.urgentTickets })}
        </Alert>
      )}
      {summary.openTickets > 5 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t('You have {{count}} open tickets. Consider assigning more staff to handle the workload.', { count: summary.openTickets })}
        </Alert>
      )}

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder={t('Search tickets...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <MenuItem value="open">{t('Open')}</MenuItem>
                  <MenuItem value="in_progress">{t('In Progress')}</MenuItem>
                  <MenuItem value="waiting_customer">{t('Waiting Customer')}</MenuItem>
                  <MenuItem value="resolved">{t('Resolved')}</MenuItem>
                  <MenuItem value="closed">{t('Closed')}</MenuItem>
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
                <InputLabel>{t('Category')}</InputLabel>
                <Select
                  value={categoryFilter}
                  label={t('Category')}
                  onChange={(e: SelectChangeEvent) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('All Categories')}</MenuItem>
                  <MenuItem value="Technical Support">{t('Technical Support')}</MenuItem>
                  <MenuItem value="Quote Request">{t('Quote Request')}</MenuItem>
                  <MenuItem value="Water Damage">{t('Water Damage')}</MenuItem>
                  <MenuItem value="Software Support">{t('Software Support')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('Assigned To')}</InputLabel>
                <Select
                  value={assignedFilter}
                  label={t('Assigned To')}
                  onChange={(e: SelectChangeEvent) => setAssignedFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('All Staff')}</MenuItem>
                  <MenuItem value="Mike Johnson">{t('Mike Johnson')}</MenuItem>
                  <MenuItem value="Sarah Wilson">{t('Sarah Wilson')}</MenuItem>
                  <MenuItem value="Unassigned">{t('Unassigned')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setDialogType('create');
                  setOpenDialog(true);
                }}
              >
                {t('New')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>{t('Ticket')}</strong></TableCell>
                  <TableCell><strong>{t('Customer')}</strong></TableCell>
                  <TableCell><strong>{t('Subject')}</strong></TableCell>
                  <TableCell><strong>{t('Category')}</strong></TableCell>
                  <TableCell><strong>{t('Status')}</strong></TableCell>
                  <TableCell><strong>{t('Priority')}</strong></TableCell>
                  <TableCell><strong>{t('Assigned To')}</strong></TableCell>
                  <TableCell><strong>{t('Response Time')}</strong></TableCell>
                  <TableCell><strong>{t('Actions')}</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                          <SupportIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {ticket.ticketNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('ID')}: {ticket.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {ticket.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ticket.customerEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ticket.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.category}
                        color={getCategoryColor(ticket.category) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(ticket.status.replace('_', ' '))}
                        color={getStatusColor(ticket.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(ticket.priority)}
                        color={getPriorityColor(ticket.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {ticket.assignedTo || t('Unassigned')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {ticket.responseTime || t('N/A')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, ticket)}
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
          {t('Edit Ticket')}
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('Delete Ticket')}
        </MenuItem>
      </Menu>

      {/* Ticket Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'create' && t('Create New Ticket')}
          {dialogType === 'edit' && t('Edit Ticket')}
          {dialogType === 'view' && t('Ticket Details')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('Ticket dialog content will be implemented here')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="create ticket"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => {
          setDialogType('create');
          setOpenDialog(true);
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default TicketsPage;
