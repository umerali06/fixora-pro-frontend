import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  LinearProgress,
  Tooltip,
  TextField
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  CloudDownload as DownloadIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Storage as StorageIcon,
  Restore as RestoreIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon2,
  Autorenew as AutorenewIcon
} from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import DashboardHeader from '../../components/Layout/DashboardHeader';

interface Backup {
  id: string;
  filename: string;
  filePath: string;
  fileSize: number;
  backupType: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled';
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  progress?: number;
  errorMessage?: string;
}

interface BackupStats {
  totalBackups: number;
  completedBackups: number;
  failedBackups: number;
  inProgressBackups: number;
  totalSize: number;
  lastBackupDate?: string;
  nextScheduledBackup?: string;
  averageBackupSize: number;
}

const BackupsPage: React.FC = () => {
  const { token } = useAppSelector((state) => state.auth);

  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Dialogs
  const [createDialog, setCreateDialog] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  
  // Form data
  const [backupFormData, setBackupFormData] = useState({
    backupType: 'full' as 'full' | 'incremental' | 'differential',
    description: ''
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    time: '02:00',
    backupType: 'full' as 'full' | 'incremental' | 'differential',
    enabled: true
  });

  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/backups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch backups');
      }

      const result = await response.json();
      setBackups(result.data);
    } catch (err) {
      console.error('Error fetching backups:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch backups');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/backups/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error fetching backup stats:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchBackups();
    fetchStats();
    
    // Set up polling for in-progress backups
    const interval = setInterval(() => {
      fetchBackups();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchBackups, fetchStats]);

  const handleCreateBackup = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/v1/backups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backupFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create backup');
      }

      const result = await response.json();
      setBackups([result.data, ...backups]);
      setCreateDialog(false);
      resetBackupForm();
      fetchStats();
    } catch (err) {
      console.error('Error creating backup:', err);
      setError(err instanceof Error ? err.message : 'Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backup: Backup) => {
    try {
      const response = await fetch(`/api/v1/backups/${backup.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download backup');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading backup:', err);
      setError(err instanceof Error ? err.message : 'Failed to download backup');
    }
  };

  const handleRestoreBackup = async (backup: Backup) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/v1/backups/${backup.id}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore backup');
      }

      setRestoreDialog(false);
      setSelectedBackup(null);
      setError(null);
    } catch (err) {
      console.error('Error restoring backup:', err);
      setError(err instanceof Error ? err.message : 'Failed to restore backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (backup: Backup) => {
    if (!window.confirm(`Are you sure you want to delete backup "${backup.filename}"?`)) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/v1/backups/${backup.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete backup');
      }

      setBackups(backups.filter(b => b.id !== backup.id));
      fetchStats();
    } catch (err) {
      console.error('Error deleting backup:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete backup');
    } finally {
      setLoading(false);
    }
  };

  const resetBackupForm = () => {
    setBackupFormData({
      backupType: 'full',
      description: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#2196F3';
      case 'failed': return '#F44336';
      case 'scheduled': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'in_progress': return <AutorenewIcon />;
      case 'failed': return <ErrorIcon />;
      case 'scheduled': return <ScheduleIcon />;
      default: return <WarningIcon />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredBackups = backups.filter(backup => {
    const matchesSearch = 
      backup.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      backup.createdBy.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      backup.createdBy.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || backup.status === statusFilter;
    const matchesType = !typeFilter || backup.backupType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#EEF3FB' }}>
      <DashboardHeader />
      
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#49566F', mb: 1 }}>
              Database Backups
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage database backups and restorations
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon2 />}
              onClick={() => setScheduleDialog(true)}
              sx={{ borderRadius: '20px', textTransform: 'none' }}
            >
              Schedule
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => setCreateDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Create Backup
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: '18px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                        Total Backups
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#49566F' }}>
                        {stats.totalBackups}
                      </Typography>
                    </Box>
                    <StorageIcon sx={{ color: '#3BB2FF', fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: '18px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                        Completed
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                        {stats.completedBackups}
                      </Typography>
                    </Box>
                    <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: '18px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                        Failed
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#F44336' }}>
                        {stats.failedBackups}
                      </Typography>
                    </Box>
                    <ErrorIcon sx={{ color: '#F44336', fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: '18px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                        Total Size
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#49566F' }}>
                        {formatFileSize(stats.totalSize)}
                      </Typography>
                    </Box>
                    <StorageIcon sx={{ color: '#6A6BFF', fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search backups..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#99A7BD' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '15px',
                      backgroundColor: '#FFFFFF'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: '15px' }}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Type"
                    onChange={(e) => setTypeFilter(e.target.value)}
                    sx={{ borderRadius: '15px' }}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="full">Full</MenuItem>
                    <MenuItem value="incremental">Incremental</MenuItem>
                    <MenuItem value="differential">Differential</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <IconButton onClick={fetchBackups} sx={{ color: '#3BB2FF' }}>
                  <RefreshIcon />
                </IconButton>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Backups Table */}
        <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredBackups.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <StorageIcon sx={{ fontSize: 48, color: '#99A7BD', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#99A7BD', mb: 1 }}>
                  No backups found
                </Typography>
                <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                  {searchQuery ? 'Try adjusting your search criteria' : 'Create your first backup to get started'}
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Filename</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Size</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Created By</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Created At</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#49566F' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBackups.map((backup) => (
                      <TableRow key={backup.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StorageIcon sx={{ color: '#6A6BFF', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#49566F' }}>
                              {backup.filename}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={backup.backupType}
                            size="small"
                            sx={{
                              backgroundColor: backup.backupType === 'full' ? '#E3F2FD' : 
                                             backup.backupType === 'incremental' ? '#F3E5F5' : '#E8F5E8',
                              color: backup.backupType === 'full' ? '#1976D2' : 
                                     backup.backupType === 'incremental' ? '#7B1FA2' : '#388E3C',
                              fontWeight: 500,
                              fontSize: '11px'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#49566F' }}>
                            {formatFileSize(backup.fileSize)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Chip
                              icon={getStatusIcon(backup.status)}
                              label={backup.status}
                              size="small"
                              sx={{
                                backgroundColor: `${getStatusColor(backup.status)}15`,
                                color: getStatusColor(backup.status),
                                fontWeight: 500,
                                fontSize: '11px'
                              }}
                            />
                            {backup.status === 'in_progress' && backup.progress !== undefined && (
                              <Box sx={{ mt: 1, width: '100%' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={backup.progress}
                                  sx={{ height: 4, borderRadius: 2 }}
                                />
                                <Typography variant="caption" sx={{ color: '#99A7BD', fontSize: '10px' }}>
                                  {backup.progress}%
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                              {backup.createdBy.firstName[0]}{backup.createdBy.lastName[0]}
                            </Avatar>
                            <Typography variant="body2" sx={{ color: '#49566F' }}>
                              {backup.createdBy.firstName} {backup.createdBy.lastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#49566F' }}>
                            {formatDate(backup.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {backup.status === 'completed' && (
                              <>
                                <Tooltip title="Download Backup">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDownloadBackup(backup)}
                                    sx={{ color: '#3BB2FF' }}
                                  >
                                    <DownloadIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Restore Backup">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedBackup(backup);
                                      setRestoreDialog(true);
                                    }}
                                    sx={{ color: '#4CAF50' }}
                                  >
                                    <RestoreIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title="Delete Backup">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteBackup(backup)}
                                sx={{ color: '#F44336' }}
                              >
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
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

        {/* Create Backup Dialog */}
        <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Create New Backup</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Backup Type</InputLabel>
                    <Select
                      value={backupFormData.backupType}
                      label="Backup Type"
                      onChange={(e) => setBackupFormData({ ...backupFormData, backupType: e.target.value as any })}
                    >
                      <MenuItem value="full">Full Backup</MenuItem>
                      <MenuItem value="incremental">Incremental Backup</MenuItem>
                      <MenuItem value="differential">Differential Backup</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (Optional)"
                    value={backupFormData.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBackupFormData({ ...backupFormData, description: e.target.value })}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateBackup}
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Create Backup
            </Button>
          </DialogActions>
        </Dialog>

        {/* Restore Backup Dialog */}
        <Dialog open={restoreDialog} onClose={() => setRestoreDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Restore Backup</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              {selectedBackup && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Warning: This action will restore the database to the state when this backup was created.
                  </Typography>
                  <Typography variant="body2">
                    All data created after {formatDate(selectedBackup.createdAt)} will be lost.
                    Make sure to create a backup of your current data before proceeding.
                  </Typography>
                </Alert>
              )}
              <Typography variant="body1" sx={{ color: '#49566F' }}>
                Are you sure you want to restore from backup "{selectedBackup?.filename}"?
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setRestoreDialog(false)}>Cancel</Button>
            <Button
              onClick={() => selectedBackup && handleRestoreBackup(selectedBackup)}
              variant="contained"
              disabled={loading}
              color="error"
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Restore Backup
            </Button>
          </DialogActions>
        </Dialog>

        {/* Schedule Backup Dialog */}
        <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Schedule Automatic Backups</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={scheduleFormData.enabled}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, enabled: e.target.checked })}
                      />
                    }
                    label="Enable automatic backups"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={scheduleFormData.frequency}
                      label="Frequency"
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, frequency: e.target.value as any })}
                      disabled={!scheduleFormData.enabled}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    type="time"
                    value={scheduleFormData.time}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduleFormData({ ...scheduleFormData, time: e.target.value })}
                    disabled={!scheduleFormData.enabled}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Backup Type</InputLabel>
                    <Select
                      value={scheduleFormData.backupType}
                      label="Backup Type"
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, backupType: e.target.value as any })}
                      disabled={!scheduleFormData.enabled}
                    >
                      <MenuItem value="full">Full Backup</MenuItem>
                      <MenuItem value="incremental">Incremental Backup</MenuItem>
                      <MenuItem value="differential">Differential Backup</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Save Schedule
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default BackupsPage;

