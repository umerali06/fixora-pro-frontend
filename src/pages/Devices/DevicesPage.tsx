import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Device {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  imei: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'available' | 'in_repair' | 'sold' | 'scrapped';
  customerName: string;
  notes: string;
  lastUpdated: string;
}

const DevicesPage: React.FC = () => {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    imei: '',
    condition: 'good' as 'excellent' | 'good' | 'fair' | 'poor',
    status: 'available' as 'available' | 'in_repair' | 'sold' | 'scrapped',
    customerName: '',
    notes: ''
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDevices([
        {
          id: '1',
          brand: 'Apple',
          model: 'iPhone 12',
          serialNumber: 'SN123456789',
          imei: '123456789012345',
          condition: 'excellent',
          status: 'available',
          customerName: 'John Doe',
          notes: 'Perfect condition, ready for sale',
          lastUpdated: '2024-01-15'
        },
        {
          id: '2',
          brand: 'Samsung',
          model: 'Galaxy S21',
          serialNumber: 'SN987654321',
          imei: '987654321098765',
          condition: 'good',
          status: 'in_repair',
          customerName: 'Jane Smith',
          notes: 'Screen replacement needed',
          lastUpdated: '2024-01-14'
        },
        {
          id: '3',
          brand: 'Apple',
          model: 'iPhone 11',
          serialNumber: 'SN456789123',
          imei: '456789123456789',
          condition: 'fair',
          status: 'sold',
          customerName: 'Mike Johnson',
          notes: 'Sold for $450',
          lastUpdated: '2024-01-10'
        }
      ]);
    }, 1000);
  }, []);

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = brandFilter === 'all' || device.brand === brandFilter;
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    
    return matchesSearch && matchesBrand && matchesStatus;
  });

  const handleAddDevice = () => {
    setEditingDevice(null);
    setFormData({
      brand: '',
      model: '',
      serialNumber: '',
      imei: '',
      condition: 'good',
      status: 'available',
      customerName: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setFormData({
      brand: device.brand,
      model: device.model,
      serialNumber: device.serialNumber,
      imei: device.imei,
      condition: device.condition,
      status: device.status,
      customerName: device.customerName,
      notes: device.notes
    });
    setOpenDialog(true);
  };

  const handleDeleteDevice = (id: string) => {
    setDevices(devices.filter(device => device.id !== id));
  };

  const handleSaveDevice = () => {
    if (editingDevice) {
      setDevices(devices.map(device => 
        device.id === editingDevice.id ? { ...formData, id: device.id, lastUpdated: device.lastUpdated } : device
      ));
    } else {
      const newDevice: Device = {
        ...formData,
        id: Date.now().toString(),
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setDevices([...devices, newDevice]);
    }
    setOpenDialog(false);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'in_repair': return 'warning';
      case 'sold': return 'info';
      case 'scrapped': return 'error';
      default: return 'default';
    }
  };

  const getBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'apple':
        return <PhoneIcon color="primary" />;
      case 'samsung':
        return <BuildIcon color="secondary" />;
      default:
        return <CheckCircleIcon color="action" />;
    }
  };

  const uniqueBrands = Array.from(new Set(devices.map(device => device.brand)));

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {t('Devices')}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('Search devices')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>{t('Brand')}</InputLabel>
                    <Select
                      value={brandFilter}
                      label={t('Brand')}
                      onChange={(e) => setBrandFilter(e.target.value)}
                    >
                      <MenuItem value="all">{t('All Brands')}</MenuItem>
                      {uniqueBrands.map(brand => (
                        <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>{t('Status')}</InputLabel>
                    <Select
                      value={statusFilter}
                      label={t('Status')}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">{t('All Statuses')}</MenuItem>
                      <MenuItem value="available">{t('Available')}</MenuItem>
                      <MenuItem value="in_repair">{t('In Repair')}</MenuItem>
                      <MenuItem value="sold">{t('Sold')}</MenuItem>
                      <MenuItem value="scrapped">{t('Scrapped')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddDevice}
                  >
                    {t('Add Device')}
                  </Button>
                </Grid>
              </Grid>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Device')}</TableCell>
                      <TableCell>{t('Serial/IMEI')}</TableCell>
                      <TableCell>{t('Condition')}</TableCell>
                      <TableCell>{t('Status')}</TableCell>
                      <TableCell>{t('Customer')}</TableCell>
                      <TableCell>{t('Last Updated')}</TableCell>
                      <TableCell>{t('Actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDevices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {getBrandIcon(device.brand)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {device.brand} {device.model}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {device.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {t('SN')}: {device.serialNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('IMEI')}: {device.imei}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={t(device.condition)} 
                            color={getConditionColor(device.condition) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={t(device.status)} 
                            color={getStatusColor(device.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{device.customerName}</TableCell>
                        <TableCell>{device.lastUpdated}</TableCell>
                        <TableCell>
                          <Tooltip title={t('Edit')}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditDevice(device)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('Delete')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteDevice(device.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDevice ? t('Edit Device') : t('Add New Device')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('Brand')}
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('Model')}
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('Serial Number')}
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('IMEI')}
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('Condition')}</InputLabel>
                <Select
                  value={formData.condition}
                  label={t('Condition')}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                >
                  <MenuItem value="excellent">{t('Excellent')}</MenuItem>
                  <MenuItem value="good">{t('Good')}</MenuItem>
                  <MenuItem value="fair">{t('Fair')}</MenuItem>
                  <MenuItem value="poor">{t('Poor')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('Status')}</InputLabel>
                <Select
                  value={formData.status}
                  label={t('Status')}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="available">{t('Available')}</MenuItem>
                  <MenuItem value="in_repair">{t('In Repair')}</MenuItem>
                  <MenuItem value="sold">{t('Sold')}</MenuItem>
                  <MenuItem value="scrapped">{t('Scrapped')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('Customer Name')}
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('Notes')}
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t('Cancel')}
          </Button>
          <Button onClick={handleSaveDevice} variant="contained">
            {editingDevice ? t('Update') : t('Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DevicesPage;
