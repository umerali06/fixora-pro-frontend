import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Language as LanguageIcon,
  Translate as TranslateIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  FormatSize as FormatSizeIcon,
  AccessTime as AccessTimeIcon,
  DateRange as DateRangeIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { supportedLanguages } from '../../i18n';

// TypeScript declarations for Intl API compatibility
// Note: We're not using Intl.supportedValuesOf anymore, but keeping this for future reference
declare global {
  interface Intl {
    supportedValuesOf?(type: 'timeZone'): string[];
  }
}

// Comprehensive timezone detection with fallbacks
// Note: We're using a comprehensive list of fallback timezones instead of Intl.supportedValuesOf
// to ensure maximum browser compatibility and avoid TypeScript compilation issues
const getAvailableTimezones = (): string[] => {
  // Comprehensive fallback timezones for all major regions
  const fallbackTimezones = [
    'UTC',
    // Americas
    'America/New_York',
    'America/Los_Angeles', 
    'America/Chicago',
    'America/Denver',
    'America/Toronto',
    'America/Vancouver',
    'America/Mexico_City',
    'America/Sao_Paulo',
    'America/Buenos_Aires',
    // Europe
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Madrid',
    'Europe/Amsterdam',
    'Europe/Stockholm',
    'Europe/Vienna',
    'Europe/Zurich',
    'Europe/Moscow',
    // Asia
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Seoul',
    'Asia/Singapore',
    'Asia/Hong_Kong',
    'Asia/Bangkok',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Jakarta',
    'Asia/Manila',
    // Oceania
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Perth',
    'Pacific/Auckland',
    'Pacific/Fiji',
    // Africa
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Africa/Lagos',
    'Africa/Nairobi'
  ];

  // For now, always use fallback timezones to avoid Intl API compatibility issues
  // This ensures the component works across all browsers and TypeScript configurations
  return fallbackTimezones;
};

interface LanguageSettingsState {
  language: string;
  autoDetect: boolean;
  fallbackLanguage: string;
  rtlSupport: boolean;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
  weekStart: string;
  workingHours: {
    start: string;
    end: string;
    breakStart: string;
    breakEnd: string;
  };
}

const LanguageSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  // Utility function to get current timezone safely
  const getCurrentTimezone = (): string => {
    try {
      // Check if Intl.DateTimeFormat is available
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const formatter = new Intl.DateTimeFormat();
        const options = formatter.resolvedOptions();
        if (options && options.timeZone) {
          return options.timeZone;
        }
      }
      return 'UTC';
    } catch (error) {
      console.warn('Failed to detect current timezone, using UTC:', error);
      return 'UTC';
    }
  };

  const [settings, setSettings] = useState<LanguageSettingsState>({
    language: i18n.language,
    autoDetect: true,
    fallbackLanguage: 'en',
    rtlSupport: ['ar', 'he', 'fa'].includes(i18n.language),
    timezone: getCurrentTimezone(),
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    numberFormat: 'en-US',
    currencyFormat: 'USD',
    weekStart: 'monday',
    workingHours: {
      start: '09:00',
      end: '17:00',
      breakStart: '12:00',
      breakEnd: '13:00'
    }
  });

  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Get available timezones using the comprehensive function
  const timezones: string[] = getAvailableTimezones();
  
  // Timezone validation function
  const isValidTimezone = (timezone: string): boolean => {
    try {
      new Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  };
  
  // Get user-friendly timezone display name
  const getTimezoneDisplayName = (timezone: string): string => {
    try {
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const formatter = new Intl.DateTimeFormat(undefined, { 
          timeZone: timezone,
          timeZoneName: 'long'
        });
        const parts = formatter.formatToParts(new Date());
        const timeZonePart = parts.find(part => part.type === 'timeZoneName');
        if (timeZonePart) {
          return timeZonePart.value;
        }
      }
      // Fallback: return the timezone name without region prefix
      return timezone.includes('/') ? timezone.split('/')[1].replace(/_/g, ' ') : timezone;
    } catch {
      return timezone.includes('/') ? timezone.split('/')[1].replace(/_/g, ' ') : timezone;
    }
  };
  
  // Get current time in selected timezone
  const getCurrentTimeInTimezone = (timezone: string): string => {
    try {
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const formatter = new Intl.DateTimeFormat(undefined, {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        return formatter.format(new Date());
      }
      return '--:--:--';
    } catch {
      return '--:--:--';
    }
  };
  
  // Group timezones by region for better organization
  const groupedTimezones = timezones.reduce((groups, timezone) => {
    const region = timezone.split('/')[0];
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(timezone);
    return groups;
  }, {} as Record<string, string[]>);

  // Timezone search functionality
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const filteredTimezones = timezoneSearch
    ? timezones.filter(tz => 
        tz.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
        tz.replace(/_/g, ' ').toLowerCase().includes(timezoneSearch.toLowerCase())
      )
    : timezones;
  
  const filteredGroupedTimezones = timezoneSearch
    ? filteredTimezones.reduce((groups, timezone) => {
        const region = timezone.split('/')[0];
        if (!groups[region]) {
          groups[region] = [];
        }
        groups[region].push(timezone);
        return groups;
      }, {} as Record<string, string[]>)
    : groupedTimezones;
  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
  ];
  const timeFormats = [
    { value: '12', label: '12-hour (AM/PM)' },
    { value: '24', label: '24-hour' }
  ];
  const numberFormats = [
    { value: 'en-US', label: '1,234.56 (US)' },
    { value: 'de-DE', label: '1.234,56 (EU)' },
    { value: 'fr-FR', label: '1 234,56 (FR)' }
  ];
  const currencyFormats = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'JPY', label: 'JPY (¥)' }
  ];
  const weekStarts = [
    { value: 'monday', label: t('common.monday', 'Monday') },
    { value: 'sunday', label: t('common.sunday', 'Sunday') }
  ];

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('languageSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading language settings:', error);
      }
    }
  }, []);

  const handleSettingChange = (key: keyof LanguageSettingsState, value: any) => {
    try {
      // Special handling for timezone changes
      if (key === 'timezone' && typeof value === 'string') {
        if (!isValidTimezone(value)) {
          setErrors(['Invalid timezone selected. Please choose a valid timezone.']);
          return;
        }
      }
      
      setSettings(prev => ({ ...prev, [key]: value }));
      setSaved(false);
      setErrors([]);
    } catch (error) {
      console.error('Error updating setting:', error);
      setErrors(['Failed to update setting']);
    }
  };

  const handleWorkingHoursChange = (key: keyof typeof settings.workingHours, value: string) => {
    try {
      setSettings(prev => ({
        ...prev,
        workingHours: { ...prev.workingHours, [key]: value }
      }));
      setSaved(false);
    } catch (error) {
      console.error('Error updating working hours:', error);
      setErrors(['Failed to update working hours']);
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    handleSettingChange('language', languageCode);
    handleSettingChange('rtlSupport', ['ar', 'he', 'fa'].includes(languageCode));
    
    // Change the language immediately
    i18n.changeLanguage(languageCode);
    
    // Update document direction
    if (['ar', 'he', 'fa'].includes(languageCode)) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem('languageSettings', JSON.stringify(settings));
      setSaved(true);
      setErrors([]);
      
      // Apply settings
      if (settings.language !== i18n.language) {
        i18n.changeLanguage(settings.language);
      }
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setErrors(['Failed to save settings']);
    }
  };

  const handleReset = () => {
    const defaultSettings: LanguageSettingsState = {
      language: 'en',
      autoDetect: true,
      fallbackLanguage: 'en',
      rtlSupport: false,
      timezone: getCurrentTimezone(),
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12',
      numberFormat: 'en-US',
      currencyFormat: 'USD',
      weekStart: 'monday',
      workingHours: {
        start: '09:00',
        end: '17:00',
        breakStart: '12:00',
        breakEnd: '13:00'
      }
    };
    
    setSettings(defaultSettings);
    setSaved(false);
    setErrors([]);
  };

  const currentLanguage = supportedLanguages[settings.language as keyof typeof supportedLanguages] || supportedLanguages.en;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('common.languageSettings', 'Language Settings')}
      </Typography>
      
      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('common.settingsSaved', 'Settings saved successfully!')}
        </Alert>
      )}
      
      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.join(', ')}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Language Selection */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <LanguageIcon color="primary" />
                  <Typography variant="h6">
                    {t('common.language', 'Language')}
                  </Typography>
                </Box>
              }
            />
            <CardContent>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('common.selectLanguage', 'Select Language')}</InputLabel>
                <Select
                  value={settings.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  label={t('common.selectLanguage', 'Select Language')}
                >
                  {Object.entries(supportedLanguages).map(([code, lang]) => (
                    <MenuItem key={code} value={code}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6">{lang.flag}</Typography>
                        <Box>
                          <Typography variant="body1">{lang.nativeName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {lang.name}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoDetect}
                    onChange={(e) => handleSettingChange('autoDetect', e.target.checked)}
                  />
                }
                label={t('common.autoDetectLanguage', 'Auto-detect Language')}
              />

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>{t('common.fallbackLanguage', 'Fallback Language')}</InputLabel>
                <Select
                  value={settings.fallbackLanguage}
                  onChange={(e) => handleSettingChange('fallbackLanguage', e.target.value)}
                  label={t('common.fallbackLanguage', 'Fallback Language')}
                >
                  {Object.entries(supportedLanguages).map(([code, lang]) => (
                    <MenuItem key={code} value={code}>
                      {lang.nativeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.rtlSupport}
                    onChange={(e) => handleSettingChange('rtlSupport', e.target.checked)}
                    disabled={!['ar', 'he', 'fa'].includes(settings.language)}
                  />
                }
                label={t('common.rtlSupport', 'RTL Support')}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Current Language Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <InfoIcon color="info" />
                  <Typography variant="h6">
                    {t('common.currentLanguage', 'Current Language')}
                  </Typography>
                </Box>
              }
            />
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                <Typography variant="h2">{currentLanguage.flag}</Typography>
                <Box>
                  <Typography variant="h5">{currentLanguage.nativeName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentLanguage.name}
                  </Typography>
                </Box>
              </Box>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('common.language', 'Language')}
                    secondary={currentLanguage.nativeName}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('common.textDirection', 'Text Direction')}
                    secondary={settings.rtlSupport ? t('common.rightToLeft', 'Right to Left') : t('common.leftToRight', 'Left to Right')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('common.timezone', 'Timezone')}
                    secondary={settings.timezone}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Formatting Settings */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <FormatSizeIcon color="primary" />
                <Typography variant="h6">
                  {t('common.formattingSettings', 'Formatting Settings')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{t('common.dateFormat', 'Date Format')}</InputLabel>
                    <Select
                      value={settings.dateFormat}
                      onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                      label={t('common.dateFormat', 'Date Format')}
                    >
                      {dateFormats.map(format => (
                        <MenuItem key={format.value} value={format.value}>
                          {format.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{t('common.timeFormat', 'Time Format')}</InputLabel>
                    <Select
                      value={settings.timeFormat}
                      onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                      label={t('common.timeFormat', 'Time Format')}
                    >
                      {timeFormats.map(format => (
                        <MenuItem key={format.value} value={format.value}>
                          {format.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{t('common.numberFormat', 'Number Format')}</InputLabel>
                    <Select
                      value={settings.numberFormat}
                      onChange={(e) => handleSettingChange('numberFormat', e.target.value)}
                      label={t('common.numberFormat', 'Number Format')}
                    >
                      {numberFormats.map(format => (
                        <MenuItem key={format.value} value={format.value}>
                          {format.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{t('common.currencyFormat', 'Currency Format')}</InputLabel>
                    <Select
                      value={settings.currencyFormat}
                      onChange={(e) => handleSettingChange('currencyFormat', e.target.value)}
                      label={t('common.currencyFormat', 'Currency Format')}
                    >
                      {currencyFormats.map(format => (
                        <MenuItem key={format.value} value={format.value}>
                          {format.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{t('common.weekStart', 'Week Start')}</InputLabel>
                    <Select
                      value={settings.weekStart}
                      onChange={(e) => handleSettingChange('weekStart', e.target.value)}
                      label={t('common.weekStart', 'Week Start')}
                    >
                      {weekStarts.map(day => (
                        <MenuItem key={day.value} value={day.value}>
                          {day.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{t('common.timezone', 'Timezone')}</InputLabel>
                    <Select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      label={t('common.timezone', 'Timezone')}
                    >
                      {/* Timezone Search */}
                      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                        <TextField
                          size="small"
                          placeholder="Search timezones..."
                          value={timezoneSearch}
                          onChange={(e) => setTimezoneSearch(e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                      
                      {/* Timezone Options */}
                      {Object.entries(filteredGroupedTimezones).map(([region, regionTimezones]) => (
                        <div key={region}>
                          <MenuItem disabled sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            {region}
                          </MenuItem>
                          {regionTimezones.map((tz: string) => (
                            <MenuItem key={tz} value={tz} sx={{ pl: 3 }}>
                              <Box>
                                <Typography variant="body2">
                                  {getTimezoneDisplayName(tz)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {tz}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </div>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Working Hours */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <ScheduleIcon color="primary" />
                <Typography variant="h6">
                  {t('common.workingHours', 'Working Hours')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={t('common.startTime', 'Start Time')}
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={t('common.endTime', 'End Time')}
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={t('common.breakStart', 'Break Start')}
                    type="time"
                    value={settings.workingHours.breakStart}
                    onChange={(e) => handleWorkingHoursChange('breakStart', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={t('common.breakEnd', 'Break End')}
                    type="time"
                    value={settings.workingHours.breakEnd}
                    onChange={(e) => handleWorkingHoursChange('breakEnd', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={handleReset}
          startIcon={<RefreshIcon />}
        >
          {t('common.reset', 'Reset')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<SaveIcon />}
          disabled={saved}
        >
          {t('common.save', 'Save')}
        </Button>
      </Box>
    </Box>
  );
};

export default LanguageSettings;
