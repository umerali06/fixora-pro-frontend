import QRCode from 'qrcode';

export interface QRCodeData {
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  amount: number;
  currency: string;
  date: string;
  organizationId: string;
  verificationUrl?: string;
}

export class QRCodeGenerator {
  /**
   * Generate QR code for invoice tracking
   */
  static async generateInvoiceQRCode(data: QRCodeData): Promise<string> {
    try {
      const qrData = {
        type: 'invoice',
        invoiceId: data.invoiceId,
        invoiceNumber: data.invoiceNumber,
        customerId: data.customerId,
        amount: data.amount,
        currency: data.currency,
        date: data.date,
        orgId: data.organizationId,
        verificationUrl: data.verificationUrl || `${window.location.origin}/invoice/verify/${data.invoiceId}`
      };

      const qrString = JSON.stringify(qrData);
      
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code for repair tracking
   */
  static async generateRepairQRCode(repairTicketId: string, organizationId: string): Promise<string> {
    try {
      const qrData = {
        type: 'repair',
        repairTicketId,
        orgId: organizationId,
        trackingUrl: `${window.location.origin}/repair/track/${repairTicketId}`
      };

      const qrString = JSON.stringify(qrData);
      
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating repair QR code:', error);
      throw new Error('Failed to generate repair QR code');
    }
  }

  /**
   * Generate QR code for warranty card
   */
  static async generateWarrantyQRCode(warrantyId: string, organizationId: string): Promise<string> {
    try {
      const qrData = {
        type: 'warranty',
        warrantyId,
        orgId: organizationId,
        warrantyUrl: `${window.location.origin}/warranty/verify/${warrantyId}`
      };

      const qrString = JSON.stringify(qrData);
      
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating warranty QR code:', error);
      throw new Error('Failed to generate warranty QR code');
    }
  }

  /**
   * Generate QR code for device tag
   */
  static async generateDeviceTagQRCode(tagId: string, deviceInfo: string, organizationId: string): Promise<string> {
    try {
      const qrData = {
        type: 'device_tag',
        tagId,
        deviceInfo,
        orgId: organizationId,
        deviceUrl: `${window.location.origin}/device/info/${tagId}`
      };

      const qrString = JSON.stringify(qrData);
      
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 150,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating device tag QR code:', error);
      throw new Error('Failed to generate device tag QR code');
    }
  }

  /**
   * Generate QR code as SVG
   */
  static async generateQRCodeSVG(data: string): Promise<string> {
    try {
      const svg = await QRCode.toString(data, {
        type: 'svg',
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      return svg;
    } catch (error) {
      console.error('Error generating QR code SVG:', error);
      throw new Error('Failed to generate QR code SVG');
    }
  }

  /**
   * Generate QR code for custom data
   */
  static async generateCustomQRCode(data: any, options?: {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    color?: {
      dark?: string;
      light?: string;
    };
  }): Promise<string> {
    try {
      const qrString = typeof data === 'string' ? data : JSON.stringify(data);
      
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: options?.width || 200,
        margin: options?.margin || 2,
        color: options?.color || {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: options?.errorCorrectionLevel || 'M'
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating custom QR code:', error);
      throw new Error('Failed to generate custom QR code');
    }
  }
}

export default QRCodeGenerator;

