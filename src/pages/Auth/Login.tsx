import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { login, clearError } from '../../store/slices/authSlice';
import Logo from '../../components/common/Logo';

const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  padding: theme.spacing(2),
}));

const LoginCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  width: '100%',
  boxShadow: theme.shadows[10],
  borderRadius: theme.spacing(2),
}));

const LoginHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(3),
}));



const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    orgId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    orgId: '',
  });
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check server status on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('/api/v1/health', { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        console.log('Server status check error:', error);
        setServerStatus('offline');
      }
    };

    checkServerStatus();
    
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  // Redirect after successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Debug logging for errors
  useEffect(() => {
    if (error) {
      console.log('🔍 Error displayed in UI:', error);
      console.log('🔍 Error type:', typeof error);
      console.log('🔍 Error length:', error?.length);
    }
  }, [error]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear form validation errors when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear Redux API errors when user starts typing
    if (error) {
      console.log('🧹 Clearing error on input change');
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
      orgId: '',
    };

    if (!formData.email) {
      errors.email = '📧 Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '📧 Please enter a valid email address (e.g., user@example.com)';
    }

    if (!formData.password) {
      errors.password = '🔒 Password is required';
    }

    if (!formData.orgId) {
      errors.orgId = '🏢 Organization ID is required (e.g., "test-business-123")';
    } else if (formData.orgId.length < 3) {
      errors.orgId = '🏢 Organization ID must be at least 3 characters';
    } else if (!/^[a-z0-9-]+$/.test(formData.orgId)) {
      errors.orgId = '🏢 Organization ID can only contain lowercase letters, numbers, and hyphens';
    }

    setFormErrors(errors);
    return !errors.email && !errors.password && !errors.orgId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔐 Login form submitted with:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed, clearing errors...');
    
    // Force clear all errors and reset form
    dispatch(clearError());
    setFormErrors({ email: '', password: '', orgId: '' });
    
    console.log('🚀 Dispatching login action...');
    dispatch(login(formData));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <CardContent sx={{ p: 4 }}>
          <LoginHeader>
            <Logo size="xlarge" variant="circular" sx={{ margin: '0 auto', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              FIXORA PRO
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.875rem' }}>
              Use the organization ID from your registration (e.g., "test-business-123")
            </Typography>
            
            {/* Server Status Indicator */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: serverStatus === 'online' ? 'success.main' : 
                                 serverStatus === 'offline' ? 'error.main' : 'warning.main',
                  mr: 1
                }}
              />
              <Typography 
                variant="caption" 
                color={serverStatus === 'online' ? 'success.main' : 
                       serverStatus === 'offline' ? 'error.main' : 'warning.main'}
                sx={{ fontSize: '0.75rem' }}
              >
                {serverStatus === 'online' ? 'Server Online' : 
                 serverStatus === 'offline' ? 'Server Offline' : 'Checking Server...'}
              </Typography>
              
              {serverStatus === 'offline' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setServerStatus('checking');
                    setTimeout(() => {
                      const checkServerStatus = async () => {
                        try {
                          const response = await fetch('/api/v1/health', { 
                            method: 'GET',
                            signal: AbortSignal.timeout(5000)
                          });
                          if (response.ok) {
                            setServerStatus('online');
                          } else {
                            setServerStatus('offline');
                          }
                        } catch (error) {
                          console.log('Retry server status check error:', error);
                          setServerStatus('offline');
                        }
                      };
                      checkServerStatus();
                    }, 100);
                  }}
                  sx={{ ml: 2, minWidth: 'auto', px: 1, py: 0.5, fontSize: '0.75rem' }}
                >
                  Retry
                </Button>
              )}
            </Box>
          </LoginHeader>

          {location.state?.message && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {location.state.message}
            </Alert>
          )}
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                '& .MuiAlert-message': {
                  whiteSpace: 'pre-line',
                  fontSize: '0.875rem'
                }
              }}
              onClose={() => dispatch(clearError())}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => {
                    console.log('🧹 Clearing error and refreshing...');
                    dispatch(clearError());
                    // Force clear any cached state
                    localStorage.removeItem('persist:root');
                    window.location.reload();
                  }}
                >
                  Clear & Refresh
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Organization ID"
              value={formData.orgId}
              onChange={(e) => handleInputChange('orgId', e.target.value)}
              onKeyPress={handleKeyPress}
              error={!!formErrors.orgId}
              helperText={formErrors.orgId || 'Enter the organization ID from your registration'}
              margin="normal"
              required
              placeholder="e.g., test-business-123"
            />

            <TextField
              fullWidth
              label={t('auth.email')}
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onKeyPress={handleKeyPress}
              error={!!formErrors.email}
              helperText={formErrors.email}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onKeyPress={handleKeyPress}
              error={!!formErrors.password}
              helperText={formErrors.password}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('auth.login')
              )}
            </Button>



            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Button
                  variant="text"
                  onClick={() => navigate('/register')}
                  sx={{ textTransform: 'none' }}
                >
                  Create Account
                </Button>
              </Typography>
            </Box>

            {/* Troubleshooting Tips */}
            {serverStatus === 'offline' && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'orange.50', borderRadius: 1, border: '1px solid', borderColor: 'orange.200' }}>
                <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500, mb: 1 }}>
                  🔧 Server Connection Issue Detected:
                </Typography>
                <Typography variant="caption" color="warning.main" display="block">
                  • Server appears to be offline or not accessible
                </Typography>
                <Typography variant="caption" color="warning.main" display="block">
                  • Please start the server: npm run server:dev
                </Typography>
                <Typography variant="caption" color="warning.main" display="block">
                  • Wait for "🚀 FIXORA PRO Server running on port 5000" message
                </Typography>
                <Typography variant="caption" color="warning.main" display="block">
                  • Then try logging in again
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login; 