import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import DashboardHeader from '../../components/Layout/DashboardHeader';

interface Expense {
  id: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  receiptUrl?: string;
  approvedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
}

interface ExpenseStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byCategory: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  totalAmount: number;
}

const ExpensesPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useAppSelector((state) => state.auth);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Dialogs
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    description: '',
    amount: 0,
    currency: 'EUR',
    date: new Date().toISOString().split('T')[0],
    receiptUrl: ''
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    color: '#3BB2FF'
  });

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchStats();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const result = await response.json();
      console.log('📊 Expenses API response:', result);
      
      // Handle response structure - check if data is wrapped or direct
      const expenses = Array.isArray(result) ? result : (result?.data || []);
      console.log('📊 Processed expenses:', expenses);
      
      setExpenses(expenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/expense-categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📂 Categories API response:', result);
        
        // Handle response structure - check if data is wrapped or direct
        const categories = Array.isArray(result) ? result : (result?.data || []);
        console.log('📂 Processed categories:', categories);
        
        setCategories(categories);
      }
    } catch (err) {
      console.error('Error fetching expense categories:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/expenses/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📈 Stats API response:', result);
        
        // Handle response structure - check if data is wrapped or direct
        const stats = result?.data || result || null;
        console.log('📈 Processed stats:', stats);
        
        setStats(stats);
      }
    } catch (err) {
      console.error('Error fetching expense stats:', err);
    }
  };

  const handleCreateExpense = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/v1/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create expense');
      }

      const result = await response.json();
      setExpenses([result.data, ...expenses]);
      setCreateDialog(false);
      resetForm();
      fetchStats();
    } catch (err) {
      console.error('Error creating expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExpense = async () => {
    if (!selectedExpense) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/v1/expenses/${selectedExpense.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, status: 'pending' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update expense');
      }

      const result = await response.json();
      setExpenses(expenses.map(expense => 
        expense.id === selectedExpense.id ? result.data : expense
      ));
      setEditDialog(false);
      setSelectedExpense(null);
      resetForm();
      fetchStats();
    } catch (err) {
      console.error('Error updating expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expense: Expense) => {
    if (!window.confirm(`Are you sure you want to delete this expense?`)) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/v1/expenses/${expense.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete expense');
      }

      setExpenses(expenses.filter(e => e.id !== expense.id));
      fetchStats();
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveExpense = async (expense: Expense) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/v1/expenses/${expense.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve expense');
      }

      const result = await response.json();
      setExpenses(expenses.map(e => 
        e.id === expense.id ? result.data : e
      ));
      fetchStats();
    } catch (err) {
      console.error('Error approving expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve expense');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/v1/expense-categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }

      const result = await response.json();
      setCategories([...categories, result.data]);
      setCategoryDialog(false);
      resetCategoryForm();
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      subcategory: '',
      description: '',
      amount: 0,
      currency: 'EUR',
      date: new Date().toISOString().split('T')[0],
      receiptUrl: ''
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      color: '#3BB2FF'
    });
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      category: expense.category,
      subcategory: expense.subcategory || '',
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      date: expense.date.split('T')[0],
      receiptUrl: expense.receiptUrl || ''
    });
    setEditDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon />;
      case 'rejected': return <CancelIcon />;
      default: return <PendingIcon />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || expense.status === statusFilter;
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#EEF3FB' }}>
      <DashboardHeader />
      
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#49566F', mb: 1 }}>
              Expense Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage business expenses
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CategoryIcon />}
              onClick={() => setCategoryDialog(true)}
              sx={{ borderRadius: '20px', textTransform: 'none' }}
            >
              Categories
            </Button>
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
              Add Expense
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: '18px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                        Total Expenses
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#49566F' }}>
                        {stats.total}
                      </Typography>
                    </Box>
                    <MoneyIcon sx={{ color: '#3BB2FF', fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: '18px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                        Pending
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#FF9800' }}>
                        {stats.pending}
                      </Typography>
                    </Box>
                    <PendingIcon sx={{ color: '#FF9800', fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: '18px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                        Approved
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                        {stats.approved}
                      </Typography>
                    </Box>
                    <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: '18px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                        Total Amount
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#49566F' }}>
                        {formatCurrency(stats.totalAmount)}
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search expenses..."
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
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: '15px' }}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    sx={{ borderRadius: '15px' }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.name}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <IconButton onClick={fetchExpenses} sx={{ color: '#3BB2FF' }}>
                  <RefreshIcon />
                </IconButton>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredExpenses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <MoneyIcon sx={{ fontSize: 48, color: '#99A7BD', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#99A7BD', mb: 1 }}>
                  No expenses found
                </Typography>
                <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                  {searchQuery ? 'Try adjusting your search criteria' : 'Add your first expense to get started'}
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#49566F' }}>
                              {expense.description}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                              by {expense.createdBy.firstName} {expense.createdBy.lastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#49566F' }}>
                            {expense.category}
                            {expense.subcategory && ` - ${expense.subcategory}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#49566F' }}>
                            {formatCurrency(expense.amount, expense.currency)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#49566F' }}>
                            {formatDate(expense.date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(expense.status)}
                            label={expense.status}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(expense.status)}15`,
                              color: getStatusColor(expense.status),
                              fontWeight: 500,
                              fontSize: '11px'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {expense.status === 'pending' && (
                              <IconButton
                                size="small"
                                onClick={() => handleApproveExpense(expense)}
                                sx={{ color: '#4CAF50' }}
                              >
                                <CheckCircleIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(expense)}
                              sx={{ color: '#6A6BFF' }}
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteExpense(expense)}
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

        {/* Create Expense Dialog */}
        <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Add New Expense</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category"
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.name}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={formData.currency}
                      label="Currency"
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    >
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="GBP">GBP</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Receipt URL"
                    value={formData.receiptUrl}
                    onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateExpense}
              variant="contained"
              disabled={loading || !formData.description || !formData.category || !formData.amount}
              sx={{
                background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Create Expense
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Expense Dialog */}
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Edit Expense</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category"
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.name}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={formData.currency}
                      label="Currency"
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    >
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="GBP">GBP</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Receipt URL"
                    value={formData.receiptUrl}
                    onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button
              onClick={handleUpdateExpense}
              variant="contained"
              disabled={loading || !formData.description || !formData.category || !formData.amount}
              sx={{
                background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Update Expense
            </Button>
          </DialogActions>
        </Dialog>

        {/* Category Dialog */}
        <Dialog open={categoryDialog} onClose={() => setCategoryDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Expense Categories</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Category Name"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Color"
                    type="color"
                    value={categoryFormData.color}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setCategoryDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateCategory}
              variant="contained"
              disabled={loading || !categoryFormData.name}
              sx={{
                background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Create Category
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ExpensesPage;

