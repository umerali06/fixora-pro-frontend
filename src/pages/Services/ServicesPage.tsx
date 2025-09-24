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
  CircularProgress,
  Alert,
  Fab,
  Switch,
  FormControlLabel,
  FormHelperText,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Build as BuildIcon,
  Category as CategoryIcon,
  AttachMoney as PriceIcon,
  Schedule as TimeIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  TrendingUp as PopularIcon,
  Star as FeaturedIcon,
  Refresh as RefreshIcon,
  MiscellaneousServices as ServicesIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { inventoryAPI, api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  longDescription?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    displayName?: string;
  };
  subcategory?: string;
  tags?: string;
  serviceType: string;
  complexity: string;
  basePrice: number;
  hourlyRate?: number;
  minimumPrice?: number;
  estimatedDuration?: number;
  estimatedLaborHours?: number;
  prerequisites?: string;
  tools?: string;
  parts?: string;
  isActive: boolean;
  isFeatured?: boolean;
  popularity?: number;
  requirements?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceStats {
  totalServices: number;
  activeServices: number;
  featuredServices: number;
  totalRevenue: number;
  averagePrice: number;
  popularCategories: string[];
}

interface CreateServiceForm {
  name: string;
  displayName?: string;
  description?: string;
  longDescription?: string;
  categoryId: string;
  subcategory?: string;
  tags?: string;
  serviceType: string;
  complexity: string;
  basePrice: number;
  hourlyRate?: number;
  minimumPrice?: number;
  estimatedDuration?: number;
  estimatedLaborHours?: number;
  prerequisites?: string;
  tools?: string;
  parts?: string;
  isActive: boolean;
  isFeatured?: boolean;
  notes?: string;
}

const ServicesPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  
  // State
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Debug categories state
  useEffect(() => {
    console.log('📂 Categories state updated:', categories);
    console.log('📂 Categories length:', categories.length);
  }, [categories]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [createForm, setCreateForm] = useState<CreateServiceForm>({
    name: '',
    displayName: '',
    description: '',
    longDescription: '',
    categoryId: '',
    subcategory: '',
    tags: '',
    serviceType: 'REPAIR',
    complexity: 'MEDIUM',
    basePrice: 0,
    hourlyRate: 0,
    minimumPrice: 0,
    estimatedDuration: 0,
    estimatedLaborHours: 0,
    prerequisites: '',
    tools: '',
    parts: '',
    isActive: true,
    isFeatured: false,
    notes: ''
  });

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchServicesData();
      fetchCategories();
    } else {
      console.log('⚠️ User not authenticated, skipping services data fetch');
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const fetchCategories = async () => {
    try {
      console.log('🔍 Fetching categories from /v1/inventory/categories...');
      const response = await api.get('/v1/inventory/categories');
      console.log('📂 Categories API response:', response);
      console.log('📂 Categories API response.data:', response.data);
      
      // Handle response structure - check if data is wrapped or direct
      const categories = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      console.log('📂 Processed categories:', categories);
      console.log('📂 Categories length:', categories.length);
      
      setCategories(categories);
    } catch (err: any) {
      console.error('❌ Error fetching categories:', err);
      console.error('❌ Error details:', err.response?.data);
      
      // Fallback to default categories if API fails
      console.log('🔄 Using fallback categories...');
      const fallbackCategories = [
        { id: 'screen-repair', name: 'Screen Repair', displayName: 'Screen Repair' },
        { id: 'battery-replacement', name: 'Battery Replacement', displayName: 'Battery Replacement' },
        { id: 'software-issues', name: 'Software Issues', displayName: 'Software Issues' },
        { id: 'hardware-repair', name: 'Hardware Repair', displayName: 'Hardware Repair' },
        { id: 'data-recovery', name: 'Data Recovery', displayName: 'Data Recovery' }
      ];
      setCategories(fallbackCategories);
    }
  };

  const fetchServicesData = async () => {
    // Check authentication before making API calls
    if (!isAuthenticated || !token) {
      console.log('⚠️ Cannot fetch services data: user not authenticated');
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Fetching services data with token:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + '...'
      });
      
      // Use authenticated API service
      console.log('🔍 Making API calls to services endpoints...');
      
      const [servicesData, statsData] = await Promise.all([
        inventoryAPI.getServices(),
        inventoryAPI.getServiceStats()
      ]);

      console.log('📊 Services API response:', servicesData);
      console.log('📈 Stats API response:', statsData);

      // Handle response structure - check if data is wrapped or direct
      const services = Array.isArray(servicesData) ? servicesData : (servicesData?.data || []);
      const stats = statsData?.data || statsData || null;

      console.log('📊 Processed services:', services);
      console.log('📈 Processed stats:', stats);

      setServices(services);
      setStats(stats);
    } catch (err) {
      console.error('Error fetching services data:', err);
      setError('Failed to load services data');
      
      // Fallback to mock data for development
    const mockServices: Service[] = [
      {
        id: 'SRV-001',
        name: 'iPhone Screen Replacement',
        displayName: 'iPhone Screen Replacement',
        description: 'Professional screen replacement service for all iPhone models',
        longDescription: 'Complete screen replacement service including LCD, digitizer, and frame assembly for all iPhone models from iPhone 6 to latest models.',
        categoryId: 'cat-screen-repair',
        category: {
          id: 'cat-screen-repair',
          name: 'Screen Repair',
          displayName: 'Screen Repair'
        },
        subcategory: 'iPhone',
        tags: 'screen,iphone,repair,lcd,digitizer',
        serviceType: 'REPAIR',
        complexity: 'MEDIUM',
        basePrice: 89.99,
        hourlyRate: 25.00,
        minimumPrice: 79.99,
        estimatedDuration: 120,
        estimatedLaborHours: 1.5,
        prerequisites: 'Original device, Backup data, Remove passcode',
        tools: 'Screen removal tools, Heat gun, Precision screwdrivers',
        parts: 'Original or high-quality replacement screen assembly',
        isActive: true,
        isFeatured: true,
        popularity: 95,
        requirements: ['Original device', 'Backup data', 'Remove passcode'],
        notes: 'Most popular service, high customer satisfaction',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'SRV-002',
        name: 'Battery Replacement',
        displayName: 'Battery Replacement',
        description: 'Replace old or faulty batteries with high-quality replacements',
        longDescription: 'Professional battery replacement service for smartphones and tablets using OEM or high-quality compatible batteries.',
        categoryId: 'cat-battery-service',
        category: {
          id: 'cat-battery-service',
          name: 'Battery Service',
          displayName: 'Battery Service'
        },
        subcategory: 'Battery',
        tags: 'battery,replacement,power,charging',
        serviceType: 'REPAIR',
        complexity: 'LOW',
        basePrice: 49.99,
        hourlyRate: 20.00,
        minimumPrice: 39.99,
        estimatedDuration: 45,
        estimatedLaborHours: 0.75,
        prerequisites: 'Original device, Backup data',
        tools: 'Battery removal tools, Heat gun, Precision tools',
        parts: 'High-quality replacement battery',
        isActive: true,
        isFeatured: false,
        popularity: 88,
        requirements: ['Original device', 'Backup data'],
        notes: 'Fast service, improves device performance significantly',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
        }
      ];
      
      const mockStats: ServiceStats = {
        totalServices: mockServices.length,
        activeServices: mockServices.filter(s => s.isActive).length,
        featuredServices: mockServices.filter(s => s.isFeatured).length,
        totalRevenue: mockServices.reduce((sum, s) => sum + s.basePrice, 0),
        averagePrice: mockServices.reduce((sum, s) => sum + s.basePrice, 0) / mockServices.length,
        popularCategories: ['Screen Repair', 'Battery Service']
      };
    
    setServices(mockServices);
      setStats(mockStats);
    } finally {
    setLoading(false);
    }
  };

  // Helper functions
  const handleItemSelect = (service: Service, action: 'view' | 'edit') => {
    console.log('🔍 handleItemSelect called with:', { service: service.name, action });
    setSelectedService(service);
    if (action === 'view') {
      setViewDialog(true);
    } else {
      console.log('🔍 Populating form for editing service:', service.name);
      setCreateForm({
        name: service.name,
        displayName: service.displayName || '',
        description: service.description || '',
        longDescription: service.longDescription || '',
        categoryId: service.categoryId,
        subcategory: service.subcategory || '',
        tags: service.tags || '',
        serviceType: service.serviceType,
        complexity: service.complexity,
        basePrice: service.basePrice,
        hourlyRate: service.hourlyRate || 0,
        minimumPrice: service.minimumPrice || 0,
        estimatedDuration: service.estimatedDuration || 0,
        estimatedLaborHours: service.estimatedLaborHours || 0,
        prerequisites: service.prerequisites || '',
        tools: service.tools || '',
        parts: service.parts || '',
        isActive: service.isActive,
        isFeatured: service.isFeatured || false,
        notes: service.notes || ''
      });
      setCreateDialog(true);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, service: Service) => {
    setAnchorEl(event.currentTarget);
    setSelectedService(service);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedService(null);
  };

  const handleAction = (action: string) => {
    if (!selectedService) return;
    
    switch (action) {
      case 'view':
        setViewDialog(true);
        setAnchorEl(null); // Close menu but keep selectedService
        break;
      case 'edit':
        handleItemSelect(selectedService, 'edit');
        setAnchorEl(null); // Close menu but keep selectedService for editing
        break;
      case 'delete':
        handleDeleteService(selectedService);
        handleMenuClose();
        break;
    }
  };

  const handleSaveService = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Saving service - selectedService:', selectedService);
      console.log('🔍 Is edit mode:', !!selectedService);
      
      const serviceData = {
        name: createForm.name,
        displayName: createForm.displayName,
        description: createForm.description,
        longDescription: createForm.longDescription,
        categoryId: createForm.categoryId,
        subcategory: createForm.subcategory,
        tags: createForm.tags,
        serviceType: createForm.serviceType,
        complexity: createForm.complexity,
        basePrice: createForm.basePrice,
        hourlyRate: createForm.hourlyRate,
        minimumPrice: createForm.minimumPrice,
        estimatedDuration: createForm.estimatedDuration,
        estimatedLaborHours: createForm.estimatedLaborHours,
        prerequisites: createForm.prerequisites,
        tools: createForm.tools,
        parts: createForm.parts,
        isActive: createForm.isActive,
        isFeatured: createForm.isFeatured,
        notes: createForm.notes
      };
      
      if (selectedService) {
        // Update existing service
              const result: any = await api.put(`/v1/inventory/services/${selectedService.id}`, serviceData);
              const updatedService = result.data?.data || result.data;
        setServices(prev => prev.map(service => 
                service.id === selectedService.id ? updatedService : service
        ));
              toast.success('Service updated successfully!');
      } else {
              // Create new service
              const result: any = await api.post('/v1/inventory/services', serviceData);
              const newService = result.data?.data || result.data;
              setServices(prev => [...prev, newService]);
              toast.success('Service created successfully!');
      }
      
      setCreateDialog(false);
      setSelectedService(null);
      resetCreateForm();
      
      // Refresh stats
      fetchServicesData();
      
    } catch (err: any) {
      console.error('Error saving service:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save service. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (!window.confirm(t('Are you sure you want to delete this service?'))) {
      return;
    }

    try {
      setLoading(true);
      
      await api.delete(`/v1/inventory/services/${service.id}`);

      setServices(prev => prev.filter(s => s.id !== service.id));
      toast.success('Service deleted successfully!');
      
      // Refresh stats
      fetchServicesData();
      
    } catch (err: any) {
      console.error('Error deleting service:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete service. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      displayName: '',
      description: '',
      longDescription: '',
      categoryId: '',
      subcategory: '',
      tags: '',
      serviceType: 'REPAIR',
      complexity: 'MEDIUM',
      basePrice: 0,
      hourlyRate: 0,
      minimumPrice: 0,
      estimatedDuration: 0,
      estimatedLaborHours: 0,
      prerequisites: '',
      tools: '',
      parts: '',
      isActive: true,
      isFeatured: false,
      notes: ''
    });
  };

  const toggleServiceStatus = (serviceId: string) => {
    setServices(services.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive }
        : service
    ));
  };

  const toggleFeaturedStatus = (serviceId: string) => {
    setServices(services.map(service => 
      service.id === serviceId 
        ? { ...service, isFeatured: !service.isFeatured }
        : service
    ));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Screen Repair':
        return 'primary';
      case 'Battery Service':
        return 'secondary';
      case 'Hardware Repair':
        return 'success';
      case 'Water Damage':
        return 'warning';
      case 'Software Service':
        return 'info';
      case 'Camera Repair':
        return 'info';
      case 'Speaker/Audio':
        return 'secondary';
      case 'Charging Port':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 90) return 'success';
    if (popularity >= 70) return 'primary';
    if (popularity >= 50) return 'warning';
    return 'error';
  };

  // Filtered services
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.displayName && service.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || 
      (service.category && service.category.name === categoryFilter) ||
      service.categoryId === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && service.isActive) ||
      (statusFilter === 'inactive' && !service.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getServiceSummary = () => {
    const totalServices = services.length;
    const activeServices = services.filter(s => s.isActive).length;
    const featuredServices = services.filter(s => s.isFeatured).length;
    const totalRevenue = services.reduce((sum, s) => sum + s.basePrice, 0);
    
    return { totalServices, activeServices, featuredServices, totalRevenue };
  };

  const summary = getServiceSummary();

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
            <ServicesIcon sx={{ color: '#3BB2FF', fontSize: 28 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1A202C' }}>
          {t('Services Management')}
        </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchServicesData}
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

        {/* Service Statistics Cards */}
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
                    {t('Total Services')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.totalServices || 0}
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
                    {t('Active Services')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.activeServices || 0}
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
                    {t('Featured Services')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.featuredServices || 0}
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
                    {t('Total Revenue')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                  </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
        )}

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder={t('Search services...')}
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
                  <MenuItem value="Screen Repair">{t('Screen Repair')}</MenuItem>
                  <MenuItem value="Battery Service">{t('Battery Service')}</MenuItem>
                  <MenuItem value="Hardware Repair">{t('Hardware Repair')}</MenuItem>
                  <MenuItem value="Water Damage">{t('Water Damage')}</MenuItem>
                  <MenuItem value="Software Service">{t('Software Service')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('Status')}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t('Status')}
                  onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('All Statuses')}</MenuItem>
                  <MenuItem value="active">{t('Active')}</MenuItem>
                  <MenuItem value="inactive">{t('Inactive')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedService(null);
                  resetCreateForm();
                  setCreateDialog(true);
                }}
              >
                {t('New Service')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>{t('Service')}</strong></TableCell>
                  <TableCell><strong>{t('Category')}</strong></TableCell>
                  <TableCell><strong>{t('Price')}</strong></TableCell>
                  <TableCell><strong>{t('Time')}</strong></TableCell>
                  <TableCell><strong>{t('Popularity')}</strong></TableCell>
                  <TableCell><strong>{t('Status')}</strong></TableCell>
                  <TableCell><strong>{t('Featured')}</strong></TableCell>
                  <TableCell><strong>{t('Actions')}</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: '#3BB2FF' }}>
                          <BuildIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {service.displayName || service.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {service.description ? service.description.substring(0, 50) + '...' : 'No description'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.category?.name || service.categoryId}
                        color={getCategoryColor(service.category?.name || service.categoryId) as any}
                        size="small"
                        icon={<CategoryIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${service.basePrice?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {service.estimatedDuration ? `${service.estimatedDuration} min` : 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PopularIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Chip
                          label={`${service.popularity || 0}%`}
                          color={getPopularityColor(service.popularity || 0) as any}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={service.isActive}
                            onChange={() => toggleServiceStatus(service.id)}
                            color="success"
                            size="small"
                          />
                        }
                        label={service.isActive ? t('Active') : t('Inactive')}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={service.isFeatured}
                            onChange={() => toggleFeaturedStatus(service.id)}
                            color="warning"
                            size="small"
                          />
                        }
                        label={service.isFeatured ? t('Featured') : t('Standard')}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, service)}
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
          {t('Edit Service')}
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('Delete Service')}
        </MenuItem>
      </Menu>

      {/* Create/Edit Service Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => {
          setCreateDialog(false);
          setSelectedService(null);
          resetCreateForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedService ? t('Edit Service') : t('Create New Service')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Service Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Service Name')}
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  error={!createForm.name}
                  helperText={!createForm.name ? t('Service name is required') : ''}
                />
              </Grid>

              {/* Display Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Display Name')}
                  value={createForm.displayName || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder={t('Optional display name for customers')}
                />
              </Grid>

              {/* Category and Service Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!createForm.categoryId}>
                  <InputLabel>{t('Service Category')}</InputLabel>
                  <Select
                    value={createForm.categoryId}
                    label={t('Service Category')}
                    onChange={(e) => {
                      console.log('📂 Category selected:', e.target.value);
                      setCreateForm(prev => ({ ...prev, categoryId: e.target.value }));
                    }}
                  >
                    {categories.length === 0 ? (
                      <MenuItem disabled>Loading categories...</MenuItem>
                    ) : (
                      categories.map((category) => {
                        console.log('📂 Rendering category:', category);
                        return (
                          <MenuItem key={category.id} value={category.id}>
                            {category.displayName || category.name}
                          </MenuItem>
                        );
                      })
                    )}
                  </Select>
                  {!createForm.categoryId && (
                    <FormHelperText>{t('Category is required')}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('Service Type')}</InputLabel>
                  <Select
                    value={createForm.serviceType}
                    label={t('Service Type')}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, serviceType: e.target.value }))}
                  >
                    <MenuItem value="REPAIR">{t('Repair')}</MenuItem>
                    <MenuItem value="MAINTENANCE">{t('Maintenance')}</MenuItem>
                    <MenuItem value="INSTALLATION">{t('Installation')}</MenuItem>
                    <MenuItem value="CONSULTATION">{t('Consultation')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Estimated Duration and Complexity */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Estimated Duration (minutes)')}
                  type="number"
                  value={createForm.estimatedDuration || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                  placeholder={t('e.g. 120 for 2 hours')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('Complexity')}</InputLabel>
                  <Select
                    value={createForm.complexity}
                    label={t('Complexity')}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, complexity: e.target.value }))}
                  >
                    <MenuItem value="LOW">{t('Low')}</MenuItem>
                    <MenuItem value="MEDIUM">{t('Medium')}</MenuItem>
                    <MenuItem value="HIGH">{t('High')}</MenuItem>
                    <MenuItem value="EXPERT">{t('Expert')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Base Price and Hourly Rate */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Base Price ($)')}
                  type="number"
                  value={createForm.basePrice || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Hourly Rate ($)')}
                  type="number"
                  value={createForm.hourlyRate || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Minimum Price and Labor Hours */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Minimum Price ($)')}
                  type="number"
                  value={createForm.minimumPrice || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, minimumPrice: parseFloat(e.target.value) || 0 }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Estimated Labor Hours')}
                  type="number"
                  value={createForm.estimatedLaborHours || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, estimatedLaborHours: parseFloat(e.target.value) || 0 }))}
                  placeholder={t('e.g. 1.5 for 1 hour 30 minutes')}
                  inputProps={{ step: 0.5 }}
                />
              </Grid>

              {/* Service Status Toggles */}
              <Grid item xs={12} md={6}>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={createForm.isActive}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, isActive: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label={t('Active Service')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={createForm.isFeatured}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        color="secondary"
                      />
                    }
                    label={t('Featured Service')}
                  />
                </Box>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Service Description')}
                  value={createForm.description || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={3}
                  placeholder={t('Brief description of the service...')}
                />
              </Grid>

              {/* Long Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Detailed Description')}
                  value={createForm.longDescription || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, longDescription: e.target.value }))}
                  multiline
                  rows={4}
                  placeholder={t('Detailed description of the service process...')}
                />
              </Grid>

              {/* Prerequisites, Tools, and Parts */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('Prerequisites')}
                  value={createForm.prerequisites || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, prerequisites: e.target.value }))}
                  multiline
                  rows={3}
                  placeholder={t('What customer needs to bring...')}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('Required Tools')}
                  value={createForm.tools || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, tools: e.target.value }))}
                  multiline
                  rows={3}
                  placeholder={t('Tools needed for this service...')}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('Required Parts')}
                  value={createForm.parts || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, parts: e.target.value }))}
                  multiline
                  rows={3}
                  placeholder={t('Parts needed for this service...')}
                />
              </Grid>

              {/* Subcategory and Tags */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Subcategory')}
                  value={createForm.subcategory || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, subcategory: e.target.value }))}
                  placeholder={t('e.g. iPhone, Samsung, Laptop')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Tags')}
                  value={createForm.tags || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder={t('e.g. screen,repair,iphone,lcd')}
                  helperText={t('Comma-separated tags for search and filtering')}
                />
              </Grid>

              {/* Additional Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Additional Notes')}
                  value={createForm.notes || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                  multiline
                  rows={2}
                  placeholder={t('Any special notes about this service...')}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialog(false);
            setSelectedService(null);
            resetCreateForm();
          }}>
            {t('Cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveService}
            disabled={!createForm.name || !createForm.categoryId}
          >
            {selectedService ? t('Update Service') : t('Create Service')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Service Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => {
          setViewDialog(false);
          setSelectedService(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('Service Details')}
        </DialogTitle>
                <DialogContent>
          {selectedService && (
            <Box sx={{ mt: 2 }}>
              {/* Service Header */}
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: '#3BB2FF',
                  fontSize: '2rem'
                }}>
                  <BuildIcon fontSize="large" />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedService.displayName || selectedService.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                  <Chip 
                    label={selectedService.category?.name || selectedService.categoryId} 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={selectedService.serviceType} 
                    color="secondary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={selectedService.isActive ? t('Active') : t('Inactive')} 
                    color={selectedService.isActive ? 'success' : 'error'} 
                  />
                  {selectedService.isFeatured && (
                    <Chip 
                      label={t('Featured')} 
                      color="warning" 
                    />
                  )}
                </Box>
              </Box>

              {/* Service Details Grid */}
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', bgcolor: '#f8f9fa' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: '#3BB2FF', fontWeight: 600 }}>
                        {t('Basic Information')}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Base Price')}
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                          ${selectedService.basePrice?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Estimated Duration')}
                        </Typography>
                        <Typography variant="body1">
                          {selectedService.estimatedDuration ? `${selectedService.estimatedDuration} minutes` : 'N/A'}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Complexity')}
                        </Typography>
                        <Typography variant="body1">
                          {selectedService.complexity}
                        </Typography>
                      </Box>

                      {selectedService.hourlyRate && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('Hourly Rate')}
                          </Typography>
                          <Typography variant="body1">
                            ${selectedService.hourlyRate?.toFixed(2) || '0.00'}/hour
                          </Typography>
                        </Box>
                      )}

                      {selectedService.popularity && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('Popularity Score')}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {selectedService.popularity}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={selectedService.popularity} 
                              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                              color={selectedService.popularity >= 80 ? 'success' : 
                                     selectedService.popularity >= 60 ? 'warning' : 'error'}
                            />
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Description */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', bgcolor: '#f8f9fa' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: '#3BB2FF', fontWeight: 600 }}>
                        {t('Description')}
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {selectedService.description || t('No description available')}
                      </Typography>
                      {selectedService.longDescription && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="h6" sx={{ mb: 1, color: '#3BB2FF', fontWeight: 600 }}>
                            {t('Detailed Description')}
                          </Typography>
                          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                            {selectedService.longDescription}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Service Prerequisites, Tools, and Parts */}
                {(selectedService.prerequisites || selectedService.tools || selectedService.parts) && (
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: '#f8f9fa' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#3BB2FF', fontWeight: 600 }}>
                          {t('Service Details')}
                        </Typography>
                        <Grid container spacing={3}>
                          {selectedService.prerequisites && (
                            <Grid item xs={12} md={4}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                {t('Prerequisites')}
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                {selectedService.prerequisites}
                              </Typography>
                            </Grid>
                          )}
                          {selectedService.tools && (
                            <Grid item xs={12} md={4}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                {t('Required Tools')}
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                {selectedService.tools}
                              </Typography>
                            </Grid>
                          )}
                          {selectedService.parts && (
                            <Grid item xs={12} md={4}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                {t('Required Parts')}
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                {selectedService.parts}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Service Requirements (Legacy) */}
                {selectedService.requirements && selectedService.requirements.length > 0 && (
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: '#f8f9fa' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#3BB2FF', fontWeight: 600 }}>
                          {t('Service Requirements')}
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                          {selectedService.requirements.map((requirement, index) => (
                            <Box component="li" key={index} sx={{ mb: 1 }}>
                              <Typography variant="body1">{requirement}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Additional Notes */}
                {selectedService.notes && (
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: '#fff3cd', border: '1px solid #ffeaa7' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#d68910', fontWeight: 600 }}>
                          {t('Additional Notes')}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#856404' }}>
                          {selectedService.notes}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setViewDialog(false);
            setSelectedService(null);
          }}>
            {t('Close')}
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            onClick={() => {
              setViewDialog(false);
              if (selectedService) {
                handleItemSelect(selectedService, 'edit');
              }
            }}
          >
            {t('Edit Service')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="create service"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => {
          setSelectedService(null);
          resetCreateForm();
          setCreateDialog(true);
        }}
      >
        <AddIcon />
      </Fab>
      </Box>
    </Box>
  );
};

export default ServicesPage;
