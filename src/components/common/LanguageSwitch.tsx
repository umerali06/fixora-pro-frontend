import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
  Typography,
  Divider
} from '@mui/material';
import {
  Language as LanguageIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../i18n';

interface LanguageSwitchProps {
  compact?: boolean;
  variant?: 'header' | 'sidebar' | 'settings' | 'floating';
  showFloating?: boolean;
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ compact = false, variant = 'header', showFloating = false }) => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      
      // Update document direction for RTL languages
      if (['ar', 'he', 'fa'].includes(languageCode)) {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
      
      handleClose();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const currentLanguage = supportedLanguages[i18n.language as keyof typeof supportedLanguages] || supportedLanguages.en;
  const open = Boolean(anchorEl);

  // Different styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'sidebar':
        return {
          backgroundColor: 'transparent',
          color: '#9aa7be',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        };
      case 'settings':
        return {
          backgroundColor: 'rgba(59, 178, 255, 0.1)',
          color: '#3bb2ff',
          '&:hover': {
            backgroundColor: 'rgba(59, 178, 255, 0.2)',
          },
        };
      default: // header
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        };
    }
  };

  const getMenuStyles = () => {
    switch (variant) {
      case 'sidebar':
        return {
          backgroundColor: '#2f3a53',
          border: '1px solid #3a4661',
          '& .MuiMenuItem-root': {
            color: '#cdd7e6',
            '&:hover': {
              backgroundColor: '#3a4661',
            },
            '&.Mui-selected': {
              backgroundColor: '#3bb2ff',
              color: 'white',
            },
          },
        };
      default:
        return {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          '& .MuiMenuItem-root': {
            color: '#374151',
            '&:hover': {
              backgroundColor: '#F3F4F6',
            },
            '&.Mui-selected': {
              backgroundColor: 'primary.light',
              color: 'primary.main',
            },
          },
        };
    }
  };

  return (
    <>
      <Tooltip title={t('common.changeLanguage', 'Change Language') || 'Change Language'}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          size={compact ? "small" : "medium"}
          sx={{
            ...getButtonStyles(),
            ...(compact && {
              width: 32,
              height: 32,
            }),
          }}
        >
          <Box display="flex" alignItems="center" gap={0.5}>
            <LanguageIcon sx={{ fontSize: compact ? 16 : 20 }} />
            {!compact && (
              <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1 }}>
                {currentLanguage.flag}
              </Typography>
            )}
          </Box>
        </IconButton>
      </Tooltip>

      {/* Floating Language Switcher */}
      {showFloating && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <Tooltip title={t('common.quickLanguageSwitch', 'Quick Language Switch') || 'Quick Language Switch'} placement="left">
            <IconButton
              onClick={handleClick}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                width: 56,
                height: 56,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <LanguageIcon sx={{ fontSize: 24 }} />
                <Typography variant="h6">{currentLanguage.flag}</Typography>
              </Box>
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: compact ? 200 : 280,
            maxHeight: 400,
            overflow: 'auto',
            ...getMenuStyles(),
            '& .MuiMenuItem-root': {
              minHeight: compact ? 40 : 48,
            },
          },
        }}
      >
        {/* Header */}
        <MenuItem disabled>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {t('common.selectLanguage', 'Select Language') || 'Select Language'}
          </Typography>
        </MenuItem>
        
        <Divider />
        
        {/* Current Language Display */}
        <MenuItem disabled>
          <Box display="flex" alignItems="center" gap={1} sx={{ width: '100%' }}>
            <Typography variant="h6">{currentLanguage.flag}</Typography>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t('common.currentLanguage', 'Current Language') || 'Current Language'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentLanguage.nativeName} ({currentLanguage.name})
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        
        <Divider />
        
        {/* Language Options */}
        {Object.entries(supportedLanguages).map(([code, lang]) => (
          <MenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            selected={code === i18n.language}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon>
              <Typography variant="h6">{lang.flag}</Typography>
            </ListItemIcon>
            <ListItemText
              primary={lang.nativeName}
              secondary={lang.name}
              primaryTypographyProps={{
                sx: { fontWeight: code === i18n.language ? 600 : 400 }
              }}
            />
            {code === i18n.language && (
              <CheckIcon color="primary" fontSize="small" />
            )}
          </MenuItem>
        ))}
        
        <Divider />
        
        {/* Language Info */}
        <MenuItem disabled>
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {Object.keys(supportedLanguages).length} {t('common.languages', 'Languages') || 'Languages'} • 
              {t('common.rtlSupport', 'RTL Support') || 'RTL Support'} • 
              {t('common.autoDetect', 'Auto-Detect') || 'Auto-Detect'}
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSwitch;
