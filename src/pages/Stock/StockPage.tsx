import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
  Fab,
  Menu,
  SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  Refresh as RefreshIcon,
  Inventory2 as Inventory2Icon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { inventoryAPI } from '../../services/api';
import { PermissionGate } from '../../utils/permissions';
import toast from 'react-hot-toast';

interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
}

interface StockStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categoriesCount: number;
  averageItemValue: number;
}

interface CreateStockForm {
  sku: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
  supplier: string;
  location: string;
}

const StockPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  
  // State
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockStats, setStockStats] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [createForm, setCreateForm] = useState<CreateStockForm>({
    sku: '',
    name: '',
    category: '',
    description: '',
    quantity: 0,
    minQuantity: 5,
    maxQuantity: 100,
    unitPrice: 0,
    supplier: '',
    location: ''
  });
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchStockData();
    } else {
      console.log('⚠️ User not authenticated, skipping stock data fetch');
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Debug logging for edit form
  useEffect(() => {
    if (createDialog && selectedItem) {
      console.log('🔧 Edit dialog opened with selectedItem:', selectedItem);
      console.log('🔧 Current createForm state:', createForm);
      console.log('🔧 Form fields check:', {
        sku: createForm.sku,
        name: createForm.name,
        category: createForm.category,
        description: createForm.description,
        quantity: createForm.quantity,
        minQuantity: createForm.minQuantity,
        maxQuantity: createForm.maxQuantity,
        unitPrice: createForm.unitPrice,
        supplier: createForm.supplier,
        location: createForm.location
      });
    }
  }, [createDialog, selectedItem, createForm]);

  const fetchStockData = async () => {
    // Check authentication before making API calls
    if (!isAuthenticated || !token) {
      console.log('⚠️ Cannot fetch stock data: user not authenticated');
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Fetching stock data with token:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + '...'
      });
      
      // Use authenticated API service
      const [itemsData, statsData] = await Promise.all([
        inventoryAPI.getStockItems(),
        inventoryAPI.getStockStats()
      ]);

      console.log('📦 Stock items data:', itemsData);
      console.log('📊 Stock stats data:', statsData);
      
      if (itemsData && itemsData.length > 0) {
        console.log('📦 First item details:', itemsData[0]);
        console.log('📦 First item fields:', {
          id: itemsData[0].id,
          sku: itemsData[0].sku,
          name: itemsData[0].name,
          category: itemsData[0].category,
          description: itemsData[0].description,
          quantity: itemsData[0].quantity,
          minQuantity: itemsData[0].minQuantity,
          maxQuantity: itemsData[0].maxQuantity,
          unitPrice: itemsData[0].unitPrice,
          supplier: itemsData[0].supplier,
          location: itemsData[0].location
        });
      }

      setStockItems(itemsData || []);
      setStockStats(statsData || null);
    } catch (err: any) {
      console.error('Error fetching stock data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load stock data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getStockStatus = (item: { quantity: number; minQuantity: number }) => {
    if (item.quantity === 0) return 'out_of_stock';
    if (item.quantity <= item.minQuantity) return 'low_stock';
    return 'in_stock';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'success';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <InventoryIcon />;
      case 'low_stock': return <WarningIcon />;
      case 'out_of_stock': return <ErrorIcon />;
      default: return <InventoryIcon />;
    }
  };

  // Handle item selection
  const handleItemSelect = (item: StockItem, action: 'view' | 'edit') => {
    console.log('🔧 handleItemSelect called with:', { item, action });
    setSelectedItem(item);
    if (action === 'view') {
      setViewDialog(true);
    } else {
      // For edit action, set the selectedItem and form data
      setSelectedItem(item);
      const formData = {
        sku: item.sku,
        name: item.name,
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
        maxQuantity: item.maxQuantity,
        unitPrice: item.unitPrice,
        supplier: item.supplier,
        location: item.location
      };
      console.log('🔧 Setting form data for edit:', formData);
      setCreateForm(formData);
      setCreateDialog(true);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: StockItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleAction = (action: string) => {
    if (!selectedItem) return;
    
    switch (action) {
      case 'view':
        setViewDialog(true);
        setAnchorEl(null); // Close menu but keep selectedItem
        break;
      case 'edit':
        handleItemSelect(selectedItem, 'edit');
        setAnchorEl(null); // Close menu but keep selectedItem for edit
        break;
      case 'delete':
        handleDeleteItem(selectedItem);
        handleMenuClose();
        break;
    }
  };

  const handleSaveStockItem = async () => {
    try {
      setLoading(true);
      setFieldErrors({});
      
      // Validate required fields
      const errors: {[key: string]: string} = {};
      
      if (!createForm.sku.trim()) {
        errors.sku = 'SKU is required';
      }
      if (!createForm.name.trim()) {
        errors.name = 'Item name is required';
      }
      if (!createForm.category.trim()) {
        errors.category = 'Category is required';
      }
      if (createForm.quantity < 0) {
        errors.quantity = 'Quantity cannot be negative';
      }
      if (createForm.minQuantity < 0) {
        errors.minQuantity = 'Minimum quantity cannot be negative';
      }
      if (createForm.maxQuantity <= 0) {
        errors.maxQuantity = 'Maximum quantity must be greater than 0';
      }
      if (createForm.unitPrice < 0) {
        errors.unitPrice = 'Unit price cannot be negative';
      }
      if (createForm.minQuantity > createForm.maxQuantity) {
        errors.minQuantity = 'Minimum quantity cannot be greater than maximum quantity';
      }
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        toast.error('Please fix the validation errors');
        return;
      }
      
      const itemData = {
        sku: createForm.sku.trim(),
        name: createForm.name.trim(),
        category: createForm.category,
        description: createForm.description.trim() || undefined,
        quantity: createForm.quantity,
        minQuantity: createForm.minQuantity,
        maxQuantity: createForm.maxQuantity,
        unitPrice: createForm.unitPrice,
        supplier: createForm.supplier.trim() || undefined,
        location: createForm.location.trim() || undefined
      };

      console.log('💾 Saving stock item:', itemData);
      console.log('🔧 selectedItem state:', selectedItem);
      console.log('🔧 Will call:', selectedItem ? 'UPDATE' : 'CREATE');
      
      let result: StockItem;
      if (selectedItem) {
        // Update existing item
        console.log('🔧 Calling UPDATE API with ID:', selectedItem.id);
        result = await inventoryAPI.update(selectedItem.id, itemData);
        setStockItems(prev => prev.map(item => 
          item.id === selectedItem.id ? result : item
        ));
        toast.success('Stock item updated successfully!');
      } else {
        // Add new item
        result = await inventoryAPI.create(itemData);
        setStockItems(prev => [...prev, result]);
        toast.success('Stock item created successfully!');
      }
      
      console.log('🔧 Closing dialog - selectedItem before reset:', selectedItem);
      setCreateDialog(false);
      setSelectedItem(null);
      resetCreateForm();
      
      // Refresh stats
      await fetchStockData();
      
    } catch (err: any) {
      console.error('Error saving stock item:', err);
      
      // Handle field-specific validation errors
      if (err?.response?.data?.details && Array.isArray(err.response.data.details)) {
        const fieldErrors: {[key: string]: string} = {};
        err.response.data.details.forEach((detail: any) => {
          fieldErrors[detail.field] = detail.message;
        });
        setFieldErrors(fieldErrors);
        
        // Show the first field error as a toast
        const firstError = err.response.data.details[0];
        toast.error(`${firstError.field}: ${firstError.message}`);
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to save stock item. Please try again.';
        const errorCode = err.response?.data?.error;
        
        // Handle specific error codes
        if (errorCode === 'DUPLICATE_ITEM_NAME') {
          setFieldErrors({ name: 'An item with this name already exists' });
          toast.error('An item with this name already exists in your organization');
        } else if (errorCode === 'DUPLICATE_ITEM_SKU') {
          setFieldErrors({ sku: 'An item with this SKU already exists' });
          toast.error('An item with this SKU already exists in your organization');
        } else {
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (item: StockItem) => {
    // Use a more user-friendly confirmation
    const confirmed = window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      
      console.log('🗑️ Deleting stock item:', item.id);
      await inventoryAPI.delete(item.id);
      
      setStockItems(prev => prev.filter(stockItem => stockItem.id !== item.id));
      toast.success('Stock item deleted successfully!');
      
      // Refresh stats
      await fetchStockData();
      
    } catch (err: any) {
      console.error('Error deleting stock item:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete stock item. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      sku: '',
      name: '',
      category: '',
      description: '',
      quantity: 0,
      minQuantity: 5,
      maxQuantity: 100,
      unitPrice: 0,
      supplier: '',
      location: ''
    });
    setFieldErrors({});
  };

  // Filtered stock items
  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || getStockStatus(item) === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
      
      <PermissionGate permission="inventory:read">
        <Box sx={{ p: 3, backgroundColor: '#EEF3FB', minHeight: 'calc(100vh - 64px)' }}>
      {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Inventory2Icon sx={{ color: '#3BB2FF', fontSize: 28 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1A202C' }}>
          {t('Stock Management')}
        </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchStockData}
            sx={{ ml: 'auto' }}
          >
            {t('Refresh')}
          </Button>
      </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        {stockStats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white',
                height: '100%'
              }}>
            <CardContent>
                  <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                    {t('Total Items')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stockStats?.totalItems || 0}
                  </Typography>
            </CardContent>
          </Card>
        </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                color: 'white',
                height: '100%'
              }}>
            <CardContent>
                  <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                    {t('Total Value')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ${stockStats.totalValue.toFixed(2)}
                  </Typography>
            </CardContent>
          </Card>
        </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                color: 'white',
                height: '100%'
              }}>
            <CardContent>
                  <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                    {t('Low Stock')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stockStats.lowStockItems}
                  </Typography>
            </CardContent>
          </Card>
        </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
                color: 'white',
                height: '100%'
              }}>
            <CardContent>
                  <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                    {t('Out of Stock')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stockStats.outOfStockItems}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 
                color: '#1A202C',
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                    {t('Categories')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stockStats.categoriesCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 
                color: '#1A202C',
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                    {t('Avg. Value')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ${stockStats.averageItemValue.toFixed(2)}
                  </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
        )}

        {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder={t('Search stock items...')}
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
                <InputLabel>{t('Category')}</InputLabel>
                <Select
                  value={categoryFilter}
                  label={t('Category')}
                  onChange={(e: SelectChangeEvent) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('All Categories')}</MenuItem>
                  <MenuItem value="Screens">{t('Screens')}</MenuItem>
                  <MenuItem value="Batteries">{t('Batteries')}</MenuItem>
                  <MenuItem value="Charging">{t('Charging')}</MenuItem>
                  <MenuItem value="Tools">{t('Tools')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('Stock Status')}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t('Stock Status')}
                  onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('All Statuses')}</MenuItem>
                  <MenuItem value="in_stock">{t('In Stock')}</MenuItem>
                  <MenuItem value="low_stock">{t('Low Stock')}</MenuItem>
                  <MenuItem value="out_of_stock">{t('Out of Stock')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <PermissionGate permission="inventory:write">
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                      setSelectedItem(null);
                      resetCreateForm();
                      setCreateDialog(true);
                  }}
                >
                  {t('Add Item')}
                </Button>
              </PermissionGate>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

        {/* Stock Items Table */}
      <Card>
        <CardContent>
            <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                    <TableCell>{t('Item')}</TableCell>
                    <TableCell>{t('SKU')}</TableCell>
                    <TableCell>{t('Category')}</TableCell>
                    <TableCell>{t('Quantity')}</TableCell>
                    <TableCell>{t('Unit Price')}</TableCell>
                    <TableCell>{t('Status')}</TableCell>
                    <TableCell>{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStockItems.map((item) => (
                    <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: '#3BB2FF' }}>
                          <InventoryIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {item.sku}
                        </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.category}
                        size="small"
                          sx={{ bgcolor: '#E3F2FD', color: '#1976D2' }}
                      />
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2">
                          {item.quantity} / {item.maxQuantity}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Min: {item.minQuantity}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${item.unitPrice.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                          icon={getStatusIcon(getStockStatus(item))}
                          label={t(getStockStatus(item))}
                        color={getStatusColor(getStockStatus(item)) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <PermissionGate permission="inventory:read">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, item)}
                        >
                          <MoreIcon />
                        </IconButton>
                      </PermissionGate>
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
        <PermissionGate permission="inventory:read">
          <MenuItem onClick={() => handleAction('view')}>
            <ViewIcon sx={{ mr: 1 }} />
            {t('View Details')}
          </MenuItem>
        </PermissionGate>
        <PermissionGate permission="inventory:write">
          <MenuItem onClick={() => handleAction('edit')}>
            <EditIcon sx={{ mr: 1 }} />
            {t('Edit Item')}
          </MenuItem>
        </PermissionGate>
        <PermissionGate permission="inventory:delete">
          <MenuItem onClick={() => handleAction('delete')}>
            <DeleteIcon sx={{ mr: 1 }} />
            {t('Delete Item')}
          </MenuItem>
        </PermissionGate>
      </Menu>

      {/* Stock Item Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => {
          setCreateDialog(false);
          setSelectedItem(null);
          resetCreateForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
            {selectedItem ? t('Edit Stock Item') : t('Add New Stock Item')}
        </DialogTitle>
        <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('SKU')}
                    value={createForm.sku}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, sku: e.target.value });
                      if (fieldErrors.sku) {
                        setFieldErrors(prev => ({ ...prev, sku: '' }));
                      }
                    }}
                    required
                    placeholder="e.g., IP12-SCR-001"
                    error={!!fieldErrors.sku}
                    helperText={fieldErrors.sku}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!fieldErrors.category}>
                    <InputLabel>{t('Category')}</InputLabel>
                    <Select
                      value={createForm.category}
                      label={t('Category')}
                      onChange={(e) => {
                        setCreateForm({ ...createForm, category: e.target.value });
                        if (fieldErrors.category) {
                          setFieldErrors(prev => ({ ...prev, category: '' }));
                        }
                      }}
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value="Screens">{t('Screens')}</MenuItem>
                      <MenuItem value="Batteries">{t('Batteries')}</MenuItem>
                      <MenuItem value="Charging">{t('Charging')}</MenuItem>
                      <MenuItem value="Tools">{t('Tools')}</MenuItem>
                      <MenuItem value="Cases">{t('Cases')}</MenuItem>
                      <MenuItem value="Cables">{t('Cables')}</MenuItem>
                      <MenuItem value="Other">{t('Other')}</MenuItem>
                    </Select>
                    {fieldErrors.category && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {fieldErrors.category}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('Item Name')}
                    value={createForm.name}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, name: e.target.value });
                      if (fieldErrors.name) {
                        setFieldErrors(prev => ({ ...prev, name: '' }));
                      }
                    }}
                    required
                    placeholder="e.g., iPhone 12 Screen Replacement"
                    error={!!fieldErrors.name}
                    helperText={fieldErrors.name}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('Description')}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    multiline
                    rows={3}
                    placeholder="Detailed description of the item..."
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('Current Quantity')}
                    type="number"
                    value={createForm.quantity}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, quantity: parseInt(e.target.value) || 0 });
                      if (fieldErrors.quantity) {
                        setFieldErrors(prev => ({ ...prev, quantity: '' }));
                      }
                    }}
                    required
                    inputProps={{ min: 0 }}
                    error={!!fieldErrors.quantity}
                    helperText={fieldErrors.quantity}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('Minimum Quantity')}
                    type="number"
                    value={createForm.minQuantity}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, minQuantity: parseInt(e.target.value) || 0 });
                      if (fieldErrors.minQuantity) {
                        setFieldErrors(prev => ({ ...prev, minQuantity: '' }));
                      }
                    }}
                    required
                    inputProps={{ min: 0 }}
                    error={!!fieldErrors.minQuantity}
                    helperText={fieldErrors.minQuantity}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('Maximum Quantity')}
                    type="number"
                    value={createForm.maxQuantity}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, maxQuantity: parseInt(e.target.value) || 0 });
                      if (fieldErrors.maxQuantity) {
                        setFieldErrors(prev => ({ ...prev, maxQuantity: '' }));
                      }
                    }}
                    required
                    inputProps={{ min: 1 }}
                    error={!!fieldErrors.maxQuantity}
                    helperText={fieldErrors.maxQuantity}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('Unit Price')}
                    type="number"
                    value={createForm.unitPrice}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, unitPrice: parseFloat(e.target.value) || 0 });
                      if (fieldErrors.unitPrice) {
                        setFieldErrors(prev => ({ ...prev, unitPrice: '' }));
                      }
                    }}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                    error={!!fieldErrors.unitPrice}
                    helperText={fieldErrors.unitPrice}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('Supplier')}
                    value={createForm.supplier}
                    onChange={(e) => setCreateForm({ ...createForm, supplier: e.target.value })}
                    placeholder="e.g., TechParts Inc."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('Storage Location')}
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    placeholder="e.g., Warehouse A - Shelf 1"
                  />
                </Grid>
              </Grid>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => {
              setCreateDialog(false);
              setSelectedItem(null);
              resetCreateForm();
            }}>
              {t('Cancel')}
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveStockItem}
              disabled={!createForm.sku || !createForm.name || !createForm.category}
            >
              {selectedItem ? t('Update Item') : t('Add Item')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
              <Dialog
        open={viewDialog}
        onClose={() => {
          setViewDialog(false);
          setSelectedItem(null);
        }}
        maxWidth="md"
        fullWidth
      >
          <DialogTitle sx={{ pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#3BB2FF' }}>
                <InventoryIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedItem?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('Stock Item Details')}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Box>
                <Grid container spacing={3}>
                  {/* Basic Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1A202C', borderBottom: '1px solid #E2E8F0', pb: 1 }}>
                      {t('Basic Information')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('SKU')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {selectedItem.sku}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('Category')}
                      </Typography>
                      <Chip
                        label={selectedItem.category}
                        size="small"
                        sx={{ bgcolor: '#E3F2FD', color: '#1976D2', mt: 0.5 }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('Description')}
                      </Typography>
                      <Typography variant="body1">
                        {selectedItem.description || t('No description available')}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Stock Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1A202C', borderBottom: '1px solid #E2E8F0', pb: 1 }}>
                      {t('Stock Information')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#F7FAFC' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('Current Quantity')}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3BB2FF' }}>
                        {selectedItem.quantity}
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#FFF5F5' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('Minimum Quantity')}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#E53E3E' }}>
                        {selectedItem.minQuantity}
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#F0FFF4' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('Maximum Quantity')}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#38A169' }}>
                        {selectedItem.maxQuantity}
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Financial Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1A202C', borderBottom: '1px solid #E2E8F0', pb: 1 }}>
                      {t('Financial Information')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('Unit Price')}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2D3748' }}>
                        ${selectedItem.unitPrice.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('Total Value')}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2D3748' }}>
                        ${(selectedItem.quantity * selectedItem.unitPrice).toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Supplier & Location */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1A202C', borderBottom: '1px solid #E2E8F0', pb: 1 }}>
                      {t('Supplier & Location')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('Supplier')}
                      </Typography>
                      <Typography variant="body1">
                        {selectedItem.supplier || t('Not specified')}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('Storage Location')}
                      </Typography>
                      <Typography variant="body1">
                        {selectedItem.location || t('Not specified')}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Status Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1A202C', borderBottom: '1px solid #E2E8F0', pb: 1 }}>
                      {t('Status Information')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('Current Status')}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          icon={getStatusIcon(getStockStatus(selectedItem))}
                          label={t(getStockStatus(selectedItem))}
                          color={getStatusColor(getStockStatus(selectedItem)) as any}
                          size="medium"
                        />
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('Last Updated')}
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedItem.lastUpdated).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setViewDialog(false);
              setSelectedItem(null);
            }}>
              {t('Close')}
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={() => {
                setViewDialog(false);
                if (selectedItem) {
                  handleItemSelect(selectedItem, 'edit');
                }
              }}
            >
              {t('Edit Item')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add stock item"
        sx={{
          position: 'fixed',
            bottom: 24,
            right: 24,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => {
            setSelectedItem(null);
            resetCreateForm();
            setCreateDialog(true);
        }}
      >
        <AddIcon />
      </Fab>
        </Box>
      </PermissionGate>
    </Box>
  );
};

export default StockPage;
