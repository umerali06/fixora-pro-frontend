import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface ImportItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  basePrice: number;
  quantity: number;
  status: 'valid' | 'warning' | 'error';
}

const BulkImport: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const parseFile = async (file: File) => {
    setIsProcessing(true);
    setImportProgress(0);
    
    try {
      // Mock file parsing
      const mockData: ImportItem[] = [
        {
          id: '1',
          name: 'iPhone 13 Pro Display',
          sku: 'IPH13PRO-DISP-001',
          category: 'Displays',
          basePrice: 299.99,
          quantity: 10,
          status: 'valid'
        },
        {
          id: '2',
          name: 'Samsung S21 Battery',
          sku: 'SAM-S21-BAT-001',
          category: 'Batteries',
          basePrice: 89.99,
          quantity: 25,
          status: 'warning'
        }
      ];
      
      // Simulate processing delay
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setImportData(mockData);
      setActiveStep(1);
    } catch (error) {
      console.error('Failed to parse file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processImport = async () => {
    setIsProcessing(true);
    setImportProgress(0);
    
    try {
      const validItems = importData.filter(item => item.status !== 'error');
      
      for (let i = 0; i < validItems.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setImportProgress(((i + 1) / validItems.length) * 100);
      }
      
      setActiveStep(2);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['Name', 'SKU', 'Category', 'Base Price', 'Quantity'];
    const csvContent = headers.join(',') + '\n' +
      'iPhone 13 Pro Display,IPH13PRO-DISP-001,Displays,299.99,10\n' +
      'Samsung S21 Battery,SAM-S21-BAT-001,Batteries,89.99,25';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    return status as 'success' | 'warning' | 'error';
  };

  const steps = ['Upload File', 'Validate Data', 'Import Complete'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bulk Import Inventory
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step>
            <StepLabel>{steps[0]}</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadTemplate}
                  sx={{ mb: 2 }}
                >
                  Download Template
                </Button>
                
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <input
                        id="file-input"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                            parseFile(file);
                          }
                        }}
                      />
                      <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Drag & drop file here, or click to select
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Supported formats: .xlsx, .xls, .csv
                      </Typography>
                      {uploadedFile && (
                        <Chip
                          label={uploadedFile.name}
                          color="primary"
                          sx={{ mt: 2 }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
                
                {isProcessing && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Processing file...
                    </Typography>
                    <LinearProgress variant="determinate" value={importProgress} />
                  </Box>
                )}
              </Box>
            </StepContent>
          </Step>
          
          <Step>
            <StepLabel>{steps[1]}</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Data Preview ({importData.length} items)
                </Typography>
                
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Quantity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getStatusIcon(item.status)}
                              <Chip
                                label={item.status}
                                size="small"
                                color={getStatusColor(item.status)}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>€{item.basePrice.toFixed(2)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button onClick={() => setActiveStep(0)}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={processImport}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Importing...' : 'Start Import'}
                  </Button>
                </Box>
                
                {isProcessing && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Importing items...
                    </Typography>
                    <LinearProgress variant="determinate" value={importProgress} />
                  </Box>
                )}
              </Box>
            </StepContent>
          </Step>
          
          <Step>
            <StepLabel>{steps[2]}</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Import completed successfully!
                  </Typography>
                  <Typography variant="body2">
                    {importData.length} items imported
                  </Typography>
                </Alert>
                
                <Button
                  variant="contained"
                  onClick={() => {
                    setActiveStep(0);
                    setImportData([]);
                    setUploadedFile(null);
                  }}
                >
                  Import More Items
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>
    </Box>
  );
};

export default BulkImport;
