import React from 'react';
import { Alert, Box, Typography, LinearProgress } from '@mui/material';
import { AccessTime as TimeIcon } from '@mui/icons-material';

interface TimeoutWarningProps {
  message?: string;
  showProgress?: boolean;
}

const TimeoutWarning: React.FC<TimeoutWarningProps> = ({ 
  message = "This request is taking longer than expected. Please wait...",
  showProgress = true 
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Alert 
        severity="info" 
        icon={<TimeIcon />}
        sx={{ 
          borderRadius: 2,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          {message}
        </Typography>
        {showProgress && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress 
              sx={{ 
                height: 4, 
                borderRadius: 2,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2
                }
              }} 
            />
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export default TimeoutWarning;
