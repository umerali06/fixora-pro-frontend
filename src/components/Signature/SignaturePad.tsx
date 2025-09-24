import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Save as SaveIcon,
  Gesture as GestureIcon,
  Usb as UsbIcon,
  Bluetooth as BluetoothIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface SignaturePadProps {
  open: boolean;
  onClose: () => void;
  onSave: (signatureData: string, deviceType: string) => void;
  title?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ open, onClose, onSave, title }) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [deviceType, setDeviceType] = useState<'BROWSER' | 'USB_PAD' | 'WIRELESS_PAD'>('BROWSER');
  const [externalDeviceConnected, setExternalDeviceConnected] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (open) {
      checkExternalDevices();
      setupCanvas();
    }
  }, [open]);

  const checkExternalDevices = async () => {
    // Mock check for external signature devices
    // In real implementation, check for USB/Bluetooth signature pads
    try {
      // Check for USB devices
      if ('usb' in navigator) {
        const devices = await (navigator as any).usb.getDevices();
        const signaturePads = devices.filter((device: any) => 
          device.vendorId === 0x1234 // Example vendor ID for signature pad
        );
        if (signaturePads.length > 0) {
          setExternalDeviceConnected(true);
          setDeviceType('USB_PAD');
        }
      }

      // Check for Bluetooth devices
      if ('bluetooth' in navigator) {
        // Implementation would check for paired Bluetooth signature devices
      }
    } catch (error) {
      console.log('External device check failed:', error);
    }
  };

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 500;
    canvas.height = 200;

    // Set drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setLastPoint({ x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPoint(null);
      captureSignature();
    }
  };

  const captureSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    setSignatureData(dataURL);
  };

  const clearSignature = () => {
    setupCanvas();
    setSignatureData('');
  };

  const handleSave = () => {
    if (!signatureData) {
      captureSignature();
    }
    if (signatureData) {
      onSave(signatureData, deviceType);
      onClose();
    }
  };

  const handleDeviceTypeChange = (newDeviceType: 'BROWSER' | 'USB_PAD' | 'WIRELESS_PAD') => {
    setDeviceType(newDeviceType);
    clearSignature();
    
    if (newDeviceType === 'USB_PAD') {
      connectUSBDevice();
    } else if (newDeviceType === 'WIRELESS_PAD') {
      connectBluetoothDevice();
    }
  };

  const connectUSBDevice = async () => {
    try {
      // Mock USB signature pad connection
      // In real implementation, use WebUSB API
      if ('usb' in navigator) {
        const device = await (navigator as any).usb.requestDevice({
          filters: [
            { vendorId: 0x1234 } // Example vendor ID
          ]
        });
        console.log('Connected to USB signature pad:', device);
        setExternalDeviceConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect USB device:', error);
    }
  };

  const connectBluetoothDevice = async () => {
    try {
      // Mock Bluetooth signature pad connection
      // In real implementation, use Web Bluetooth API
      if ('bluetooth' in navigator) {
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [
            { name: 'SignaturePad' }
          ],
          optionalServices: ['12345678-1234-1234-1234-123456789abc']
        });
        console.log('Connected to Bluetooth signature pad:', device);
        setExternalDeviceConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect Bluetooth device:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GestureIcon />
          {title || t('signature.captureSignature')}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>{t('signature.deviceType')}</InputLabel>
            <Select
              value={deviceType}
              onChange={(e) => handleDeviceTypeChange(e.target.value as any)}
            >
              <MenuItem value="BROWSER">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GestureIcon />
                  {t('signature.browserSignature')}
                </Box>
              </MenuItem>
              <MenuItem value="USB_PAD">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <UsbIcon />
                  {t('signature.usbSignaturePad')}
                </Box>
              </MenuItem>
              <MenuItem value="WIRELESS_PAD">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BluetoothIcon />
                  {t('signature.wirelessSignaturePad')}
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {deviceType !== 'BROWSER' && !externalDeviceConnected && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('signature.deviceNotConnected')}
          </Alert>
        )}

        {deviceType === 'BROWSER' && (
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'divider',
              backgroundColor: 'background.paper'
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('signature.signHere')}
            </Typography>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{
                border: '1px solid #ccc',
                cursor: 'crosshair',
                width: '100%',
                maxWidth: '500px',
                height: '200px',
                backgroundColor: 'white'
              }}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearSignature}
              >
                {t('signature.clear')}
              </Button>
            </Box>
          </Paper>
        )}

        {deviceType !== 'BROWSER' && externalDeviceConnected && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="primary" gutterBottom>
              {t('signature.externalDeviceReady')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('signature.pleaseSignOnDevice')}
            </Typography>
            {signatureData && (
              <Box sx={{ mt: 2 }}>
                <img 
                  src={signatureData} 
                  alt="Signature" 
                  style={{ maxWidth: '100%', border: '1px solid #ccc' }}
                />
              </Box>
            )}
          </Paper>
        )}

        {signatureData && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {t('signature.signatureCaptured')}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!signatureData && deviceType === 'BROWSER'}
        >
          {t('signature.saveSignature')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignaturePad;