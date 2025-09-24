import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import DashboardHeader from '../../components/Layout/DashboardHeader';

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  contactInfo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const BrandsPage: React.FC = () => {
  const { token } = useAppSelector((state) => state.auth);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    website: '',
    contactInfo: '',
    isActive: true
  });

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/brands', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }

      const result = await response.json();
      setBrands(result.data);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleCreateBrand = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/v1/brands', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create brand');
      }

      const result = await response.json();
      setBrands([...brands, result.data]);
      setCreateDialog(false);
      resetForm();
    } catch (err) {
      console.error('Error creating brand:', err);
      setError(err instanceof Error ? err.message : 'Failed to create brand');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBrand = async () => {
    if (!selectedBrand) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/v1/brands/${selectedBrand.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update brand');
      }

      const result = await response.json();
      setBrands(brands.map(brand => 
        brand.id === selectedBrand.id ? result.data : brand
      ));
      setEditDialog(false);
      setSelectedBrand(null);
      resetForm();
    } catch (err) {
      console.error('Error updating brand:', err);
      setError(err instanceof Error ? err.message : 'Failed to update brand');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (brand: Brand) => {
    if (!window.confirm(`Are you sure you want to delete "${brand.name}"?`)) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/v1/brands/${brand.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete brand');
      }

      setBrands(brands.filter(b => b.id !== brand.id));
    } catch (err) {
      console.error('Error deleting brand:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete brand');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logo: '',
      website: '',
      contactInfo: '',
      isActive: true
    });
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logo: brand.logo || '',
      website: brand.website || '',
      contactInfo: brand.contactInfo || '',
      isActive: brand.isActive
    });
    setEditDialog(true);
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (brand.description && brand.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#EEF3FB' }}>
      <DashboardHeader />
      
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#49566F', mb: 1 }}>
              Product Brands
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your product brands and manufacturers
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
            sx={{
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Add Brand
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Card sx={{ mb: 3, borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#99A7BD' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                    backgroundColor: '#FFFFFF'
                  }
                }}
              />
              
              <IconButton onClick={fetchBrands} sx={{ color: '#3BB2FF' }}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>

        {/* Brands Table */}
        <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredBrands.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BusinessIcon sx={{ fontSize: 48, color: '#99A7BD', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#99A7BD', mb: 1 }}>
                  No brands found
                </Typography>
                <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                  {searchQuery ? 'Try adjusting your search criteria' : 'Add your first brand to get started'}
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Brand</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Website</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBrands.map((brand) => (
                      <TableRow key={brand.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={brand.logo}
                              sx={{ width: 40, height: 40, backgroundColor: '#E3F2FD' }}
                            >
                              {brand.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#49566F' }}>
                                {brand.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                                ID: {brand.id.slice(-8)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#49566F' }}>
                            {brand.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {brand.website ? (
                            <Button
                              size="small"
                              href={brand.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ textTransform: 'none' }}
                            >
                              Visit Website
                            </Button>
                          ) : (
                            <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={brand.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              backgroundColor: brand.isActive ? '#E8F5E8' : '#FFEBEE',
                              color: brand.isActive ? '#2E7D32' : '#D32F2F',
                              fontWeight: 500,
                              fontSize: '11px'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(brand)}
                              sx={{ color: '#6A6BFF' }}
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteBrand(brand)}
                              sx={{ color: '#F44336' }}
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Create Brand Dialog */}
        <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Add New Brand</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Brand Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Logo URL"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Contact Information"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                multiline
                rows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateBrand}
              variant="contained"
              disabled={loading || !formData.name}
              sx={{
                background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Create Brand
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Brand Dialog */}
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Edit Brand</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Brand Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Logo URL"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Contact Information"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                multiline
                rows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button
              onClick={handleUpdateBrand}
              variant="contained"
              disabled={loading || !formData.name}
              sx={{
                background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Update Brand
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default BrandsPage;

