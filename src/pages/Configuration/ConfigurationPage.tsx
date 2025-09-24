import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  AttachMoney as CurrencyIcon,
  Receipt as TaxIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { configurationAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`configuration-tabpanel-${index}`}
      aria-labelledby={`configuration-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface EmailConfig {
  provider: string;
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  secure: boolean;
  tls: boolean;
}

interface CurrencyConfig {
  defaultCurrency: string;
  symbol: string;
  position: 'before' | 'after';
  decimalPlaces: number;
  thousandSeparator: string;
  decimalSeparator: string;
  autoUpdateRates: boolean;
  exchangeApi: string;
}

interface TaxConfig {
  defaultTaxRate: number;
  inclusivePricing: boolean;
  displayOnInvoice: boolean;
  registrationNumber: string;
  country: string;
  region: string;
}

interface RecaptchaConfig {
  enabled: boolean;
  siteKey: string;
  secretKey: string;
  version: string;
  threshold: number;
}

const ConfigurationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email Configuration
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    provider: 'smtp',
    host: '',
    port: 587,
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    secure: false,
    tls: true
  });

  // Currency Configuration
  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig>({
    defaultCurrency: 'EUR',
    symbol: '€',
    position: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    autoUpdateRates: true,
    exchangeApi: 'fixer'
  });

  // Tax Configuration
  const [taxConfig, setTaxConfig] = useState<TaxConfig>({
    defaultTaxRate: 19,
    inclusivePricing: false,
    displayOnInvoice: true,
    registrationNumber: '',
    country: 'DE',
    region: ''
  });

  // reCAPTCHA Configuration
  const [recaptchaConfig, setRecaptchaConfig] = useState<RecaptchaConfig>({
    enabled: false,
    siteKey: '',
    secretKey: '',
    version: 'v3',
    threshold: 0.5
  });

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' }
  ];

  const countries = [
    { code: 'DE', name: 'Germany' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'AT', name: 'Austria' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'HU', name: 'Hungary' },
    { code: 'RU', name: 'Russia' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'SG', name: 'Singapore' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' },
    { code: 'MX', name: 'Mexico' },
    { code: 'ZA', name: 'South Africa' }
  ];

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all configurations in parallel
      const [emailRes, currencyRes, taxRes, recaptchaRes] = await Promise.all([
        configurationAPI.getEmailConfig(),
        configurationAPI.getCurrencyConfig(),
        configurationAPI.getTaxConfig(),
        configurationAPI.getRecaptchaConfig()
      ]);

      if (emailRes.success) {
        setEmailConfig(emailRes.data);
      }
      if (currencyRes.success) {
        setCurrencyConfig(currencyRes.data);
      }
      if (taxRes.success) {
        setTaxConfig(taxRes.data);
      }
      if (recaptchaRes.success) {
        setRecaptchaConfig(recaptchaRes.data);
      }
    } catch (err) {
      console.error('Error loading configurations:', err);
      setError('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmailConfig = async () => {
    setSaving(true);
    try {
      const response = await configurationAPI.updateEmailConfig(emailConfig);
      if (response.success) {
        toast.success('Email configuration saved successfully');
      } else {
        toast.error(response.error || 'Failed to save email configuration');
      }
    } catch (err) {
      console.error('Error saving email configuration:', err);
      toast.error('Failed to save email configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCurrencyConfig = async () => {
    setSaving(true);
    try {
      const response = await configurationAPI.updateCurrencyConfig(currencyConfig);
      if (response.success) {
        toast.success('Currency configuration saved successfully');
      } else {
        toast.error(response.error || 'Failed to save currency configuration');
      }
    } catch (err) {
      console.error('Error saving currency configuration:', err);
      toast.error('Failed to save currency configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTaxConfig = async () => {
    setSaving(true);
    try {
      const response = await configurationAPI.updateTaxConfig(taxConfig);
      if (response.success) {
        toast.success('Tax configuration saved successfully');
      } else {
        toast.error(response.error || 'Failed to save tax configuration');
      }
    } catch (err) {
      console.error('Error saving tax configuration:', err);
      toast.error('Failed to save tax configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRecaptchaConfig = async () => {
    setSaving(true);
    try {
      const response = await configurationAPI.updateRecaptchaConfig(recaptchaConfig);
      if (response.success) {
        toast.success('reCAPTCHA configuration saved successfully');
      } else {
        toast.error(response.error || 'Failed to save reCAPTCHA configuration');
      }
    } catch (err) {
      console.error('Error saving reCAPTCHA configuration:', err);
      toast.error('Failed to save reCAPTCHA configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleCurrencyChange = (field: keyof CurrencyConfig, value: any) => {
    setCurrencyConfig(prev => ({
      ...prev,
      [field]: value,
      // Auto-update symbol when currency changes
      ...(field === 'defaultCurrency' && {
        symbol: currencies.find(c => c.code === value)?.symbol || value
      })
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <DashboardHeader />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab 
                icon={<EmailIcon />} 
                label="Email" 
                iconPosition="start"
              />
              <Tab 
                icon={<CurrencyIcon />} 
                label="Currency" 
                iconPosition="start"
              />
              <Tab 
                icon={<TaxIcon />} 
                label="Tax" 
                iconPosition="start"
              />
              <Tab 
                icon={<SecurityIcon />} 
                label="reCAPTCHA" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Email Configuration Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Email Configuration
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Configure email settings for notifications and communications
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Email Provider</InputLabel>
                  <Select
                    value={emailConfig.provider}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, provider: e.target.value }))}
                  >
                    <MenuItem value="smtp">SMTP</MenuItem>
                    <MenuItem value="sendgrid">SendGrid</MenuItem>
                    <MenuItem value="mailgun">Mailgun</MenuItem>
                    <MenuItem value="ses">AWS SES</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  value={emailConfig.host}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, host: e.target.value }))}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Port"
                  type="number"
                  value={emailConfig.port}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={emailConfig.username}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, username: e.target.value }))}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={emailConfig.password}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, password: e.target.value }))}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Email"
                  type="email"
                  value={emailConfig.fromEmail}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Name"
                  value={emailConfig.fromName}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailConfig.secure}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, secure: e.target.checked }))}
                    />
                  }
                  label="Use SSL/TLS"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailConfig.tls}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, tls: e.target.checked }))}
                    />
                  }
                  label="Use STARTTLS"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSaveEmailConfig}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Email Configuration'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Currency Configuration Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Currency Configuration
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Configure currency settings and formatting
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Default Currency</InputLabel>
                  <Select
                    value={currencyConfig.defaultCurrency}
                    onChange={(e) => handleCurrencyChange('defaultCurrency', e.target.value)}
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Currency Symbol"
                  value={currencyConfig.symbol}
                  onChange={(e) => handleCurrencyChange('symbol', e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Symbol Position</InputLabel>
                  <Select
                    value={currencyConfig.position}
                    onChange={(e) => handleCurrencyChange('position', e.target.value)}
                  >
                    <MenuItem value="before">Before amount ($100)</MenuItem>
                    <MenuItem value="after">After amount (100$)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Decimal Places"
                  type="number"
                  value={currencyConfig.decimalPlaces}
                  onChange={(e) => handleCurrencyChange('decimalPlaces', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Thousand Separator"
                  value={currencyConfig.thousandSeparator}
                  onChange={(e) => handleCurrencyChange('thousandSeparator', e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Decimal Separator"
                  value={currencyConfig.decimalSeparator}
                  onChange={(e) => handleCurrencyChange('decimalSeparator', e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currencyConfig.autoUpdateRates}
                      onChange={(e) => handleCurrencyChange('autoUpdateRates', e.target.checked)}
                    />
                  }
                  label="Auto-update Exchange Rates"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Exchange Rate API</InputLabel>
                  <Select
                    value={currencyConfig.exchangeApi}
                    onChange={(e) => handleCurrencyChange('exchangeApi', e.target.value)}
                  >
                    <MenuItem value="fixer">Fixer.io</MenuItem>
                    <MenuItem value="exchangerate">ExchangeRate-API</MenuItem>
                    <MenuItem value="currencylayer">CurrencyLayer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSaveCurrencyConfig}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Currency Configuration'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tax Configuration Tab */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Tax Configuration
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Configure tax settings and compliance
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default Tax Rate (%)"
                  type="number"
                  value={taxConfig.defaultTaxRate}
                  onChange={(e) => setTaxConfig(prev => ({ ...prev, defaultTaxRate: parseFloat(e.target.value) }))}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={taxConfig.country}
                    onChange={(e) => setTaxConfig(prev => ({ ...prev, country: e.target.value }))}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Region/State"
                  value={taxConfig.region}
                  onChange={(e) => setTaxConfig(prev => ({ ...prev, region: e.target.value }))}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Registration Number"
                  value={taxConfig.registrationNumber}
                  onChange={(e) => setTaxConfig(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={taxConfig.inclusivePricing}
                      onChange={(e) => setTaxConfig(prev => ({ ...prev, inclusivePricing: e.target.checked }))}
                    />
                  }
                  label="Tax-Inclusive Pricing"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={taxConfig.displayOnInvoice}
                      onChange={(e) => setTaxConfig(prev => ({ ...prev, displayOnInvoice: e.target.checked }))}
                    />
                  }
                  label="Display Tax on Invoices"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSaveTaxConfig}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Tax Configuration'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* reCAPTCHA Configuration Tab */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  reCAPTCHA Configuration
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Configure reCAPTCHA v3 for form protection
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={recaptchaConfig.enabled}
                      onChange={(e) => setRecaptchaConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                    />
                  }
                  label="Enable reCAPTCHA"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Site Key"
                  value={recaptchaConfig.siteKey}
                  onChange={(e) => setRecaptchaConfig(prev => ({ ...prev, siteKey: e.target.value }))}
                  sx={{ mb: 2 }}
                  disabled={!recaptchaConfig.enabled}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Secret Key"
                  type="password"
                  value={recaptchaConfig.secretKey}
                  onChange={(e) => setRecaptchaConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                  sx={{ mb: 2 }}
                  disabled={!recaptchaConfig.enabled}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Version</InputLabel>
                  <Select
                    value={recaptchaConfig.version}
                    onChange={(e) => setRecaptchaConfig(prev => ({ ...prev, version: e.target.value }))}
                    disabled={!recaptchaConfig.enabled}
                  >
                    <MenuItem value="v2">reCAPTCHA v2</MenuItem>
                    <MenuItem value="v3">reCAPTCHA v3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Score Threshold (0.0 - 1.0)"
                  type="number"
                  inputProps={{ step: 0.1, min: 0, max: 1 }}
                  value={recaptchaConfig.threshold}
                  onChange={(e) => setRecaptchaConfig(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                  sx={{ mb: 2 }}
                  disabled={!recaptchaConfig.enabled}
                />
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>reCAPTCHA v3:</strong> Returns a score (0.0 to 1.0) for each request. 
                    Higher scores indicate a higher likelihood of legitimate interaction.
                  </Typography>
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSaveRecaptchaConfig}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save reCAPTCHA Configuration'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConfigurationPage;
