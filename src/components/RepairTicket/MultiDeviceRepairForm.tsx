import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Watch as WatchIcon,
  DeviceUnknown as DeviceIcon,
  QrCodeScanner as ScanIcon,
} from '@mui/icons-material';

interface Device {
  id: string;
  imei: string;
  brand: string;
  model: string;
  color?: string;
  deviceType: string;
  issues: DeviceIssue[];
}

interface DeviceIssue {
  id: string;
  description: string;
  diagnosis?: string;
  estimatedCost?: number;
  actualCost?: number;
  status: 'IDENTIFIED' | 'DIAGNOSED' | 'REPAIRING' | 'REPAIRED' | 'TESTING' | 'COMPLETED' | 'FAILED';
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

const MultiDeviceRepairForm: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [currentDevice, setCurrentDevice] = useState<Partial<Device>>({
    imei: '',
    brand: '',
    model: '',
    color: '',
    deviceType: 'SMARTPHONE',
    issues: []
  });
  const [currentIssue, setCurrentIssue] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');

  // Mock data
  const deviceTypes = [
    { value: 'SMARTPHONE', label: 'Smartphone', icon: PhoneIcon },
    { value: 'TABLET', label: 'Tablet', icon: TabletIcon },
    { value: 'LAPTOP', label: 'Laptop', icon: LaptopIcon },
    { value: 'SMARTWATCH', label: 'Smartwatch', icon: WatchIcon },
    { value: 'OTHER', label: 'Other', icon: DeviceIcon },
  ];

  const commonBrands = [
    'Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus', 
    'Google', 'Sony', 'LG', 'Motorola', 'Nokia'
  ];

  const commonIssues = [
    'Screen broken/cracked',
    'Display not working',
    'Battery issues',
    'Charging port problems',
    'Water damage',
    'Speaker not working',
    'Camera issues',
    'Software problems',
    'Power button stuck',
    'Volume buttons not working',
    'Fingerprint sensor issues',
    'WiFi/Bluetooth problems'
  ];

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceTypes.find(dt => dt.value === deviceType);
    return type ? type.icon : DeviceIcon;
  };

  const addIssueToCurrentDevice = () => {
    if (!currentIssue.trim()) return;
    
    const newIssue: DeviceIssue = {
      id: Date.now().toString(),
      description: currentIssue,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      status: 'IDENTIFIED'
    };

    setCurrentDevice({
      ...currentDevice,
      issues: [...(currentDevice.issues || []), newIssue]
    });
    
    setCurrentIssue('');
    setEstimatedCost('');
  };

  const removeIssueFromCurrentDevice = (issueId: string) => {
    setCurrentDevice({
      ...currentDevice,
      issues: currentDevice.issues?.filter(issue => issue.id !== issueId) || []
    });
  };

  const saveDevice = () => {
    if (!currentDevice.imei || !currentDevice.brand || !currentDevice.model) {
      return; // Validation
    }

    const deviceToSave: Device = {
      id: editingDevice?.id || Date.now().toString(),
      imei: currentDevice.imei!,
      brand: currentDevice.brand!,
      model: currentDevice.model!,
      color: currentDevice.color,
      deviceType: currentDevice.deviceType!,
      issues: currentDevice.issues || []
    };

    if (editingDevice) {
      setDevices(devices.map(d => d.id === editingDevice.id ? deviceToSave : d));
    } else {
      setDevices([...devices, deviceToSave]);
    }

    resetDeviceForm();
  };

  const resetDeviceForm = () => {
    setCurrentDevice({
      imei: '',
      brand: '',
      model: '',
      color: '',
      deviceType: 'SMARTPHONE',
      issues: []
    });
    setCurrentIssue('');
    setEstimatedCost('');
    setEditingDevice(null);
    setDeviceDialogOpen(false);
  };

  const editDevice = (device: Device) => {
    setCurrentDevice(device);
    setEditingDevice(device);
    setDeviceDialogOpen(true);
  };

  const removeDevice = (deviceId: string) => {
    setDevices(devices.filter(d => d.id !== deviceId));
  };

  const getTotalEstimatedCost = () => {
    return devices.reduce((total, device) => {
      const deviceTotal = device.issues.reduce((issueTotal, issue) => {
        return issueTotal + (issue.estimatedCost || 0);
      }, 0);
      return total + deviceTotal;
    }, 0);
  };

  const scanIMEI = () => {
    // Mock barcode scanning
    const mockIMEI = '123456789012345';
    setCurrentDevice({ ...currentDevice, imei: mockIMEI });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        New Multi-Device Repair Ticket
      </Typography>

      {/* Customer Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Customer
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={[]} // Mock customers would go here
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search customer..."
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button variant="outlined" fullWidth>
              New Customer
            </Button>
          </Grid>
        </Grid>
        {customer && (
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`${customer.firstName} ${customer.lastName} - ${customer.phone}`}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Devices Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Devices ({devices.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDeviceDialogOpen(true)}
          >
            Add Device
          </Button>
        </Box>

        {devices.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No devices added yet
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {devices.map((device) => {
              const DeviceIconComponent = getDeviceIcon(device.deviceType);
              return (
                <Grid item xs={12} md={6} lg={4} key={device.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DeviceIconComponent sx={{ mr: 1, color: 'primary.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">
                            {device.brand} {device.model}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            IMEI: {device.imei}
                          </Typography>
                          {device.color && (
                            <Typography variant="body2" color="text.secondary">
                              Color: {device.color}
                            </Typography>
                          )}
                        </Box>
                        <Box>
                          <IconButton size="small" onClick={() => editDevice(device)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => removeDevice(device.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Issues ({device.issues.length}):
                      </Typography>
                      {device.issues.map((issue) => (
                        <Box key={issue.id} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            • {issue.description}
                          </Typography>
                          {issue.estimatedCost && (
                            <Typography variant="body2" color="primary">
                              Est. Cost: €{issue.estimatedCost.toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>

      {/* Summary */}
      {devices.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1">
                Total Devices: {devices.length}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                Total Issues: {devices.reduce((total, device) => total + device.issues.length, 0)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" color="primary">
                Estimated Total: €{getTotalEstimatedCost().toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined">
          Cancel
        </Button>
        <Button 
          variant="contained"
          disabled={devices.length === 0 || !customer}
        >
          Create Ticket
        </Button>
      </Box>

      {/* Device Dialog */}
      <Dialog 
        open={deviceDialogOpen} 
        onClose={resetDeviceForm} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editingDevice ? 'Edit Device' : 'Add Device'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Device Info */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Device Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="IMEI"
                  value={currentDevice.imei || ''}
                  onChange={(e) => setCurrentDevice({ ...currentDevice, imei: e.target.value })}
                />
                <IconButton onClick={scanIMEI} color="primary">
                  <ScanIcon />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Device Type</InputLabel>
                <Select
                  value={currentDevice.deviceType || 'SMARTPHONE'}
                  onChange={(e) => setCurrentDevice({ ...currentDevice, deviceType: e.target.value })}
                >
                  {deviceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <type.icon sx={{ mr: 1 }} />
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Autocomplete
                freeSolo
                options={commonBrands}
                value={currentDevice.brand || ''}
                onChange={(_, value) => setCurrentDevice({ ...currentDevice, brand: value || '' })}
                renderInput={(params) => (
                  <TextField {...params} label="Brand" fullWidth />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Model"
                value={currentDevice.model || ''}
                onChange={(e) => setCurrentDevice({ ...currentDevice, model: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Color"
                value={currentDevice.color || ''}
                onChange={(e) => setCurrentDevice({ ...currentDevice, color: e.target.value })}
              />
            </Grid>

            {/* Issues Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Issues
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={commonIssues}
                value={currentIssue}
                onChange={(_, value) => setCurrentIssue(value || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Issue Description"
                    fullWidth
                    onChange={(e) => setCurrentIssue(e.target.value)}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Estimated Cost"
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                InputProps={{ startAdornment: '€' }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={addIssueToCurrentDevice}
                disabled={!currentIssue.trim()}
                sx={{ height: 56 }}
              >
                Add Issue
              </Button>
            </Grid>

            {/* Current Issues List */}
            {currentDevice.issues && currentDevice.issues.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Issues:
                </Typography>
                {currentDevice.issues.map((issue) => (
                  <Chip
                    key={issue.id}
                    label={`${issue.description}${issue.estimatedCost ? ` (€${issue.estimatedCost})` : ''}`}
                    onDelete={() => removeIssueFromCurrentDevice(issue.id)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetDeviceForm}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={saveDevice}
            disabled={!currentDevice.imei || !currentDevice.brand || !currentDevice.model}
          >
            {editingDevice ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultiDeviceRepairForm;
