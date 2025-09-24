import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  useTheme,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  AccountCircle,
  QrCode as QrCodeIcon,
  AttachMoney as CashIcon,
  CreditCard as CardIcon
} from '@mui/icons-material';
import { useResponsiveData } from '../../hooks/useResponsiveData';

interface CartItem {
  id: string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
  total: number;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Product {
  id: string;
  name: string;
  variant?: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
}

const POSTerminal: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'CARD' | 'SUMUP'>('CARD');
  const [cashReceived, setCashReceived] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Dynamic data management for products
  const [productsData, productsActions] = useResponsiveData({
    endpoint: '/inventory/products',
    realTime: false, // Disabled temporarily
    autoRefresh: false, // Disabled temporarily
    pageSize: 50
  });

  const filteredProducts = productsData.data.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.variant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        variant: product.variant,
        price: product.price,
        quantity: 1,
        total: product.price
      }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
      setCart(cart.map(item =>
        item.id === id
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      ));
  };

  const getSubtotal = () => cart.reduce((sum, item) => sum + item.total, 0);
  const getTax = () => getSubtotal() * 0.19; // 19% tax
  const getTotal = () => getSubtotal() + getTax();
  const getChange = () => {
    const cash = parseFloat(cashReceived) || 0;
    return cash - getTotal();
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);
    try {
      // Create POS order
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        customer: customer,
        subtotal: getSubtotal(),
        tax: getTax(),
        total: getTotal(),
        paymentMethod: selectedPaymentMethod,
        cashReceived: selectedPaymentMethod === 'CASH' ? parseFloat(cashReceived) : 0
      };

      // Here you would call the API to create the order
      console.log('Processing payment:', orderData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and close dialog
      setCart([]);
      setPaymentDialogOpen(false);
      setCashReceived('');
      setCustomer(null);
      
    } catch (error) {
      console.error('Payment processing failed:', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const renderProductCard = (product: Product) => (
                <Card 
      key={product.id} 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { 
          boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
          transition: 'all 0.2s ease'
                    }
                  }}
                  onClick={() => addToCart(product)}
                >
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
                        {product.name}
                      </Typography>
                      {product.variant && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {product.variant}
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary">
            €{product.price.toFixed(2)}
          </Typography>
                        <Chip 
            label={`Stock: ${product.stock}`} 
            color={product.stock > 0 ? 'success' : 'error'}
                          size="small" 
                        />
                    </Box>
        <Typography variant="caption" color="text.secondary">
          SKU: {product.sku}
                    </Typography>
                  </CardContent>
                </Card>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            POS Terminal
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<AccountCircle />}>
              Customer
            </Button>
            <Button variant="outlined" startIcon={<QrCodeIcon />}>
              Scan
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flex: 1, gap: 2, overflow: 'hidden' }}>
        {/* Products Section */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Search */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Paper>

          {/* Loading State */}
          {productsData.loading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                Loading products...
          </Typography>
        </Box>
          )}

          {/* Error State */}
          {productsData.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {productsData.error}
            </Alert>
          )}

          {/* Products Grid */}
          <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 2,
            p: 1
          }}>
            {filteredProducts.map(renderProductCard)}
          </Box>
        </Box>

        {/* Cart Section */}
        <Paper sx={{ width: 400, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold">
              Cart ({cart.length} items)
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {cart.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Cart is empty
              </Typography>
            ) : (
              <List>
          {cart.map((item) => (
                  <ListItem key={item.id} sx={{ px: 0 }}>
              <ListItemText
                primary={item.name}
                secondary={item.variant}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  size="small" 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <RemoveIcon />
                </IconButton>
                      <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center' }}>
                  {item.quantity}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <AddIcon />
                </IconButton>
                      <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'right' }}>
                  €{item.total.toFixed(2)}
                </Typography>
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => removeFromCart(item.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
            )}
          </Box>

        {/* Cart Summary */}
          {cart.length > 0 && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Subtotal:</Typography>
            <Typography>€{getSubtotal().toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Tax (19%):</Typography>
            <Typography>€{getTax().toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Total:</Typography>
                <Typography variant="h6" fontWeight="bold">€{getTotal().toFixed(2)}</Typography>
          </Box>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PaymentIcon />}
            onClick={() => setPaymentDialogOpen(true)}
                size="large"
          >
            Process Payment
          </Button>
        </Box>
          )}
      </Paper>
      </Box>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Total: €{getTotal().toFixed(2)}
          </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Payment Method
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={selectedPaymentMethod === 'CASH' ? 'contained' : 'outlined'}
                startIcon={<CashIcon />}
                onClick={() => setSelectedPaymentMethod('CASH')}
              >
                Cash
              </Button>
              <Button
                variant={selectedPaymentMethod === 'CARD' ? 'contained' : 'outlined'}
                startIcon={<CardIcon />}
                onClick={() => setSelectedPaymentMethod('CARD')}
              >
                Card
              </Button>
              <Button
                variant={selectedPaymentMethod === 'SUMUP' ? 'contained' : 'outlined'}
                startIcon={<PaymentIcon />}
                onClick={() => setSelectedPaymentMethod('SUMUP')}
              >
                SumUp
              </Button>
            </Box>
          </Box>

          {selectedPaymentMethod === 'CASH' && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Cash Received"
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                InputProps={{
                  startAdornment: <Typography>€</Typography>,
                }}
              />
              {parseFloat(cashReceived) > getTotal() && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Change: €{getChange().toFixed(2)}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={processPayment}
            disabled={isProcessingPayment || (selectedPaymentMethod === 'CASH' && parseFloat(cashReceived) < getTotal())}
            startIcon={isProcessingPayment ? <LinearProgress /> : <PaymentIcon />}
          >
            {isProcessingPayment ? 'Processing...' : 'Complete Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default POSTerminal;
