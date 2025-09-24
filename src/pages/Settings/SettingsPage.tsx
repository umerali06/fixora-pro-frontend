import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  Business as BusinessIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  Language as LanguageIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../i18n';

interface BusinessSettings {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  businessCountry: string;
  taxRate: number;
  currency: string;
  timezone: string;
  website: string;
}

interface PaymentSettings {
  sumupEnabled: boolean;
  sumupApiKey: string;
  sumupTerminalId: string;
  cashRegisterEnabled: boolean;
  receiptPrinter: string;
  cashDrawer: string;
  autoOpenDrawer: boolean;
}

interface LanguageSettings {
  currentLanguage: string;
  availableLanguages: string[];
}

interface StorageSettings {
  backupEnabled: boolean;
  backupFrequency: string;
  cloudStorageEnabled: boolean;
  cloudProvider: string;
}


interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginAttempts: number;
}

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: 'FIXORA PRO',
    businessEmail: 'info@fixorapro.com',
    businessPhone: '+1 (555) 123-4567',
    businessAddress: '123 Repair Street',
    businessCity: 'New York',
    businessState: 'NY',
    businessZipCode: '10001',
    businessCountry: 'USA',
    taxRate: 8.875,
    currency: 'USD',
    timezone: 'America/New_York',
    website: 'www.fixorapro.com'
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    sumupEnabled: false,
    sumupApiKey: '',
    sumupTerminalId: '',
    cashRegisterEnabled: true,
    receiptPrinter: 'USB_THERMAL_PRINTER',
    cashDrawer: 'USB_CASH_DRAWER',
    autoOpenDrawer: true
  });

  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    currentLanguage: 'en',
    availableLanguages: Object.keys(supportedLanguages)
  });

  const [storageSettings, setStorageSettings] = useState<StorageSettings>({
    backupEnabled: true,
    backupFrequency: 'daily',
    cloudStorageEnabled: false,
    cloudProvider: 'local'
  });


  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5
  });

  const [saved, setSaved] = useState(false);

  // Load settings from backend
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load business settings
      const businessResponse = await fetch('/api/v1/settings/business/info', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        if (businessData.data?.settings) {
          setBusinessSettings(prev => ({
            ...prev,
            ...businessData.data.settings
          }));
        }
      }


      // Load security settings
      const securityResponse = await fetch('/api/v1/settings/security', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (securityResponse.ok) {
        const securityData = await securityResponse.json();
        if (securityData.data?.settings) {
          setSecuritySettings(prev => ({
            ...prev,
            ...securityData.data.settings
          }));
        }
      }

    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSettingsChange = (field: keyof BusinessSettings, value: string | number) => {
    setBusinessSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentSettingsChange = (field: keyof PaymentSettings, value: string | boolean) => {
    setPaymentSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLanguageSettingsChange = (field: keyof LanguageSettings, value: string | string[]) => {
    setLanguageSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStorageSettingsChange = (field: keyof StorageSettings, value: string | boolean) => {
    setStorageSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleSecuritySettingsChange = (field: keyof SecuritySettings, value: boolean | number) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Save business settings
      await fetch('/api/v1/settings/business/info', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: businessSettings.businessName,
          email: businessSettings.businessEmail,
          phone: businessSettings.businessPhone,
          address: businessSettings.businessAddress,
          city: businessSettings.businessCity,
          state: businessSettings.businessState,
          zipCode: businessSettings.businessZipCode,
          country: businessSettings.businessCountry,
          taxRate: businessSettings.taxRate,
          currency: businessSettings.currency,
          timezone: businessSettings.timezone
        }),
      });


      // Save security settings
      await fetch('/api/v1/settings/security', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          twoFactorAuth: securitySettings.twoFactorAuth,
          sessionTimeout: securitySettings.sessionTimeout,
          passwordExpiry: securitySettings.passwordExpiry,
          loginAttempts: securitySettings.loginAttempts
        }),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
  return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Box sx={{ p: 3, pt: 1 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon sx={{ color: '#3BB2FF', fontSize: 28 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1A202C' }}>
          {t('Settings')}
        </Typography>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ color: '#99A7BD', mb: 3 }}>
          {t('Configure your business settings and preferences')}
        </Typography>
        
        {/* Settings Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              minHeight: '110px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 0.5 }}>
                      6
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                      Settings Categories
        </Typography>
      </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                    color: 'white'
                  }}>
                    <SettingsIcon />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              minHeight: '110px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 0.5 }}>
                      {securitySettings.twoFactorAuth ? 'On' : 'Off'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                      Two-Factor Auth
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: securitySettings.twoFactorAuth ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white'
                  }}>
                    <SecurityIcon />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              minHeight: '110px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 0.5 }}>
                      {securitySettings.twoFactorAuth ? 'On' : 'Off'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                      2FA Security
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: securitySettings.twoFactorAuth ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: 'white'
                  }}>
                    <SecurityIcon />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              minHeight: '110px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 0.5 }}>
                      {storageSettings.backupEnabled ? 'On' : 'Off'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                      Auto Backup
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: storageSettings.backupEnabled ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                    color: 'white'
                  }}>
                    <StorageIcon />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      {saved && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
          {t('Settings saved successfully!')}
        </Alert>
      )}

        {/* Settings Tabs */}
        <Card sx={{ 
          borderRadius: '16px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
        }}>
          <Box sx={{ 
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC'
          }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontWeight: 500,
                  color: '#64748B',
                  '&.Mui-selected': {
                    color: '#3BB2FF',
                    fontWeight: 600,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#3BB2FF',
                  height: 3,
                },
              }}
            >
              <Tab 
                icon={<BusinessIcon />} 
                label={t('Business')} 
                iconPosition="start"
              />
              <Tab 
                icon={<SecurityIcon />} 
                label={t('Security')} 
                iconPosition="start"
              />
              <Tab 
                icon={<PaymentIcon />} 
                label={t('Payment')} 
                iconPosition="start"
              />
              <Tab 
                icon={<LanguageIcon />} 
                label={t('Language')} 
                iconPosition="start"
              />
              <Tab 
                icon={<StorageIcon />} 
                label={t('Storage')} 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 3 }}>
            {/* Business Settings Tab */}
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                    color: 'white'
                  }}>
                    <BusinessIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1A202C' }}>
              {t('Business Information')}
            </Typography>
                    <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                      Manage your business details and preferences
            </Typography>
          </Box>
                </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Business Name')}
                value={businessSettings.businessName}
                onChange={(e) => handleBusinessSettingsChange('businessName', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#3BB2FF',
                          },
                        },
                      }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Business Email')}
                type="email"
                value={businessSettings.businessEmail}
                onChange={(e) => handleBusinessSettingsChange('businessEmail', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#3BB2FF',
                          },
                        },
                      }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Business Phone')}
                value={businessSettings.businessPhone}
                onChange={(e) => handleBusinessSettingsChange('businessPhone', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#3BB2FF',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('Website')}
                      value={businessSettings.website}
                      onChange={(e) => handleBusinessSettingsChange('website', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#3BB2FF',
                          },
                        },
                      }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Tax Rate (%)')}
                type="number"
                value={businessSettings.taxRate}
                onChange={(e) => handleBusinessSettingsChange('taxRate', parseFloat(e.target.value))}
                inputProps={{ step: 0.01, min: 0, max: 100 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#3BB2FF',
                          },
                        },
                      }}
              />
            </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('Currency')}</InputLabel>
                      <Select
                        value={businessSettings.currency}
                        label={t('Currency')}
                        onChange={(e) => handleBusinessSettingsChange('currency', e.target.value)}
                        sx={{
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#3BB2FF',
                            },
                          },
                        }}
                      >
                        <MenuItem value="USD">USD ($)</MenuItem>
                        <MenuItem value="EUR">EUR (€)</MenuItem>
                        <MenuItem value="GBP">GBP (£)</MenuItem>
                        <MenuItem value="CAD">CAD (C$)</MenuItem>
                      </Select>
                    </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('Business Address')}
                value={businessSettings.businessAddress}
                onChange={(e) => handleBusinessSettingsChange('businessAddress', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#3BB2FF',
                          },
                        },
                      }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('City')}
                value={businessSettings.businessCity}
                onChange={(e) => handleBusinessSettingsChange('businessCity', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#3BB2FF',
                          },
                        },
                      }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('State/Province')}
                value={businessSettings.businessState}
                onChange={(e) => handleBusinessSettingsChange('businessState', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#3BB2FF',
                          },
                        },
                      }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('ZIP/Postal Code')}
                value={businessSettings.businessZipCode}
                onChange={(e) => handleBusinessSettingsChange('businessZipCode', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#3BB2FF',
                          },
                        },
                      }}
              />
            </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('Country')}
                      value={businessSettings.businessCountry}
                      onChange={(e) => handleBusinessSettingsChange('businessCountry', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#3BB2FF',
                          },
                        },
                      }}
                    />
          </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('Timezone')}</InputLabel>
                      <Select
                        value={businessSettings.timezone}
                        label={t('Timezone')}
                        onChange={(e) => handleBusinessSettingsChange('timezone', e.target.value)}
                        sx={{
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#3BB2FF',
                            },
                          },
                        }}
                      >
                        <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                        <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                        <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                        <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                        <MenuItem value="Europe/London">London (GMT)</MenuItem>
                        <MenuItem value="Europe/Berlin">Berlin (CET)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}


            {/* Security Settings Tab */}
            {activeTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: 'white'
                  }}>
                    <SecurityIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1A202C' }}>
                      {t('Security & Privacy')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                      Manage your account security and privacy settings
            </Typography>
          </Box>
                </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      p: 2, 
                      borderRadius: '12px', 
                      border: '1px solid #E2E8F0',
                      backgroundColor: securitySettings.twoFactorAuth ? '#F0FDF4' : '#FEF2F2'
                    }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => handleSecuritySettingsChange('twoFactorAuth', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#10B981',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#10B981',
                              },
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#1A202C' }}>
                              {t('Two-Factor Authentication')}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                              Add an extra layer of security to your account
                            </Typography>
                          </Box>
                        }
                      />
                    </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Session Timeout (minutes)')}
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleSecuritySettingsChange('sessionTimeout', parseInt(e.target.value))}
                inputProps={{ min: 5, max: 480 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#3BB2FF',
                          },
                        },
                      }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Password Expiry (days)')}
                type="number"
                value={securitySettings.passwordExpiry}
                onChange={(e) => handleSecuritySettingsChange('passwordExpiry', parseInt(e.target.value))}
                inputProps={{ min: 30, max: 365 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#3BB2FF',
                          },
                        },
                      }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Max Login Attempts')}
                type="number"
                value={securitySettings.loginAttempts}
                onChange={(e) => handleSecuritySettingsChange('loginAttempts', parseInt(e.target.value))}
                inputProps={{ min: 3, max: 10 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#3BB2FF',
                          },
                        },
                      }}
              />
            </Grid>
          </Grid>
              </Box>
            )}

            {/* Payment Settings Tab */}
            {activeTab === 2 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: 'white'
                  }}>
                    <PaymentIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1A202C' }}>
                      {t('Payment & Hardware')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                      Configure payment methods and hardware settings
                    </Typography>
                  </Box>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={paymentSettings.sumupEnabled}
                          onChange={(e) => handlePaymentSettingsChange('sumupEnabled', e.target.checked)}
                        />
                      }
                      label={t('Enable SumUp Payments')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={paymentSettings.cashRegisterEnabled}
                          onChange={(e) => handlePaymentSettingsChange('cashRegisterEnabled', e.target.checked)}
                        />
                      }
                      label={t('Enable Cash Register')}
                    />
                  </Grid>
                  {paymentSettings.sumupEnabled && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label={t('SumUp API Key')}
                          value={paymentSettings.sumupApiKey}
                          onChange={(e) => handlePaymentSettingsChange('sumupApiKey', e.target.value)}
                          type="password"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label={t('SumUp Terminal ID')}
                          value={paymentSettings.sumupTerminalId}
                          onChange={(e) => handlePaymentSettingsChange('sumupTerminalId', e.target.value)}
                        />
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('Receipt Printer')}</InputLabel>
                      <Select
                        value={paymentSettings.receiptPrinter}
                        label={t('Receipt Printer')}
                        onChange={(e) => handlePaymentSettingsChange('receiptPrinter', e.target.value)}
                      >
                        <MenuItem value="USB_THERMAL_PRINTER">USB Thermal Printer</MenuItem>
                        <MenuItem value="NETWORK_PRINTER">Network Printer</MenuItem>
                        <MenuItem value="BLUETOOTH_PRINTER">Bluetooth Printer</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('Cash Drawer')}</InputLabel>
                      <Select
                        value={paymentSettings.cashDrawer}
                        label={t('Cash Drawer')}
                        onChange={(e) => handlePaymentSettingsChange('cashDrawer', e.target.value)}
                      >
                        <MenuItem value="USB_CASH_DRAWER">USB Cash Drawer</MenuItem>
                        <MenuItem value="SERIAL_CASH_DRAWER">Serial Cash Drawer</MenuItem>
                        <MenuItem value="NETWORK_CASH_DRAWER">Network Cash Drawer</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={paymentSettings.autoOpenDrawer}
                          onChange={(e) => handlePaymentSettingsChange('autoOpenDrawer', e.target.checked)}
                        />
                      }
                      label={t('Auto-open Cash Drawer')}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Language Settings Tab */}
            {activeTab === 3 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                    color: 'white'
                  }}>
                    <LanguageIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1A202C' }}>
                      {t('Language & Localization')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                      Set your preferred language and regional settings
                    </Typography>
                  </Box>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('Current Language')}</InputLabel>
                      <Select
                        value={languageSettings.currentLanguage}
                        label={t('Current Language')}
                        onChange={(e) => handleLanguageSettingsChange('currentLanguage', e.target.value)}
                      >
                        {Object.entries(supportedLanguages).map(([code, lang]) => (
                          <MenuItem key={code} value={code}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="h6">{lang.flag}</Typography>
                              <Box>
                                <Typography variant="body1">{lang.nativeName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {lang.name}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('Timezone')}</InputLabel>
                      <Select
                        value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                        label={t('Timezone')}
                        disabled
                      >
                        <MenuItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                          {Intl.DateTimeFormat().resolvedOptions().timeZone}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                      {t('Language Features')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={t('RTL Support')} 
                        color={['ar', 'he', 'fa'].includes(languageSettings.currentLanguage) ? 'primary' : 'default'}
                        variant="outlined"
                      />
                      <Chip 
                        label={t('Auto-Detect')} 
                        color="primary" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`${Object.keys(supportedLanguages).length} Languages`} 
                        color="info" 
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                      {t('Quick Language Switch')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {Object.entries(supportedLanguages).slice(0, 6).map(([code, lang]) => (
                        <Chip
                          key={code}
                          label={`${lang.flag} ${lang.nativeName}`}
                          onClick={() => handleLanguageSettingsChange('currentLanguage', code)}
                          color={code === languageSettings.currentLanguage ? 'primary' : 'default'}
                          variant={code === languageSettings.currentLanguage ? 'filled' : 'outlined'}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Storage Settings Tab */}
            {activeTab === 4 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                    color: 'white'
                  }}>
                    <StorageIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1A202C' }}>
                      {t('Storage & Backup')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                      Manage data storage and backup preferences
                    </Typography>
                  </Box>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={storageSettings.backupEnabled}
                          onChange={(e) => handleStorageSettingsChange('backupEnabled', e.target.checked)}
                        />
                      }
                      label={t('Enable Automatic Backups')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={storageSettings.cloudStorageEnabled}
                          onChange={(e) => handleStorageSettingsChange('cloudStorageEnabled', e.target.checked)}
                        />
                      }
                      label={t('Enable Cloud Storage')}
                    />
                  </Grid>
                  {storageSettings.backupEnabled && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>{t('Backup Frequency')}</InputLabel>
                        <Select
                          value={storageSettings.backupFrequency}
                          label={t('Backup Frequency')}
                          onChange={(e) => handleStorageSettingsChange('backupFrequency', e.target.value)}
                        >
                          <MenuItem value="hourly">Hourly</MenuItem>
                          <MenuItem value="daily">Daily</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {storageSettings.cloudStorageEnabled && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>{t('Cloud Provider')}</InputLabel>
                        <Select
                          value={storageSettings.cloudProvider}
                          label={t('Cloud Provider')}
                          onChange={(e) => handleStorageSettingsChange('cloudProvider', e.target.value)}
                        >
                          <MenuItem value="aws">Amazon Web Services</MenuItem>
                          <MenuItem value="azure">Microsoft Azure</MenuItem>
                          <MenuItem value="gcp">Google Cloud Platform</MenuItem>
                          <MenuItem value="dropbox">Dropbox</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
        </CardContent>
      </Card>

      {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={saveSettings}
            disabled={saving}
            sx={{ 
              px: 6, 
              py: 2,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              fontSize: '16px',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(59, 178, 255, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
                boxShadow: '0 6px 25px rgba(59, 178, 255, 0.4)',
              },
              '&:disabled': {
                background: '#E2E8F0',
                boxShadow: 'none',
              }
            }}
          >
            {saving ? t('Saving...') : t('Save Settings')}
        </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsPage;


