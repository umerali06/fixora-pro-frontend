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
  Menu,
  ListItemIcon,
  ListItemText,
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
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { expensesAPI, expenseCategoriesAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface Expense {
  id: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  receiptUrl?: string;
  status: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  createdByUser?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedByUser?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
}

interface ExpenseStats {
  totalAmount: number;
  byCategory: Array<{
    category: string;
    _sum: { amount: number };
    _count: { id: number };
  }>;
}

const ExpensesPage: React.FC = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Form state
  const [createForm, setCreateForm] = useState({
    category: '',
    subcategory: '',
    description: '',
    amount: '',
    currency: 'EUR',
    date: new Date().toISOString().split('T')[0],
    receiptUrl: ''
  });

  const [editForm, setEditForm] = useState({
    id: '',
    category: '',
    subcategory: '',
    description: '',
    amount: '',
    currency: 'EUR',
    date: '',
    receiptUrl: '',
    status: 'pending'
  });

  // Fetch data
  const fetchExpensesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [expensesData, statsData] = await Promise.all([
        expensesAPI.getAll(),
        expensesAPI.getStats()
      ]);

      console.log('🔍 Expenses data:', expensesData);
      console.log('🔍 Stats data:', statsData);

      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching expenses data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses data. Please try again.');
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await expenseCategoriesAPI.getAll();
      console.log('🔍 Categories data:', categoriesData);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchExpensesData();
    fetchCategories();
  }, []);

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = !searchTerm || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.subcategory?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Handlers
  const handleCreateExpense = async () => {
    try {
      setLoading(true);

      const expenseData = {
        category: createForm.category,
        subcategory: createForm.subcategory || undefined,
        description: createForm.description,
        amount: parseFloat(createForm.amount),
        currency: createForm.currency,
        date: createForm.date,
        receiptUrl: createForm.receiptUrl || undefined
      };

      await expensesAPI.create(expenseData);
      toast.success('Expense created successfully!');
      setCreateDialog(false);
      setCreateForm({
        category: '',
        subcategory: '',
        description: '',
        amount: '',
        currency: 'EUR',
        date: new Date().toISOString().split('T')[0],
        receiptUrl: ''
      });
      await fetchExpensesData();
    } catch (err) {
      console.error('Error creating expense:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create expense. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setViewDialog(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditForm({
      id: expense.id,
      category: expense.category,
      subcategory: expense.subcategory || '',
      description: expense.description,
      amount: expense.amount.toString(),
      currency: expense.currency,
      date: expense.date.split('T')[0],
      receiptUrl: expense.receiptUrl || '',
      status: expense.status
    });
    setEditDialog(true);
  };

  const handleUpdateExpense = async () => {
    try {
      setLoading(true);

      const updateData = {
        category: editForm.category,
        subcategory: editForm.subcategory || undefined,
        description: editForm.description,
        amount: parseFloat(editForm.amount),
        currency: editForm.currency,
        date: editForm.date,
        receiptUrl: editForm.receiptUrl || undefined,
        status: editForm.status
      };

      await expensesAPI.update(editForm.id, updateData);
      toast.success('Expense updated successfully!');
      setEditDialog(false);
      setSelectedExpense(null);
      await fetchExpensesData();
    } catch (err) {
      console.error('Error updating expense:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update expense. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      setLoading(true);
      await expensesAPI.delete(expenseId);
      toast.success('Expense deleted successfully!');
      setDeleteDialog(false);
      setSelectedExpense(null);
      await fetchExpensesData();
    } catch (err) {
      console.error('Error deleting expense:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete expense. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, expense: Expense) => {
    setMenuAnchor(event.currentTarget);
    setSelectedExpense(expense);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircleIcon />;
      case 'pending':
        return <PendingIcon />;
      case 'rejected':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && expenses.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Dashboard Header */}
      <DashboardHeader />
      
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C' }}>
            Expense Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
            sx={{
              backgroundColor: '#3BB2FF',
              '&:hover': { backgroundColor: '#2A9CE8' }
            }}
          >
            Add Expense
          </Button>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                    {formatCurrency(stats.totalAmount, 'EUR')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Expenses
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                    {expenses.filter(e => e.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Pending Approval
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                    {expenses.filter(e => e.status === 'approved').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Approved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                    {expenses.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Entries
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Search and Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search expenses..."
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
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.name}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchExpensesData}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Expenses ({filteredExpenses.length})
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {expense.description}
                          </Typography>
                          {expense.subcategory && (
                            <Typography variant="caption" color="textSecondary">
                              {expense.subcategory}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={expense.category}
                          size="small"
                          icon={<CategoryIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(expense.amount, expense.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(expense.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={expense.status}
                          color={getStatusColor(expense.status) as any}
                          size="small"
                          icon={getStatusIcon(expense.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {expense.createdByUser?.firstName?.[0] || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {expense.createdByUser?.firstName} {expense.createdByUser?.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {expense.createdByUser?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuClick(e, expense)}
                          size="small"
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
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            selectedExpense && handleViewExpense(selectedExpense);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <ViewIcon />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            selectedExpense && handleEditExpense(selectedExpense);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            setDeleteDialog(true);
            handleMenuClose();
          }} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Create/Edit Expense Dialog */}
        <Dialog open={createDialog || editDialog} onClose={() => {
          setCreateDialog(false);
          setEditDialog(false);
          setSelectedExpense(null);
        }} maxWidth="md" fullWidth>
          <DialogTitle>{editDialog ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editDialog ? editForm.category : createForm.category}
                    label="Category"
                    onChange={(e) => {
                      if (editDialog) {
                        setEditForm({ ...editForm, category: e.target.value });
                      } else {
                        setCreateForm({ ...createForm, category: e.target.value });
                      }
                    }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.name}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Subcategory"
                  value={editDialog ? editForm.subcategory : createForm.subcategory}
                  onChange={(e) => {
                    if (editDialog) {
                      setEditForm({ ...editForm, subcategory: e.target.value });
                    } else {
                      setCreateForm({ ...createForm, subcategory: e.target.value });
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={editDialog ? editForm.description : createForm.description}
                  onChange={(e) => {
                    if (editDialog) {
                      setEditForm({ ...editForm, description: e.target.value });
                    } else {
                      setCreateForm({ ...createForm, description: e.target.value });
                    }
                  }}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={editDialog ? editForm.amount : createForm.amount}
                  onChange={(e) => {
                    if (editDialog) {
                      setEditForm({ ...editForm, amount: e.target.value });
                    } else {
                      setCreateForm({ ...createForm, amount: e.target.value });
                    }
                  }}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">€</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={editDialog ? editForm.currency : createForm.currency}
                    label="Currency"
                    onChange={(e) => {
                      if (editDialog) {
                        setEditForm({ ...editForm, currency: e.target.value });
                      } else {
                        setCreateForm({ ...createForm, currency: e.target.value });
                      }
                    }}
                  >
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={editDialog ? editForm.date : createForm.date}
                  onChange={(e) => {
                    if (editDialog) {
                      setEditForm({ ...editForm, date: e.target.value });
                    } else {
                      setCreateForm({ ...createForm, date: e.target.value });
                    }
                  }}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Receipt URL"
                  value={editDialog ? editForm.receiptUrl : createForm.receiptUrl}
                  onChange={(e) => {
                    if (editDialog) {
                      setEditForm({ ...editForm, receiptUrl: e.target.value });
                    } else {
                      setCreateForm({ ...createForm, receiptUrl: e.target.value });
                    }
                  }}
                />
              </Grid>
              {editDialog && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editForm.status}
                      label="Status"
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCreateDialog(false);
              setEditDialog(false);
              setSelectedExpense(null);
            }}>Cancel</Button>
            <Button 
              onClick={editDialog ? handleUpdateExpense : handleCreateExpense} 
              variant="contained" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : (editDialog ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Expense Details Dialog */}
        <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Expense Details</DialogTitle>
          <DialogContent>
            {selectedExpense ? (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedExpense.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip 
                    label={selectedExpense.status} 
                    color={getStatusColor(selectedExpense.status) as any}
                    size="small"
                    icon={getStatusIcon(selectedExpense.status)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {selectedExpense.category}
                    {selectedExpense.subcategory && ` - ${selectedExpense.subcategory}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Amount
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedExpense.date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Created By
                  </Typography>
                  <Typography variant="body1">
                    {selectedExpense.createdByUser?.firstName} {selectedExpense.createdByUser?.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedExpense.createdByUser?.email}
                  </Typography>
                </Grid>
                {selectedExpense.receiptUrl && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Receipt
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<ReceiptIcon />}
                      href={selectedExpense.receiptUrl}
                      target="_blank"
                    >
                      View Receipt
                    </Button>
                  </Grid>
                )}
                {selectedExpense.approvedByUser && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Approved By
                    </Typography>
                    <Typography variant="body1">
                      {selectedExpense.approvedByUser.firstName} {selectedExpense.approvedByUser.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedExpense.approvedByUser.email}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  No expense selected
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Delete Expense</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this expense? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => selectedExpense && handleDeleteExpense(selectedExpense.id)} 
              color="error" 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ExpensesPage;
