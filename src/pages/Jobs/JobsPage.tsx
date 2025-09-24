import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Avatar,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Work,
  AccessTime,
  Person,
  Edit,
  Visibility,
  Add,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  PauseCircle,
  PlayArrow,
  Close,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { jobsAPI, customerAPI, techniciansAPI } from '../../services/api';
import { PermissionGate, usePermissions } from '../../utils/permissions';
import toast from 'react-hot-toast';

// Types for Jobs data
interface JobStats {
  total: number;
  inProgress: number;
  completed: number;
  onHold: number;
  percentageChange: number;
}

interface Job {
  id: string;
  jobId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  assignedTechnician: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED';
  title: string;
  description: string;
  createdAt: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  totalCost: number;
}

interface JobNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

interface CreateJobForm {
  title: string;
  description: string;
  customerId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string;
  assignedTechnician: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED';
}

// Jobs Page Component
const JobsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  // Get sidebar context from MainLayout
  const sidebarContext = useOutletContext() as { 
    sidebarOpen: boolean; 
    handleSidebarToggle: () => void; 
    handleSidebarClose: () => void; 
  };

  // State management
  const [stats, setStats] = useState<JobStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [notes, setNotes] = useState<JobNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Job creation dialog state
  const [createJobDialog, setCreateJobDialog] = useState(false);
  const [createJobForm, setCreateJobForm] = useState<CreateJobForm>({
    title: '',
    description: '',
    customerId: '',
    priority: 'MEDIUM',
    dueDate: '',
    assignedTechnician: '',
    status: 'PENDING'
  });

  // Add note dialog state
  const [addNoteDialog, setAddNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Edit job dialog state
  const [editJobDialog, setEditJobDialog] = useState(false);
  const [editJobForm, setEditJobForm] = useState<CreateJobForm>({
    title: '',
    description: '',
    customerId: '',
    priority: 'MEDIUM',
    dueDate: '',
    assignedTechnician: '',
    status: 'PENDING'
  });
  const [customers, setCustomers] = useState<Array<{id: string, name: string}>>([]);
  const [technicians, setTechnicians] = useState<Array<{id: string, name: string}>>([]);

  // Fetch jobs data from API
  const fetchJobsData = async () => {
    // Check authentication before making API calls
    if (!isAuthenticated || !token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      
      // Use authenticated API service
      const [statsData, jobsData] = await Promise.all([
        jobsAPI.getStats(),
        jobsAPI.getJobs()
      ]);

      setStats(statsData);
      setJobs(jobsData);
      // Notes will be fetched when a job is selected
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching jobs data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs data from database');
      setStats(null);
      setJobs([]);
      // Don't clear notes here as they might be from a selected job
    } finally {
    setLoading(false);
    }
  };

  // Fetch customers and technicians for job creation
  const fetchFormData = async () => {
    // Check authentication before making API calls
    if (!isAuthenticated || !token) {
      return;
    }
    
    try {
      
      // Use existing customer and technician APIs
      const [customersData, techniciansData] = await Promise.all([
        customerAPI.getAll(),
        techniciansAPI.getAll()
      ]);


      // Handle customers
      if (Array.isArray(customersData) && customersData.length > 0) {
        const mappedCustomers = customersData.map((c: any) => ({ 
          id: c.id, 
          name: `${c.firstName} ${c.lastName}` 
        }));
        setCustomers(mappedCustomers);
      } else {
        setCustomers([]);
      }

      // Handle technicians
      if (Array.isArray(techniciansData) && techniciansData.length > 0) {
        const mappedTechnicians = techniciansData.map((t: any) => ({ 
          id: t.id, 
          name: `${t.firstName} ${t.lastName}` 
        }));
        setTechnicians(mappedTechnicians);
      } else {
        setTechnicians([]);
      }
    } catch (error) {
      console.error('💥 Error fetching form data:', error);
      setCustomers([]);
      setTechnicians([]);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchJobsData();
      fetchFormData();
      const interval = setInterval(fetchJobsData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);


  // Fetch notes for a specific job
  const fetchJobNotes = async (jobId: string) => {
    try {
      const notesData = await jobsAPI.getNotes(jobId);
      setNotes(notesData);
    } catch (error) {
      console.error('Error fetching job notes:', error);
      setNotes([]);
    }
  };

  // Handle job selection
  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    // Fetch notes for the selected job
    fetchJobNotes(job.id);
  };

  // Handle status update
  const handleStatusUpdate = async (jobId: string, newStatus: Job['status']) => {
    try {
      const response = await fetch(`/api/v1/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: newStatus } : job
        ));
        if (selectedJob?.id === jobId) {
          setSelectedJob(prev => prev ? { ...prev, status: newStatus } : null);
        }
        fetchJobsData();
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  // Handle job creation
  const handleCreateJob = async () => {
    try {
      // Validate required fields
      if (!createJobForm.title || !createJobForm.customerId) {
        toast.error('Please fill in all required fields (Title and Customer)');
        return;
      }


      // Prepare job data for API
      const jobData = {
        title: createJobForm.title.trim(),
        description: createJobForm.description.trim(),
        customerId: createJobForm.customerId,
        priority: createJobForm.priority,
        assignedToId: createJobForm.assignedTechnician || null
      };

      const newJob = await jobsAPI.create(jobData);

      setCreateJobDialog(false);
      setCreateJobForm({
        title: '',
        description: '',
        customerId: '',
        priority: 'MEDIUM',
        dueDate: '',
        assignedTechnician: '',
        status: 'PENDING'
      });
      
      // Refresh jobs data
      await fetchJobsData();
      toast.success('Job created successfully!');
    } catch (error: any) {
      console.error('Error creating job:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create job. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Handle adding a new note
  const handleAddNote = async () => {
    if (!selectedJob || !newNote.trim()) {
      toast.error('Please select a job and enter a note');
      return;
    }

    try {
      
      // Call API to create note
      const noteData = {
        jobId: selectedJob.id,
        content: newNote.trim()
      };
      
      const newNoteData = await jobsAPI.createNote(noteData);
      
      // Add the note to local state
      setNotes(prev => [newNoteData, ...prev]);
      setNewNote('');
      setAddNoteDialog(false);
      toast.success('Note added successfully!');
    } catch (error: any) {
      console.error('Error adding note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add note';
      toast.error(errorMessage);
    }
  };

  // Handle editing a job
  const handleEditJob = async () => {
    if (!selectedJob) {
      toast.error('Please select a job to edit');
      return;
    }

    try {
      // Validate required fields
      if (!editJobForm.title || !editJobForm.customerId) {
        toast.error('Please fill in all required fields (Title and Customer)');
        return;
      }


      // Prepare job data for API
      const jobData = {
        title: editJobForm.title.trim(),
        description: editJobForm.description.trim(),
        customerId: editJobForm.customerId,
        priority: editJobForm.priority,
        assignedToId: editJobForm.assignedTechnician || null,
        status: editJobForm.status
      };

      // Call API to update job
      console.log('🔧 Updating job via API:', selectedJob.id, jobData);
      console.log('🔧 API URL will be:', `/api/v1/jobs/${selectedJob.id}`);
      const updatedJob = await jobsAPI.update(selectedJob.id, jobData);
      console.log('✅ Job updated successfully:', updatedJob);
      
      if (!updatedJob) {
        throw new Error('Failed to update job - no response from server');
      }
      
      // Update the local state with the response from API
      setJobs(prev => prev.map(job => 
        job.id === selectedJob.id 
          ? { 
              ...job, 
              ...updatedJob,
              // Ensure we have the correct customer and technician names
              assignedTechnician: updatedJob.assignedTechnician || 'Unassigned',
              customerName: updatedJob.customerName || job.customerName,
              customerEmail: updatedJob.customerEmail || job.customerEmail
            }
          : job
      ));

      // Refresh job stats after update
      await fetchJobsData();
      
      setEditJobDialog(false);
      setEditJobForm({
        title: '',
        description: '',
        customerId: '',
        priority: 'MEDIUM',
        dueDate: '',
        assignedTechnician: '',
        status: 'PENDING'
      });
      toast.success('Job updated successfully!');
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast.error(error.response?.data?.message || 'Failed to update job');
    }
  };

  // Handle opening edit job dialog
  const handleOpenEditJob = (job: Job) => {
    setSelectedJob(job);
    setEditJobForm({
      title: job.title,
      description: job.description || '',
      customerId: job.customerId || '',
      priority: job.priority || 'MEDIUM',
      dueDate: job.dueDate || '',
      assignedTechnician: job.assignedTechnician || '',
      status: job.status || 'PENDING'
    });
    setEditJobDialog(true);
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'PENDING': return '#FF9800';
      case 'IN_PROGRESS': return '#2196F3';
      case 'ON_HOLD': return '#F44336';
      case 'COMPLETED': return '#4CAF50';
      default: return '#99A7BD';
    }
  };

  const getPriorityColor = (priority: Job['priority']) => {
    switch (priority) {
      case 'HIGH': return '#F44336';
      case 'MEDIUM': return '#FF9800';
      case 'LOW': return '#4CAF50';
      default: return '#99A7BD';
    }
  };

  // Refresh function
  const handleRefresh = () => {
    fetchJobsData();
  };

  // Check permissions
  const { hasPermission } = usePermissions();
  const hasRepairRead = hasPermission('repair:read');
  const hasRepairsRead = hasPermission('repairs:read');
  const hasRepairsWildcard = hasPermission('repairs:*');
  const hasRepairWildcard = hasPermission('repair:*');

  // If user doesn't have permission, show a message
  if (!hasRepairRead && !hasRepairsRead && !hasRepairsWildcard && !hasRepairWildcard) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#EEF3FB' }}>
        <DashboardHeader 
          onMenuToggle={sidebarContext.handleSidebarToggle}
        />
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have permission to view jobs. Required permission: repair:read
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Please contact your administrator to request access to the Jobs page.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#EEF3FB' }}>
      <DashboardHeader 
        onMenuToggle={sidebarContext.handleSidebarToggle}
      />
      
      <Box sx={{ 
        p: { xs: 2, sm: 3 }, 
        pt: { xs: 2, sm: 3 },
        ml: { xs: 0, md: sidebarContext.sidebarOpen ? '85px' : 0 },
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Page Title Section */}
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#49566F',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            Jobs
            <AccessTime sx={{ fontSize: '1.2rem', color: '#99A7BD' }} />
          </Typography>
          
          {lastUpdated && (
            <Typography variant="body2" sx={{ color: '#99A7BD' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <IconButton onClick={handleRefresh} sx={{ color: '#3BB2FF' }}>
              <Refresh />
            </IconButton>
            <PermissionGate permission="repair:write">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateJobDialog(true)}
                sx={{
                  background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3
                }}
              >
                New Job
              </Button>
            </PermissionGate>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}


        {/* Job Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3, alignItems: 'stretch' }}>
          <Grid item xs={12} sm={6} lg={4}>
            <Card sx={{
              borderRadius: '18px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              height: '120px',
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ p: 2.5, color: 'white', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Jobs
                  </Typography>
                  <Work sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : (stats?.total || 0)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {stats?.percentageChange && stats.percentageChange > 0 ? (
                    <TrendingUp sx={{ fontSize: 16 }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 16 }} />
                  )}
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {stats?.percentageChange || 0}% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={4}>
            <Card sx={{
              borderRadius: '18px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              height: '120px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                    Jobs In Progress
                  </Typography>
                  <PlayArrow sx={{ color: '#3BB2FF', fontSize: 20 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#49566F', mb: 1 }}>
                  {loading ? <CircularProgress size={24} /> : (stats?.inProgress || 0)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label="Active"
                    size="small"
                    sx={{
                      backgroundColor: '#E3F2FD',
                      color: '#1976D2',
                      fontSize: '10px',
                      height: '20px'
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                    {stats?.total ? Math.round((stats.inProgress / stats.total) * 100) : 0}% of total
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={4}>
            <Card sx={{
              borderRadius: '18px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              height: '120px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                    Jobs Completed
                  </Typography>
                  <CheckCircle sx={{ color: '#4CAF50', fontSize: 20 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#49566F', mb: 1 }}>
                  {loading ? <CircularProgress size={24} /> : (stats?.completed || 0)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label="Success"
                    size="small"
                    sx={{
                      backgroundColor: '#E8F5E8',
                      color: '#2E7D32',
                      fontSize: '10px',
                      height: '20px'
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                    {stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0}% of total
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={2} sx={{ mt: 0, alignItems: 'flex-start' }}>
          {/* Jobs List - Main Content */}
          <Grid item xs={12} xl={8} lg={7} md={12}>
            <Card sx={{
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              backgroundColor: '#FFFFFF',
              minHeight: '400px'
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#49566F' }}>
                    Active Jobs ({jobs.length})
                  </Typography>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : jobs.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Work sx={{ fontSize: 48, color: '#99A7BD', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#99A7BD' }}>
                      No jobs found
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Job ID</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Customer</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Technician</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Due Date</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {jobs.map((job) => (
                          <TableRow
                            key={job.id}
                            onClick={() => handleJobSelect(job)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: '#F8FAFC' },
                              backgroundColor: selectedJob?.id === job.id ? '#F0F7FF' : 'transparent'
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#49566F' }}>
                                {job.jobId}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                                {job.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '14px' }}>
                                  {job.customerName[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#49566F' }}>
                                    {job.customerName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                                    {job.customerEmail}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: '#49566F' }}>
                                {job.assignedTechnician || 'Unassigned'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={job.status.replace('_', ' ')}
                                size="small"
                                sx={{
                                  backgroundColor: `${getStatusColor(job.status)}15`,
                                  color: getStatusColor(job.status),
                                  fontWeight: 500,
                                  fontSize: '11px'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: '#49566F' }}>
                                {formatDate(job.dueDate)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <PermissionGate permission="repair:read">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleJobSelect(job);
                                    }}
                                    sx={{ color: '#3BB2FF' }}
                                  >
                                    <Visibility sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </PermissionGate>
                                <PermissionGate permission="repair:write">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEditJob(job);
                                    }}
                                    sx={{ color: '#6A6BFF' }}
                                  >
                                    <Edit sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </PermissionGate>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Job Details & Notes */}
          <Grid item xs={12} xl={4} lg={5} md={12}>
            <Grid container spacing={2} sx={{ mt: 0, alignItems: 'flex-start' }}>
              {/* Job Details Card */}
              <Grid item xs={12}>
                <Card sx={{
                  borderRadius: '20px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  backgroundColor: '#FFFFFF',
                  minHeight: '280px'
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#49566F', mb: 2 }}>
                      Job Details
                    </Typography>
                    
                    {selectedJob ? (
                      <Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: '#99A7BD', mb: 0.5 }}>
                            Job ID
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#49566F' }}>
                            {selectedJob.jobId}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: '#99A7BD', mb: 0.5 }}>
                            Customer
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#49566F' }}>
                            {selectedJob.customerName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                            {selectedJob.customerEmail}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: '#99A7BD', mb: 0.5 }}>
                            Status
                          </Typography>
                          <Chip
                            label={selectedJob.status.replace('_', ' ')}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(selectedJob.status)}15`,
                              color: getStatusColor(selectedJob.status),
                              fontWeight: 500
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: '#99A7BD', mb: 0.5 }}>
                            Total Cost
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#49566F' }}>
                            {formatCurrency(selectedJob.totalCost)}
                          </Typography>
                        </Box>
                        
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleOpenEditJob(selectedJob)}
                          sx={{
                            background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                            borderRadius: '20px',
                            textTransform: 'none',
                            fontWeight: 600,
                            mt: 1
                          }}
                        >
                          Edit Job
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Work sx={{ fontSize: 48, color: '#99A7BD', mb: 2 }} />
                        <Typography variant="body1" sx={{ color: '#99A7BD', mb: 1 }}>
                          Select a job to view details
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                          Click on any job from the list
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Job Notes Card */}
              <Grid item xs={12}>
                <Card sx={{
                  borderRadius: '20px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  backgroundColor: '#FFFFFF',
                  minHeight: '280px'
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#49566F' }}>
                        Job Notes
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => navigate('/jobs/notes/new')}
                        sx={{ color: '#3BB2FF' }}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    
                    {notes.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" sx={{ color: '#99A7BD', mb: 1 }}>
                          No notes yet
                        </Typography>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => setAddNoteDialog(true)}
                          sx={{ color: '#3BB2FF', textTransform: 'none' }}
                        >
                          Add new note...
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {notes.map((note) => (
                          <Box key={note.id} sx={{ mb: 2, p: 1.5, backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
                            <Typography variant="body2" sx={{ color: '#49566F', mb: 1 }}>
                              {note.content}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                                {note.createdBy}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                                {formatDate(note.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Create Job Dialog */}
      <Dialog
        open={createJobDialog} 
        onClose={() => setCreateJobDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Create New Job
          </Typography>
          <IconButton onClick={() => setCreateJobDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Job Title"
              value={createJobForm.title}
              onChange={(e) => setCreateJobForm(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              value={createJobForm.description}
              onChange={(e) => setCreateJobForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Customer</InputLabel>
              <Select
                value={createJobForm.customerId}
                onChange={(e) => setCreateJobForm(prev => ({ ...prev, customerId: e.target.value }))}
                label="Customer"
                required
              >
                {customers.length === 0 ? (
                  <MenuItem disabled>No customers available</MenuItem>
                ) : (
                  customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              <Typography variant="caption" sx={{ color: '#99A7BD', mt: 0.5 }}>
                {customers.length} customer(s) loaded
              </Typography>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={createJobForm.priority}
                onChange={(e) => setCreateJobForm(prev => ({ ...prev, priority: e.target.value as any }))}
                label="Priority"
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={createJobForm.dueDate}
              onChange={(e) => setCreateJobForm(prev => ({ ...prev, dueDate: e.target.value }))}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Assigned Technician</InputLabel>
              <Select
                value={createJobForm.assignedTechnician}
                onChange={(e) => setCreateJobForm(prev => ({ ...prev, assignedTechnician: e.target.value }))}
                label="Assigned Technician"
              >
                {technicians.length === 0 ? (
                  <MenuItem disabled>No technicians available</MenuItem>
                ) : (
                  technicians.map((tech) => (
                    <MenuItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              <Typography variant="caption" sx={{ color: '#99A7BD', mt: 0.5 }}>
                {technicians.length} technician(s) loaded
              </Typography>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setCreateJobDialog(false)}
            sx={{ color: '#99A7BD' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateJob}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Create Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog
        open={addNoteDialog}
        onClose={() => setAddNoteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          color: '#49566F'
        }}>
          Add Note
          <IconButton onClick={() => setAddNoteDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note here..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px'
                }
              }}
            />
            <Typography variant="caption" sx={{ color: '#99A7BD', mt: 1, display: 'block' }}>
              {selectedJob ? `Adding note to: ${selectedJob.title}` : 'Please select a job first'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setAddNoteDialog(false)}
            sx={{ color: '#99A7BD' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddNote}
            variant="contained"
            disabled={!selectedJob || !newNote.trim()}
            sx={{
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Add Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog
        open={editJobDialog}
        onClose={() => setEditJobDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          color: '#49566F'
        }}>
          Edit Job
          <IconButton onClick={() => setEditJobDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Job Title *"
              value={editJobForm.title}
              onChange={(e) => setEditJobForm(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={editJobForm.description}
              onChange={(e) => setEditJobForm(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Customer *</InputLabel>
              <Select
                value={editJobForm.customerId}
                onChange={(e) => setEditJobForm(prev => ({ ...prev, customerId: e.target.value }))}
                sx={{ borderRadius: '12px' }}
              >
                {customers.length === 0 ? (
                  <MenuItem disabled>No customers available</MenuItem>
                ) : (
                  customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={editJobForm.priority}
                onChange={(e) => setEditJobForm(prev => ({ ...prev, priority: e.target.value as any }))}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editJobForm.status}
                onChange={(e) => setEditJobForm(prev => ({ ...prev, status: e.target.value as any }))}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="ON_HOLD">On Hold</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Assigned Technician</InputLabel>
              <Select
                value={editJobForm.assignedTechnician}
                onChange={(e) => setEditJobForm(prev => ({ ...prev, assignedTechnician: e.target.value }))}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {technicians.length === 0 ? (
                  <MenuItem disabled>No technicians available</MenuItem>
                ) : (
                  technicians.map((tech) => (
                    <MenuItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setEditJobDialog(false)}
            sx={{ color: '#99A7BD' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditJob}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Update Job
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
  );
};

export default JobsPage;