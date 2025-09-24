import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Email as EmailIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Support as SupportIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const Apps: React.FC = () => {
  const { t } = useTranslation();

  const apps = [
    {
      id: 'sumup',
      name: 'SumUp',
      description: 'Card payment processing and POS integration',
      icon: PaymentIcon,
      category: 'Payment',
      status: 'connected',
      isActive: true,
      features: ['Card payments', 'Receipt printing', 'Transaction history'],
    },
    {
      id: 'email',
      name: 'Email Integration',
      description: 'Send invoices and notifications via email',
      icon: EmailIcon,
      category: 'Communication',
      status: 'configured',
      isActive: true,
      features: ['Invoice emails', 'Status notifications', 'Customer updates'],
    },
    {
      id: 'backup',
      name: 'Cloud Backup',
      description: 'Automatic data backup and synchronization',
      icon: CloudIcon,
      category: 'Data',
      status: 'connected',
      isActive: true,
      features: ['Daily backups', 'Data sync', 'Restore points'],
    },
    {
      id: 'security',
      name: 'Security Suite',
      description: 'Advanced security and compliance features',
      icon: SecurityIcon,
      category: 'Security',
      status: 'available',
      isActive: false,
      features: ['Two-factor auth', 'Audit logs', 'GDPR compliance'],
    },
    {
      id: 'analytics',
      name: 'Business Analytics',
      description: 'Advanced reporting and business intelligence',
      icon: AnalyticsIcon,
      category: 'Analytics',
      status: 'available',
      isActive: false,
      features: ['Custom reports', 'Performance metrics', 'Trend analysis'],
    },
    {
      id: 'support',
      name: 'Support System',
      description: 'Customer support and ticket management',
      icon: SupportIcon,
      category: 'Support',
      status: 'available',
      isActive: false,
      features: ['Ticket system', 'Knowledge base', 'Live chat'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'configured':
        return 'info';
      case 'available':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'configured':
        return 'Configured';
      case 'available':
        return 'Available';
      default:
        return 'Unknown';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          {t('navigation.apps')}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your integrations and third-party applications
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {apps.map((app) => {
          const IconComponent = app.icon;
          return (
            <Grid item xs={12} md={6} lg={4} key={app.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: app.isActive ? 'primary.main' : 'grey.300',
                        color: app.isActive ? 'white' : 'grey.600',
                        mr: 2,
                      }}
                    >
                      <IconComponent />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {app.name}
                      </Typography>
                      <Chip
                        label={app.category}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    <Chip
                      label={getStatusText(app.status)}
                      color={getStatusColor(app.status) as any}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {app.description}
                  </Typography>

                  <List dense>
                    {app.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Active
                    </Typography>
                    <Switch
                      checked={app.isActive}
                      size="small"
                      disabled={app.status === 'available'}
                    />
                  </Box>
                  <Box>
                    {app.status === 'connected' && (
                      <Button size="small" color="primary">
                        Configure
                      </Button>
                    )}
                    {app.status === 'configured' && (
                      <Button size="small" color="primary">
                        Manage
                      </Button>
                    )}
                    {app.status === 'available' && (
                      <Button size="small" variant="outlined">
                        Install
                      </Button>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Coming Soon Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Coming Soon
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ opacity: 0.6 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'grey.300', color: 'grey.600', mr: 2 }}>
                    <SettingsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Advanced Settings
                    </Typography>
                    <Chip label="Settings" size="small" variant="outlined" />
                  </Box>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Advanced configuration options and system settings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Apps; 