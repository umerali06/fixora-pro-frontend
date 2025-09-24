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
  Switch,
  FormControlLabel,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Notifications,
  Storage as StorageIcon,
  Usb as UsbIcon,
  Wifi as WifiIcon,
  CreditCard as CreditCardIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Build as TestConnectionIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | 'warning' | null>(null);

  // Mock settings state
  const [settings, setSettings] = useState({
    business: {
      name: 'FIXORA PRO',
      address: '123 Repair Street, Tech City, TC 12345',
      phone: '+1 555-0123',
      email: 'info@fixorapro.com',
      website: 'www.fixorapro.com',
      taxRate: 10.0,
    currency: 'EUR',
      timezone: 'Europe/Berlin'
    },
    payment: {
      sumupEnabled: true,
      sumupApiKey: 'sk_test_123456789',
      sumupTerminalId: 'T123456789',
      cashRegisterEnabled: true,
      receiptPrinter: 'USB_THERMAL_PRINTER',
      cashDrawer: 'USB_CASH_DRAWER',
      autoOpenDrawer: true
    },
    signature: {
      signatureDeviceEnabled: true,
      deviceType: 'usb',
      deviceModel: 'Wacom Intuos',
      autoCapture: true,
      signatureFormat: 'PNG'
    },
    language: {
      currentLanguage: 'en',
      availableLanguages: ['en', 'de']
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      lowStockAlerts: true,
      overdueInvoiceAlerts: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      backupEnabled: true,
      backupFrequency: 'daily'
    }
  });

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const testConnection = (type: string) => {
    setOpenTestDialog(true);
    // Simulate connection test
    setTimeout(() => {
      setTestResult('success');
      setTimeout(() => {
        setOpenTestDialog(false);
        setTestResult(null);
      }, 2000);
    }, 1500);
  };

  const getTestResultIcon = () => {
    switch (testResult) {
      case 'success': return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
      case 'error': return <ErrorIcon sx={{ color: '#F44336' }} />;
      case 'warning': return <WarningIcon sx={{ color: '#FF9800' }} />;
      default: return <InfoIcon sx={{ color: '#2196F3' }} />;
    }
  };

  const getTestResultMessage = () => {
    switch (testResult) {
      case 'success': return 'Connection successful!';
      case 'error': return 'Connection failed. Please check your settings.';
      case 'warning': return 'Connection established with warnings.';
      default: return 'Testing connection...';
    }
  };

  const settingSections: SettingSection[] = [
    {
      id: 'business',
      title: 'Business Information',
      description: 'Configure your business details and preferences',
      icon: <BusinessIcon />,
      content: (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
              label="Business Name"
              value={settings.business.name}
              onChange={(e) => handleSettingChange('business', 'name', e.target.value)}
              sx={{ mb: 2 }}
            />
              <TextField
                fullWidth
              label="Address"
                multiline
                rows={2}
              value={settings.business.address}
              onChange={(e) => handleSettingChange('business', 'address', e.target.value)}
              sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
              label="Phone"
              value={settings.business.phone}
              onChange={(e) => handleSettingChange('business', 'phone', e.target.value)}
              sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
              label="Email"
              value={settings.business.email}
              onChange={(e) => handleSettingChange('business', 'email', e.target.value)}
              sx={{ mb: 2 }}
            />
              <TextField
                fullWidth
              label="Website"
              value={settings.business.website}
              onChange={(e) => handleSettingChange('business', 'website', e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Currency</InputLabel>
                <Select
                value={settings.business.currency}
                onChange={(e) => handleSettingChange('business', 'currency', e.target.value)}
                  label="Currency"
                >
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                </Select>
              </FormControl>
            <TextField
              fullWidth
              label="Tax Rate (%)"
              type="number"
              value={settings.business.taxRate}
              onChange={(e) => handleSettingChange('business', 'taxRate', parseFloat(e.target.value))}
              sx={{ mb: 2 }}
            />
            </Grid>
          </Grid>
      )
    },
    {
      id: 'payment',
      title: 'Payment & POS Settings',
      description: 'Configure SumUp integration and cash register settings',
      icon: <PaymentIcon />,
      content: (
        <Grid container spacing={3}>
            <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, color: '#24324A' }}>
                SumUp Integration
              </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.payment.sumupEnabled}
                  onChange={(e) => handleSettingChange('payment', 'sumupEnabled', e.target.checked)}
                />
              }
              label="Enable SumUp Card Payments"
              sx={{ mb: 2 }}
            />
            {settings.payment.sumupEnabled && (
              <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="SumUp API Key"
                  value={settings.payment.sumupApiKey}
                  onChange={(e) => handleSettingChange('payment', 'sumupApiKey', e.target.value)}
                  sx={{ mb: 2 }}
                />
              <TextField
                fullWidth
                  label="Terminal ID"
                  value={settings.payment.sumupTerminalId}
                  onChange={(e) => handleSettingChange('payment', 'sumupTerminalId', e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<TestConnectionIcon />}
                  onClick={() => testConnection('sumup')}
                  sx={{ mr: 2 }}
                >
                  Test Connection
                </Button>
                <Chip
                  icon={<CreditCardIcon />}
                  label="SumUp Connected"
                  color="success"
                  size="small"
                />
              </Box>
            )}
            </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, color: '#24324A' }}>
              Cash Register Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.payment.cashRegisterEnabled}
                  onChange={(e) => handleSettingChange('payment', 'cashRegisterEnabled', e.target.checked)}
                />
              }
              label="Enable Cash Register"
              sx={{ mb: 2 }}
            />
            {settings.payment.cashRegisterEnabled && (
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Receipt Printer</InputLabel>
                  <Select
                    value={settings.payment.receiptPrinter}
                    onChange={(e) => handleSettingChange('payment', 'receiptPrinter', e.target.value)}
                    label="Receipt Printer"
                  >
                    <MenuItem value="USB_THERMAL_PRINTER">USB Thermal Printer</MenuItem>
                    <MenuItem value="NETWORK_PRINTER">Network Printer</MenuItem>
                    <MenuItem value="BLUETOOTH_PRINTER">Bluetooth Printer</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Cash Drawer</InputLabel>
                <Select
                    value={settings.payment.cashDrawer}
                    onChange={(e) => handleSettingChange('payment', 'cashDrawer', e.target.value)}
                    label="Cash Drawer"
                  >
                    <MenuItem value="USB_CASH_DRAWER">USB Cash Drawer</MenuItem>
                    <MenuItem value="SERIAL_CASH_DRAWER">Serial Cash Drawer</MenuItem>
                    <MenuItem value="NETWORK_CASH_DRAWER">Network Cash Drawer</MenuItem>
                </Select>
              </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.payment.autoOpenDrawer}
                      onChange={(e) => handleSettingChange('payment', 'autoOpenDrawer', e.target.checked)}
                    />
                  }
                  label="Auto-open cash drawer on cash payment"
                  sx={{ mb: 2 }}
                />
              <Button
                variant="outlined"
                startIcon={<TestConnectionIcon />}
                  onClick={() => testConnection('cash_register')}
                  sx={{ mr: 2 }}
                >
                  Test Cash Register
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => testConnection('printer')}
                >
                  Test Printer
              </Button>
              </Box>
            )}
            </Grid>
          </Grid>
      )
    },
    {
      id: 'signature',
      title: 'Signature Device',
      description: 'Configure external signature pad settings',
      icon: <UsbIcon />,
      content: (
        <Grid container spacing={3}>
            <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.signature.signatureDeviceEnabled}
                  onChange={(e) => handleSettingChange('signature', 'signatureDeviceEnabled', e.target.checked)}
                />
              }
              label="Enable External Signature Device"
              sx={{ mb: 2 }}
            />
            {settings.signature.signatureDeviceEnabled && (
              <Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Device Type</InputLabel>
                <Select
                    value={settings.signature.deviceType}
                    onChange={(e) => handleSettingChange('signature', 'deviceType', e.target.value)}
                    label="Device Type"
                  >
                    <MenuItem value="usb">USB Signature Pad</MenuItem>
                    <MenuItem value="bluetooth">Bluetooth Signature Pad</MenuItem>
                    <MenuItem value="wifi">WiFi Signature Pad</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                  label="Device Model"
                  value={settings.signature.deviceModel}
                  onChange={(e) => handleSettingChange('signature', 'deviceModel', e.target.value)}
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.signature.autoCapture}
                      onChange={(e) => handleSettingChange('signature', 'autoCapture', e.target.checked)}
                    />
                  }
                  label="Auto-capture signature"
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Signature Format</InputLabel>
                  <Select
                    value={settings.signature.signatureFormat}
                    onChange={(e) => handleSettingChange('signature', 'signatureFormat', e.target.value)}
                    label="Signature Format"
                  >
                    <MenuItem value="PNG">PNG</MenuItem>
                    <MenuItem value="JPG">JPG</MenuItem>
                    <MenuItem value="SVG">SVG</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<TestConnectionIcon />}
                  onClick={() => testConnection('signature')}
                >
                  Test Signature Device
                </Button>
              </Box>
            )}
            </Grid>
            </Grid>
      )
    },
    {
      id: 'language',
      title: 'Language & Localization',
      description: 'Configure language preferences and localization',
      icon: <LanguageIcon />,
      content: (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Language</InputLabel>
                <Select
                value={settings.language.currentLanguage}
                onChange={(e) => handleSettingChange('language', 'currentLanguage', e.target.value)}
                label="Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="de">Deutsch (German)</MenuItem>
                </Select>
              </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Available languages: English, German
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Language changes will be applied immediately. Some features may require a page refresh.
            </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, color: '#24324A' }}>
              Date & Time Format
              </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Date Format</InputLabel>
              <Select label="Date Format">
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Time Format</InputLabel>
              <Select label="Time Format">
                <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                <MenuItem value="24h">24-hour</MenuItem>
                </Select>
              </FormControl>
            </Grid>
        </Grid>
      )
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure notification preferences',
      icon: <Notifications />,
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, color: '#24324A' }}>
              Notification Channels
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                />
              }
              label="Email Notifications"
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                />
              }
              label="SMS Notifications"
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                />
              }
              label="Push Notifications"
              sx={{ mb: 2 }}
            />
          </Grid>
            <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, color: '#24324A' }}>
              Alert Types
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.lowStockAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'lowStockAlerts', e.target.checked)}
                />
              }
              label="Low Stock Alerts"
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.overdueInvoiceAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'overdueInvoiceAlerts', e.target.checked)}
                />
              }
              label="Overdue Invoice Alerts"
              sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
      )
    },
    {
      id: 'security',
      title: 'Security & Backup',
      description: 'Configure security settings and backup preferences',
      icon: <SecurityIcon />,
      content: (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, color: '#24324A' }}>
              Security Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                />
              }
              label="Two-Factor Authentication"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Session Timeout (minutes)</InputLabel>
              <Select
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                label="Session Timeout (minutes)"
              >
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={60}>1 hour</MenuItem>
                <MenuItem value={120}>2 hours</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Password Policy</InputLabel>
                <Select
                value={settings.security.passwordPolicy}
                onChange={(e) => handleSettingChange('security', 'passwordPolicy', e.target.value)}
                label="Password Policy"
              >
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="strong">Strong</MenuItem>
                <MenuItem value="very_strong">Very Strong</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, color: '#24324A' }}>
              Backup Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.security.backupEnabled}
                  onChange={(e) => handleSettingChange('security', 'backupEnabled', e.target.checked)}
                />
              }
              label="Enable Automatic Backup"
              sx={{ mb: 2 }}
            />
            {settings.security.backupEnabled && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Backup Frequency</InputLabel>
                <Select
                  value={settings.security.backupFrequency}
                  onChange={(e) => handleSettingChange('security', 'backupFrequency', e.target.value)}
                  label="Backup Frequency"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            )}
            <Button
              variant="outlined"
              startIcon={<StorageIcon />}
              sx={{ mr: 2 }}
            >
              Manual Backup
            </Button>
            <Button
              variant="outlined"
              startIcon={<StorageIcon />}
            >
              Restore Backup
            </Button>
            </Grid>
          </Grid>
      )
    }
  ];

  return (
    <Box sx={{ 
      backgroundColor: '#F4F7FB',
      minHeight: '100vh',
      maxWidth: '1240px',
      mx: 'auto',
      px: 3,
      py: 2.5
    }}>
      {/* Header */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderRadius: '14px',
        border: '1px solid #E8EEF5',
        boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
        p: 3,
        mb: 2.5
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ 
            fontSize: '22px', 
            fontWeight: 800, 
            color: '#24324A'
          }}>
            System Settings
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ 
              backgroundColor: '#2F80ED',
              color: 'white',
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              '&:hover': { backgroundColor: '#2563EB' }
            }}
          >
            Save Changes
          </Button>
        </Box>
        <Typography sx={{ color: '#7D8DA5', fontSize: '14px' }}>
          Configure your system settings, integrations, and preferences
        </Typography>
      </Box>

      {/* Settings Sections */}
      <Grid container spacing={2.5}>
        {settingSections.map((section) => (
          <Grid item xs={12} key={section.id}>
            <Card sx={{ 
              backgroundColor: 'white',
              borderRadius: '14px',
              border: '1px solid #E8EEF5',
              boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
              '&:hover': { boxShadow: 'rgba(19, 33, 68, 0.08) 0 8px 20px' }
            }}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                      gap: 2
                    }
                  }}
                >
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    backgroundColor: '#E3F2FD', 
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    {section.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#24324A' }}>
                      {section.title}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#7D8DA5' }}>
                      {section.description}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {section.content}
                </AccordionDetails>
              </Accordion>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Test Connection Dialog */}
      <Dialog
        open={openTestDialog}
        onClose={() => setOpenTestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          fontSize: '18px', 
          fontWeight: 700, 
          color: '#24324A',
          borderBottom: '1px solid #E6ECF3',
          pb: 2
        }}>
          Testing Connection
        </DialogTitle>
        <DialogContent sx={{ pt: 2, textAlign: 'center' }}>
          <Box sx={{ py: 3 }}>
            {getTestResultIcon()}
            <Typography sx={{ mt: 2, color: '#24324A', fontWeight: 600 }}>
              {getTestResultMessage()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #E6ECF3' }}>
          <Button
            onClick={() => setOpenTestDialog(false)}
            sx={{ color: '#7D8DA5' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 