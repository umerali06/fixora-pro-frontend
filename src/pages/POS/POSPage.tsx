import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  useTheme,
  Fab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
}

const POSPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data
    const mockProducts: Product[] = [
      {
        id: 'PROD-001',
        name: 'iPhone 12 Screen Protector',
        category: 'Accessories',
        price: 19.99,
        stock: 50,
        sku: 'IP12-SP-001'
      },
      {
        id: 'PROD-002',
        name: 'Samsung Galaxy Charging Cable',
        category: 'Cables',
        price: 12.99,
        stock: 100,
        sku: 'SG-CC-001'
      },
      {
        id: 'PROD-003',
        name: 'iPhone Battery Replacement',
        category: 'Parts',
        price: 45.99,
        stock: 25,
        sku: 'IP-BAT-001'
      },
      {
        id: 'PROD-004',
        name: 'Phone Repair Toolkit',
        category: 'Tools',
        price: 29.99,
        stock: 30,
        sku: 'TOOL-001'
      }
    ];
    
    setProducts(mockProducts);
    setLoading(false);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1, price: (item.quantity + 1) * product.price }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, price: product.price }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity, price: quantity * item.product.price }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setOpenCheckoutDialog(true);
  };

  const processPayment = () => {
    // Handle payment processing
    console.log('Processing payment:', { cart, customer: selectedCustomer, paymentMethod });
    setOpenCheckoutDialog(false);
    setCart([]);
    setSelectedCustomer(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Accessories':
        return 'primary';
      case 'Cables':
        return 'secondary';
      case 'Parts':
        return 'success';
      case 'Tools':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          {t('Point of Sale')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('Process sales and manage transactions')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Products Section */}
        <Grid item xs={12} md={8}>
          {/* Search and Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder={t('Search products...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>{t('Category')}</InputLabel>
                    <Select
                      value={categoryFilter}
                      label={t('Category')}
                      onChange={(e: SelectChangeEvent) => setCategoryFilter(e.target.value)}
                    >
                      <MenuItem value="all">{t('All Categories')}</MenuItem>
                      <MenuItem value="Accessories">{t('Accessories')}</MenuItem>
                      <MenuItem value="Cables">{t('Cables')}</MenuItem>
                      <MenuItem value="Parts">{t('Parts')}</MenuItem>
                      <MenuItem value="Tools">{t('Tools')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PersonIcon />}
                    onClick={() => setOpenCustomerDialog(true)}
                  >
                    {selectedCustomer ? t('Customer') : t('Select Customer')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <Grid container spacing={2}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-4px)', 
                      boxShadow: theme.shadows[8] 
                    }
                  }}
                  onClick={() => addToCart(product)}
                >
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                        {product.name}
                      </Typography>
                      <Chip 
                        label={product.category} 
                        color={getCategoryColor(product.category) as any}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        SKU: {product.sku}
                      </Typography>
                      <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('Stock')}: {product.stock}
                      </Typography>
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      {t('Add to Cart')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Cart Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CartIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('Shopping Cart')}
                </Typography>
                <Badge badgeContent={getCartItemCount()} color="primary" sx={{ ml: 'auto' }} />
              </Box>

              {cart.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    {t('Your cart is empty')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('Add products to get started')}
                  </Typography>
                </Box>
              ) : (
                <>
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {cart.map((item) => (
                      <ListItem key={item.product.id} sx={{ px: 0 }}>
                        <ListItemText
                          primary={item.product.name}
                          secondary={`$${item.product.price.toFixed(2)} x ${item.quantity}`}
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <AddIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">{t('Subtotal')}</Typography>
                      <Typography variant="body1">${getCartTotal().toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">{t('Tax (8.5%)')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${(getCartTotal() * 0.085).toFixed(2)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('Total')}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ${(getCartTotal() * 1.085).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<PaymentIcon />}
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    sx={{ py: 1.5 }}
                  >
                    {t('Checkout')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customer Selection Dialog */}
      <Dialog open={openCustomerDialog} onClose={() => setOpenCustomerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('Select Customer')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('Choose a customer for this transaction')}
          </Typography>
          <Typography variant="body1">
            {t('Customer selection interface will be implemented here')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCustomerDialog(false)}>{t('Cancel')}</Button>
          <Button variant="contained" onClick={() => setOpenCustomerDialog(false)}>{t('Select')}</Button>
        </DialogActions>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={openCheckoutDialog} onClose={() => setOpenCheckoutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('Checkout')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>{t('Order Summary')}</Typography>
            <List dense>
              {cart.map((item) => (
                <ListItem key={item.product.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={item.product.name}
                    secondary={`${item.quantity} x $${item.product.price.toFixed(2)}`}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ${item.price.toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">{t('Total')}</Typography>
              <Typography variant="h6" color="primary.main">
                ${(getCartTotal() * 1.085).toFixed(2)}
              </Typography>
            </Box>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t('Payment Method')}</InputLabel>
            <Select
              value={paymentMethod}
              label={t('Payment Method')}
              onChange={(e: SelectChangeEvent) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="cash">{t('Cash')}</MenuItem>
              <MenuItem value="card">{t('Credit/Debit Card')}</MenuItem>
              <MenuItem value="transfer">{t('Bank Transfer')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckoutDialog(false)}>{t('Cancel')}</Button>
          <Button variant="contained" onClick={processPayment} startIcon={<ReceiptIcon />}>
            {t('Complete Sale')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="view cart"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <CartIcon />
      </Fab>
    </Box>
  );
};

export default POSPage;
