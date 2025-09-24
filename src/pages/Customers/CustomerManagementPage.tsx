import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import CustomerCategories from '../../components/Customer/CustomerCategories';
import CustomerImportExport from '../../components/Customer/CustomerImportExport';
import { useAppSelector } from '../../store/hooks';

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
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
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

function a11yProps(index: number) {
  return {
    id: `customer-tab-${index}`,
    'aria-controls': `customer-tabpanel-${index}`,
  };
}

const CustomerManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAppSelector((state) => state.auth);
  const orgId = user?.orgId || '';

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCategoryChange = () => {
    // Refresh customer data when categories change
    console.log('Categories updated, refreshing customer data...');
  };

  const handleImportComplete = () => {
    // Refresh customer data when import completes
    console.log('Import completed, refreshing customer data...');
  };

  return (
    <Box>
      <DashboardHeader />
      
      <Box sx={{ p: 3, backgroundColor: '#EEF3FB', minHeight: 'calc(100vh - 64px)' }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1A202C', mb: 1 }}>
            Customer Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage customer categories, import/export data, and configure customer settings
          </Typography>
        </Box>

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="customer management tabs"
              sx={{ px: 2 }}
            >
              <Tab label="Categories" {...a11yProps(0)} />
              <Tab label="Import/Export" {...a11yProps(1)} />
              <Tab label="Settings" {...a11yProps(2)} />
            </Tabs>
          </Box>

          {/* Categories Tab */}
          <TabPanel value={tabValue} index={0}>
            <CustomerCategories 
              orgId={orgId} 
              onCategoryChange={handleCategoryChange}
            />
          </TabPanel>

          {/* Import/Export Tab */}
          <TabPanel value={tabValue} index={1}>
            <CustomerImportExport 
              orgId={orgId} 
              onImportComplete={handleImportComplete}
            />
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Customer Settings
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Configure default customer settings, categories, and business rules.
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      This section will include customer management preferences, 
                      default categories, and system configuration options.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Data Management
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Manage customer data retention, backup settings, and data export options.
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Configure how long to keep customer data, backup schedules, 
                      and data export formats.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Box>
    </Box>
  );
};

export default CustomerManagementPage;
