import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Switch,
  FormControlLabel,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  LocalOffer as LocalOfferIcon,
  Category as CategoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
  isPopular: boolean;
  includes: string[];
  requirements: string[];
  estimatedTime: string;
  warranty: string;
  createdAt: string;
  updatedAt: string;
}

const Services: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openNewServiceDialog, setOpenNewServiceDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Mock data
  const services: Service[] = [
    {
      id: 'SERV-001',
      name: 'iPhone Screen Replacement',
      category: 'Screen Repair',
      description: 'Professional iPhone screen replacement service with original quality parts',
      price: 149.99,
      duration: 60,
      isActive: true,
      isPopular: true,
      includes: ['Screen replacement', 'Quality testing', 'Warranty'],
      requirements: ['Device backup recommended', 'Remove passcode'],
      estimatedTime: '1 hour',
      warranty: '90 days',
      createdAt: '2025-01-15',
      updatedAt: '2025-02-01'
    },
    {
      id: 'SERV-002',
      name: 'Battery Replacement',
      category: 'Battery Service',
      description: 'Replace your device battery with high-quality replacement',
      price: 79.99,
      duration: 45,
      isActive: true,
      isPopular: true,
      includes: ['Battery replacement', 'Performance test', 'Warranty'],
      requirements: ['Device backup recommended'],
      estimatedTime: '45 minutes',
      warranty: '6 months',
      createdAt: '2025-01-10',
      updatedAt: '2025-01-28'
    },
    {
      id: 'SERV-003',
      name: 'Water Damage Repair',
      category: 'Water Damage',
      description: 'Professional water damage assessment and repair service',
      price: 199.99,
      duration: 120,
      isActive: true,
      isPopular: false,
      includes: ['Damage assessment', 'Component cleaning', 'Testing'],
      requirements: ['Do not power on device', 'Remove battery if possible'],
      estimatedTime: '2-3 hours',
      warranty: '30 days',
      createdAt: '2025-01-20',
      updatedAt: '2025-02-05'
    },
    {
      id: 'SERV-004',
      name: 'Software Repair',
      category: 'Software',
      description: 'Fix software issues, data recovery, and system optimization',
      price: 59.99,
      duration: 90,
      isActive: true,
      isPopular: false,
      includes: ['Software diagnosis', 'Data recovery', 'System optimization'],
      requirements: ['Device backup required'],
      estimatedTime: '1-2 hours',
      warranty: '30 days',
      createdAt: '2025-01-05',
      updatedAt: '2025-01-25'
    },
    {
      id: 'SERV-005',
      name: 'Charging Port Repair',
      category: 'Hardware Repair',
      description: 'Repair or replace damaged charging ports',
      price: 89.99,
      duration: 75,
      isActive: true,
      isPopular: false,
      includes: ['Port replacement', 'Testing', 'Warranty'],
      requirements: ['Bring charging cable'],
      estimatedTime: '1 hour',
      warranty: '90 days',
      createdAt: '2025-01-12',
      updatedAt: '2025-01-30'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Screen Repair': return 'primary';
      case 'Battery Service': return 'success';
      case 'Water Damage': return 'warning';
      case 'Software': return 'info';
      case 'Hardware Repair': return 'secondary';
      default: return 'default';
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && service.isActive) ||
                         (statusFilter === 'inactive' && !service.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const tabLabels = ['All Services', 'Popular Services', 'Screen Repair', 'Battery Service', 'Software'];

  const totalRevenue = services.reduce((sum, service) => sum + service.price, 0);
  const activeServices = services.filter(service => service.isActive).length;
  const popularServices = services.filter(service => service.isPopular).length;

  return (
    <Box sx={{ 
      backgroundColor: '#F4F7FB',
      minHeight: '100vh',
      maxWidth: '1240px',
      mx: 'auto',
      px: 3,
      py: 2.5
    }}>
      {/* Header */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderRadius: '14px',
        border: '1px solid #E8EEF5',
        boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
        p: 3,
        mb: 2.5
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ 
            fontSize: '22px', 
            fontWeight: 800, 
            color: '#24324A'
          }}>
            Services Management
        </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewServiceDialog(true)}
            sx={{ 
              backgroundColor: '#2F80ED',
              color: 'white',
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              '&:hover': { backgroundColor: '#2563EB' }
            }}
          >
            New Service
          </Button>
        </Box>

        {/* Search and Filters */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search services by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9FB0C7' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: '#E6ECF3',
                  },
                  '&:hover fieldset': {
                    borderColor: '#2F80ED',
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="Screen Repair">Screen Repair</MenuItem>
                <MenuItem value="Battery Service">Battery Service</MenuItem>
                <MenuItem value="Water Damage">Water Damage</MenuItem>
                <MenuItem value="Software">Software</MenuItem>
                <MenuItem value="Hardware Repair">Hardware Repair</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              fullWidth
              sx={{ 
                borderRadius: '12px',
                borderColor: '#E6ECF3',
                color: '#24324A',
                '&:hover': { borderColor: '#2F80ED' }
              }}
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '14px',
            border: '1px solid #E8EEF5',
            boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
            '&:hover': { boxShadow: 'rgba(19, 33, 68, 0.08) 0 8px 20px' }
          }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#7D8DA5', mb: 0.5 }}>
                    Total Services
                  </Typography>
                  <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#24324A' }}>
                    {services.length}
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: '#E3F2FD', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BuildIcon sx={{ fontSize: 24, color: '#2F80ED' }} />
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
            '&:hover': { boxShadow: 'rgba(19, 33, 68, 0.08) 0 8px 20px' }
          }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#7D8DA5', mb: 0.5 }}>
                    Active Services
                  </Typography>
                  <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#24324A' }}>
                    {activeServices}
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: '#E8F5E8', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircleIcon sx={{ fontSize: 24, color: '#4CAF50' }} />
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
            '&:hover': { boxShadow: 'rgba(19, 33, 68, 0.08) 0 8px 20px' }
          }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#7D8DA5', mb: 0.5 }}>
                    Popular Services
                  </Typography>
                  <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#24324A' }}>
                    {popularServices}
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: '#FFF3E0', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <StarIcon sx={{ fontSize: 24, color: '#FF9800' }} />
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
            '&:hover': { boxShadow: 'rgba(19, 33, 68, 0.08) 0 8px 20px' }
          }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#7D8DA5', mb: 0.5 }}>
                    Total Value
          </Typography>
                  <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#24324A' }}>
                    €{totalRevenue.toFixed(2)}
          </Typography>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: '#F3E5F5', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AttachMoneyIcon sx={{ fontSize: 24, color: '#9C27B0' }} />
                </Box>
              </Box>
        </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderRadius: '14px',
        border: '1px solid #E8EEF5',
        boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
        mb: 2.5
      }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              color: '#7D8DA5',
              '&.Mui-selected': {
                color: '#2F80ED',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2F80ED',
            },
          }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>

      {/* Services Table */}
      <Card sx={{ 
        backgroundColor: 'white',
        borderRadius: '14px',
        border: '1px solid #E8EEF5',
        boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
        overflow: 'hidden'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Service</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Popular</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: '#2F80ED' }}>
                        <BuildIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#24324A' }}>
                          {service.name}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#7D8DA5', maxWidth: 300 }}>
                          {service.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={service.category}
                      color={getCategoryColor(service.category) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: '#24324A', fontWeight: 600 }}>
                      €{service.price.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 16, color: '#7D8DA5' }} />
                      <Typography sx={{ fontSize: '12px', color: '#7D8DA5' }}>
                        {service.estimatedTime}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={service.isActive ? 'Active' : 'Inactive'}
                      color={service.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      {service.isPopular ? (
                        <StarIcon sx={{ color: '#FFD700' }} />
                      ) : (
                        <StarBorderIcon sx={{ color: '#9FB0C7' }} />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" sx={{ color: '#2F80ED' }}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" sx={{ color: '#2F80ED' }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" sx={{ color: '#FF5A79' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* New Service Dialog */}
      <Dialog
        open={openNewServiceDialog}
        onClose={() => setOpenNewServiceDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          fontSize: '20px', 
          fontWeight: 700, 
          color: '#24324A',
          borderBottom: '1px solid #E6ECF3',
          pb: 2
        }}>
          Add New Service
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontWeight: 600, color: '#24324A', mb: 1 }}>
                Service Information
              </Typography>
              <TextField
                fullWidth
                label="Service Name"
                size="small"
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select label="Category">
                  <MenuItem value="Screen Repair">Screen Repair</MenuItem>
                  <MenuItem value="Battery Service">Battery Service</MenuItem>
                  <MenuItem value="Water Damage">Water Damage</MenuItem>
                  <MenuItem value="Software">Software</MenuItem>
                  <MenuItem value="Hardware Repair">Hardware Repair</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                size="small"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontWeight: 600, color: '#24324A', mb: 1 }}>
                Pricing & Duration
              </Typography>
              <TextField
                fullWidth
                label="Price (€)"
                type="number"
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Estimated Time (e.g., 1 hour)"
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Warranty (e.g., 90 days)"
                size="small"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 600, color: '#24324A', mb: 1 }}>
                Service Details
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="What's included (comma separated)"
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Requirements (comma separated)"
                size="small"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Active Service"
                sx={{ color: '#24324A' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={<Switch />}
                label="Popular Service"
                sx={{ color: '#24324A' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #E6ECF3' }}>
          <Button
            onClick={() => setOpenNewServiceDialog(false)}
            sx={{ color: '#7D8DA5' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenNewServiceDialog(false)}
            sx={{ 
              backgroundColor: '#2F80ED',
              '&:hover': { backgroundColor: '#2563EB' }
            }}
          >
            Add Service
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Services; 