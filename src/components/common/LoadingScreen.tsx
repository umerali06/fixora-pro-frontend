import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import Logo from './Logo';

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(3),
}));

const PulsingLogo = styled(Logo)(({ theme }) => ({
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      opacity: 1,
      transform: 'scale(1)',
    },
    '50%': {
      opacity: 0.8,
      transform: 'scale(1.05)',
    },
    '100%': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
}));

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  showLogo = true 
}) => {
  return (
    <LoadingContainer>
      <Fade in timeout={500}>
        <Box sx={{ textAlign: 'center' }}>
          {showLogo && (
            <LogoContainer>
              <PulsingLogo size="xlarge" variant="circular" />
            </LogoContainer>
          )}
          
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            FIXORA PRO
          </Typography>
          
          <CircularProgress 
            size={50} 
            sx={{ 
              color: 'white',
              mb: 2 
            }} 
          />
          
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {message}
          </Typography>
        </Box>
      </Fade>
    </LoadingContainer>
  );
};

export default LoadingScreen;
