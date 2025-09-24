import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  AccountCircle,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Customer } from '../../store/slices/customersSlice';

interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (customer: Partial<Customer>) => void;
  customer?: Customer | null;
  loading?: boolean;
}

const CustomerDialog: React.FC<CustomerDialogProps> = ({
  open,
  onClose,
  onSave,
  customer,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    status: 'ACTIVE',
    address: {
      street: '',
      city: '',
      zipCode: '',
      country: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        ...customer,
        address: customer.address || {
          street: '',
          city: '',
          zipCode: '',
          country: '',
        },
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
        status: 'ACTIVE',
        address: {
          street: '',
          city: '',
          zipCode: '',
          country: '',
        },
      });
    }
    setErrors({});
  }, [customer, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = t('validation.required');
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = t('validation.required');
    }

    if (!formData.email?.trim()) {
      newErrors.email = t('validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.invalidEmail');
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = t('validation.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        street: prev.address?.street || '',
        city: prev.address?.city || '',
        zipCode: prev.address?.zipCode || '',
        country: prev.address?.country || '',
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const isEditMode = !!customer;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '600px',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountCircle color="primary" />
            <Typography variant="h6">
              {isEditMode ? t('customers.editCustomer') : t('customers.addCustomer')}
            </Typography>
            {isEditMode && customer && (
              <Chip
                label={customer.status}
                color={customer.status === 'ACTIVE' ? 'success' : 'error'}
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mt: 1 }} />
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccountCircle color="action" />
              <Typography variant="h6" color="text.secondary">
                {t('customers.personalInfo')}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('customers.firstName')}
              value={formData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('customers.lastName')}
              value={formData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              error={!!errors.lastName}
              helperText={errors.lastName}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('customers.email')}
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              required
              InputProps={{
                startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('customers.phone')}
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
              required
              InputProps={{
                startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label={t('customers.company')}
              value={formData.company || ''}
              onChange={(e) => handleInputChange('company', e.target.value)}
              InputProps={{
                startAdornment: <BusinessIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>{t('customers.status')}</InputLabel>
              <Select
                value={formData.status || 'ACTIVE'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                label={t('customers.status')}
              >
                <MenuItem value="ACTIVE">{t('customers.statusActive')}</MenuItem>
                <MenuItem value="INACTIVE">{t('customers.statusInactive')}</MenuItem>
                <MenuItem value="BLOCKED">{t('customers.statusBlocked')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2 }}>
              <LocationIcon color="action" />
              <Typography variant="h6" color="text.secondary">
                {t('customers.addressInfo')}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('customers.address.street')}
              value={formData.address?.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={t('customers.address.city')}
              value={formData.address?.city || ''}
              onChange={(e) => handleAddressChange('city', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={t('customers.address.zipCode')}
              value={formData.address?.zipCode || ''}
              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={t('customers.address.country')}
              value={formData.address?.country || ''}
              onChange={(e) => handleAddressChange('country', e.target.value)}
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('customers.notes')}
              multiline
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t('customers.notesPlaceholder')}
            />
          </Grid>

          {/* Customer Stats (Edit Mode Only) */}
          {isEditMode && customer && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t('customers.customerStats')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="h6" color="primary">
                        {customer.totalRepairs}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('customers.totalRepairs')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="h6" color="primary">
                        €{customer.totalSpent}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('customers.totalSpent')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('customers.lastVisit')}: {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : t('customers.never')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('customers.memberSince')}: {new Date(customer.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? t('common.saving') : isEditMode ? t('common.update') : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDialog;
