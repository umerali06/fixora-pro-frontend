import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Tooltip,
  Snackbar,
  CircularProgress,
  Collapse,
  useTheme,
  useMediaQuery,
  Pagination,
  Stack,
  Badge,
  Fab
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  LocalOffer as LocalOfferIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
  ViewInAr as BarcodeIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  GridView as GridViewIcon,
  TableRows as TableViewIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { useResponsiveData } from '../../hooks/useResponsiveData';
import ResponsiveGrid from '../../components/common/ResponsiveGrid';

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  variant: string;
  barcode: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  location: string;
  supplier: string;
  lastRestocked: string;
  expiryDate?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  description: string;
  image?: string;
}

const Stock: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [openNewProductDialog, setOpenNewProductDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    variant: '',
    barcode: '',
    sku: '',
    costPrice: 0,
    sellingPrice: 0,
    quantity: 0,
    minQuantity: 0,
    maxQuantity: 0,
    location: '',
    supplier: '',
    description: '',
    status: 'in-stock'
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Dynamic data management
  const [inventoryData, inventoryActions] = useResponsiveData({
    endpoint: '/inventory',
    realTime: false, // Disabled temporarily
    autoRefresh: false, // Disabled temporarily
    refreshInterval: 30000,
    pageSize: 10
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'success';
      case 'low-stock': return 'warning';
      case 'out-of-stock': return 'error';
      case 'discontinued': return 'default';
      default: return 'default';
    }
  };

  const getStockLevel = (product: Product) => {
    const percentage = (product.quantity / product.maxQuantity) * 100;
    if (percentage >= 80) return 'High';
    if (percentage >= 50) return 'Medium';
    if (percentage >= 20) return 'Low';
    return 'Critical';
  };

  const getStockLevelColor = (product: Product) => {
    const level = getStockLevel(product);
    switch (level) {
      case 'High': return 'success';
      case 'Medium': return 'warning';
      case 'Low': return 'error';
      case 'Critical': return 'error';
      default: return 'default';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    inventoryActions.setSearchQuery(event.target.value);
  };

  const handleStatusFilter = (status: string) => {
    inventoryActions.setFilters({ ...inventoryData.filters, status });
  };

  const handleCategoryFilter = (category: string) => {
    inventoryActions.setFilters({ ...inventoryData.filters, category });
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      brand: '',
      model: '',
      variant: '',
      barcode: '',
      sku: '',
      costPrice: 0,
      sellingPrice: 0,
      quantity: 0,
      minQuantity: 0,
      maxQuantity: 0,
      location: '',
      supplier: '',
      description: '',
      status: 'in-stock'
    });
    setOpenNewProductDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand,
      model: product.model,
      variant: product.variant,
      barcode: product.barcode,
      sku: product.sku,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      quantity: product.quantity,
      minQuantity: product.minQuantity,
      maxQuantity: product.maxQuantity,
      location: product.location,
      supplier: product.supplier,
      description: product.description,
      status: product.status
    });
    setOpenNewProductDialog(true);
  };

  // Validation function
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = t('validation.required');
    }
    
    if (!formData.sku.trim()) {
      errors.sku = t('validation.required');
    }
    
    if (!formData.category) {
      errors.category = t('validation.required');
    }
    
    if (formData.costPrice < 0) {
      errors.costPrice = t('validation.positiveNumber');
    }
    
    if (formData.sellingPrice < 0) {
      errors.sellingPrice = t('validation.positiveNumber');
    }
    
    if (formData.quantity < 0) {
      errors.quantity = t('validation.positiveNumber');
    }
    
    if (formData.minQuantity < 0) {
      errors.minQuantity = t('validation.positiveNumber');
    }
    
    if (formData.maxQuantity < formData.minQuantity) {
      errors.maxQuantity = t('stock.maxQuantityError');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const productData = {
        ...formData,
        lastRestocked: new Date().toISOString()
      };

      if (editingProduct) {
        await inventoryActions.updateItem(editingProduct.id, productData);
        setSnackbar({ 
          open: true, 
          message: t('stock.updateSuccess'), 
          severity: 'success' 
        });
      } else {
        await inventoryActions.createItem(productData);
        setSnackbar({ 
          open: true, 
          message: t('stock.createSuccess'), 
          severity: 'success' 
        });
      }
      
      setOpenNewProductDialog(false);
      setFormErrors({});
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: editingProduct ? t('stock.updateError') : t('stock.createError'), 
        severity: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingProduct(null);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(t('stock.confirmDelete', { name }))) {
      try {
        await inventoryActions.deleteItem(id);
        setSnackbar({ 
          open: true, 
          message: t('stock.deleteSuccess'), 
          severity: 'success' 
        });
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: t('stock.deleteError'), 
          severity: 'error' 
        });
      }
    }
  };

  // Filter products based on search and filters
  const filteredProducts = inventoryData.data.filter((product: Product) => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || product.status === statusFilter;
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate statistics
  const stats = {
    total: filteredProducts.length,
    inStock: filteredProducts.filter(p => p.status === 'in-stock').length,
    lowStock: filteredProducts.filter(p => p.status === 'low-stock').length,
    outOfStock: filteredProducts.filter(p => p.status === 'out-of-stock').length,
    totalValue: filteredProducts.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0),
    totalCost: filteredProducts.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0)
  };

  const renderProductCard = (product: Product) => (
    <Card 
      key={product.id} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: '14px',
        border: '1px solid #E8EEF5',
        boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'rgba(19, 33, 68, 0.12) 0 12px 24px'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ 
            bgcolor: getStatusColor(product.status) === 'success' ? '#10B981' : 
                    getStatusColor(product.status) === 'warning' ? '#F59E0B' : 
                    getStatusColor(product.status) === 'error' ? '#EF4444' : '#6B7280',
            width: 56, 
            height: 56 
          }}>
            <InventoryIcon />
          </Avatar>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={t('common.view')}>
              <IconButton size="small" onClick={() => handleViewProduct(product)}>
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.edit')}>
              <IconButton size="small" onClick={() => handleEditProduct(product)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.delete')}>
              <IconButton size="small" color="error" onClick={() => handleDeleteProduct(product.id, product.name)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Typography variant="h6" component="h3" gutterBottom sx={{ 
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {product.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {product.brand} {product.model}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={t(`stock.${product.category}`)} 
            size="small" 
            icon={<CategoryIcon />}
            variant="outlined"
          />
          <Chip 
            label={t(`stock.${product.status.replace('-', '')}`)} 
            color={getStatusColor(product.status) as any}
            size="small"
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('stock.stockLevel')}
          </Typography>
          <Chip 
            label={t(`stock.level${getStockLevel(product)}`)}
            color={getStockLevelColor(product) as any}
            size="small"
          />
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={product.maxQuantity > 0 ? (product.quantity / product.maxQuantity) * 100 : 0}
          color={getStockLevelColor(product) as any}
          sx={{ mb: 1, height: 8, borderRadius: 4 }}
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.quantity} / {product.maxQuantity} {t('stock.units')}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t('stock.price')}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              ${product.sellingPrice.toFixed(2)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t('stock.sku')}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {product.sku}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderProductTable = () => (
    <Card sx={{ 
      backgroundColor: 'white', 
      borderRadius: '14px', 
      border: '1px solid #E8EEF5',
      boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px'
    }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('stock.product')}</TableCell>
              <TableCell>{t('stock.category')}</TableCell>
              <TableCell>{t('stock.sku')}</TableCell>
              <TableCell>{t('stock.stockLevel')}</TableCell>
              <TableCell>{t('stock.price')}</TableCell>
              <TableCell>{t('stock.status')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryData.loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {t('common.loading')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    {searchQuery || statusFilter || categoryFilter 
                      ? t('stock.noProductsFound') 
                      : t('stock.noProducts')
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 2,
                        bgcolor: getStatusColor(product.status) === 'success' ? '#10B981' : 
                                getStatusColor(product.status) === 'warning' ? '#F59E0B' : 
                                getStatusColor(product.status) === 'error' ? '#EF4444' : '#6B7280'
                      }}>
                        <InventoryIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.brand} {product.model}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={t(`stock.${product.category}`)} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {product.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={t(`stock.level${getStockLevel(product)}`)}
                        color={getStockLevelColor(product) as any}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        ({product.quantity}/{product.maxQuantity})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ${product.sellingPrice.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={t(`stock.${product.status.replace('-', '')}`)}
                      color={getStatusColor(product.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title={t('common.view')}>
                        <IconButton size="small" onClick={() => handleViewProduct(product)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.edit')}>
                        <IconButton size="small" onClick={() => handleEditProduct(product)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.delete')}>
                        <IconButton size="small" color="error" onClick={() => handleDeleteProduct(product.id, product.name)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 'bold', 
          color: '#24324A',
          fontSize: { xs: '1.5rem', sm: '2rem' }
        }}>
          {t('navigation.stock')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => inventoryActions.refreshData()}
            disabled={inventoryData.loading}
            size={isMobile ? 'small' : 'medium'}
          >
            {t('common.refresh')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setOpenImportDialog(true)}
            size={isMobile ? 'small' : 'medium'}
          >
            {t('stock.import')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
            sx={{
              backgroundColor: '#2F80ED',
              '&:hover': { backgroundColor: '#1B5EAC' }
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            {t('stock.addProduct')}
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '14px',
            border: '1px solid #E8EEF5',
            boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ backgroundColor: '#10B981', mr: 2 }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('stock.totalProducts')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '14px',
            border: '1px solid #E8EEF5',
            boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ backgroundColor: '#3B82F6', mr: 2 }}>
                  <StoreIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats.inStock}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('stock.inStock')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '14px',
            border: '1px solid #E8EEF5',
            boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ backgroundColor: '#F59E0B', mr: 2 }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F59E0B' }}>
                    {stats.lowStock}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('stock.lowStock')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '14px',
            border: '1px solid #E8EEF5',
            boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ backgroundColor: '#10B981', mr: 2 }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ${stats.totalValue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('stock.totalValue')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Search and Filters */}
      <Card sx={{ 
        mb: 3, 
        backgroundColor: 'white', 
        borderRadius: '14px', 
        border: '1px solid #E8EEF5',
        boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px'
      }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder={t('stock.searchPlaceholder')}
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
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                {t('stock.totalProducts')}: {filteredProducts.length} | 
                {t('stock.totalValue')}: ${stats.totalValue.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
          
          <Collapse in={showFilters}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('stock.status')}</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label={t('stock.status')}
                  >
                    <MenuItem value="">{t('common.all')}</MenuItem>
                    <MenuItem value="in-stock">{t('stock.inStock')}</MenuItem>
                    <MenuItem value="low-stock">{t('stock.lowStock')}</MenuItem>
                    <MenuItem value="out-of-stock">{t('stock.outOfStock')}</MenuItem>
                    <MenuItem value="discontinued">{t('stock.discontinued')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('stock.category')}</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label={t('stock.category')}
                  >
                    <MenuItem value="">{t('common.all')}</MenuItem>
                    <MenuItem value="displays">{t('stock.displays')}</MenuItem>
                    <MenuItem value="batteries">{t('stock.batteries')}</MenuItem>
                    <MenuItem value="cables">{t('stock.cables')}</MenuItem>
                    <MenuItem value="tools">{t('stock.tools')}</MenuItem>
                    <MenuItem value="parts">{t('stock.parts')}</MenuItem>
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
                    setCategoryFilter('');
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

      {/* Loading State */}
      {inventoryData.loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Loading inventory data...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {inventoryData.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {inventoryData.error}
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ 
        mb: 3, 
        backgroundColor: 'white', 
        borderRadius: '14px', 
        border: '1px solid #E8EEF5' 
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons="auto"
          >
            <Tab 
              label={t('stock.gridView')} 
              icon={<GridViewIcon />}
              iconPosition="start"
            />
            <Tab 
              label={t('stock.tableView')} 
              icon={<TableViewIcon />}
              iconPosition="start"
            />
            <Tab 
              label={
                <Badge badgeContent={stats.lowStock} color="warning">
                  {t('stock.lowStock')}
                </Badge>
              }
              icon={<WarningIcon />}
              iconPosition="start"
            />
            <Tab 
              label={
                <Badge badgeContent={stats.outOfStock} color="error">
                  {t('stock.outOfStock')}
                </Badge>
              }
              icon={<WarningIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
      </Card>

      {/* Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {inventoryData.loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card sx={{ height: 300 }}>
                  <CardContent>
                    <CircularProgress />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : filteredProducts.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ 
                backgroundColor: 'white', 
                borderRadius: '14px', 
                border: '1px solid #E8EEF5',
                textAlign: 'center',
                py: 8
              }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  {searchQuery || statusFilter || categoryFilter 
                    ? t('stock.noProductsFound') 
                    : t('stock.noProducts')
                  }
                </Typography>
                {!searchQuery && !statusFilter && !categoryFilter && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddProduct}
                    sx={{ mt: 2 }}
                  >
                    {t('stock.addFirstProduct')}
                  </Button>
                )}
              </Card>
            </Grid>
          ) : (
            filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                {renderProductCard(product)}
              </Grid>
            ))
          )}
        </Grid>
      )}

      {activeTab === 1 && renderProductTable()}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {filteredProducts.filter(p => p.status === 'low-stock').length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ 
                backgroundColor: 'white', 
                borderRadius: '14px', 
                border: '1px solid #E8EEF5',
                textAlign: 'center',
                py: 8
              }}>
                <Typography variant="h6" color="textSecondary">
                  {t('stock.noLowStockProducts')}
                </Typography>
              </Card>
            </Grid>
          ) : (
            filteredProducts.filter(p => p.status === 'low-stock').map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                {renderProductCard(product)}
              </Grid>
            ))
          )}
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          {filteredProducts.filter(p => p.status === 'out-of-stock').length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ 
                backgroundColor: 'white', 
                borderRadius: '14px', 
                border: '1px solid #E8EEF5',
                textAlign: 'center',
                py: 8
              }}>
                <Typography variant="h6" color="textSecondary">
                  {t('stock.noOutOfStockProducts')}
                </Typography>
              </Card>
            </Grid>
          ) : (
            filteredProducts.filter(p => p.status === 'out-of-stock').map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                {renderProductCard(product)}
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog 
        open={openNewProductDialog} 
        onClose={() => {
          setOpenNewProductDialog(false);
          setFormErrors({});
        }} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingProduct ? t('stock.editProduct') : t('stock.addProduct')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('stock.productName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
                placeholder={t('stock.productNamePlaceholder')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.category}>
                <InputLabel>{t('stock.category')}</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label={t('stock.category')}
                  required
                >
                  <MenuItem value="displays">{t('stock.displays')}</MenuItem>
                  <MenuItem value="batteries">{t('stock.batteries')}</MenuItem>
                  <MenuItem value="cables">{t('stock.cables')}</MenuItem>
                  <MenuItem value="tools">{t('stock.tools')}</MenuItem>
                  <MenuItem value="parts">{t('stock.parts')}</MenuItem>
                </Select>
                {formErrors.category && (
                  <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                    {formErrors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('stock.brand')}
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder={t('stock.brandPlaceholder')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('stock.model')}
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder={t('stock.modelPlaceholder')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('stock.sku')}
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
                error={!!formErrors.sku}
                helperText={formErrors.sku || t('stock.skuHelper')}
                placeholder={t('stock.skuPlaceholder')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('stock.barcode')}
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder={t('stock.barcodePlaceholder')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small">
                        <QrCodeIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('stock.costPrice')}
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                error={!!formErrors.costPrice}
                helperText={formErrors.costPrice}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start">$</InputAdornment> 
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('stock.sellingPrice')}
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                error={!!formErrors.sellingPrice}
                helperText={formErrors.sellingPrice}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start">$</InputAdornment> 
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={t('stock.currentQuantity')}
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                error={!!formErrors.quantity}
                helperText={formErrors.quantity}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={t('stock.minQuantity')}
                type="number"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 0 })}
                error={!!formErrors.minQuantity}
                helperText={formErrors.minQuantity || t('stock.minQuantityHelper')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={t('stock.maxQuantity')}
                type="number"
                value={formData.maxQuantity}
                onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) || 0 })}
                error={!!formErrors.maxQuantity}
                helperText={formErrors.maxQuantity || t('stock.maxQuantityHelper')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('stock.location')}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('stock.locationPlaceholder')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('stock.supplier')}
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder={t('stock.supplierPlaceholder')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('stock.description')}
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('stock.descriptionPlaceholder')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenNewProductDialog(false);
              setFormErrors({});
            }}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSaveProduct} 
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
          >
            {isSubmitting 
              ? t('common.saving') 
              : editingProduct 
                ? t('common.update') 
                : t('common.create')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleCloseViewDialog} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {t('stock.viewProduct')}
        </DialogTitle>
        <DialogContent>
          {viewingProduct && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  {viewingProduct.name}
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  {viewingProduct.description || t('stock.noDescription')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.category')}
                </Typography>
                <Chip 
                  label={t(`stock.${viewingProduct.category}`)} 
                  icon={<CategoryIcon />}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.status')}
                </Typography>
                <Chip 
                  label={t(`stock.${viewingProduct.status.replace('-', '')}`)}
                  color={getStatusColor(viewingProduct.status) as any}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.brand')}
                </Typography>
                <Typography variant="body2">
                  {viewingProduct.brand || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.model')}
                </Typography>
                <Typography variant="body2">
                  {viewingProduct.model || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.sku')}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {viewingProduct.sku}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.barcode')}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {viewingProduct.barcode || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.costPrice')}
                </Typography>
                <Typography variant="body2">
                  ${viewingProduct.costPrice.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.sellingPrice')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ${viewingProduct.sellingPrice.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.currentQuantity')}
                </Typography>
                <Typography variant="body2">
                  {viewingProduct.quantity} {t('stock.units')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.minQuantity')}
                </Typography>
                <Typography variant="body2">
                  {viewingProduct.minQuantity} {t('stock.units')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.maxQuantity')}
                </Typography>
                <Typography variant="body2">
                  {viewingProduct.maxQuantity} {t('stock.units')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.location')}
                </Typography>
                <Typography variant="body2">
                  {viewingProduct.location || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.supplier')}
                </Typography>
                <Typography variant="body2">
                  {viewingProduct.supplier || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('stock.stockLevel')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={viewingProduct.maxQuantity > 0 ? (viewingProduct.quantity / viewingProduct.maxQuantity) * 100 : 0}
                    color={getStockLevelColor(viewingProduct) as any}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  />
                  <Chip 
                    label={t(`stock.level${getStockLevel(viewingProduct)}`)}
                    color={getStockLevelColor(viewingProduct) as any}
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>
            {t('common.close')}
          </Button>
          <Button 
            onClick={() => {
              handleCloseViewDialog();
              if (viewingProduct) handleEditProduct(viewingProduct);
            }}
            variant="contained"
          >
            {t('common.edit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={openImportDialog} onClose={() => setOpenImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('stock.importProducts')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            {t('stock.importDescription')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            fullWidth
            sx={{ mb: 2 }}
          >
            {t('stock.downloadTemplate')}
          </Button>
          <TextField
            type="file"
            fullWidth
            inputProps={{ accept: '.xlsx,.xls,.csv' }}
            helperText={t('stock.supportedFormats')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImportDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained">
            {t('stock.import')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            backgroundColor: '#2F80ED',
            '&:hover': { backgroundColor: '#1B5EAC' }
          }}
          onClick={handleAddProduct}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default Stock; 