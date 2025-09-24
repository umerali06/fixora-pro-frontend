import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Source as SourceIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon,
  Build as BuildIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

interface CustomerProfileProps {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    company?: string;
    email?: string;
    phone: string;
    mobile?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    state?: string;
    customerType: string;
    category?: string;
    source?: string;
    tags?: string;
    notes?: string;
    internalNotes?: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    lastContact?: string;
    lastOrderDate?: string;
    _count: {
      repairTickets: number;
      orders: number;
      invoices: number;
    };
  };
  onEdit?: () => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ customer, onEdit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL':
        return 'primary';
      case 'BUSINESS':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getVerificationColor = (isVerified: boolean) => {
    return isVerified ? 'success' : 'warning';
  };

  const parseTags = (tagsString?: string): string[] => {
    if (!tagsString) return [];
    try {
      return JSON.parse(tagsString);
    } catch {
      return tagsString.split(',').map((tag: string) => tag.trim());
    }
  };

  const tags = parseTags(customer.tags);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: '2rem',
                  backgroundColor: '#3BB2FF'
                }}
              >
                {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {customer.displayName || `${customer.firstName} ${customer.lastName}`}
                </Typography>
                {customer.company && (
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {customer.company}
                  </Typography>
                )}
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Chip
                    label={customer.customerType}
                    color={getCustomerTypeColor(customer.customerType)}
                    size="small"
                  />
                  <Chip
                    label={customer.isActive ? 'Active' : 'Inactive'}
                    color={getStatusColor(customer.isActive)}
                    size="small"
                  />
                  <Chip
                    label={customer.isVerified ? 'Verified' : 'Unverified'}
                    color={getVerificationColor(customer.isVerified)}
                    size="small"
                  />
                  {customer.category && (
                    <Chip
                      label={customer.category}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onEdit}
            >
              Edit Profile
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <PersonIcon />
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                {customer.email && (
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={customer.email}
                    />
                  </ListItem>
                )}
                
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={customer.phone}
                  />
                </ListItem>

                {customer.mobile && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Mobile"
                      secondary={customer.mobile}
                    />
                  </ListItem>
                )}

                {customer.address && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Address"
                      secondary={
                        <Box>
                          <Typography variant="body2">{customer.address}</Typography>
                          {customer.city && (
                            <Typography variant="body2">
                              {customer.city}{customer.postalCode && `, ${customer.postalCode}`}
                            </Typography>
                          )}
                          {customer.state && customer.country && (
                            <Typography variant="body2">
                              {customer.state}, {customer.country}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <BusinessIcon />
                Business Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CategoryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Customer Type"
                    secondary={customer.customerType}
                  />
                </ListItem>

                {customer.category && (
                  <ListItem>
                    <ListItemIcon>
                      <CategoryIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Category"
                      secondary={customer.category}
                    />
                  </ListItem>
                )}

                {customer.source && (
                  <ListItem>
                    <ListItemIcon>
                      <SourceIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Source"
                      secondary={customer.source}
                    />
                  </ListItem>
                )}

                {tags.length > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <CategoryIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Tags"
                      secondary={
                                                 <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                           {tags.map((tag: string, index: number) => (
                             <Chip
                               key={index}
                               label={tag}
                               size="small"
                               variant="outlined"
                             />
                           ))}
                         </Box>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <HistoryIcon />
                Activity Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {customer._count.repairTickets}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Repair Tickets
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="secondary" fontWeight="bold">
                      {customer._count.orders}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Orders
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="success" fontWeight="bold">
                      {customer._count.invoices}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Invoices
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="info" fontWeight="bold">
                      {customer.lastContact ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Recent Contact
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Important Dates */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <HistoryIcon />
                Important Dates
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Customer Since"
                    secondary={formatDate(customer.createdAt)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Last Updated"
                    secondary={formatDateTime(customer.updatedAt)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Last Contact"
                    secondary={formatDate(customer.lastContact)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Last Order"
                    secondary={formatDate(customer.lastOrderDate)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notes */}
        {(customer.notes || customer.internalNotes) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <EditIcon />
                  Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {customer.notes && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Customer Notes
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {customer.notes}
                    </Typography>
                  </Box>
                )}

                {customer.internalNotes && (
                  <Box>
                    <Typography variant="subtitle2" color="secondary" gutterBottom>
                      Internal Notes
                    </Typography>
                    <Typography variant="body2">
                      {customer.internalNotes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CustomerProfile;
