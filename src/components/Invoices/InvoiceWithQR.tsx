import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  QrCode as QRCodeIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import QRCodeDisplay from '../common/QRCodeDisplay';
import { QRCodeGenerator, QRCodeData } from '../../utils/qrCodeGenerator';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  notes?: string;
  qrCode?: string;
  trackingEnabled?: boolean;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceWithQRProps {
  invoice: Invoice;
  organizationId: string;
  onPrint?: () => void;
  onDownload?: () => void;
  onEmail?: () => void;
  showQRCode?: boolean;
  enableTracking?: boolean;
  onToggleTracking?: (enabled: boolean) => void;
}

const InvoiceWithQR: React.FC<InvoiceWithQRProps> = ({
  invoice,
  organizationId,
  onPrint,
  onDownload,
  onEmail,
  showQRCode = true,
  enableTracking = false,
  onToggleTracking
}) => {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showQRCode && invoice.trackingEnabled) {
      generateQRCode();
    }
  }, [invoice, showQRCode]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);

      const qrData: QRCodeData = {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerEmail, // Using email as customer identifier
        amount: invoice.total,
        currency: 'EUR',
        date: invoice.issueDate,
        organizationId,
        verificationUrl: `${window.location.origin}/invoice/verify/${invoice.id}`
      };

      const qrCode = await QRCodeGenerator.generateInvoiceQRCode(qrData);
      setQrCodeUrl(qrCode);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTracking = () => {
    if (onToggleTracking) {
      onToggleTracking(!invoice.trackingEnabled);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'sent': return '#2196F3';
      case 'overdue': return '#F44336';
      case 'cancelled': return '#9E9E9E';
      default: return '#FF9800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'sent': return 'Sent';
      case 'paid': return 'Paid';
      case 'overdue': return 'Overdue';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Invoice Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#49566F', mb: 1 }}>
              Invoice #{invoice.invoiceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Issued: {formatDate(invoice.issueDate)}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Chip
              label={getStatusText(invoice.status)}
              sx={{
                backgroundColor: `${getStatusColor(invoice.status)}15`,
                color: getStatusColor(invoice.status),
                fontWeight: 600,
                mb: 1
              }}
            />
            {enableTracking && (
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant={invoice.trackingEnabled ? "contained" : "outlined"}
                  onClick={handleToggleTracking}
                  startIcon={<QRCodeIcon />}
                  sx={{
                    backgroundColor: invoice.trackingEnabled ? '#4CAF50' : 'transparent',
                    borderColor: '#4CAF50',
                    color: invoice.trackingEnabled ? 'white' : '#4CAF50',
                    textTransform: 'none',
                    fontSize: '0.75rem'
                  }}
                >
                  {invoice.trackingEnabled ? 'Tracking ON' : 'Enable Tracking'}
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Customer Information */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#49566F' }}>
              Bill To
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {invoice.customerName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {invoice.customerEmail}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {invoice.customerPhone}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#49566F' }}>
              Invoice Details
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
            </Typography>
            {invoice.paidDate && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Paid Date:</strong> {formatDate(invoice.paidDate)}
              </Typography>
            )}
            <Typography variant="body2">
              <strong>Total Amount:</strong> {formatCurrency(invoice.total)}
            </Typography>
          </Grid>
        </Grid>

        {/* Invoice Items */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#49566F' }}>
            Items
          </Typography>
          {invoice.items.map((item, index) => (
            <Box key={item.id} sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 1,
              borderBottom: index < invoice.items.length - 1 ? '1px solid #E5E7EB' : 'none'
            }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {item.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatCurrency(item.total)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Totals */}
        <Box sx={{ textAlign: 'right', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Subtotal:</Typography>
            <Typography variant="body1">{formatCurrency(invoice.amount)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Tax:</Typography>
            <Typography variant="body1">{formatCurrency(invoice.tax)}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Total:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#3BB2FF' }}>
              {formatCurrency(invoice.total)}
            </Typography>
          </Box>
        </Box>

        {/* Notes */}
        {invoice.notes && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#49566F' }}>
              Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {invoice.notes}
            </Typography>
          </Box>
        )}

        {/* QR Code Section */}
        {showQRCode && invoice.trackingEnabled && qrCodeUrl && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#49566F' }}>
              QR Code Tracking
            </Typography>
            <QRCodeDisplay
              data={{
                type: 'invoice',
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                amount: invoice.total,
                currency: 'EUR',
                date: invoice.issueDate
              }}
              title="Invoice QR Code"
              subtitle="Scan to verify and track this invoice"
              size={150}
              showActions={true}
            />
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {showQRCode && invoice.trackingEnabled && qrCodeUrl && (
            <Button
              variant="outlined"
              startIcon={<QRCodeIcon />}
              onClick={() => setQrDialogOpen(true)}
              sx={{
                borderColor: '#4CAF50',
                color: '#4CAF50',
                textTransform: 'none',
                borderRadius: '20px'
              }}
            >
              View QR Code
            </Button>
          )}
          
          {onPrint && (
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={onPrint}
              sx={{
                borderColor: '#6A6BFF',
                color: '#6A6BFF',
                textTransform: 'none',
                borderRadius: '20px'
              }}
            >
              Print
            </Button>
          )}
          
          {onDownload && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={onDownload}
              sx={{
                borderColor: '#3BB2FF',
                color: '#3BB2FF',
                textTransform: 'none',
                borderRadius: '20px'
              }}
            >
              Download
            </Button>
          )}
          
          {onEmail && (
            <Button
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={onEmail}
              sx={{
                borderColor: '#FF9800',
                color: '#FF9800',
                textTransform: 'none',
                borderRadius: '20px'
              }}
            >
              Email
            </Button>
          )}
        </Box>
      </CardContent>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
          Invoice QR Code - #{invoice.invoiceNumber}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <QRCodeDisplay
            data={{
              type: 'invoice',
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              customerId: invoice.customerEmail,
              amount: invoice.total,
              currency: 'EUR',
              date: invoice.issueDate,
              organizationId,
              verificationUrl: `${window.location.origin}/invoice/verify/${invoice.id}`
            }}
            title="Invoice Tracking QR Code"
            subtitle={`Scan this QR code to verify and track invoice #${invoice.invoiceNumber}`}
            size={250}
            showActions={true}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setQrDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default InvoiceWithQR;

