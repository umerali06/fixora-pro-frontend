import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Pagination,
  CircularProgress,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useResponsiveData } from '../../hooks/useResponsiveData';

interface Job {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  repairTicketId: string;
  createdAt: string;
  updatedAt: string;
}

const Jobs: React.FC = () => {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  const [jobsData, jobsActions] = useResponsiveData<Job>({
    endpoint: '/jobs',
    realTime: false,
    autoRefresh: false,
    refreshInterval: 30000,
    pageSize: 10
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    assignedTo: '',
    estimatedDuration: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDialog = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        description: job.description || '',
        status: job.status,
        priority: job.priority,
        assignedTo: job.assignedTo || '',
        estimatedDuration: job.estimatedDuration?.toString() || '',
        notes: job.notes || ''
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: '',
        description: '',
        status: 'PENDING',
        priority: 'MEDIUM',
        assignedTo: '',
        estimatedDuration: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingJob(null);
    setFormErrors({});
  };

  const handleViewJob = (job: Job) => {
    setViewingJob(job);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingJob(null);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      errors.title = t('validation.required');
    }
    
    if (formData.estimatedDuration && parseInt(formData.estimatedDuration) < 0) {
      errors.estimatedDuration = t('validation.positiveNumber');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const jobData = {
        ...formData,
        estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null
      };

      if (editingJob) {
        await jobsActions.updateItem(editingJob.id, jobData);
        setSnackbar({ 
          open: true, 
          message: t('jobs.updateSuccess'), 
          severity: 'success' 
        });
      } else {
        await jobsActions.createItem(jobData);
        setSnackbar({ 
          open: true, 
          message: t('jobs.createSuccess'), 
          severity: 'success' 
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: editingJob ? t('jobs.updateError') : t('jobs.createError'), 
        severity: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(t('jobs.confirmDelete', { title }))) {
      try {
        await jobsActions.deleteItem(id);
        setSnackbar({ 
          open: true, 
          message: t('jobs.deleteSuccess'), 
          severity: 'success' 
        });
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: t('jobs.deleteError'), 
          severity: 'error' 
        });
      }
    }
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobsData.data.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || job.status === statusFilter;
    const matchesPriority = !priorityFilter || job.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'primary';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#24324A' }}>
          {t('navigation.jobs')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => jobsActions.refreshData()}
            disabled={jobsData.loading}
          >
            {t('common.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#2F80ED',
              '&:hover': { backgroundColor: '#1B5EAC' }
            }}
          >
            {t('jobs.addJob')}
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3, backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E8EEF5' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder={t('jobs.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowFilters(!showFilters)}
                size="small"
              >
                {t('common.filter')}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                {t('jobs.totalJobs', { count: filteredJobs.length })}
              </Typography>
            </Grid>
          </Grid>
          
          <Collapse in={showFilters}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('jobs.status')}</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label={t('jobs.status')}
                  >
                    <MenuItem value="">{t('common.all')}</MenuItem>
                    <MenuItem value="PENDING">{t('status.pending')}</MenuItem>
                    <MenuItem value="IN_PROGRESS">{t('status.inProgress')}</MenuItem>
                    <MenuItem value="COMPLETED">{t('status.completed')}</MenuItem>
                    <MenuItem value="CANCELLED">{t('status.cancelled')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('jobs.priority')}</InputLabel>
                  <Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    label={t('jobs.priority')}
                  >
                    <MenuItem value="">{t('common.all')}</MenuItem>
                    <MenuItem value="LOW">{t('priority.low')}</MenuItem>
                    <MenuItem value="MEDIUM">{t('priority.medium')}</MenuItem>
                    <MenuItem value="HIGH">{t('priority.high')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                    setPriorityFilter('');
                  }}
                  size="small"
                >
                  {t('common.clearFilters')}
                </Button>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E8EEF5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon sx={{ color: '#2F80ED', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {jobsData.data.filter(job => job.status === 'PENDING').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('jobs.pendingJobs')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E8EEF5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ color: '#FF9800', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {jobsData.data.filter(job => job.status === 'IN_PROGRESS').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('jobs.inProgress')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E8EEF5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ color: '#4CAF50', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {jobsData.data.filter(job => job.status === 'COMPLETED').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('jobs.completed')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E8EEF5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ color: '#F44336', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {jobsData.data.filter(job => job.priority === 'HIGH').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('jobs.highPriority')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Jobs Table */}
      <Card sx={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E8EEF5' }}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('jobs.title')}</TableCell>
                  <TableCell>{t('jobs.status')}</TableCell>
                  <TableCell>{t('jobs.priority')}</TableCell>
                  <TableCell>{t('jobs.assignedTo')}</TableCell>
                  <TableCell>{t('jobs.duration')}</TableCell>
                  <TableCell>{t('jobs.started')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobsData.loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={24} />
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        {t('common.loading')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="textSecondary">
                        {searchQuery || statusFilter || priorityFilter 
                          ? t('jobs.noJobsFound') 
                          : t('jobs.noJobs')
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {job.title}
          </Typography>
                        {job.description && (
                          <Typography variant="caption" color="textSecondary">
                            {job.description.substring(0, 50)}...
          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(`status.${job.status.toLowerCase()}`)}
                          color={getStatusColor(job.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(`priority.${job.priority.toLowerCase()}`)}
                          color={getPriorityColor(job.priority) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ fontSize: 16, mr: 1 }} />
                          {job.assignedTo || t('jobs.unassigned')}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {formatDuration(job.actualDuration || job.estimatedDuration)}
                      </TableCell>
                      <TableCell>
                        {formatDate(job.startedAt)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title={t('common.view')}>
                            <IconButton size="small" color="primary" onClick={() => handleViewJob(job)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common.edit')}>
                            <IconButton size="small" color="primary" onClick={() => handleOpenDialog(job)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common.delete')}>
                            <IconButton size="small" color="error" onClick={() => handleDelete(job.id, job.title)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingJob ? t('jobs.editJob') : t('jobs.addJob')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('jobs.title')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                error={!!formErrors.title}
                helperText={formErrors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('jobs.description')}
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('jobs.descriptionPlaceholder')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('jobs.status')}</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label={t('jobs.status')}
                >
                  <MenuItem value="PENDING">{t('status.pending')}</MenuItem>
                  <MenuItem value="IN_PROGRESS">{t('status.inProgress')}</MenuItem>
                  <MenuItem value="COMPLETED">{t('status.completed')}</MenuItem>
                  <MenuItem value="CANCELLED">{t('status.cancelled')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('jobs.priority')}</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  label={t('jobs.priority')}
                >
                  <MenuItem value="LOW">{t('priority.low')}</MenuItem>
                  <MenuItem value="MEDIUM">{t('priority.medium')}</MenuItem>
                  <MenuItem value="HIGH">{t('priority.high')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('jobs.assignedTo')}
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder={t('jobs.assignedToPlaceholder')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('jobs.estimatedDuration')}
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                error={!!formErrors.estimatedDuration}
                helperText={formErrors.estimatedDuration || t('jobs.durationHelper')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">{t('jobs.minutes')}</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('jobs.notes')}
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('jobs.notesPlaceholder')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
          >
            {isSubmitting 
              ? t('common.saving') 
              : editingJob 
                ? t('common.update') 
                : t('common.create')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Job Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {t('jobs.viewJob')}
        </DialogTitle>
        <DialogContent>
          {viewingJob && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {viewingJob.title}
                </Typography>
                {viewingJob.description && (
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {viewingJob.description}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('jobs.status')}
                </Typography>
                <Chip
                  label={t(`status.${viewingJob.status.toLowerCase()}`)}
                  color={getStatusColor(viewingJob.status) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('jobs.priority')}
                </Typography>
                <Chip
                  label={t(`priority.${viewingJob.priority.toLowerCase()}`)}
                  color={getPriorityColor(viewingJob.priority) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('jobs.assignedTo')}
                </Typography>
                <Typography variant="body2">
                  {viewingJob.assignedTo || t('jobs.unassigned')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('jobs.estimatedDuration')}
                </Typography>
                <Typography variant="body2">
                  {formatDuration(viewingJob.estimatedDuration)}
                </Typography>
              </Grid>
              {viewingJob.startedAt && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('jobs.startedAt')}
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(viewingJob.startedAt)}
                  </Typography>
                </Grid>
              )}
              {viewingJob.completedAt && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('jobs.completedAt')}
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(viewingJob.completedAt)}
                  </Typography>
                </Grid>
              )}
              {viewingJob.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('jobs.notes')}
                  </Typography>
                  <Typography variant="body2">
                    {viewingJob.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>
            {t('common.close')}
          </Button>
          <Button 
            onClick={() => {
              handleCloseViewDialog();
              if (viewingJob) handleOpenDialog(viewingJob);
            }}
            variant="contained"
          >
            {t('common.edit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Jobs; 