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
  InputAdornment,
  Switch,
  FormControlLabel,
  Autocomplete,
} from '@mui/material';
import {
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Euro as EuroIcon,
  QrCode as QrCodeIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { InventoryItem } from '../../store/slices/inventorySlice';

interface InventoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<InventoryItem>) => void;
  item?: InventoryItem | null;
  loading?: boolean;
  categories?: string[];
  locations?: string[];
}

const InventoryDialog: React.FC<InventoryDialogProps> = ({
  open,
  onClose,
  onSave,
  item,
  loading = false,
  categories = [],
  locations = [],
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    productName: '',
    sku: '',
    category: '',
    variant: '',
    quantity: 0,
    minQuantity: 5,
    price: 0,
    costPrice: 0,
    location: '',
    status: 'IN_STOCK',
    description: '',
    supplier: '',
    barcode: '',
    tags: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        tags: item.tags || [],
      });
    } else {
      setFormData({
        productName: '',
        sku: '',
        category: '',
        variant: '',
        quantity: 0,
        minQuantity: 5,
        price: 0,
        costPrice: 0,
        location: '',
        status: 'IN_STOCK',
        description: '',
        supplier: '',
        barcode: '',
        tags: [],
      });
    }
    setErrors({});
  }, [item, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName?.trim()) {
      newErrors.productName = t('validation.required');
    }

    if (!formData.sku?.trim()) {
      newErrors.sku = t('validation.required');
    }

    if (!formData.category?.trim()) {
      newErrors.category = t('validation.required');
    }

    if (formData.quantity === undefined || formData.quantity < 0) {
      newErrors.quantity = t('validation.positiveNumber');
    }

    if (formData.minQuantity === undefined || formData.minQuantity < 0) {
      newErrors.minQuantity = t('validation.positiveNumber');
    }

    if (formData.price === undefined || formData.price < 0) {
      newErrors.price = t('validation.positiveNumber');
    }

    if (formData.costPrice === undefined || formData.costPrice < 0) {
      newErrors.costPrice = t('validation.positiveNumber');
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

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  };

  const getStatusOptions = () => [
    { value: 'IN_STOCK', label: t('inventory.status.inStock'), color: 'success' },
    { value: 'LOW_STOCK', label: t('inventory.status.lowStock'), color: 'warning' },
    { value: 'OUT_OF_STOCK', label: t('inventory.status.outOfStock'), color: 'error' },
    { value: 'DISCONTINUED', label: t('inventory.status.discontinued'), color: 'default' },
  ];

  const isEditMode = !!item;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '700px',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon color="primary" />
            <Typography variant="h6">
              {isEditMode ? t('inventory.editItem') : t('inventory.addItem')}
            </Typography>
            {isEditMode && item && (
              <Chip
                label={getStatusOptions().find(s => s.value === item.status)?.label}
                color={getStatusOptions().find(s => s.value === item.status)?.color as any}
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
          {/* Basic Information */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <InfoIcon color="action" />
              <Typography variant="h6" color="text.secondary">
                {t('inventory.basicInfo')}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label={t('inventory.productName')}
              value={formData.productName || ''}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              error={!!errors.productName}
              helperText={errors.productName}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t('inventory.variant')}
              value={formData.variant || ''}
              onChange={(e) => handleInputChange('variant', e.target.value)}
              placeholder={t('inventory.variantPlaceholder')}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('inventory.sku')}
              value={formData.sku || ''}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              error={!!errors.sku}
              helperText={errors.sku}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('inventory.barcode')}
              value={formData.barcode || ''}
              onChange={(e) => handleInputChange('barcode', e.target.value)}
              InputProps={{
                startAdornment: <QrCodeIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              freeSolo
              options={categories}
              value={formData.category || ''}
              onChange={(_, value) => handleInputChange('category', value || '')}
              onInputChange={(_, value) => handleInputChange('category', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('inventory.category')}
                  error={!!errors.category}
                  helperText={errors.category}
                  required
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <CategoryIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              freeSolo
              options={locations}
              value={formData.location || ''}
              onChange={(_, value) => handleInputChange('location', value || '')}
              onInputChange={(_, value) => handleInputChange('location', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('inventory.location')}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              )}
            />
          </Grid>

          {/* Quantity and Pricing */}
          <Grid item xs={12}>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
              {t('inventory.quantityPricing')}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label={t('inventory.quantity')}
              value={formData.quantity || 0}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
              error={!!errors.quantity}
              helperText={errors.quantity}
              inputProps={{ min: 0 }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label={t('inventory.minQuantity')}
              value={formData.minQuantity || 0}
              onChange={(e) => handleInputChange('minQuantity', parseInt(e.target.value) || 0)}
              error={!!errors.minQuantity}
              helperText={errors.minQuantity}
              inputProps={{ min: 0 }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label={t('inventory.price')}
              value={formData.price || 0}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              error={!!errors.price}
              helperText={errors.price}
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{
                startAdornment: <EuroIcon color="action" sx={{ mr: 0.5 }} />,
              }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label={t('inventory.costPrice')}
              value={formData.costPrice || 0}
              onChange={(e) => handleInputChange('costPrice', parseFloat(e.target.value) || 0)}
              error={!!errors.costPrice}
              helperText={errors.costPrice}
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{
                startAdornment: <EuroIcon color="action" sx={{ mr: 0.5 }} />,
              }}
              required
            />
          </Grid>

          {/* Status and Additional Info */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('inventory.status.label')}</InputLabel>
              <Select
                value={formData.status || 'IN_STOCK'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                label={t('inventory.status.label')}
              >
                {getStatusOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Chip
                      label={option.label}
                      color={option.color as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('inventory.supplier')}
              value={formData.supplier || ''}
              onChange={(e) => handleInputChange('supplier', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('inventory.description')}
              multiline
              rows={3}
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('inventory.descriptionPlaceholder')}
            />
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {t('inventory.tags')}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label={t('inventory.addTag')}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                InputProps={{
                  endAdornment: (
                    <Button onClick={handleAddTag} disabled={!tagInput.trim()}>
                      {t('common.add')}
                    </Button>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formData.tags?.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          {/* Profit Margin Calculation */}
          {formData.price && formData.costPrice && (
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 1, 
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="h6" gutterBottom>
                  {t('inventory.profitAnalysis')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      {t('inventory.profit')}
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      €{((formData.price || 0) - (formData.costPrice || 0)).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      {t('inventory.margin')}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formData.price ? (((formData.price - formData.costPrice) / formData.price) * 100).toFixed(1) : 0}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      {t('inventory.totalValue')}
                    </Typography>
                    <Typography variant="h6">
                      €{((formData.quantity || 0) * (formData.price || 0)).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      {t('inventory.totalCost')}
                    </Typography>
                    <Typography variant="h6">
                      €{((formData.quantity || 0) * (formData.costPrice || 0)).toFixed(2)}
                    </Typography>
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

export default InventoryDialog;
