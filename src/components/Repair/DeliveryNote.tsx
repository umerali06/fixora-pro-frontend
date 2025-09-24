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
  Paper,
  Alert
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
  actualCost: number;
  warrantyInfo?: {
    warrantyPeriod: number;
    warrantyExpiry: string;
    warrantyTerms: string;
  };
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

interface DeliveryNoteProps {
  repairData: {
    customer: Customer;
    devices: Device[];
    repairNumber: string;
    completedAt: string;
    assignedTechnician: string;
    customerNotes: string;
    internalNotes: string;
    totalActualCost: number;
    paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';
    warrantyInfo?: {
      warrantyPeriod: number;
      warrantyExpiry: string;
      warrantyTerms: string;
    };
  };
  onPrint?: () => void;
  onDownloadPDF?: () => void;
  onSendEmail?: () => void;
}

const DeliveryNote: React.FC<DeliveryNoteProps> = ({
  repairData,
  onPrint,
  onDownloadPDF,
  onSendEmail
}) => {

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PARTIAL': return 'warning';
      case 'PENDING': return 'error';
      case 'REFUNDED': return 'info';
      default: return 'default';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Paid';
      case 'PARTIAL': return 'Partially Paid';
      case 'PENDING': return 'Payment Pending';
      case 'REFUNDED': return 'Refunded';
      default: return status;
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
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
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

      {/* Delivery Note Card */}
      <Card sx={{ mb: 4, border: '2px solid #2e7d32' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2" color="success" sx={{ fontWeight: 'bold' }}>
              REPAIR COMPLETED - READY FOR PICKUP
            </Typography>
            <Chip
              label={getPaymentStatusLabel(repairData.paymentStatus)}
              color={getPaymentStatusColor(repairData.paymentStatus)}
              size="medium"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Completion Details */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom color="success">
                Repair Information
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
                  Completion Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formatDate(repairData.completedAt)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Technician
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {repairData.assignedTechnician}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom color="success">
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
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">
                  {repairData.customer.phone}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Completed Devices Table */}
          <Typography variant="h6" gutterBottom color="success" sx={{ mb: 2 }}>
            Repaired Devices
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#e8f5e8' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Device</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Serial/IMEI</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Issue Resolved</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Final Cost</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Warranty</TableCell>
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
                      <Typography variant="body2">
                        {device.issue}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        ${device.actualCost.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {device.warrantyInfo ? (
                        <Box>
                          <Typography variant="body2" color="success.main">
                            {device.warrantyInfo.warrantyPeriod} days
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Expires: {formatDate(device.warrantyInfo.warrantyExpiry)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No warranty
                        </Typography>
                      )}
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
            backgroundColor: '#e8f5e8',
            borderRadius: 2,
            border: '1px solid #2e7d32'
          }}>
            <Typography variant="h6" color="success">
              Total Final Cost
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
              ${repairData.totalActualCost.toFixed(2)}
            </Typography>
          </Box>

          {/* Payment Status */}
          <Box sx={{ mt: 4, p: 3, backgroundColor: '#fff3e0', borderRadius: 2, border: '1px solid #ff9800' }}>
            <Typography variant="h6" gutterBottom color="warning">
              Payment Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Chip
                  label={getPaymentStatusLabel(repairData.paymentStatus)}
                  color={getPaymentStatusColor(repairData.paymentStatus)}
                  size="medium"
                />
              {repairData.paymentStatus === 'PENDING' && (
                <Alert severity="warning" sx={{ flex: 1 }}>
                  Payment is required before device pickup
                </Alert>
              )}
            </Box>
            {repairData.paymentStatus === 'PENDING' && (
              <Typography variant="body2" color="text.secondary">
                Please complete payment to receive your repaired device(s).
              </Typography>
            )}
          </Box>

          {/* Warranty Information */}
          {repairData.warrantyInfo && (
            <Box sx={{ mt: 4, p: 3, backgroundColor: '#e3f2fd', borderRadius: 2, border: '1px solid #2196f3' }}>
              <Typography variant="h6" gutterBottom color="info">
                Warranty Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Warranty Period
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {repairData.warrantyInfo.warrantyPeriod} days
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Warranty Expires
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatDate(repairData.warrantyInfo.warrantyExpiry)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Warranty Terms
                  </Typography>
                  <Typography variant="body1">
                    {repairData.warrantyInfo.warrantyTerms}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Pickup Instructions */}
          <Box sx={{ mt: 4, p: 3, backgroundColor: '#f3e5f5', borderRadius: 2, border: '1px solid #9c27b0' }}>
            <Typography variant="h6" gutterBottom color="secondary">
              Pickup Instructions
            </Typography>
            <Typography variant="body2" paragraph>
              1. Please bring a valid photo ID for verification.
            </Typography>
            <Typography variant="body2" paragraph>
              2. If someone else is picking up on your behalf, they must have written authorization.
            </Typography>
            <Typography variant="body2" paragraph>
              3. Test your device before leaving to ensure everything is working correctly.
            </Typography>
            <Typography variant="body2" paragraph>
              4. Keep this delivery note for warranty purposes.
            </Typography>
            <Typography variant="body2">
              5. For any issues, contact us within the warranty period.
            </Typography>
          </Box>

          {/* Notes Section */}
          {(repairData.customerNotes || repairData.internalNotes) && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom color="success">
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

          {/* Important Reminders */}
          <Box sx={{ mt: 4, p: 3, backgroundColor: '#fff8e1', borderRadius: 2, border: '1px solid #ffc107' }}>
            <Typography variant="h6" gutterBottom color="warning">
              Important Reminders
            </Typography>
            <Typography variant="body2" paragraph>
              • Backup your data regularly to prevent future data loss.
            </Typography>
            <Typography variant="body2" paragraph>
              • Keep your device clean and avoid exposure to extreme temperatures.
            </Typography>
            <Typography variant="body2" paragraph>
              • Use only recommended chargers and accessories.
            </Typography>
            <Typography variant="body2">
              • Contact us immediately if you notice any issues during the warranty period.
            </Typography>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center', pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary">
              Thank you for choosing FIXORA PRO! We hope you're satisfied with our service.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              For questions or support, please contact {repairData.assignedTechnician}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              We appreciate your business and look forward to serving you again!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DeliveryNote;
