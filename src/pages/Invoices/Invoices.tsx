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
  Avatar,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { useResponsiveData } from '../../hooks/useResponsiveData';
import ResponsiveGrid from '../../components/common/ResponsiveGrid';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  jobId: string;
  services: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'sumup';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  notes: string;
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

const Invoices: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openNewInvoiceDialog, setOpenNewInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Dynamic data management
  const [invoicesData, invoicesActions] = useResponsiveData({
    endpoint: '/invoices',
    realTime: false, // Disabled temporarily
    autoRefresh: false, // Disabled temporarily
    refreshInterval: 30000,
    pageSize: 10
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'info';
      case 'draft': return 'default';
      case 'overdue': return 'error';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <AttachMoneyIcon />;
      case 'card': return <CreditCardIcon />;
      case 'bank_transfer': return <AccountBalanceIcon />;
      case 'sumup': return <PaymentIcon />;
      default: return <PaymentIcon />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'success';
      case 'card': return 'primary';
      case 'bank_transfer': return 'info';
      case 'sumup': return 'warning';
      default: return 'default';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    invoicesActions.setSearchQuery(event.target.value);
  };

  const handleStatusFilter = (status: string) => {
    invoicesActions.setFilters({ ...invoicesData.filters, status });
  };

  const handlePaymentFilter = (paymentMethod: string) => {
    invoicesActions.setFilters({ ...invoicesData.filters, paymentMethod });
  };

  const handleCreateInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
    try {
      await invoicesActions.createItem(invoiceData);
      setOpenNewInvoiceDialog(false);
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  const handleUpdateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      await invoicesActions.updateItem(id, updates);
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Failed to update invoice:', error);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      await invoicesActions.deleteItem(id);
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  };

  const renderInvoiceCard = (invoice: Invoice) => (
    <Card key={invoice.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <ReceiptIcon />
          </Avatar>
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>
        
        <Typography variant="h6" component="h3" gutterBottom>
          {invoice.invoiceNumber}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {invoice.customerName}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip 
            label={invoice.status} 
            color={getStatusColor(invoice.status) as any}
            size="small"
          />
          <Chip 
            label={invoice.paymentMethod} 
            icon={getPaymentMethodIcon(invoice.paymentMethod)}
            color={getPaymentMethodColor(invoice.paymentMethod) as any}
            size="small"
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Issue Date
          </Typography>
          <Typography variant="body2">
            {new Date(invoice.issueDate).toLocaleDateString()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Due Date
          </Typography>
          <Typography variant="body2">
            {new Date(invoice.dueDate).toLocaleDateString()}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Subtotal
          </Typography>
          <Typography variant="body2">
            ${invoice.subtotal.toFixed(2)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Tax
          </Typography>
          <Typography variant="body2">
            ${invoice.tax.toFixed(2)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary">
            Total
          </Typography>
          <Typography variant="h6" color="primary">
            ${invoice.total.toFixed(2)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <IconButton size="small">
              <PrintIcon />
            </IconButton>
            <IconButton size="small">
              <EmailIcon />
            </IconButton>
            <IconButton size="small" onClick={() => setSelectedInvoice(invoice)}>
              <EditIcon />
            </IconButton>
          </Box>
          <IconButton size="small" onClick={() => handleDeleteInvoice(invoice.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const renderInvoiceTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Invoice #</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Issue Date</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoicesData.data.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <Typography variant="subtitle2">{invoice.invoiceNumber}</Typography>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="subtitle2">{invoice.customerName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {invoice.customerEmail}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                {new Date(invoice.issueDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" color="primary">
                  ${invoice.total.toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={invoice.status}
                  color={getStatusColor(invoice.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={invoice.paymentMethod}
                  icon={getPaymentMethodIcon(invoice.paymentMethod)}
                  color={getPaymentMethodColor(invoice.paymentMethod) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton size="small">
                  <PrintIcon />
                </IconButton>
                <IconButton size="small">
                  <EmailIcon />
                </IconButton>
                <IconButton size="small" onClick={() => setSelectedInvoice(invoice)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteInvoice(invoice.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Invoice Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewInvoiceDialog(true)}
          >
            Create Invoice
          </Button>
        </Box>
      </Box>
      
      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search invoices..."
                value={invoicesData.searchQuery}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={invoicesData.filters.status}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={invoicesData.filters.paymentMethod}
                  onChange={(e) => handlePaymentFilter(e.target.value)}
                  label="Payment Method"
                >
                  <MenuItem value="all">All Methods</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="sumup">SumUp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => invoicesActions.refreshData()}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading State */}
      {invoicesData.loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Loading invoices data...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {invoicesData.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {invoicesData.error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Grid View" />
          <Tab label="Table View" />
          <Tab label="Paid" />
          <Tab label="Overdue" />
        </Tabs>
      </Box>

      {/* Content */}
      {activeTab === 0 && (
        <ResponsiveGrid
          data={invoicesData.data}
          renderItem={renderInvoiceCard}
          loading={invoicesData.loading}
          empty={invoicesData.data.length === 0}
          pagination={invoicesData.pagination}
          onPageChange={invoicesActions.goToPage}
          onPageSizeChange={invoicesActions.changePageSize}
          viewMode={invoicesData.viewMode}
          onViewModeChange={invoicesActions.setViewMode}
          onRefresh={invoicesActions.refreshData}
        />
      )}

      {activeTab === 1 && renderInvoiceTable()}

      {activeTab === 2 && (
        <ResponsiveGrid
          data={invoicesData.data.filter(i => i.status === 'paid')}
          renderItem={renderInvoiceCard}
          loading={invoicesData.loading}
          empty={invoicesData.data.filter(i => i.status === 'paid').length === 0}
          pagination={invoicesData.pagination}
          onPageChange={invoicesActions.goToPage}
          onPageSizeChange={invoicesActions.changePageSize}
          viewMode={invoicesData.viewMode}
          onViewModeChange={invoicesActions.setViewMode}
          onRefresh={invoicesActions.refreshData}
        />
      )}

      {activeTab === 3 && (
        <ResponsiveGrid
          data={invoicesData.data.filter(i => i.status === 'overdue')}
          renderItem={renderInvoiceCard}
          loading={invoicesData.loading}
          empty={invoicesData.data.filter(i => i.status === 'overdue').length === 0}
          pagination={invoicesData.pagination}
          onPageChange={invoicesActions.goToPage}
          onPageSizeChange={invoicesActions.changePageSize}
          viewMode={invoicesData.viewMode}
          onViewModeChange={invoicesActions.setViewMode}
          onRefresh={invoicesActions.refreshData}
        />
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={openNewInvoiceDialog} onClose={() => setOpenNewInvoiceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogContent>
          {/* Add form here */}
          <Typography>Invoice form will be implemented here</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewInvoiceDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Invoice</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoices; 