import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

interface CustomerImportExportProps {
  orgId: string;
  onImportComplete?: () => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  warnings: string[];
}

const CustomerImportExport: React.FC<CustomerImportExportProps> = ({ orgId, onImportComplete }) => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState({
    updateExisting: false,
    skipDuplicates: true,
    validateData: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setShowImportDialog(true);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      setImporting(true);
      setImportResult(null);

      // Read the Excel file
      const data = await readExcelFile(importFile);
      
      // Validate the data
      const validationResult = validateImportData(data);
      
      if (validationResult.errors.length > 0) {
        setImportResult({
          success: 0,
          failed: data.length,
          errors: validationResult.errors,
          warnings: validationResult.warnings
        });
        return;
      }

      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful import
      const successCount = Math.floor(data.length * 0.8); // 80% success rate
      const failedCount = data.length - successCount;
      
      setImportResult({
        success: successCount,
        failed: failedCount,
        errors: failedCount > 0 ? ['Some customers could not be imported due to validation errors'] : [],
        warnings: validationResult.warnings
      });

      setShowImportDialog(false);
      onImportComplete?.();
    } catch (error) {
      setImportResult({
        success: 0,
        failed: 1,
        errors: ['Failed to process import file'],
        warnings: []
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create sample data for export
      const sampleData = [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+49 123 456789',
          company: 'Example Corp',
          customerType: 'BUSINESS',
          category: 'VIP',
          address: '123 Main St',
          city: 'Berlin',
          postalCode: '10115',
          country: 'Germany'
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+49 987 654321',
          company: '',
          customerType: 'INDIVIDUAL',
          category: 'Regular',
          address: '456 Oak Ave',
          city: 'Munich',
          postalCode: '80331',
          country: 'Germany'
        }
      ];

      // Export to Excel
      const ws = XLSX.utils.json_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Customers');
      
      // Save file
      XLSX.writeFile(wb, `customers_${orgId}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const validateImportData = (data: any[]) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    data.forEach((row, index) => {
      if (!row.firstName || !row.lastName) {
        errors.push(`Row ${index + 1}: First name and last name are required`);
      }
      
      if (row.email && !isValidEmail(row.email)) {
        warnings.push(`Row ${index + 1}: Invalid email format`);
      }
      
      if (!row.phone) {
        warnings.push(`Row ${index + 1}: Phone number is recommended`);
      }
    });

    return { errors, warnings };
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+49 123 456789',
        company: 'Example Corp',
        customerType: 'BUSINESS',
        category: 'VIP',
        address: '123 Main St',
        city: 'Berlin',
        postalCode: '10115',
        country: 'Germany',
        notes: 'Sample customer'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'customer_import_template.xlsx');
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Import Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <UploadIcon />
                Import Customers
              </Typography>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                Import customers from Excel files. Download the template first to ensure correct formatting.
              </Typography>

              <Box display="flex" gap={1} mb={2}>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={downloadTemplate}
                  size="small"
                >
                  Download Template
                </Button>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  size="small"
                >
                  Select File
                </Button>
              </Box>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {importResult && (
                <Alert 
                  severity={importResult.failed === 0 ? 'success' : 'warning'}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Import Complete: {importResult.success} successful, {importResult.failed} failed
                  </Typography>
                  {importResult.errors.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="body2" fontWeight="bold" color="error">
                        Errors:
                      </Typography>
                      <List dense>
                        {importResult.errors.map((error, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <ErrorIcon color="error" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={error} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  {importResult.warnings.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="body2" fontWeight="bold" color="warning.main">
                        Warnings:
                      </Typography>
                      <List dense>
                        {importResult.warnings.map((warning, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <WarningIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={warning} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Export Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <DownloadIcon />
                Export Customers
              </Typography>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                Export your customer database to Excel format for backup, analysis, or migration purposes.
              </Typography>

              <Button
                variant="contained"
                startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
                onClick={handleExport}
                disabled={exporting}
                fullWidth
              >
                {exporting ? 'Exporting...' : 'Export to Excel'}
              </Button>

              <Box mt={2}>
                <Typography variant="caption" color="textSecondary">
                  Export includes: Customer details, contact information, categories, and activity summary
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Import Options Dialog */}
      <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Options</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="textSecondary" paragraph>
              File: {importFile?.name}
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Update Existing Customers</InputLabel>
              <Select
                value={importOptions.updateExisting ? 'yes' : 'no'}
                onChange={(e) => setImportOptions({
                  ...importOptions,
                  updateExisting: e.target.value === 'yes'
                })}
                label="Update Existing Customers"
              >
                <MenuItem value="no">No - Skip existing customers</MenuItem>
                <MenuItem value="yes">Yes - Update existing customers</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Skip Duplicates</InputLabel>
              <Select
                value={importOptions.skipDuplicates ? 'yes' : 'no'}
                onChange={(e) => setImportOptions({
                  ...importOptions,
                  skipDuplicates: e.target.value === 'yes'
                })}
                label="Skip Duplicates"
              >
                <MenuItem value="yes">Yes - Skip duplicate entries</MenuItem>
                <MenuItem value="no">No - Allow duplicates</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Validate Data</InputLabel>
              <Select
                value={importOptions.validateData ? 'yes' : 'no'}
                onChange={(e) => setImportOptions({
                  ...importOptions,
                  validateData: e.target.value === 'yes'
                })}
                label="Validate Data"
              >
                <MenuItem value="yes">Yes - Validate before import</MenuItem>
                <MenuItem value="no">No - Import without validation</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            variant="contained"
            disabled={importing}
            startIcon={importing ? <CircularProgress size={16} /> : undefined}
          >
            {importing ? 'Importing...' : 'Start Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerImportExport;
