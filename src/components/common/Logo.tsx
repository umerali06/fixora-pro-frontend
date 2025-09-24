import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface LogoProps extends Omit<BoxProps, 'component'> {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'default' | 'light' | 'dark' | 'circular';
}

const sizeConfig = {
  small: { width: 32, height: 32 },
  medium: { width: 50, height: 50 },
  large: { width: 80, height: 80 },
  xlarge: { width: 120, height: 120 },
};

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  variant = 'default',
  sx,
  ...props 
}) => {
  const { width, height } = sizeConfig[size];
  
  const logoStyles = {
    width,
    height,
    objectFit: 'cover' as const,
    ...(variant === 'circular' && {
      borderRadius: '50%',
      border: (theme: any) => `2px solid ${theme.palette.grey[300]}`,
      boxShadow: (theme: any) => theme.shadows[3],
      background: (theme: any) => theme.palette.common.white,
      padding: 0.3,
    }),
    ...(variant === 'default' && {
      borderRadius: size === 'xlarge' ? 2 : 1,
      ...(size === 'xlarge' && {
        boxShadow: (theme: any) => theme.shadows[3],
      }),
    }),
    ...(variant === 'light' && {
      filter: 'brightness(1.2)',
      borderRadius: 1,
    }),
    ...(variant === 'dark' && {
      filter: 'brightness(0.8)',
      borderRadius: 1,
    }),
    ...sx,
  };

  return (
    <Box
      component="img"
      src="/logo.jpg"
      alt="FIXORA PRO Logo"
      sx={logoStyles}
      {...props}
    />
  );
};

export default Logo;
