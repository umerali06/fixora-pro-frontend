import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Button,
  LinearProgress,
  Avatar,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  VolumeOff as VolumeOffIcon,
  SkipPrevious as SkipPreviousIcon,
  SkipNext as SkipNextIcon,
  Loop as LoopIcon,
  Fullscreen as FullscreenIcon,
  MoreVert as MoreVertIcon,
  Feedback as FeedbackIcon,
  PhoneAndroid as PhoneIcon,
  Laptop as LaptopIcon,
  Watch as WatchIcon,
  Monitor as MonitorIcon,
  SportsEsports as GameControllerIcon,
  Flight as DroneIcon,
  ShoppingCart as ShoppingCartIcon,
  DirectionsBike as BikeIcon,
  TwoWheeler as ScooterIcon,
  Warning as WarningIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const Devices: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const deviceTypes = [
    { name: 'Smart Phone', icon: <PhoneIcon sx={{ fontSize: 40 }} /> },
    { name: 'Notebook', icon: <LaptopIcon sx={{ fontSize: 40 }} /> },
    { name: 'Watch', icon: <WatchIcon sx={{ fontSize: 40 }} /> },
    { name: 'Monitor', icon: <MonitorIcon sx={{ fontSize: 40 }} /> },
    { name: 'Game Controller', icon: <GameControllerIcon sx={{ fontSize: 40 }} /> },
    { name: 'Drone', icon: <DroneIcon sx={{ fontSize: 40 }} /> },
    { name: 'Store', icon: <ShoppingCartIcon sx={{ fontSize: 40 }} /> },
    { name: 'Bicycle', icon: <BikeIcon sx={{ fontSize: 40 }} /> },
    { name: 'Scooter', icon: <ScooterIcon sx={{ fontSize: 40 }} /> },
  ];

  const handleDeviceSelect = (deviceName: string) => {
    setSelectedDevice(deviceName);
    // Here you would typically navigate to the next step or handle the selection
  };

  return (
    <Box sx={{ 
      p: 3, 
      maxWidth: '100%', 
      overflow: 'hidden', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            backgroundColor: '#6f42c1',
            borderRadius: '50%',
            width: 40,
            height: 40,
            justifyContent: 'center'
          }}>
            <PlayIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
            Media Player
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton>
            <SettingsIcon />
          </IconButton>
          <IconButton>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 2,
          mb: 2
        }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            backgroundColor: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <MonitorIcon />
          </Box>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}>
            <Avatar sx={{ width: 20, height: 20, bgcolor: '#666' }} />
          </Box>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}>
            <WarningIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}>
            <PrintIcon sx={{ fontSize: 20 }} />
          </Box>
        </Box>
      </Box>

      {/* Title */}
      <Typography variant="h4" sx={{ 
        textAlign: 'center', 
        fontWeight: 'bold', 
        color: '#333',
        mb: 4
      }}>
        Select a device type
      </Typography>

      {/* Device Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {deviceTypes.map((device, index) => (
          <Grid item xs={12} sm={6} md={4} key={device.name}>
            <Card 
              sx={{ 
                height: 120,
                cursor: 'pointer',
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                border: selectedDevice === device.name ? '2px solid #1976d2' : 'none'
              }}
              onClick={() => handleDeviceSelect(device.name)}
            >
              <CardContent sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <Box sx={{ color: '#1976d2', mb: 1 }}>
                  {device.icon}
                </Box>
                <Typography variant="body1" sx={{ 
                  fontWeight: 600, 
                  color: '#333',
                  fontSize: '0.9rem'
                }}>
                  {device.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Media Player Controls */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: '#ff9800',
        height: 80,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Progress Bar */}
        <Box sx={{ 
          height: 4, 
          backgroundColor: '#e65100',
          position: 'relative'
        }}>
          <Box sx={{ 
            width: '0%', 
            height: '100%', 
            backgroundColor: '#fff',
            position: 'absolute',
            top: 0,
            left: 0
          }} />
        </Box>
        
        {/* Controls */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          px: 3,
          py: 1,
          flex: 1
        }}>
          {/* Left side - Time */}
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
            0:00:00
          </Typography>
          
          {/* Center - Playback controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" sx={{ color: 'white' }}>
              <VolumeOffIcon />
            </IconButton>
            <IconButton size="small" sx={{ color: 'white' }}>
              <SkipPreviousIcon />
            </IconButton>
            <Typography variant="body2" sx={{ color: 'white', mx: 1 }}>
              10
            </Typography>
            <IconButton sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.2)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
            }}>
              <PlayIcon />
            </IconButton>
            <Typography variant="body2" sx={{ color: 'white', mx: 1 }}>
              30
            </Typography>
            <IconButton size="small" sx={{ color: 'white' }}>
              <SkipNextIcon />
            </IconButton>
            <IconButton size="small" sx={{ color: 'white' }}>
              <LoopIcon />
            </IconButton>
          </Box>
          
          {/* Right side - Additional controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'white' }}>
              0:00:05
            </Typography>
            <IconButton size="small" sx={{ color: 'white' }}>
              <VolumeOffIcon />
            </IconButton>
            <IconButton size="small" sx={{ color: 'white' }}>
              <FullscreenIcon />
            </IconButton>
            <IconButton size="small" sx={{ color: 'white' }}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Feedback Button */}
      <Box sx={{ 
        position: 'fixed', 
        right: 20, 
        top: '50%', 
        transform: 'translateY(-50%)',
        zIndex: 1001
      }}>
        <Button
          variant="contained"
          startIcon={<FeedbackIcon />}
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            height: 120,
            minWidth: 40,
            '&:hover': { backgroundColor: '#1565c0' }
          }}
        >
          Feedback
        </Button>
      </Box>
    </Box>
  );
};

export default Devices;

