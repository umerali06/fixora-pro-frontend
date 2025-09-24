import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLanguageContext } from '../../contexts/LanguageContext';

const LanguageTest: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentLanguage } = useLanguageContext();

  return (
    <Paper sx={{ p: 2, m: 2, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h6" gutterBottom>
        Language Test Component
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2">
          <strong>Current Language (Context):</strong> {currentLanguage}
        </Typography>
        <Typography variant="body2">
          <strong>Current Language (i18n):</strong> {i18n.language}
        </Typography>
        <Typography variant="body2">
          <strong>Dashboard Welcome:</strong> {t('dashboard.welcome')}
        </Typography>
        <Typography variant="body2">
          <strong>Common Jobs:</strong> {t('common.jobs')}
        </Typography>
        <Typography variant="body2">
          <strong>Common Contacts:</strong> {t('common.contacts')}
        </Typography>
        <Typography variant="body2">
          <strong>Auth Login:</strong> {t('auth.login')}
        </Typography>
      </Box>
    </Paper>
  );
};

export default LanguageTest;