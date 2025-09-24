import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
  Person,
  Phone,
  Language,
  Public
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import Logo from '../../components/common/Logo';

const RegisterContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  padding: theme.spacing(2),
}));

const RegisterCard = styled(Card)(({ theme }) => ({
  maxWidth: 600,
  width: '100%',
  boxShadow: theme.shadows[10],
  borderRadius: theme.spacing(2),
}));

const RegisterHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(3),
}));

const steps = ['Organization Setup', 'User Account', 'Business Details'];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
     const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [progressMessage, setProgressMessage] = useState('');

  // Form data for all steps
  const [formData, setFormData] = useState({
    // Organization
    orgName: '',
    orgSlug: '',
    orgEmail: '',
    orgPhone: '',
    orgWebsite: '',
    orgAddress: '',
    orgCity: '',
    orgPostalCode: '',
    orgCountry: 'Germany',
    orgCurrency: 'EUR',
    orgLanguage: 'de',
    orgTimezone: 'Europe/Berlin',
    
    // User Account
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    title: '',
    department: '',
    role: 'USER',
    
    // Business Details
    taxNumber: '',
    vatNumber: '',
    commercialRegister: '',
    primaryColor: '#1976d2'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear errors when user types
  };

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];

    switch (step) {
             case 0: // Organization
         if (!formData.orgName) errors.push('Organization name is required');
         if (!formData.orgSlug) errors.push('Organization slug is required');
         if (!formData.orgSlug || formData.orgSlug.length < 3) errors.push('Organization slug must be at least 3 characters');
         if (!formData.orgSlug || !/^[a-z0-9-]+$/.test(formData.orgSlug)) errors.push('Organization slug can only contain lowercase letters, numbers, and hyphens');
         if (!formData.orgEmail) errors.push('Organization email is required');
         if (!formData.orgPhone) errors.push('Organization phone is required');
         if (formData.orgPhone && !/^[\+]?[1-9][0-9]{0,15}$/.test(formData.orgPhone)) {
           errors.push('Please enter a valid business phone number (must start with 1-9, only digits and optional + at start)');
         }
         break;
      
             case 1: // User Account
         if (!formData.firstName) errors.push('First name is required');
         if (!formData.lastName) errors.push('Last name is required');
         if (!formData.email) errors.push('Email is required');
         if (!formData.password) errors.push('Password is required');
         if (formData.password.length < 8) errors.push('Password must be at least 8 characters');
         if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
           errors.push('Password must contain at least one lowercase letter, one uppercase letter, and one number');
         }
         if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
         if (formData.phone && !/^[\+]?[1-9][0-9]{0,15}$/.test(formData.phone)) {
           errors.push('Please enter a valid phone number (must start with 1-9, only digits and optional + at start)');
         }
         break;
      
      case 2: // Business Details
        // Optional fields, no validation required
        break;
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const generateOrgSlug = (name: string) => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Add a random suffix to make it unique
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const uniqueSlug = `${baseSlug}-${randomSuffix}`;
    
    handleInputChange('orgSlug', uniqueSlug);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

         setLoading(true);
     setError('');
     setProgressMessage('Starting registration process...');

         try {
               setProgressMessage('Creating your business organization...');
        console.log('Creating organization with data:', {
          name: formData.orgName,
          slug: formData.orgSlug,
          email: formData.orgEmail,
          phone: formData.orgPhone
        });
        
        // First create organization
       const orgResponse = await fetch('/api/v1/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.orgName,
          slug: formData.orgSlug,
          email: formData.orgEmail,
          phone: formData.orgPhone,
          website: formData.orgWebsite,
          address: formData.orgAddress,
          city: formData.orgCity,
          postalCode: formData.orgPostalCode,
          country: formData.orgCountry,
          currency: formData.orgCurrency,
          language: formData.orgLanguage,
          timezone: formData.orgTimezone,
          taxNumber: formData.taxNumber,
          vatNumber: formData.vatNumber,
          commercialRegister: formData.commercialRegister,
          primaryColor: formData.primaryColor
        }),
      });

             if (!orgResponse.ok) {
         const errorData = await orgResponse.json();
         if (errorData.message === 'Organization with this slug already exists') {
           throw new Error('This business name is already taken. Please choose a different name or add a location (e.g., "Fixora Berlin" or "Fixora Munich").');
         }
         throw new Error(errorData.message || 'Failed to create organization. Please try again.');
       }

               const orgData = await orgResponse.json();
        console.log('Organization response:', orgData);
        console.log('Organization response type:', typeof orgData);
        console.log('Organization response keys:', Object.keys(orgData));
        
        // Ensure we have the organization ID
        if (!orgData.data || !orgData.data.id) {
          console.error('Missing organization data:', orgData);
          console.error('orgData.data:', orgData.data);
          console.error('orgData.data?.id:', orgData.data?.id);
          throw new Error('Failed to get organization ID. Please try again.');
        }
        
                 console.log('Organization ID:', orgData.data.id);
         console.log('Organization ID type:', typeof orgData.data.id);
         
         setProgressMessage('Organization created successfully! Now creating your user account...');
 
                      const userRegistrationData = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          orgId: orgData.data.id,
          username: formData.username,
          phone: formData.phone,
          title: formData.title,
          department: formData.department,
          role: formData.role
        };
        
        console.log('Creating user with data:', userRegistrationData);
        console.log('User registration data type:', typeof userRegistrationData);
        console.log('User registration data keys:', Object.keys(userRegistrationData));
        console.log('orgId value:', userRegistrationData.orgId);
        console.log('orgId type:', typeof userRegistrationData.orgId);
        
                 setProgressMessage('Setting up your user account...');
         // Then create user account
         const userResponse = await fetch('/api/v1/auth/register', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
                  body: JSON.stringify(userRegistrationData),
       });

                           if (!userResponse.ok) {
         const userErrorData = await userResponse.json();
         console.error('User registration error:', userErrorData);
         
         // Handle different types of validation errors
         if (userErrorData.details && Array.isArray(userErrorData.details)) {
           const errorMessages = userErrorData.details.map((detail: any) => {
             const field = detail.field;
             const message = detail.message;
             
             // Convert field names to user-friendly labels
             const fieldLabels: { [key: string]: string } = {
               'email': 'Email address',
               'password': 'Password',
               'firstName': 'First name',
               'lastName': 'Last name',
               'orgId': 'Organization ID',
               'phone': 'Phone number',
               'username': 'Username'
             };
             
             const friendlyField = fieldLabels[field] || field;
             
             // Convert validation messages to user-friendly language
             let friendlyMessage = message;
             if (message.includes('already exists')) {
               friendlyMessage = 'This email is already registered. Please use a different email address.';
             } else if (message.includes('required')) {
               friendlyMessage = `${friendlyField} is required.`;
             } else if (message.includes('valid')) {
               friendlyMessage = `Please enter a valid ${friendlyField.toLowerCase()}.`;
             } else if (message.includes('length')) {
               friendlyMessage = `${friendlyField} must meet the length requirements.`;
             }
             
             return `${friendlyField}: ${friendlyMessage}`;
           }).join('\n');
           
           throw new Error(`Registration failed:\n\n${errorMessages}\n\nPlease fix these issues and try again.`);
         }
         
         // Handle general error messages
         if (userErrorData.message) {
           let friendlyMessage = userErrorData.message;
           
           // Convert technical messages to user-friendly ones
           if (userErrorData.message.includes('Validation failed')) {
             friendlyMessage = 'Some information you entered is not valid. Please check the form and try again.';
           } else if (userErrorData.message.includes('already exists')) {
             friendlyMessage = 'This email is already registered. Please use a different email address.';
           } else if (userErrorData.message.includes('Organization ID is required')) {
             friendlyMessage = 'There was a problem creating your organization. Please try again.';
           }
           
           throw new Error(friendlyMessage);
         }
         
         throw new Error('Failed to create your account. Please try again or contact support if the problem persists.');
       }
       
                const userData = await userResponse.json();
         console.log('User registration successful:', userData);
         
         setProgressMessage('Registration successful! Redirecting to login...');
 
              // Registration successful
       navigate('/login', { 
         state: { 
           message: `🎉 Registration successful! Your business "${formData.orgName}" has been created.\n\nPlease log in with your new account to start managing your repair business.` 
         } 
       });

         } catch (err: any) {
       setError(err.message || 'Registration failed. Please try again.');
       setProgressMessage(''); // Clear progress message on error
     } finally {
       setLoading(false);
     }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Organization Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Organization Name *"
                value={formData.orgName}
                onChange={(e) => {
                  handleInputChange('orgName', e.target.value);
                  if (e.target.value) generateOrgSlug(e.target.value);
                }}
                InputProps={{
                  startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
                         <Grid item xs={12} md={6}>
               <TextField
                 fullWidth
                 label="Organization Slug *"
                 value={formData.orgSlug}
                 onChange={(e) => {
                   const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                   handleInputChange('orgSlug', value);
                 }}
                 helperText="This will be used in your app URL. Only lowercase letters, numbers, and hyphens allowed."
                 InputProps={{
                   startAdornment: <Public sx={{ mr: 1, color: 'text.secondary' }} />,
                   endAdornment: (
                     <InputAdornment position="end">
                       <Button
                         size="small"
                         onClick={() => generateOrgSlug(formData.orgName)}
                         disabled={!formData.orgName}
                         sx={{ minWidth: 'auto', px: 1 }}
                       >
                         Regenerate
                       </Button>
                     </InputAdornment>
                   )
                 }}
               />
             </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Email *"
                type="email"
                value={formData.orgEmail}
                onChange={(e) => handleInputChange('orgEmail', e.target.value)}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
                         <Grid item xs={12} md={6}>
               <TextField
                 fullWidth
                 label="Business Phone *"
                 value={formData.orgPhone}
                 onChange={(e) => {
                   // Only allow numbers and plus sign, must start with 1-9
                   const value = e.target.value.replace(/[^0-9\+]/g, '');
                   if (value && !value.startsWith('+') && !/^[1-9]/.test(value)) {
                     return; // Don't allow starting with 0
                   }
                   handleInputChange('orgPhone', value);
                 }}
                 helperText="Enter a valid phone number (e.g., +49123456789 or 123456789)"
                 InputProps={{
                   startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                 }}
               />
             </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={formData.orgWebsite}
                onChange={(e) => handleInputChange('orgWebsite', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.orgAddress}
                onChange={(e) => handleInputChange('orgAddress', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.orgCity}
                onChange={(e) => handleInputChange('orgCity', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.orgPostalCode}
                onChange={(e) => handleInputChange('orgPostalCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.orgCountry}
                  label="Country"
                  onChange={(e) => handleInputChange('orgCountry', e.target.value)}
                >
                  <MenuItem value="Germany">Germany</MenuItem>
                  <MenuItem value="United States">United States</MenuItem>
                  <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                  <MenuItem value="France">France</MenuItem>
                  <MenuItem value="Spain">Spain</MenuItem>
                  <MenuItem value="Italy">Italy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.orgCurrency}
                  label="Currency"
                  onChange={(e) => handleInputChange('orgCurrency', e.target.value)}
                >
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={formData.orgLanguage}
                  label="Language"
                  onChange={(e) => handleInputChange('orgLanguage', e.target.value)}
                >
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                User Account Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                helperText="Optional, for easier login"
              />
            </Grid>
            <Grid item xs={12} md={6}>
                             <TextField
                 fullWidth
                 label="Password *"
                 type={showPassword ? 'text' : 'password'}
                 value={formData.password}
                 onChange={(e) => handleInputChange('password', e.target.value)}
                 helperText="Must be at least 8 characters with lowercase, uppercase, and number"
                 InputProps={{
                   startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm Password *"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
                         <Grid item xs={12} md={6}>
               <TextField
                 fullWidth
                 label="Phone"
                 value={formData.phone}
                 onChange={(e) => {
                   // Only allow numbers and plus sign, must start with 1-9
                   const value = e.target.value.replace(/[^0-9\+]/g, '');
                   if (value && !value.startsWith('+') && !/^[1-9]/.test(value)) {
                     return; // Don't allow starting with 0
                   }
                   handleInputChange('phone', value);
                 }}
                 helperText="Enter a valid phone number (e.g., +49123456789 or 123456789)"
                 InputProps={{
                   startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                 }}
               />
             </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Business Owner, Manager"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="e.g., Management, Sales, Technical"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  label="Role"
                >
                  <MenuItem value="USER">Standard User</MenuItem>
                  <MenuItem value="TECHNICIAN">Technician</MenuItem>
                  <MenuItem value="SALES">Sales Staff</MenuItem>
                  <MenuItem value="CUSTOMER_SERVICE">Customer Service</MenuItem>
                  <MenuItem value="INVENTORY">Inventory Manager</MenuItem>
                  <MenuItem value="FINANCE">Finance Staff</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Your role determines what you can see and do in the system
              </Typography>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Business Details (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                These details can be updated later in your business settings.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax Number"
                value={formData.taxNumber}
                onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                helperText="Steuernummer (Germany)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="VAT Number"
                value={formData.vatNumber}
                onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                helperText="USt-IdNr (Germany)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Commercial Register"
                value={formData.commercialRegister}
                onChange={(e) => handleInputChange('commercialRegister', e.target.value)}
                helperText="Handelsregister (Germany)"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                You can now complete your registration. Your organization will be created with you as the administrator.
              </Typography>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <CardContent sx={{ p: 4 }}>
          <RegisterHeader>
            <Logo size="xlarge" variant="circular" sx={{ margin: '0 auto', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              FIXORA PRO
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create Your Business Account
            </Typography>
          </RegisterHeader>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

                                {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  '& .MuiAlert-message': {
                    whiteSpace: 'pre-line'
                  }
                }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}
            
            {loading && progressMessage && (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  '& .MuiAlert-message': {
                    whiteSpace: 'pre-line'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                  {progressMessage}
                </Box>
              </Alert>
            )}

          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                                 <Button
                   variant="contained"
                   onClick={handleSubmit}
                   disabled={loading}
                   startIcon={loading ? <CircularProgress size={20} /> : null}
                   sx={{
                     minWidth: 200,
                     height: 48
                   }}
                                   >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />
          
                     <Box sx={{ textAlign: 'center' }}>
             <Typography variant="body2" color="text.secondary">
               Already have an account?{' '}
               <Button
                 variant="text"
                 onClick={() => navigate('/login')}
                 sx={{ textTransform: 'none' }}
               >
                 Sign In
               </Button>
             </Typography>
             
                           <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                  💡 Tips for a successful registration:
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Choose a unique business name that's not already taken
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Use the "Regenerate" button if your slug is taken
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Add your location to make your business name unique
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Use a strong password with 8+ characters, uppercase, lowercase, and numbers
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Enter phone numbers without spaces or special characters
                </Typography>
              </Box>
              
              {error && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'red.50', borderRadius: 1, border: '1px solid', borderColor: 'red.200' }}>
                  <Typography variant="body2" color="error.main" sx={{ fontWeight: 500, mb: 1 }}>
                    🚨 Registration Issue Detected:
                  </Typography>
                  <Typography variant="caption" color="error.main" display="block">
                    • Your organization was created successfully
                  </Typography>
                  <Typography variant="caption" color="error.main" display="block">
                    • But user account creation failed
                  </Typography>
                  <Typography variant="caption" color="block">
                    • Please check the error message above and try again
                  </Typography>
                  <Typography variant="caption" color="error.main" display="block">
                    • If the problem persists, contact support
                  </Typography>
                </Box>
              )}
           </Box>
        </CardContent>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
