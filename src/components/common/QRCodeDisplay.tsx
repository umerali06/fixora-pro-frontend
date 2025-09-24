import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Fullscreen as FullscreenIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { QRCodeGenerator } from '../../utils/qrCodeGenerator';

interface QRCodeDisplayProps {
  data: any;
  title?: string;
  subtitle?: string;
  size?: number;
  showActions?: boolean;
  onDownload?: (qrCodeUrl: string) => void;
  onPrint?: (qrCodeUrl: string) => void;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  data,
  title = 'QR Code',
  subtitle,
  size = 200,
  showActions = true,
  onDownload,
  onPrint,
  errorCorrectionLevel = 'M',
  className
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const generateQRCode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const qrCode = await QRCodeGenerator.generateCustomQRCode(data, {
        width: size,
        errorCorrectionLevel
      });

      setQrCodeUrl(qrCode);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  }, [data, size, errorCorrectionLevel]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const handleDownload = () => {
    if (qrCodeUrl && onDownload) {
      onDownload(qrCodeUrl);
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (qrCodeUrl && onPrint) {
      onPrint(qrCodeUrl);
    } else {
      // Default print behavior
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${title}</title>
              <style>
                body { 
                  display: flex; 
                  flex-direction: column; 
                  align-items: center; 
                  justify-content: center; 
                  height: 100vh; 
                  margin: 0; 
                  font-family: Arial, sans-serif;
                }
                .qr-container { text-align: center; }
                .qr-title { font-size: 24px; margin-bottom: 10px; }
                .qr-subtitle { font-size: 16px; color: #666; margin-bottom: 20px; }
                .qr-image { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h1 class="qr-title">${title}</h1>
                ${subtitle ? `<p class="qr-subtitle">${subtitle}</p>` : ''}
                <img src="${qrCodeUrl}" alt="QR Code" class="qr-image" />
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleFullscreen = () => {
    setFullscreenOpen(true);
  };

  if (loading) {
    return (
      <Card className={className} sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Generating QR Code...
        </Typography>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className} sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={generateQRCode}
          size="small"
        >
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card className={className} sx={{ p: 2, textAlign: 'center' }}>
        <CardContent sx={{ p: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {subtitle}
            </Typography>
          )}

          <Box sx={{ mb: 2 }}>
            <img
              src={qrCodeUrl}
              alt="QR Code"
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px'
              }}
            />
          </Box>

          {showActions && (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Tooltip title="Download QR Code">
                <IconButton
                  size="small"
                  onClick={handleDownload}
                  sx={{ color: '#3BB2FF' }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Print QR Code">
                <IconButton
                  size="small"
                  onClick={handlePrint}
                  sx={{ color: '#6A6BFF' }}
                >
                  <PrintIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="View Fullscreen">
                <IconButton
                  size="small"
                  onClick={handleFullscreen}
                  sx={{ color: '#4CAF50' }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Regenerate QR Code">
                <IconButton
                  size="small"
                  onClick={generateQRCode}
                  sx={{ color: '#FF9800' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
          {title}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {subtitle}
            </Typography>
          )}
          <img
            src={qrCodeUrl}
            alt="QR Code - Fullscreen"
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '12px'
            }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={handleDownload} startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button onClick={handlePrint} startIcon={<PrintIcon />}>
            Print
          </Button>
          <Button onClick={() => setFullscreenOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QRCodeDisplay;

