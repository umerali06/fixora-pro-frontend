import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface Device {
  id: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  deviceSerial?: string;
  deviceCondition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
  issue: string;
  estimatedCost: number;
  notes: string;
}

interface Customer {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

interface RepairIntakeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: RepairIntakeData) => void;
  loading?: boolean;
}

interface RepairIntakeData {
  customer: Customer;
  devices: Device[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedCompletion: string;
  assignedTechnician: string;
  customerNotes: string;
  internalNotes: string;
  signatureUrl?: string;
  totalEstimatedCost: number;
}

const RepairIntakeForm: React.FC<RepairIntakeFormProps> = ({
  open,
  onClose,
  onSave,
  loading = false
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [signatureData, setSignatureData] = useState<string>('');

  // Form Data
  const [customer, setCustomer] = useState<Customer>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: {
      street: '',
      city: '',
      zipCode: '',
      country: ''
    }
  });

  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      deviceType: '',
      deviceBrand: '',
      deviceModel: '',
      deviceSerial: '',
      deviceCondition: 'GOOD',
      issue: '',
      estimatedCost: 0,
      notes: ''
    }
  ]);

  const [formData, setFormData] = useState({
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    estimatedCompletion: '',
    assignedTechnician: '',
    customerNotes: '',
    internalNotes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    'Customer Information',
    'Device Details',
    'Repair Information',
    'Signature & Review'
  ];

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (activeStep) {
      case 0: // Customer Information
        if (!customer.firstName) newErrors.firstName = 'First name is required';
        if (!customer.lastName) newErrors.lastName = 'Last name is required';
        if (!customer.email) newErrors.email = 'Email is required';
        if (!customer.phone) newErrors.phone = 'Phone is required';
        break;

      case 1: // Device Details
        devices.forEach((device, index) => {
          if (!device.deviceType) newErrors[`deviceType_${index}`] = 'Device type is required';
          if (!device.deviceBrand) newErrors[`deviceBrand_${index}`] = 'Device brand is required';
          if (!device.deviceModel) newErrors[`deviceModel_${index}`] = 'Device model is required';
          if (!device.issue) newErrors[`issue_${index}`] = 'Issue description is required';
        });
        break;

      case 2: // Repair Information
        if (!formData.estimatedCompletion) newErrors.estimatedCompletion = 'Estimated completion date is required';
        if (!formData.assignedTechnician) newErrors.assignedTechnician = 'Assigned technician is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCustomerChange = (field: keyof Customer, value: string) => {
    setCustomer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: 'street' | 'city' | 'zipCode' | 'country', value: string) => {
    setCustomer(prev => ({
      ...prev,
      address: {
        ...prev.address!,
        [field]: value
      }
    }));
  };


  const addDevice = () => {
    const newDevice: Device = {
      id: Date.now().toString(),
      deviceType: '',
      deviceBrand: '',
      deviceModel: '',
      deviceSerial: '',
      deviceCondition: 'GOOD',
      issue: '',
      estimatedCost: 0,
      notes: ''
    };
    setDevices(prev => [...prev, newDevice]);
  };

  const removeDevice = (index: number) => {
    if (devices.length > 1) {
      setDevices(prev => prev.filter((_, i) => i !== index));
    }
  };


  const calculateTotalCost = () => {
    return devices.reduce((sum, device) => sum + device.estimatedCost, 0);
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      const repairData: RepairIntakeData = {
        customer,
        devices,
        priority: formData.priority,
        estimatedCompletion: formData.estimatedCompletion,
        assignedTechnician: formData.assignedTechnician,
        customerNotes: formData.customerNotes,
        internalNotes: formData.internalNotes,
        signatureUrl: signatureData,
        totalEstimatedCost: calculateTotalCost()
      };
      onSave(repairData);
    }
  };

  const resetForm = () => {
    setCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      address: {
        street: '',
        city: '',
        zipCode: '',
        country: ''
      }
    });
    setDevices([{
      id: '1',
      deviceType: '',
      deviceBrand: '',
      deviceModel: '',
      deviceSerial: '',
      deviceCondition: 'GOOD',
      issue: '',
      estimatedCost: 0,
      notes: ''
    }]);
    setFormData({
      priority: 'MEDIUM',
      estimatedCompletion: '',
      assignedTechnician: '',
      customerNotes: '',
      internalNotes: ''
    });
    setActiveStep(0);
    setSignatureData('');
    setErrors({});
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Repair Intake Form</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {index === 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="First Name"
                          value={customer.firstName}
                          onChange={(e) => handleCustomerChange('firstName', e.target.value)}
                          error={!!errors.firstName}
                          helperText={errors.firstName}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label={"Last Name"}
                          value={customer.lastName}
                          onChange={(e) => handleCustomerChange('lastName', e.target.value)}
                          error={!!errors.lastName}
                          helperText={errors.lastName}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label={"Email"}
                          value={customer.email}
                          onChange={(e) => handleCustomerChange('email', e.target.value)}
                          error={!!errors.email}
                          helperText={errors.email}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label={"Phone"}
                          value={customer.phone}
                          onChange={(e) => handleCustomerChange('phone', e.target.value)}
                          error={!!errors.phone}
                          helperText={errors.phone}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label={"Company"}
                          value={customer.company}
                          onChange={(e) => handleCustomerChange('company', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label={"Address"}
                          value={customer.address?.street}
                          onChange={(e) => handleAddressChange('street', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label={"City"}
                          value={customer.address?.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label={"Zip Code"}
                          value={customer.address?.zipCode}
                          onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label={"Country"}
                          value={customer.address?.country}
                          onChange={(e) => handleAddressChange('country', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
                {index === 1 && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addDevice}
                      fullWidth
                    >
                      {"Add Device"}
                    </Button>
                    <List sx={{ mt: 2 }}>
                      {devices.map((device, index) => (
                        <ListItem
                          key={device.id}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => removeDevice(index)}>
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={`${device.deviceType} - ${device.deviceBrand} ${device.deviceModel}`}
                            secondary={`Serial: ${device.deviceSerial || 'N/A'}, Condition: ${device.deviceCondition}, Issue: ${device.issue}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                {index === 2 && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>{"Priority"}</InputLabel>
                          <Select
                            value={formData.priority}
                            label={"Priority"}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' })}
                          >
                            <MenuItem value="LOW">{"Low"}</MenuItem>
                            <MenuItem value="MEDIUM">{"Medium"}</MenuItem>
                            <MenuItem value="HIGH">{"High"}</MenuItem>
                            <MenuItem value="URGENT">{"Urgent"}</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label={"Estimated Completion Date"}
                          type="date"
                          value={formData.estimatedCompletion}
                          onChange={(e) => setFormData({ ...formData, estimatedCompletion: e.target.value })}
                          fullWidth
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label={"Assigned Technician"}
                          value={formData.assignedTechnician}
                          onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label={"Customer Notes"}
                          multiline
                          rows={2}
                          value={formData.customerNotes}
                          onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label={"Internal Notes"}
                          multiline
                          rows={2}
                          value={formData.internalNotes}
                          onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
                {index === 3 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">{"Review & Submit"}</Typography>
                    <Divider sx={{ my: 2 }} />
                    <List>
                      <ListItem>
                        <ListItemText primary={"Customer Name"} secondary={`${customer.firstName} ${customer.lastName}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={"Email"} secondary={customer.email} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={"Phone"} secondary={customer.phone} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={"Company"} secondary={customer.company} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={"Address"} secondary={`${customer.address?.street}, ${customer.address?.city}, ${customer.address?.zipCode}, ${customer.address?.country}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={"Priority"} secondary={formData.priority} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={"Estimated Completion"} secondary={formData.estimatedCompletion} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={"Assigned Technician"} secondary={formData.assignedTechnician} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={"Customer Notes"} secondary={formData.customerNotes} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={"Internal Notes"} secondary={formData.internalNotes} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={"Total Estimated Cost"} secondary={`${calculateTotalCost()} ${"USD"}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={"Signature"} secondary={signatureData ? "Signature captured" : "No signature captured"} />
                      </ListItem>
                    </List>
                    <Box sx={{ mt: 2 }}>
                      <Button variant="outlined" onClick={handleBack} sx={{ mr: 1 }}>
                        {"Back"}
                      </Button>
                      <Button variant="contained" onClick={handleNext} sx={{ mr: 1 }}>
                        {activeStep === steps.length - 1 ? "Submit" : "Next"}
                      </Button>
                      <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : "Save"}
                      </Button>
                    </Box>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{"Cancel"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RepairIntakeForm;


