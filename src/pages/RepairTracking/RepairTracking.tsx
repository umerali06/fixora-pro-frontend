import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications,
  Message as MessageIcon,
  Call as CallIcon,
  Update as UpdateIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  AccountCircle
} from '@mui/icons-material';

interface RepairJob {
  id: string;
  jobNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deviceType: string;
  deviceModel: string;
  imei: string;
  issue: string;
  status: 'pending' | 'diagnosis' | 'in-progress' | 'testing' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  estimatedCompletion: string;
  actualCompletion?: string;
  progress: number;
  notes: string[];
  timeline: Array<{
    id: string;
    status: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
  devices: Array<{
    id: string;
    deviceType: string;
    deviceModel: string;
    imei: string;
    issue: string;
    status: string;
  }>;
}

const RepairTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

  // Mock data
  const repairJobs: RepairJob[] = [
    {
      id: 'REP-001',
      jobNumber: 'REP-2025-001',
      customerName: 'John Smith',
      customerPhone: '+1 555-0123',
      customerEmail: 'john.smith@email.com',
      deviceType: 'iPhone',
      deviceModel: 'iPhone 11 Pro',
      imei: '123456789012345',
      issue: 'Broken screen and battery replacement',
      status: 'in-progress',
      priority: 'high',
      assignedTo: 'Mike Johnson',
      estimatedCompletion: '2025-02-10',
      progress: 65,
      notes: [
        'Customer requested urgent repair',
        'Screen replacement completed',
        'Battery replacement in progress'
      ],
      timeline: [
        {
          id: '1',
          status: 'pending',
          description: 'Job created',
          timestamp: '2025-02-08 09:00',
          user: 'Admin'
        },
        {
          id: '2',
          status: 'diagnosis',
          description: 'Device diagnosis completed',
          timestamp: '2025-02-08 10:30',
          user: 'Mike Johnson'
        },
        {
          id: '3',
          status: 'in-progress',
          description: 'Screen replacement started',
          timestamp: '2025-02-08 11:00',
          user: 'Mike Johnson'
        },
        {
          id: '4',
          status: 'in-progress',
          description: 'Screen replacement completed',
          timestamp: '2025-02-08 14:30',
          user: 'Mike Johnson'
        }
      ],
      devices: [
        {
          id: 'DEV-001',
          deviceType: 'iPhone',
          deviceModel: 'iPhone 11 Pro',
          imei: '123456789012345',
          issue: 'Broken screen',
          status: 'completed'
        },
        {
          id: 'DEV-002',
          deviceType: 'iPhone',
          deviceModel: 'iPhone 11 Pro',
          imei: '123456789012345',
          issue: 'Battery replacement',
          status: 'in-progress'
        }
      ]
    },
    {
      id: 'REP-002',
      jobNumber: 'REP-2025-002',
      customerName: 'Sarah Wilson',
      customerPhone: '+1 555-0456',
      customerEmail: 'sarah.wilson@email.com',
      deviceType: 'Samsung',
      deviceModel: 'Galaxy S21',
      imei: '456789123456789',
      issue: 'Water damage repair',
      status: 'diagnosis',
      priority: 'urgent',
      assignedTo: 'Alex Davis',
      estimatedCompletion: '2025-02-09',
      progress: 25,
      notes: [
        'Complex water damage',
        'Assessment in progress'
      ],
      timeline: [
        {
          id: '1',
          status: 'pending',
          description: 'Job created',
          timestamp: '2025-02-07 15:00',
          user: 'Admin'
        },
        {
          id: '2',
          status: 'diagnosis',
          description: 'Water damage assessment started',
          timestamp: '2025-02-08 09:00',
          user: 'Alex Davis'
        }
      ],
      devices: [
        {
          id: 'DEV-003',
          deviceType: 'Samsung',
          deviceModel: 'Galaxy S21',
          imei: '456789123456789',
          issue: 'Water damage repair',
          status: 'diagnosis'
        }
      ]
    },
    {
      id: 'REP-003',
      jobNumber: 'REP-2025-003',
      customerName: 'David Brown',
      customerPhone: '+1 555-0789',
      customerEmail: 'david.brown@email.com',
      deviceType: 'iPhone',
      deviceModel: 'iPhone 13',
      imei: '789123456789123',
      issue: 'Software issue and data recovery',
      status: 'completed',
      priority: 'medium',
      assignedTo: 'Mike Johnson',
      estimatedCompletion: '2025-02-07',
      actualCompletion: '2025-02-07',
      progress: 100,
      notes: [
        'Software issue resolved',
        'Data recovery successful',
        'Customer satisfied'
      ],
      timeline: [
        {
          id: '1',
          status: 'pending',
          description: 'Job created',
          timestamp: '2025-02-05 10:00',
          user: 'Admin'
        },
        {
          id: '2',
          status: 'diagnosis',
          description: 'Software diagnosis completed',
          timestamp: '2025-02-05 11:00',
          user: 'Mike Johnson'
        },
        {
          id: '3',
          status: 'in-progress',
          description: 'Software repair started',
          timestamp: '2025-02-05 14:00',
          user: 'Mike Johnson'
        },
        {
          id: '4',
          status: 'testing',
          description: 'Testing completed',
          timestamp: '2025-02-07 09:00',
          user: 'Mike Johnson'
        },
        {
          id: '5',
          status: 'completed',
          description: 'Job completed successfully',
          timestamp: '2025-02-07 16:00',
          user: 'Mike Johnson'
        }
      ],
      devices: [
        {
          id: 'DEV-004',
          deviceType: 'iPhone',
          deviceModel: 'iPhone 13',
          imei: '789123456789123',
          issue: 'Software issue and data recovery',
          status: 'completed'
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'testing': return 'warning';
      case 'diagnosis': return 'info';
      case 'pending': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'in-progress': return <BuildIcon />;
      case 'testing': return <SpeedIcon />;
      case 'diagnosis': return <AssignmentIcon />;
      case 'pending': return <PendingIcon />;
      case 'cancelled': return <CancelIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const filteredJobs = repairJobs.filter(job => {
    const matchesSearch = job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.deviceModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const tabLabels = ['All Jobs', 'In Progress', 'Pending', 'Completed', 'Testing'];

  const totalJobs = repairJobs.length;
  const inProgressJobs = repairJobs.filter(job => job.status === 'in-progress').length;
  const completedJobs = repairJobs.filter(job => job.status === 'completed').length;
  const averageProgress = repairJobs.reduce((sum, job) => sum + job.progress, 0) / repairJobs.length;

  return (
    <Box sx={{ 
      backgroundColor: '#F4F7FB',
      minHeight: '100vh',
      maxWidth: '1240px',
      mx: 'auto',
      px: 3,
      py: 2.5
    }}>
      {/* Header */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderRadius: '14px',
        border: '1px solid #E8EEF5',
        boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
        p: 3,
        mb: 2.5
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ 
            fontSize: '22px', 
            fontWeight: 800, 
            color: '#24324A'
          }}>
          Repair Tracking
        </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ 
              backgroundColor: '#2F80ED',
              color: 'white',
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              '&:hover': { backgroundColor: '#2563EB' }
            }}
          >
            New Repair Job
          </Button>
        </Box>

        {/* Search and Filters */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search jobs by customer, job number, or device..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9FB0C7' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: '#E6ECF3',
                  },
                  '&:hover fieldset': {
                    borderColor: '#2F80ED',
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="diagnosis">Diagnosis</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="testing">Testing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              fullWidth
              sx={{ 
                borderRadius: '12px',
                borderColor: '#E6ECF3',
                color: '#24324A',
                '&:hover': { borderColor: '#2F80ED' }
              }}
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '14px',
            border: '1px solid #E8EEF5',
            boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
            '&:hover': { boxShadow: 'rgba(19, 33, 68, 0.08) 0 8px 20px' }
          }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#7D8DA5', mb: 0.5 }}>
                    Total Jobs
                  </Typography>
                  <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#24324A' }}>
                    {totalJobs}
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: '#E3F2FD', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BuildIcon sx={{ fontSize: 24, color: '#2F80ED' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '14px',
            border: '1px solid #E8EEF5',
            boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
            '&:hover': { boxShadow: 'rgba(19, 33, 68, 0.08) 0 8px 20px' }
          }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#7D8DA5', mb: 0.5 }}>
                    In Progress
                  </Typography>
                  <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#24324A' }}>
                    {inProgressJobs}
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: '#FFF3E0', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BuildIcon sx={{ fontSize: 24, color: '#FF9800' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '14px',
            border: '1px solid #E8EEF5',
            boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
            '&:hover': { boxShadow: 'rgba(19, 33, 68, 0.08) 0 8px 20px' }
          }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#7D8DA5', mb: 0.5 }}>
                    Completed
                  </Typography>
                  <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#24324A' }}>
                    {completedJobs}
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: '#E8F5E8', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircleIcon sx={{ fontSize: 24, color: '#4CAF50' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: '14px',
            border: '1px solid #E8EEF5',
            boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
            '&:hover': { boxShadow: 'rgba(19, 33, 68, 0.08) 0 8px 20px' }
          }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#7D8DA5', mb: 0.5 }}>
                    Avg Progress
          </Typography>
                  <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#24324A' }}>
                    {averageProgress.toFixed(0)}%
          </Typography>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: '#F3E5F5', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TimelineIcon sx={{ fontSize: 24, color: '#9C27B0' }} />
                </Box>
              </Box>
        </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderRadius: '14px',
        border: '1px solid #E8EEF5',
        boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
        mb: 2.5
      }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              color: '#7D8DA5',
              '&.Mui-selected': {
                color: '#2F80ED',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2F80ED',
            },
          }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>

      {/* Repair Jobs Table */}
      <Card sx={{ 
        backgroundColor: 'white',
        borderRadius: '14px',
        border: '1px solid #E8EEF5',
        boxShadow: 'rgba(19, 33, 68, 0.06) 0 6px 18px',
        overflow: 'hidden'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Job</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Device</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Assigned To</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#24324A' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: '#2F80ED' }}>
                        <BuildIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#24324A' }}>
                          {job.jobNumber}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#7D8DA5' }}>
                          {job.estimatedCompletion}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#24324A' }}>
                        {job.customerName}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#7D8DA5' }}>
                        {job.customerPhone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#24324A' }}>
                        {job.deviceType} {job.deviceModel}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#7D8DA5' }}>
                        {job.issue}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontSize: '12px', color: '#7D8DA5' }}>
                          {job.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={job.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#E6ECF3',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: job.progress === 100 ? '#4CAF50' : '#2F80ED',
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(job.status)}
                      label={job.status.replace('-', ' ')}
                      color={getStatusColor(job.status) as any}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.priority}
                      color={getPriorityColor(job.priority) as any}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#2F80ED' }}>
                        <AccountCircle sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Typography sx={{ fontSize: '12px', color: '#24324A' }}>
                        {job.assignedTo}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" sx={{ color: '#2F80ED' }}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" sx={{ color: '#2F80ED' }}>
                        <UpdateIcon />
                      </IconButton>
                      <IconButton size="small" sx={{ color: '#2F80ED' }}>
                        <MessageIcon />
                      </IconButton>
                      <IconButton size="small" sx={{ color: '#2F80ED' }}>
                        <CallIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Job Details Dialog */}
      {selectedJob && (
        <Dialog
          open={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            fontSize: '20px', 
            fontWeight: 700, 
            color: '#24324A',
            borderBottom: '1px solid #E6ECF3',
            pb: 2
          }}>
            Repair Job Details - {selectedJob.jobNumber}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: '#24324A' }}>
                  Customer Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, color: '#24324A' }}>
                    {selectedJob.customerName}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#7D8DA5' }}>
                    {selectedJob.customerPhone}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#7D8DA5' }}>
                    {selectedJob.customerEmail}
                  </Typography>
                </Box>
                
                <Typography variant="h6" sx={{ mb: 2, color: '#24324A' }}>
                  Device Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, color: '#24324A' }}>
                    {selectedJob.deviceType} {selectedJob.deviceModel}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#7D8DA5' }}>
                    IMEI: {selectedJob.imei}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#7D8DA5' }}>
                    Issue: {selectedJob.issue}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: '#24324A' }}>
                  Job Progress
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: '12px', color: '#7D8DA5' }}>
                      Progress: {selectedJob.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={selectedJob.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#E6ECF3',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: selectedJob.progress === 100 ? '#4CAF50' : '#2F80ED',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                
                <Typography variant="h6" sx={{ mb: 2, color: '#24324A' }}>
                  Timeline
                </Typography>
                <Stepper orientation="vertical" sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {selectedJob.timeline.map((event) => (
                    <Step key={event.id} active>
                      <StepLabel>
                        <Typography sx={{ fontSize: '12px', color: '#24324A' }}>
                          {event.description}
                        </Typography>
                        <Typography sx={{ fontSize: '10px', color: '#7D8DA5' }}>
                          {event.timestamp} by {event.user}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #E6ECF3' }}>
            <Button
              onClick={() => setSelectedJob(null)}
              sx={{ color: '#7D8DA5' }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenUpdateDialog(true)}
              sx={{ 
                backgroundColor: '#2F80ED',
                '&:hover': { backgroundColor: '#2563EB' }
              }}
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default RepairTracking; 