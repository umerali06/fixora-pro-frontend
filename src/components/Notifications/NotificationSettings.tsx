import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Chip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  PushPin as PushIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import notificationAPI from '../../services/notificationAPI';
import { getOrgIdFromToken, getUserIdFromToken } from '../../utils/auth';

interface NotificationSettingsData {
  email: boolean;
  sms: boolean;
  push: boolean;
  lowStock: boolean;
  jobCompletion: boolean;
  paymentReminders: boolean;
  newUser: boolean;
  orderUpdate: boolean;
  repairUpdate: boolean;
  warrantyExpiry: boolean;
  systemMaintenance: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  channels: string[];
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettingsData>({
    email: true,
    sms: false,
    push: true,
    lowStock: true,
    jobCompletion: true,
    paymentReminders: true,
    newUser: true,
    orderUpdate: true,
    repairUpdate: true,
    warrantyExpiry: true,
    systemMaintenance: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    timezone: 'UTC',
    frequency: 'immediate',
    channels: ['email', 'push', 'in_app'],
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const userId = getUserIdFromToken();
      const orgId = getOrgIdFromToken();

      if (!userId || !orgId) {
        setMessage('User not authenticated');
        setShowMessage(true);
        return;
      }

      const response = await notificationAPI.getNotificationSettings(userId, orgId);
      
      if (response.success && response.data) {
        setSettings({
          email: response.data.email || false,
          sms: response.data.sms || false,
          push: response.data.push || false,
          lowStock: response.data.lowStock || false,
          jobCompletion: response.data.jobCompletion || false,
          paymentReminders: response.data.paymentReminders || false,
          newUser: response.data.newUser || false,
          orderUpdate: response.data.orderUpdate || false,
          repairUpdate: response.data.repairUpdate || false,
          warrantyExpiry: response.data.warrantyExpiry || false,
          systemMaintenance: response.data.systemMaintenance || false,
          quietHoursEnabled: response.data.quietHoursEnabled || false,
          quietHoursStart: response.data.quietHoursStart || '22:00',
          quietHoursEnd: response.data.quietHoursEnd || '08:00',
          timezone: response.data.timezone || 'UTC',
          frequency: response.data.frequency || 'immediate',
          channels: response.data.channels 
            ? (typeof response.data.channels === 'string' 
                ? response.data.channels.split(',') 
                : response.data.channels)
            : ['email', 'push', 'in_app'],
        });
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      setMessage('Failed to load notification settings');
      setShowMessage(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const userId = getUserIdFromToken();
      const orgId = getOrgIdFromToken();

      if (!userId || !orgId) {
        setMessage('User not authenticated');
        setShowMessage(true);
        return;
      }

      const response = await notificationAPI.updateNotificationSettings(userId, orgId, {
        ...settings,
        channels: settings.channels.join(','),
      } as any);

      if (response.success) {
        setMessage('Notification settings saved successfully');
        setShowMessage(true);
      } else {
        setMessage('Failed to save notification settings');
        setShowMessage(true);
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setMessage('Failed to save notification settings');
      setShowMessage(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettingsData, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleChannelChange = (channel: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      channels: checked
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel),
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading notification settings...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 },
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        textAlign: { xs: 'center', sm: 'left' }
      }}>
        <NotificationsIcon sx={{ 
          fontSize: { xs: 28, sm: 32 }, 
          color: '#3B82F6' 
        }} />
        <Typography variant="h5" sx={{ 
          fontWeight: 600, 
          color: '#1A202C',
          fontSize: { xs: '1.5rem', sm: '2rem' }
        }}>
          Notification Settings
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Notification Channels */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                Notification Channels
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: { xs: 1.5, sm: 2 }
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email}
                      onChange={(e) => handleSettingChange('email', e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      flexWrap: 'wrap'
                    }}>
                      <EmailIcon sx={{ 
                        fontSize: { xs: 18, sm: 20 }, 
                        color: '#6B7280' 
                      }} />
                      <Typography sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}>
                        Email Notifications
                      </Typography>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.sms}
                      onChange={(e) => handleSettingChange('sms', e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      flexWrap: 'wrap'
                    }}>
                      <SmsIcon sx={{ 
                        fontSize: { xs: 18, sm: 20 }, 
                        color: '#6B7280' 
                      }} />
                      <Typography sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}>
                        SMS Notifications
                      </Typography>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.push}
                      onChange={(e) => handleSettingChange('push', e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      flexWrap: 'wrap'
                    }}>
                      <PushIcon sx={{ 
                        fontSize: { xs: 18, sm: 20 }, 
                        color: '#6B7280' 
                      }} />
                      <Typography sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}>
                        Push Notifications
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Types */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                Notification Types
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: { xs: 1.5, sm: 2 }
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.lowStock}
                      onChange={(e) => handleSettingChange('lowStock', e.target.checked)}
                    />
                  }
                  label="Low Stock Alerts"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.jobCompletion}
                      onChange={(e) => handleSettingChange('jobCompletion', e.target.checked)}
                    />
                  }
                  label="Job Completion"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.paymentReminders}
                      onChange={(e) => handleSettingChange('paymentReminders', e.target.checked)}
                    />
                  }
                  label="Payment Reminders"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.newUser}
                      onChange={(e) => handleSettingChange('newUser', e.target.checked)}
                    />
                  }
                  label="New User Notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.orderUpdate}
                      onChange={(e) => handleSettingChange('orderUpdate', e.target.checked)}
                    />
                  }
                  label="Order Updates"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.repairUpdate}
                      onChange={(e) => handleSettingChange('repairUpdate', e.target.checked)}
                    />
                  }
                  label="Repair Updates"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.warrantyExpiry}
                      onChange={(e) => handleSettingChange('warrantyExpiry', e.target.checked)}
                    />
                  }
                  label="Warranty Expiry"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.systemMaintenance}
                      onChange={(e) => handleSettingChange('systemMaintenance', e.target.checked)}
                    />
                  }
                  label="System Maintenance"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quiet Hours */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                Quiet Hours
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.quietHoursEnabled}
                    onChange={(e) => handleSettingChange('quietHoursEnabled', e.target.checked)}
                  />
                }
                label="Enable Quiet Hours"
                sx={{ mb: 2 }}
              />
              
              {settings.quietHoursEnabled && (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Start Time"
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => handleSettingChange('quietHoursStart', e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                  <Typography>to</Typography>
                  <TextField
                    label="End Time"
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => handleSettingChange('quietHoursEnd', e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Frequency & Channels */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                Frequency & Channels
              </Typography>
              
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Notification Frequency</InputLabel>
                <Select
                  value={settings.frequency}
                  onChange={(e) => handleSettingChange('frequency', e.target.value)}
                  label="Notification Frequency"
                >
                  <MenuItem value="immediate">Immediate</MenuItem>
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: '#6B7280' }}>
                  Active Channels:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['email', 'sms', 'push', 'in_app'].map((channel) => (
                    <Chip
                      key={channel}
                      label={channel}
                      color={settings.channels.includes(channel) ? 'primary' : 'default'}
                      onClick={() => handleChannelChange(channel, !settings.channels.includes(channel))}
                      clickable
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: { xs: 1, sm: 2 }, 
        mt: 3, 
        justifyContent: { xs: 'center', sm: 'flex-end' },
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center'
      }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchSettings}
          disabled={loading}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            minWidth: { xs: '100%', sm: '120px' }
          }}
          size="small"
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            minWidth: { xs: '100%', sm: '120px' }
          }}
          size="small"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      {/* Success/Error Message */}
      <Snackbar
        open={showMessage}
        autoHideDuration={6000}
        onClose={() => setShowMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowMessage(false)}
          severity={message.includes('success') ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationSettings;
