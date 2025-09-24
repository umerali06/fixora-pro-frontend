import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
  Tooltip,
  InputAdornment,
  Badge,
  Divider,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  CircularProgress,
  Collapse,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon,
  AccountCircle as AccountCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';

// Import responsive components
import ResponsiveGrid from '../../components/common/ResponsiveGrid';
import { useResponsiveData } from '../../hooks/useResponsiveData';
import { useResponsiveData as useResponsiveContext } from '../../providers/ResponsiveDataProvider';
import { useTranslation } from 'react-i18next';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  status: 'active' | 'inactive' | 'vip';
  lastContact: string;
  totalOrders: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const Contacts: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  const { isConnected } = useResponsiveContext();

  // Dynamic data management
  const [contactsData, contactsActions] = useResponsiveData({
    endpoint: '/customers',
    realTime: false,
    autoRefresh: false,
    refreshInterval: 30000,
    pageSize: 10
  });

  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    isMobile ? 'list' : 'grid'
  );
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    status: 'active' as 'active' | 'inactive' | 'vip',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'vip': return 'primary';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  // Handle contact actions
  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setOpenDialog(true);
  };

  // Form validation
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = t('validation.required');
    }
    
    if (!formData.email.trim()) {
      errors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('validation.invalidEmail');
    }
    
    if (!formData.phone.trim()) {
      errors.phone = t('validation.required');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      status: 'active',
      notes: ''
    });
    setFormErrors({});
    setOpenAddEditDialog(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address || '',
      company: contact.company || '',
      status: contact.status,
      notes: contact.notes || ''
    });
    setFormErrors({});
    setOpenAddEditDialog(true);
  };

  const handleSaveContact = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const contactData = {
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.phone,
        address: formData.address ? {
          street: formData.address,
          city: '',
          zipCode: '',
          country: ''
        } : null,
        company: formData.company,
        status: formData.status.toUpperCase(),
        notes: formData.notes
      };

      if (editingContact) {
        await contactsActions.updateItem(editingContact.id, contactData);
        setSnackbar({ 
          open: true, 
          message: t('contacts.updateSuccess'), 
          severity: 'success' 
        });
      } else {
        await contactsActions.createItem(contactData);
        setSnackbar({ 
          open: true, 
          message: t('contacts.createSuccess'), 
          severity: 'success' 
        });
      }
      
      setOpenAddEditDialog(false);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: editingContact ? t('contacts.updateError') : t('contacts.createError'), 
        severity: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async (contactId: string, contactName: string) => {
    if (window.confirm(t('contacts.confirmDelete', { name: contactName }))) {
      try {
        await contactsActions.deleteItem(contactId);
        setSnackbar({ 
          open: true, 
          message: t('contacts.deleteSuccess'), 
          severity: 'success' 
        });
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: t('contacts.deleteError'), 
          severity: 'error' 
        });
      }
    }
  };

  // Filter contacts based on search and filters
  const filteredContacts = contactsData.data.filter(contact => {
    const matchesSearch = !searchQuery || 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || contact.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Render contact card for grid view
  const renderContactCard = (contact: Contact) => (
    <Card
      key={contact.id}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        }
      }}
      onClick={() => handleViewContact(contact)}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              mr: 2,
              bgcolor: theme.palette.primary.main
            }}
          >
            {contact.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '14px', sm: '16px' },
                fontWeight: 600,
                color: '#24324A',
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {contact.name}
            </Typography>
            {contact.company && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '11px', sm: '12px' },
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {contact.company}
              </Typography>
            )}
            <Chip
              label={t(`contacts.status${contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}`)}
              size="small"
              color={getStatusColor(contact.status) as any}
              sx={{
                fontSize: { xs: '10px', sm: '11px' },
                height: { xs: 20, sm: 24 }
              }}
            />
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              // Show more options
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Contact Info */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EmailIcon sx={{ fontSize: '16px', mr: 1, color: 'text.secondary' }} />
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '11px', sm: '12px' },
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {contact.email}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PhoneIcon sx={{ fontSize: '16px', mr: 1, color: 'text.secondary' }} />
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '11px', sm: '12px' },
                color: 'text.secondary'
              }}
            >
              {contact.phone}
            </Typography>
          </Box>
          {contact.address && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ fontSize: '16px', mr: 1, color: 'text.secondary' }} />
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '11px', sm: '12px' },
                  color: 'text.secondary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {contact.address}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Stats */}
        <Box sx={{ mt: 'auto' }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '10px', sm: '11px' } }}
              >
                {t('contacts.orders')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '12px', sm: '14px' },
                  fontWeight: 600,
                  color: '#24324A'
                }}
              >
                {contact.totalOrders}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '10px', sm: '11px' } }}
              >
                {t('contacts.totalSpent')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '12px', sm: '14px' },
                  fontWeight: 600,
                  color: '#24324A'
                }}
              >
                {formatCurrency(contact.totalSpent)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );

  // Render contact row for list view
  const renderContactRow = (contact: Contact) => (
    <Box
      key={contact.id}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid #E8EEF5',
        cursor: 'pointer',
        '&:last-child': { borderBottom: 'none' }
      }}
      onClick={() => handleViewContact(contact)}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          mr: 2,
          bgcolor: theme.palette.primary.main
        }}
      >
        {contact.name.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#24324A' }}>
          {contact.name}
        </Typography>
        {contact.company && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
            {contact.company}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontSize: '12px' }}>{contact.email}</Typography>
        <Typography variant="body2" sx={{ fontSize: '12px' }}>{contact.phone}</Typography>
        <Chip
          label={t(`contacts.status${contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}`)}
          size="small"
          color={getStatusColor(contact.status) as any}
          sx={{ fontSize: '10px', height: 20 }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title={t('common.view')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleViewContact(contact);
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.edit')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEditContact(contact);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.delete')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteContact(contact.id, contact.name);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      backgroundColor: '#F4F7FB',
      minHeight: '100vh',
      maxWidth: '1240px',
      mx: 'auto',
      px: { xs: 2, sm: 3, md: 4 },
      py: { xs: 2, sm: 2.5, md: 3 }
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#24324A' }}>
          {t('navigation.contacts')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => contactsActions.refreshData()}
            disabled={contactsData.loading}
          >
            {t('common.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddContact}
            sx={{
              backgroundColor: '#2F80ED',
              '&:hover': { backgroundColor: '#1B5EAC' }
            }}
          >
            {t('contacts.addContact')}
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3, backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E8EEF5' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder={t('contacts.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowFilters(!showFilters)}
                size="small"
              >
                {t('common.filter')}
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title={t('contacts.gridView')}>
                  <IconButton
                    onClick={() => setViewMode('grid')}
                    color={viewMode === 'grid' ? 'primary' : 'default'}
                    size="small"
                  >
                    <ViewModuleIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('contacts.listView')}>
                  <IconButton
                    onClick={() => setViewMode('list')}
                    color={viewMode === 'list' ? 'primary' : 'default'}
                    size="small"
                  >
                    <ViewListIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary">
                {t('contacts.totalContacts', { count: filteredContacts.length })}
              </Typography>
            </Grid>
          </Grid>
          
          <Collapse in={showFilters}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('contacts.status')}</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label={t('contacts.status')}
                  >
                    <MenuItem value="">{t('common.all')}</MenuItem>
                    <MenuItem value="active">{t('contacts.statusActive')}</MenuItem>
                    <MenuItem value="inactive">{t('contacts.statusInactive')}</MenuItem>
                    <MenuItem value="vip">{t('contacts.statusVip')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('contacts.sortBy')}</InputLabel>
                  <Select
                    value={contactsData.sortBy}
                    onChange={(e) => contactsActions.setSortBy(e.target.value)}
                    label={t('contacts.sortBy')}
                  >
                    <MenuItem value="name">{t('contacts.name')}</MenuItem>
                    <MenuItem value="createdAt">{t('contacts.dateAdded')}</MenuItem>
                    <MenuItem value="totalSpent">{t('contacts.totalSpent')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                  }}
                  size="small"
                >
                  {t('common.clearFilters')}
                </Button>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E8EEF5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ color: '#2F80ED', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {filteredContacts.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('contacts.totalContacts')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E8EEF5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountCircleIcon sx={{ color: '#4CAF50', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {filteredContacts.filter(c => c.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('contacts.activeContacts')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E8EEF5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ color: '#FF9800', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {filteredContacts.filter(c => c.company).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('contacts.businessContacts')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E8EEF5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ color: '#9C27B0', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {filteredContacts.filter(c => c.status === 'vip').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('contacts.vipContacts')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Connection Status */}
      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Real-time connection lost. Data may not be up to date.
        </Alert>
      )}

      {/* Content */}
      <Card sx={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E8EEF5' }}>
        <CardContent>
          {contactsData.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 2 }}>
                {t('common.loading')}
              </Typography>
            </Box>
          ) : filteredContacts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="textSecondary">
                {searchQuery || statusFilter 
                  ? t('contacts.noContactsFound') 
                  : t('contacts.noContacts')
                }
              </Typography>
            </Box>
          ) : viewMode === 'list' ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('contacts.name')}</TableCell>
                    <TableCell>{t('contacts.email')}</TableCell>
                    <TableCell>{t('contacts.phone')}</TableCell>
                    <TableCell>{t('contacts.status')}</TableCell>
                    <TableCell>{t('contacts.orders')}</TableCell>
                    <TableCell>{t('contacts.totalSpent')}</TableCell>
                    <TableCell>{t('contacts.company')}</TableCell>
                    <TableCell>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: theme.palette.primary.main }}>
                            {contact.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {contact.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(`contacts.status${contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}`)}
                          color={getStatusColor(contact.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{contact.totalOrders}</TableCell>
                      <TableCell>{formatCurrency(contact.totalSpent)}</TableCell>
                      <TableCell>{contact.company || '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title={t('common.view')}>
                            <IconButton size="small" color="primary" onClick={() => handleViewContact(contact)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common.edit')}>
                            <IconButton size="small" color="primary" onClick={() => handleEditContact(contact)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common.delete')}>
                            <IconButton size="small" color="error" onClick={() => handleDeleteContact(contact.id, contact.name)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Grid container spacing={3}>
              {filteredContacts.map(renderContactCard)}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Contact Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {t('contacts.contactDetails')}
        </DialogTitle>
        <DialogContent>
          {selectedContact && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: theme.palette.primary.main }}>
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {selectedContact.name}
                    </Typography>
                    <Chip
                      label={t(`contacts.status${selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)}`)}
                      color={getStatusColor(selectedContact.status) as any}
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('contacts.email')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedContact.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('contacts.phone')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedContact.phone}
                </Typography>
              </Grid>
              {selectedContact.company && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('contacts.company')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedContact.company}
                  </Typography>
                </Grid>
              )}
              {selectedContact.address && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('contacts.address')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedContact.address}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('contacts.totalOrders')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedContact.totalOrders}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('contacts.totalSpent')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {formatCurrency(selectedContact.totalSpent)}
                </Typography>
              </Grid>
              {selectedContact.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('contacts.notes')}
                  </Typography>
                  <Typography variant="body2">
                    {selectedContact.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t('common.close')}
          </Button>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              if (selectedContact) handleEditContact(selectedContact);
            }}
            variant="contained"
          >
            {t('common.edit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Contact Dialog */}
      <Dialog
        open={openAddEditDialog}
        onClose={() => setOpenAddEditDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingContact ? t('contacts.editContact') : t('contacts.addContact')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('contacts.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
                placeholder={t('contacts.namePlaceholder')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('contacts.email')}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                error={!!formErrors.email}
                helperText={formErrors.email}
                placeholder={t('contacts.emailPlaceholder')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('contacts.phone')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                placeholder={t('contacts.phonePlaceholder')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('contacts.company')}
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder={t('contacts.companyPlaceholder')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('contacts.status')}</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'vip' })}
                  label={t('contacts.status')}
                >
                  <MenuItem value="active">{t('contacts.statusActive')}</MenuItem>
                  <MenuItem value="inactive">{t('contacts.statusInactive')}</MenuItem>
                  <MenuItem value="vip">{t('contacts.statusVip')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('contacts.address')}
                multiline
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={t('contacts.addressPlaceholder')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('contacts.notes')}
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('contacts.notesPlaceholder')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddEditDialog(false)} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSaveContact} 
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
          >
            {isSubmitting 
              ? t('common.saving') 
              : editingContact 
                ? t('common.update') 
                : t('common.create')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contacts;