import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon
} from '@mui/icons-material';

interface Device {
  id: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  deviceSerial?: string;
  deviceCondition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
  issue: string;
  estimatedCost: number;
  notes: string;
}

interface Customer {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

interface OrderConfirmationProps {
  repairData: {
    customer: Customer;
    devices: Device[];
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    estimatedCompletion: string;
    assignedTechnician: string;
    customerNotes: string;
    internalNotes: string;
    signatureUrl?: string;
    totalEstimatedCost: number;
    repairNumber: string;
    createdAt: string;
  };
  onPrint?: () => void;
  onDownloadPDF?: () => void;
  onSendEmail?: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  repairData,
  onPrint,
  onDownloadPDF,
  onSendEmail
}) => {

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'Urgent';
      case 'HIGH': return 'High';
      case 'MEDIUM': return 'Medium';
      case 'LOW': return 'Low';
      default: return priority;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          FIXORA PRO
        </Typography>
        <Typography variant="h5" gutterBottom color="text.secondary">
          Professional Device Repair Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your trusted partner for all device repairs
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={onPrint}
        >
          Print
        </Button>
        <Button
          variant="outlined"
          startIcon={<PdfIcon />}
          onClick={onDownloadPDF}
        >
          Download PDF
        </Button>
        <Button
          variant="outlined"
          startIcon={<EmailIcon />}
          onClick={onSendEmail}
        >
          Send Email
        </Button>
      </Box>

      {/* Order Confirmation Card */}
      <Card sx={{ mb: 4, border: '2px solid #1976d2' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2" color="primary" sx={{ fontWeight: 'bold' }}>
              REPAIR ORDER CONFIRMATION
            </Typography>
            <Chip
              label={getPriorityLabel(repairData.priority)}
              color={getPriorityColor(repairData.priority)}
              size="medium"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Order Details */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom color="primary">
                Order Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Repair Number
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {repairData.repairNumber}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Order Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formatDate(repairData.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Estimated Completion
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formatDate(repairData.estimatedCompletion)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Assigned Technician
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {repairData.assignedTechnician}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom color="primary">
                Customer Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {repairData.customer.firstName} {repairData.customer.lastName}
                </Typography>
                {repairData.customer.company && (
                  <Typography variant="body2" color="text.secondary">
                    {repairData.customer.company}
                  </Typography>
                )}
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {repairData.customer.email}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">
                  {repairData.customer.phone}
                </Typography>
              </Box>
              {repairData.customer.address && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {repairData.customer.address.street}<br />
                    {repairData.customer.address.city}, {repairData.customer.address.zipCode}<br />
                    {repairData.customer.address.country}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>

          {/* Devices Table */}
          <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
            Devices for Repair
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Device</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Serial/IMEI</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Condition</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Issue</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Est. Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {repairData.devices.map((device, index) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {device.deviceBrand} {device.deviceModel}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {device.deviceType}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {device.deviceSerial || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={device.deviceCondition}
                        size="small"
                        color={device.deviceCondition === 'NEW' ? 'success' : 
                               device.deviceCondition === 'GOOD' ? 'primary' :
                               device.deviceCondition === 'FAIR' ? 'warning' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {device.issue}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        ${device.estimatedCost.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Cost Summary */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 3,
            backgroundColor: '#f8f9fa',
            borderRadius: 2,
            border: '1px solid #e0e0e0'
          }}>
            <Typography variant="h6" color="primary">
              Total Estimated Cost
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              ${repairData.totalEstimatedCost.toFixed(2)}
            </Typography>
          </Box>

          {/* Notes Section */}
          {(repairData.customerNotes || repairData.internalNotes) && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Additional Information
              </Typography>
              {repairData.customerNotes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Customer Notes
                  </Typography>
                  <Typography variant="body1">
                    {repairData.customerNotes}
                  </Typography>
                </Box>
              )}
              {repairData.internalNotes && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Internal Notes
                  </Typography>
                  <Typography variant="body1">
                    {repairData.internalNotes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Customer Signature */}
          {repairData.signatureUrl && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Customer Signature
              </Typography>
              <Box sx={{ 
                display: 'inline-block',
                p: 2,
                border: '2px solid #e0e0e0',
                borderRadius: 2,
                backgroundColor: 'white'
              }}>
                <img 
                  src={repairData.signatureUrl} 
                  alt="Customer Signature" 
                  style={{ 
                    maxWidth: '300px',
                    maxHeight: '100px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                I acknowledge and agree to the repair terms and conditions
              </Typography>
            </Box>
          )}

          {/* Terms and Conditions */}
          <Box sx={{ mt: 4, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Terms and Conditions
            </Typography>
            <Typography variant="body2" paragraph>
              1. All repairs are performed with care and attention to detail.
            </Typography>
            <Typography variant="body2" paragraph>
              2. Estimated completion dates are approximate and may vary based on parts availability and repair complexity.
            </Typography>
            <Typography variant="body2" paragraph>
              3. Final cost may vary from the estimate based on actual parts and labor required.
            </Typography>
            <Typography variant="body2" paragraph>
              4. We are not responsible for data loss during repair. Please backup your data before service.
            </Typography>
            <Typography variant="body2" paragraph>
              5. Repairs are covered by our standard warranty unless otherwise specified.
            </Typography>
            <Typography variant="body2">
              6. Payment is due upon completion of repairs unless prior arrangements have been made.
            </Typography>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center', pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary">
              Thank you for choosing FIXORA PRO for your device repair needs!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              For questions or updates, please contact us at {repairData.assignedTechnician}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderConfirmation;
