import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Chip,
  Skeleton,
  Fade,
  Tooltip,
  Badge,
  IconButton,
  Checkbox
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Notifications,
  TrendingDown,
  Storefront as StorefrontIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Receipt as ReceiptIcon,
  Public as PublicIcon,
  Apps as AppsIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PlayArrow as PlayArrowIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';

// Import responsive components and hooks
import LanguageSwitch from '../../components/common/LanguageSwitch';

import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Simple dashboard component - no complex data for now
  useEffect(() => {
    // Component mounted
  }, []);

  // Modern Dashboard Content Component
  const DashboardContent = () => (
    <Box sx={{ 
      backgroundColor: '#FFFFFF',
      minHeight: '100vh',
      width: '100%',
      px: { xs: 2, sm: 4, md: 6 },
      py: { xs: 3, sm: 4, md: 6 }
    }}>
      {/* Top Navigation Bar */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 4,
        width: '100%'
      }}>
        {/* Left Side - Welcome Message */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ 
            fontSize: { xs: '16px', sm: '18px' }, 
            fontWeight: 600, 
            color: '#1F2937',
            lineHeight: 1.2
          }}>
            Welcome FIXORA PRO
          </Typography>
          <Typography sx={{ 
            fontSize: { xs: '14px', sm: '16px' }, 
            fontWeight: 400, 
            color: '#6B7280',
            lineHeight: 1.2
          }}>
            {new Date().toLocaleDateString('en-US', { 
              month: '2-digit', 
              day: '2-digit', 
              year: 'numeric' 
            })} {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </Typography>
      </Box>

        {/* Center - Global Search */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          backgroundColor: '#F9FAFB',
          borderRadius: '12px',
          px: 3,
          py: 2,
          minWidth: { md: 400 },
          border: '1px solid #E5E7EB'
        }}>
          <SearchIcon sx={{ color: '#9CA3AF', mr: 2, fontSize: '20px' }} />
          <TextField
            placeholder="Global Search"
            variant="standard"
            size="medium"
                  sx={{ 
              '& .MuiInput-root': {
                fontSize: '16px',
                color: '#374151'
              },
              '& .MuiInput-root::before': { borderBottom: 'none' },
              '& .MuiInput-root::after': { borderBottom: 'none' }
            }}
          />
      </Box>

        {/* Right Side - Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* How to Start Button */}
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{
              backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            How to start?
          </Button>
          
          {/* Add Button */}
            <IconButton
            sx={{
              backgroundColor: '#3B82F6',
              color: 'white',
              width: 40,
              height: 40,
              '&:hover': { backgroundColor: '#2563EB' }
            }}
          >
            <AddIcon />
          </IconButton>
          
          {/* Filter Button */}
          <IconButton
        sx={{
              backgroundColor: '#9CA3AF',
              color: 'white',
              width: 40,
              height: 40,
              '&:hover': { backgroundColor: '#6B7280' }
            }}
          >
            <FilterListIcon />
            </IconButton>
          
          {/* Notifications */}
          <Badge badgeContent={3} color="error">
          <IconButton
            sx={{ 
                backgroundColor: '#9CA3AF',
                color: 'white',
                width: 40,
                height: 40,
                '&:hover': { backgroundColor: '#6B7280' }
              }}
            >
              <Notifications />
          </IconButton>
          </Badge>
          
          {/* Profile Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ 
              backgroundColor: '#3B82F6',
              width: 40,
              height: 40
            }}>
              <PersonIcon />
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ 
                fontSize: '14px',
                fontWeight: 600,
                color: '#1F2937'
              }}>
                FIXORA PRO
              </Typography>
              <Typography sx={{ 
                fontSize: '12px',
                fontWeight: 400,
                color: '#6B7280'
              }}>
                Admin
              </Typography>
            </Box>
            <KeyboardArrowDownIcon sx={{ color: '#6B7280' }} />
          </Box>
        </Box>
          </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4, width: '100%' }}>
        {/* Turnover Card */}
        <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #F3F4F6',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              height: '100%',
            width: '100%',
              '&:hover': { 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}>
            <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ 
                fontSize: '14px',
                color: '#6B7280',
                fontWeight: 500,
                mb: 1
              }}>
                Turnover
                </Typography>
                    <Typography sx={{ 
                fontSize: '28px',
                      fontWeight: 700,
                color: '#1F2937',
                mb: 2
              }}>
                € 0,00
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                  icon={<TrendingDown />}
                  label="0%"
                    size="small"
                    sx={{
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Unpaid Invoice Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #F3F4F6',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            height: '100%',
            width: '100%',
            '&:hover': { 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ 
                fontSize: '14px',
                color: '#6B7280',
                fontWeight: 500,
                mb: 1
              }}>
                Unpaid invoice
            </Typography>
              <Typography sx={{ 
                fontSize: '28px',
                fontWeight: 700,
                color: '#1F2937',
                mb: 2
              }}>
                € 0,00
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  icon={<TrendingDown />}
                  label="0%"
                  size="small"
                  sx={{
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                />
          </Box>
              </CardContent>
            </Card>
        </Grid>

        {/* Stock Value Card */}
        <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #F3F4F6',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              height: '100%',
            width: '100%',
              '&:hover': { 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}>
            <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ 
                fontSize: '14px',
                color: '#6B7280',
                fontWeight: 500,
                mb: 1
              }}>
                Stock value
                    </Typography>
                    <Typography sx={{ 
                fontSize: '28px',
                      fontWeight: 700,
                color: '#1F2937',
                mb: 2
              }}>
                € 0,00
                      </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Chip
                    icon={<TrendingDown />}
                  label="0%"
                    size="small"
                    sx={{
                      backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                    {new Date().toLocaleDateString('en-US', { 
                      month: '2-digit', 
                      day: '2-digit', 
                      year: 'numeric' 
                    })}
                  </Typography>
                  <CalendarTodayIcon sx={{ color: '#9CA3AF', fontSize: '16px' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Medium Cards Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Service Requests Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            height: '100%',
            width: '100%',
            '&:hover': { 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent sx={{ p: 3, color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StorefrontIcon sx={{ fontSize: '20px', mr: 1 }} />
                    <Typography sx={{ fontSize: '12px', fontWeight: 500 }}>
                      Web Form
                    </Typography>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '18px',
                    fontWeight: 600,
                    mb: 2
                  }}>
                    Service Requests
                  </Typography>
                </Box>
                <Typography sx={{ 
                  fontSize: '48px',
                  fontWeight: 700
                }}>
                  0
                  </Typography>
                </Box>
                </CardContent>
              </Card>
            </Grid>

        {/* Completed Jobs Card */}
        <Grid item xs={12} md={6}>
              <Card sx={{ 
                backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #F3F4F6',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              height: '100%',
            width: '100%',
              '&:hover': { 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WorkIcon sx={{ color: '#8B5CF6', fontSize: '20px', mr: 1 }} />
                    <Typography sx={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#6B7280'
                    }}>
                      Completed Jobs
                    </Typography>
                  </Box>
                    <Typography sx={{ 
                    fontSize: '32px',
                      fontWeight: 700,
                    color: '#1F2937'
                  }}>
                    0
                      </Typography>
                    </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                    {new Date().toLocaleDateString('en-US', { 
                      month: '2-digit', 
                      day: '2-digit', 
                      year: 'numeric' 
                    })}
                  </Typography>
                  <CalendarTodayIcon sx={{ color: '#9CA3AF', fontSize: '16px' }} />
                  </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

              {/* Bottom Cards Section */}
      <Grid container spacing={3}>
        {/* To-Do Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #F3F4F6',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            height: '100%',
            width: '100%',
            '&:hover': { 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ 
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1F2937'
                }}>
                  To-Do's
                </Typography>
                <Button
                  variant="text"
                    sx={{
                    color: '#3B82F6',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '14px'
                  }}
                >
                  View All
                </Button>
              </Box>
              
              {/* Add New To-Do Input */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Checkbox sx={{ color: '#9CA3AF' }} />
                <TextField
                  placeholder="Add new to-do..."
                  variant="standard"
                  fullWidth
                  sx={{
                    '& .MuiInput-root': {
                      fontSize: '14px',
                      color: '#6B7280'
                    },
                    '& .MuiInput-root::before': { borderBottom: 'none' },
                    '& .MuiInput-root::after': { borderBottom: 'none' }
                  }}
                />
              </Box>
              
              {/* Illustration Placeholder */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                py: 2 
              }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  backgroundColor: '#E5E7EB', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <PersonIcon sx={{ fontSize: 40, color: '#9CA3AF' }} />
                </Box>
                  <Typography sx={{ 
                  fontSize: '14px',
                  color: '#6B7280',
                  textAlign: 'center'
                }}>
                  Start with your first priorities
                  </Typography>
                </Box>
                </CardContent>
              </Card>
            </Grid>

        {/* Activity Card */}
        <Grid item xs={12} md={4}>
              <Card sx={{ 
                backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #F3F4F6',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              height: '100%',
            width: '100%',
              '&:hover': { 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ 
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1F2937'
                }}>
                  Activity
                </Typography>
                <Button
                  variant="text"
                  sx={{
                    color: '#3B82F6',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '14px'
                  }}
                >
                  View All
                </Button>
              </Box>
              
              {/* Illustration Placeholder */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                py: 2 
              }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  backgroundColor: '#DBEAFE', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <PersonIcon sx={{ fontSize: 40, color: '#3B82F6' }} />
                </Box>
                    <Typography sx={{ 
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1F2937',
                  textAlign: 'center',
                  mb: 1
                }}>
                  You have the whole day to use
                    </Typography>
                    <Typography sx={{ 
                  fontSize: '14px',
                  color: '#6B7280',
                  textAlign: 'center'
                }}>
                  It seems like you haven't received any recent notifications.
                      </Typography>
                    </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Job Progress Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #F3F4F6',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            height: '100%',
            width: '100%',
            '&:hover': { 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ 
                fontSize: '18px',
                fontWeight: 600,
                color: '#1F2937',
                mb: 3
              }}>
                Job Progress
              </Typography>
              
              {/* Donut Chart Placeholder */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                mb: 3 
              }}>
                <Box sx={{ 
                  position: 'relative',
                  width: 120,
                  height: 120,
                  mb: 2
                }}>
                  {/* Center Circle */}
                  <Box sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 60,
                    height: 60,
                    backgroundColor: '#3B82F6',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700 }}>
                      2
                    </Typography>
                    <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                      Active Jobs
                  </Typography>
                  </Box>
                  
                  {/* Outer Ring Placeholder */}
                  <Box sx={{ 
                    width: 120,
                    height: 120,
                    border: '8px solid #E5E7EB',
                    borderRadius: '50%',
                    borderTop: '8px solid #EF4444',
                    borderRight: '8px solid #F59E0B'
                  }} />
                </Box>
                
                {/* Legend */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: '#EF4444' }} />
                    <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                      1 On Hold
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: '#F59E0B' }} />
                    <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                      1 Repair in Progress
                    </Typography>
                  </Box>
                </Box>
                </Box>
                </CardContent>
              </Card>
        </Grid>
            </Grid>

      {/* Quick Actions */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: 3, width: '100%', maxWidth: '100%' }}>
        <Grid item xs={12}>
              <Card sx={{ 
                backgroundColor: 'white',
            borderRadius: '14px',
            border: '1px solid #E8EEF5',
              boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
              width: '100%',
              maxWidth: '100%'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography sx={{ 
                fontSize: { xs: '16px', sm: '18px' },
                fontWeight: 600,
                color: '#24324A',
                mb: 2
              }}>
                Quick Actions
                  </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    sx={{ 
                      borderColor: '#E2E8F0',
                      color: '#24324A',
                      textTransform: 'none',
                      py: 1.5,
                      '&:hover': {
                        borderColor: '#3B82F6',
                        backgroundColor: '#F8FAFC'
                      }
                    }}
                    onClick={() => navigate('/jobs')}
                  >
                    New Job
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    sx={{
                      borderColor: '#E2E8F0',
                      color: '#24324A',
                      textTransform: 'none',
                      py: 1.5,
                      '&:hover': {
                        borderColor: '#3B82F6',
                        backgroundColor: '#F8FAFC'
                      }
                    }}
                    onClick={() => navigate('/contacts')}
                  >
                    Add Customer
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    sx={{
                      borderColor: '#E2E8F0',
                      color: '#24324A',
                      textTransform: 'none',
                      py: 1.5,
                      '&:hover': {
                        borderColor: '#3B82F6',
                        backgroundColor: '#F8FAFC'
                      }
                    }}
                    onClick={() => navigate('/invoices')}
                  >
                    Create Invoice
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<StorefrontIcon />}
                    sx={{
                      borderColor: '#E2E8F0',
                      color: '#24324A',
                      textTransform: 'none',
                      py: 1.5,
                      '&:hover': {
                        borderColor: '#3B82F6',
                        backgroundColor: '#F8FAFC'
                      }
                    }}
                    onClick={() => navigate('/pos')}
                  >
                    Open POS
                  </Button>
                </Grid>
              </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

      {/* Bottom Cards Section */}
      <Grid container spacing={3}>
        {/* To-Do Card */}
        <Grid item xs={12} md={4}>
              <Card sx={{ 
                backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #F3F4F6',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            height: '100%',
            width: '100%',
            '&:hover': { 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ 
                  fontSize: '18px',
                fontWeight: 600,
                  color: '#1F2937'
                    }}>
                  To-Do's
              </Typography>
                <Button
                  variant="text"
                  sx={{
                    color: '#3B82F6',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '14px'
                  }}
                >
                  View All
                </Button>
                      </Box>
              
              {/* Add New To-Do Input */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Checkbox sx={{ color: '#9CA3AF' }} />
                <TextField
                  placeholder="Add new to-do..."
                  variant="standard"
                  fullWidth
                  sx={{
                    '& .MuiInput-root': {
                      fontSize: '14px',
                      color: '#6B7280'
                    },
                    '& .MuiInput-root::before': { borderBottom: 'none' },
                    '& .MuiInput-root::after': { borderBottom: 'none' }
                  }}
                />
                        </Box>
              
              {/* Illustration Placeholder */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                py: 2 
              }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  backgroundColor: '#E5E7EB', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <PersonIcon sx={{ fontSize: 40, color: '#9CA3AF' }} />
                </Box>
                <Typography sx={{ 
                  fontSize: '14px',
                  color: '#6B7280',
                  textAlign: 'center'
                }}>
                  Start with your first priorities
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

        {/* Activity Card */}
        <Grid item xs={12} md={4}>
              <Card sx={{ 
                backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #F3F4F6',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            height: '100%',
            width: '100%',
            '&:hover': { 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ 
                  fontSize: '18px',
                fontWeight: 600,
                  color: '#1F2937'
                    }}>
                  Activity
                      </Typography>
                <Button
                  variant="text"
                  sx={{
                    color: '#3B82F6',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '14px'
                  }}
                >
                  View All
                </Button>
                    </Box>
              
              {/* Illustration Placeholder */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                py: 2 
              }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  backgroundColor: '#DBEAFE', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <PersonIcon sx={{ fontSize: 40, color: '#3B82F6' }} />
                </Box>
                <Typography sx={{ 
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1F2937',
                  textAlign: 'center',
                  mb: 1
                }}>
                  You have the whole day to use
                </Typography>
                <Typography sx={{ 
                  fontSize: '14px',
                  color: '#6B7280',
                  textAlign: 'center'
                }}>
                  It seems like you haven't received any recent notifications.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

        {/* Job Progress Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #F3F4F6',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            height: '100%',
            width: '100%',
            '&:hover': { 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ 
                fontSize: '18px',
                fontWeight: 600,
                color: '#1F2937',
                mb: 3
              }}>
                Job Progress
              </Typography>
              
              {/* Donut Chart Placeholder */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                alignItems: 'center', 
                mb: 3 
                  }}>
                    <Box sx={{ 
                  position: 'relative',
                  width: 120,
                  height: 120,
                  mb: 2
                }}>
                  {/* Center Circle */}
                  <Box sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 60,
                    height: 60,
                    backgroundColor: '#3B82F6',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                      alignItems: 'center',
                    justifyContent: 'center',
          color: 'white'
        }}>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700 }}>
                      2
                    </Typography>
                    <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                      Active Jobs
                        </Typography>
                    </Box>
                    
                  {/* Outer Ring Placeholder */}
        <Box sx={{ 
                    width: 120,
                    height: 120,
                    border: '8px solid #E5E7EB',
                    borderRadius: '50%',
                    borderTop: '8px solid #EF4444',
                    borderRight: '8px solid #F59E0B'
                  }} />
      </Box>

                {/* Legend */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: '#EF4444' }} />
                    <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                      1 On Hold
                    </Typography>
        </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: '#F59E0B' }} />
                    <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                      1 Repair in Progress
                    </Typography>
      </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render the dashboard content
  const renderContent = () => {
      return <DashboardContent />;
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
          {renderContent()}
    </Box>
  );
};

export default Dashboard;
