import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

interface CustomerCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  customerCount: number;
}

interface CustomerCategoriesProps {
  orgId: string;
  onCategoryChange?: () => void;
}

const CustomerCategories: React.FC<CustomerCategoriesProps> = ({ orgId, onCategoryChange }) => {
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomerCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#1976d2'
  });

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll use predefined categories until we implement the backend
      const defaultCategories: CustomerCategory[] = [
        { id: '1', name: 'VIP', description: 'Very Important Customers', color: '#FFD700', customerCount: 0 },
        { id: '2', name: 'Regular', description: 'Regular customers', color: '#4CAF50', customerCount: 0 },
        { id: '3', name: 'New', description: 'New customers', color: '#2196F3', customerCount: 0 },
        { id: '4', name: 'Inactive', description: 'Inactive customers', color: '#9E9E9E', customerCount: 0 }
      ];
      
      setCategories(defaultCategories);
    } catch (error) {
      setError('Failed to load categories');
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [orgId]);

  const handleOpenDialog = (category?: CustomerCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#1976d2'
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#1976d2'
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#1976d2'
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        const updatedCategories = categories.map(cat =>
          cat.id === editingCategory.id
            ? { ...cat, ...formData }
            : cat
        );
        setCategories(updatedCategories);
      } else {
        // Add new category
        const newCategory: CustomerCategory = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          color: formData.color,
          customerCount: 0
        };
        setCategories([...categories, newCategory]);
      }

      handleCloseDialog();
      onCategoryChange?.();
    } catch (error) {
      setError('Failed to save category');
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const updatedCategories = categories.filter(cat => cat.id !== categoryId);
        setCategories(updatedCategories);
        onCategoryChange?.();
      } catch (error) {
        setError('Failed to delete category');
        console.error('Error deleting category:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <CategoryIcon />
              Customer Categories
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              size="small"
            >
              Add Category
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <List>
            {categories.map((category) => (
              <ListItem key={category.id} divider>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: category.color,
                      border: '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                  <ListItemText
                    primary={category.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {category.description}
                        </Typography>
                        <Chip
                          label={`${category.customerCount} customers`}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    }
                  />
                </Box>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(category)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(category.id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              margin="normal"
              sx={{ '& input': { height: 60 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerCategories;
