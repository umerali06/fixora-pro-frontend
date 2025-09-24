import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { customerAPI, repairTicketAPI, invoicesAPI } from '../../services/api';

import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  Message as MessageIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import OrderConfirmation from '../../components/Repair/OrderConfirmation';
import DeliveryNote from '../../components/Repair/DeliveryNote';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  totalRepairs?: number;
  totalSpent?: number;
  lastVisit?: string;
  lastContact?: string;
  _count?: {
    repairTickets: number;
  };
}

interface Repair {
  id: string;
  repairNumber: string;
  status: 'pending' | 'diagnosis' | 'in_progress' | 'waiting_parts' | 'testing' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issue: string;
  estimatedCost: number;
  actualCost?: number;
  estimatedCompletion: string;
  actualCompletion?: string;
  assignedTechnician?: string;
  createdAt: string;
  updatedAt: string;
  notes: string[];
  signatureUrl?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  notes: string;
  createdAt?: string;
}

interface CostEstimate {
  id: string;
  estimateNumber: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  issueDate: string;
  expiryDate: string;
  notes: string;
}

interface Communication {
  id: string;
  type: 'email' | 'sms' | 'phone' | 'note';
  subject: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

const CustomerProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [costEstimates, setCostEstimates] = useState<CostEstimate[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [editDialog, setEditDialog] = useState(false);
  const [orderConfirmationDialog, setOrderConfirmationDialog] = useState(false);
  const [deliveryNoteDialog, setDeliveryNoteDialog] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<'order' | 'delivery' | null>(null);

  const tabs = [
    { label: 'Overview', icon: <PersonIcon /> },
    { label: 'Repair History', icon: <BuildIcon /> },
    { label: 'Invoices', icon: <ReceiptIcon /> },
    { label: 'Cost Estimates', icon: <AssessmentIcon /> },
    { label: 'Communication', icon: <MessageIcon /> },
    { label: 'Timeline', icon: <HistoryIcon /> }
  ];

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const fetchCustomerData = async () => {
    if (!customerId) {
      setError('Customer ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch customer data using authenticated API
      const customerData = await customerAPI.getById(customerId);
      setCustomer(customerData);

      // Fetch customer repairs
      try {
        const repairsData = await repairTicketAPI.getAll({ customerId });
        setRepairs(repairsData || []);
      } catch (error) {
        console.log('No repairs found for customer');
        setRepairs([]);
      }

      // Fetch customer invoices
      try {
        const invoicesData = await invoicesAPI.getInvoices({ customerId });
        setInvoices(invoicesData || []);
      } catch (error) {
        console.log('No invoices found for customer');
        setInvoices([]);
      }

      // Initialize empty arrays for cost estimates and communications
      // These will be populated when real APIs are available
      setCostEstimates([]);
      setCommunications([]);

    } catch (err) {
      console.error('Error fetching customer data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customer data');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'approved':
      case 'delivered':
        return 'success';
      case 'in_progress':
      case 'sent':
      case 'pending':
        return 'info';
      case 'waiting_parts':
      case 'overdue':
        return 'warning';
      case 'cancelled':
      case 'rejected':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleViewOrderConfirmation = (repair: Repair) => {
    setSelectedRepair(repair);
    setSelectedDocument('order');
    setOrderConfirmationDialog(true);
  };

  const handleViewDeliveryNote = (repair: Repair) => {
    setSelectedRepair(repair);
    setSelectedDocument('delivery');
    setDeliveryNoteDialog(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Implementation for PDF download
    console.log('Downloading PDF...');
  };

  const handleSendEmail = () => {
    // Implementation for sending email
    console.log('Sending email...');
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!customer) {
    return <Alert severity="warning">Customer not found.</Alert>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <DashboardHeader />
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {customer.firstName} {customer.lastName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customer Profile
        </Typography>
      </Box>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                Customer Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={`${customer.firstName} ${customer.lastName}`} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PhoneIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={customer.phone} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <EmailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={customer.email} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <BusinessIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={customer.company || 'N/A'} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <LocationIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${customer.address || 'N/A'}, ${customer.city || ''}, ${customer.postalCode || ''}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <ScheduleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={`Joined: ${formatDate(customer.createdAt)}`} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <InfoIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={`Status: ${customer.isActive ? 'Active' : 'Inactive'}`} />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                Customer Summary
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <TrendingUpIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={`Total Repairs: ${customer._count?.repairTickets || 0}`} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <MoneyIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={`Total Spent: ${formatCurrency(customer.totalSpent || 0)}`} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <HistoryIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={`Last Visit: ${customer.lastVisit ? formatDate(customer.lastVisit) : 'N/A'}`} />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mt: 2 }}>
        {tabs.map((tab) => (
          <Tab key={tab.label} label={tab.label} icon={tab.icon} />
        ))}
      </Tabs>

      {activeTab === 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Typography>
              {customer.firstName} {customer.lastName} is a valued customer with a history of excellent service.
              Their current status is {customer.isActive ? 'Active' : 'Inactive'}.
            </Typography>
            <Typography>
              Total Repairs: {customer._count?.repairTickets || 0}
            </Typography>
            <Typography>
              Total Spent: {formatCurrency(customer.totalSpent || 0)}
            </Typography>
            <Typography>
              Last Visit: {customer.lastContact ? formatDate(customer.lastContact) : 'N/A'}
            </Typography>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Repair History
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Repair Number</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Device</TableCell>
                    <TableCell>Issue</TableCell>
                    <TableCell>Estimated Cost</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {repairs.map((repair) => (
                    <TableRow key={repair.id}>
                      <TableCell>{repair.repairNumber}</TableCell>
                      <TableCell>
                        <Chip label={repair.status} color={getStatusColor(repair.status)} />
                      </TableCell>
                      <TableCell>
                        <Chip label={repair.priority} color={getPriorityColor(repair.priority)} />
                      </TableCell>
                      <TableCell>{`${repair.deviceBrand} ${repair.deviceModel}`}</TableCell>
                      <TableCell>{repair.issue}</TableCell>
                      <TableCell>{formatCurrency(repair.estimatedCost)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleViewOrderConfirmation(repair)}>
                          <PdfIcon />
                        </IconButton>
                        <IconButton onClick={() => handleViewDeliveryNote(repair)}>
                          <PrintIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Invoices
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice Number</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Issue Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Chip label={invoice.status} color={getStatusColor(invoice.status)} />
                      </TableCell>
                      <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <IconButton onClick={handleDownloadPDF}>
                          <PdfIcon />
                        </IconButton>
                        <IconButton onClick={handleSendEmail}>
                          <EmailIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cost Estimates
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Estimate Number</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Issue Date</TableCell>
                    <TableCell>Expiry Date</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {costEstimates.length > 0 ? costEstimates.map((estimate) => (
                    <TableRow key={estimate.id}>
                      <TableCell>{estimate.estimateNumber}</TableCell>
                      <TableCell>{formatCurrency(estimate.amount)}</TableCell>
                      <TableCell>
                        <Chip label={estimate.status} color={getStatusColor(estimate.status)} />
                      </TableCell>
                      <TableCell>{formatDate(estimate.issueDate)}</TableCell>
                      <TableCell>{formatDate(estimate.expiryDate)}</TableCell>
                      <TableCell>{estimate.notes}</TableCell>
                      <TableCell>
                        <IconButton onClick={handleDownloadPDF}>
                          <PdfIcon />
                        </IconButton>
                        <IconButton onClick={handleSendEmail}>
                          <EmailIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No cost estimates available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 4 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Communication History
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Content</TableCell>
                    <TableCell>Direction</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {communications.length > 0 ? communications.map((comm) => (
                    <TableRow key={comm.id}>
                      <TableCell>{comm.type}</TableCell>
                      <TableCell>{comm.subject}</TableCell>
                      <TableCell>{comm.content}</TableCell>
                      <TableCell>{comm.direction}</TableCell>
                      <TableCell>
                        <Chip label={comm.status} color={getStatusColor(comm.status)} />
                      </TableCell>
                      <TableCell>{formatDate(comm.timestamp)}</TableCell>
                      <TableCell>
                        <IconButton onClick={handleDownloadPDF}>
                          <PdfIcon />
                        </IconButton>
                        <IconButton onClick={handleSendEmail}>
                          <EmailIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No communication history available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 5 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Timeline
            </Typography>
            <Box sx={{ mt: 2 }}>
              {/* Customer Registration */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Customer Joined</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(customer.createdAt)}
                  </Typography>
                  <Typography variant="body2">
                    {customer.firstName} {customer.lastName} joined the system.
                  </Typography>
                </Box>
              </Box>
              
              {/* Repair History */}
              {repairs.length > 0 && repairs.map((repair, index) => (
                <Box key={repair.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <BuildIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Repair #{repair.repairNumber || repair.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(repair.createdAt || repair.updatedAt)}
                    </Typography>
                    <Typography variant="body2">
                      {repair.deviceBrand} {repair.deviceModel} - {repair.issue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {repair.status}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              {/* Invoice History */}
              {invoices.length > 0 && invoices.map((invoice, index) => (
                <Box key={invoice.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Invoice #{invoice.invoiceNumber || invoice.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(invoice.createdAt || invoice.issueDate)}
                    </Typography>
                    <Typography variant="body2">
                      Amount: {formatCurrency(invoice.amount || invoice.total)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {invoice.status}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              {/* No data message */}
              {repairs.length === 0 && invoices.length === 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'grey.300', mr: 2 }}>
                    <InfoIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">No Activity Yet</Typography>
                    <Typography variant="body2" color="text.secondary">
                      This customer hasn't had any repairs or invoices yet.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      <Dialog open={orderConfirmationDialog} onClose={() => setOrderConfirmationDialog(false)}>
        <DialogTitle>Order Confirmation</DialogTitle>
        <DialogContent>
          <OrderConfirmation 
            repairData={{
              customer: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                company: customer.company,
                address: customer.address ? {
                  street: customer.address,
                  city: customer.city || '',
                  zipCode: customer.postalCode || '',
                  country: customer.country || ''
                } : undefined
              },
              devices: [{
                id: selectedRepair?.id || '1',
                deviceType: selectedRepair?.deviceType || '',
                deviceBrand: selectedRepair?.deviceBrand || '',
                deviceModel: selectedRepair?.deviceModel || '',
                deviceSerial: '',
                deviceCondition: 'GOOD',
                issue: selectedRepair?.issue || '',
                estimatedCost: selectedRepair?.estimatedCost || 0,
                notes: selectedRepair?.notes?.join(', ') || ''
              }],
              priority: (selectedRepair?.priority?.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') || 'MEDIUM',
              estimatedCompletion: selectedRepair?.estimatedCompletion || '',
              assignedTechnician: selectedRepair?.assignedTechnician || '',
              customerNotes: selectedRepair?.notes?.join(', ') || '',
              internalNotes: '',
              signatureUrl: selectedRepair?.signatureUrl,
              totalEstimatedCost: selectedRepair?.estimatedCost || 0,
              repairNumber: selectedRepair?.repairNumber || '',
              createdAt: selectedRepair?.createdAt || ''
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderConfirmationDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deliveryNoteDialog} onClose={() => setDeliveryNoteDialog(false)}>
        <DialogTitle>Delivery Note</DialogTitle>
        <DialogContent>
          <DeliveryNote 
            repairData={{
              customer: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                company: customer.company,
                address: customer.address ? {
                  street: customer.address,
                  city: customer.city || '',
                  zipCode: customer.postalCode || '',
                  country: customer.country || ''
                } : undefined
              },
              devices: [{
                id: selectedRepair?.id || '1',
                deviceType: selectedRepair?.deviceType || '',
                deviceBrand: selectedRepair?.deviceBrand || '',
                deviceModel: selectedRepair?.deviceModel || '',
                deviceSerial: '',
                deviceCondition: 'GOOD',
                issue: selectedRepair?.issue || '',
                actualCost: selectedRepair?.actualCost || selectedRepair?.estimatedCost || 0,
                warrantyInfo: {
                  warrantyPeriod: 90,
                  warrantyExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                  warrantyTerms: 'Standard 90-day warranty on parts and labor'
                }
              }],
              repairNumber: selectedRepair?.repairNumber || '',
              completedAt: selectedRepair?.actualCompletion || selectedRepair?.createdAt || '',
              assignedTechnician: selectedRepair?.assignedTechnician || '',
              customerNotes: selectedRepair?.notes?.join(', ') || '',
              internalNotes: '',
              totalActualCost: selectedRepair?.actualCost || selectedRepair?.estimatedCost || 0,
              paymentStatus: 'PENDING' as const
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeliveryNoteDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerProfilePage;
