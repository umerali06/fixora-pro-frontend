import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import BarcodeScanner from '../BarcodeScanner/BarcodeScanner';

interface BarcodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  showScanner?: boolean;
}

const BarcodeInput: React.FC<BarcodeInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Enter barcode or scan',
  label = 'Barcode',
  disabled = false,
  fullWidth = true,
  showScanner = true,
}) => {
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleScan = (result: string) => {
    onChange(result);
    if (onSearch) {
      onSearch(result);
    }
  };

  const handleSearch = () => {
    if (value.trim() && onSearch) {
      onSearch(value.trim());
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box>
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        label={label}
        disabled={disabled}
        fullWidth={fullWidth}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {onSearch && (
                <IconButton
                  onClick={handleSearch}
                  disabled={!value.trim()}
                  size="small"
                >
                  <SearchIcon />
                </IconButton>
              )}
              {showScanner && (
                <IconButton
                  onClick={() => setScannerOpen(true)}
                  disabled={disabled}
                  size="small"
                >
                  <ScannerIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />
      
      {showScanner && (
        <BarcodeScanner
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onScan={handleScan}
          title="Scan Barcode"
        />
      )}
    </Box>
  );
};

export default BarcodeInput; 