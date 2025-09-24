import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Language as LanguageIcon,
  Translate as TranslateIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { supportedLanguages } from '../../i18n';

interface MultiLanguageWidgetProps {
  title?: string;
  data?: any;
  onRefresh?: () => void;
  onSettings?: () => void;
}

const MultiLanguageWidget: React.FC<MultiLanguageWidgetProps> = ({
  title,
  data,
  onRefresh,
  onSettings
}) => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);

  const currentLanguage = supportedLanguages[i18n.language as keyof typeof supportedLanguages] || supportedLanguages.en;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    handleLanguageMenuClose();
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    handleMenuClose();
  };

  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    }
    handleMenuClose();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <TranslateIcon color="primary" />
            <Typography variant="h6">
              {title || t('dashboard.widgets.multiLanguage.title', 'Multi-Language Widget')}
            </Typography>
          </Box>
        }
        action={
          <Box display="flex" alignItems="center" gap={1}>
            {/* Current Language Display */}
            <Tooltip title={t('common.language', 'Language')}>
              <Chip
                icon={<LanguageIcon />}
                label={currentLanguage.nativeName}
                size="small"
                variant="outlined"
                onClick={handleLanguageMenuOpen}
                sx={{ cursor: 'pointer' }}
              />
            </Tooltip>

            {/* Language Menu */}
            <Menu
              anchorEl={languageMenuAnchor}
              open={Boolean(languageMenuAnchor)}
              onClose={handleLanguageMenuClose}
              PaperProps={{
                sx: { minWidth: 200 }
              }}
            >
              <MenuItem disabled>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('common.selectLanguage', 'Select Language')}
                </Typography>
              </MenuItem>
              <Divider />
              {Object.entries(supportedLanguages).map(([code, lang]) => (
                <MenuItem
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  selected={code === i18n.language}
                >
                  <ListItemIcon>
                    <Typography variant="h6">{lang.flag}</Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={lang.nativeName}
                    secondary={lang.name}
                  />
                </MenuItem>
              ))}
            </Menu>

            {/* Widget Menu */}
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleRefresh}>
                <ListItemIcon>
                  <RefreshIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  {t('dashboard.widgets.refresh', 'Refresh')}
                </ListItemText>
              </MenuItem>
              <MenuItem onClick={handleSettings}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  {t('dashboard.widgets.settings', 'Settings')}
                </ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        }
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Language Information */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('dashboard.widgets.multiLanguage.currentLanguage', 'Current Language')}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h4">{currentLanguage.flag}</Typography>
              <Box>
                <Typography variant="h6">{currentLanguage.nativeName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentLanguage.name}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Language Statistics */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('dashboard.widgets.multiLanguage.languageStats', 'Language Statistics')}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                label={`${Object.keys(supportedLanguages).length} ${t('common.languages', 'Languages')}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={t('dashboard.widgets.multiLanguage.rtlSupport', 'RTL Support')}
                size="small"
                color="secondary"
                variant="outlined"
              />
              <Chip
                label={t('dashboard.widgets.multiLanguage.autoDetect', 'Auto-Detect')}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Sample Translations */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('dashboard.widgets.multiLanguage.sampleTranslations', 'Sample Translations')}
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body2">
                <strong>{t('common.dashboard', 'Dashboard')}:</strong> {t('dashboard.title', 'Dashboard')}
              </Typography>
              <Typography variant="body2">
                <strong>{t('common.customers', 'Customers')}:</strong> {t('customers.title', 'Customers')}
              </Typography>
              <Typography variant="body2">
                <strong>{t('common.orders', 'Orders')}:</strong> {t('orders.title', 'Orders')}
              </Typography>
            </Box>
          </Box>

          {/* Language Change Instructions */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('dashboard.widgets.multiLanguage.howToChange', 'How to Change Language')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.widgets.multiLanguage.clickLanguageChip', 'Click the language chip above to change the interface language.')}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MultiLanguageWidget;
