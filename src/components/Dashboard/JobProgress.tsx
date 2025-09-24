import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  CircularProgress,
  Button,
  Fade,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  fetchJobProgress,
  updateJobProgress,
  JobProgressData,
} from '../../store/slices/dashboardStatsSlice';
import { fetchRepairTickets } from '../../store/slices/repairTicketsSlice';
import { addNotification } from '../../store/slices/uiSlice';

const JobProgress: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.dashboardStats);
  const { tickets } = useAppSelector((state) => state.repairTickets);

  const [animationStarted, setAnimationStarted] = useState(false);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchJobProgress());
    dispatch(fetchRepairTickets({ pageSize: 1000 })); // Get all tickets for accurate stats
  }, [dispatch]);

  // Start animation after data loads
  useEffect(() => {
    if (stats?.jobProgress && !animationStarted) {
      setTimeout(() => setAnimationStarted(true), 500);
    }
  }, [stats, animationStarted]);

  // Calculate real-time job progress from repair tickets
  const calculateJobProgress = (): JobProgressData => {
    if (tickets.length === 0) {
      return {
        pending: 0,
        inProgress: 0,
        completed: 0,
        total: 0,
        percentages: { pending: 0, inProgress: 0, completed: 0 },
      };
    }

    const pending = tickets.filter(t => ['RECEIVED', 'DIAGNOSED', 'WAITING_PARTS'].includes(t.status)).length;
    const inProgress = tickets.filter(t => t.status === 'IN_REPAIR').length;
    const completed = tickets.filter(t => ['COMPLETED', 'READY_FOR_PICKUP', 'DELIVERED'].includes(t.status)).length;
    const total = tickets.length;

    return {
      pending,
      inProgress,
      completed,
      total,
      percentages: {
        pending: total > 0 ? (pending / total) * 100 : 0,
        inProgress: total > 0 ? (inProgress / total) * 100 : 0,
        completed: total > 0 ? (completed / total) * 100 : 0,
      },
    };
  };

  const handleRefresh = async () => {
    try {
      await dispatch(fetchJobProgress()).unwrap();
      await dispatch(fetchRepairTickets({ pageSize: 1000 })).unwrap();
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        message: t('dashboard.refreshSuccess'),
      }));
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  // Use real-time data if available, fallback to stats
  const jobProgress = stats?.jobProgress || calculateJobProgress();
  const realTimeProgress = calculateJobProgress();

  // Update stats if real-time data differs significantly
  useEffect(() => {
    if (Math.abs(realTimeProgress.total - (stats?.jobProgress?.total || 0)) > 0) {
      dispatch(updateJobProgress(realTimeProgress));
    }
  }, [realTimeProgress, stats, dispatch]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return 'success';
    if (percentage >= 40) return 'warning';
    return 'error';
  };

  const formatPercentage = (value: number) => {
    return Math.round(value);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">
              {t('dashboard.jobProgress')}
            </Typography>
            <Chip
              icon={<TrendingUpIcon />}
              label={`${jobProgress.total} ${t('dashboard.totalJobs')}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        }
        action={
          <Tooltip title={t('common.refresh')}>
            <IconButton onClick={handleRefresh} size="small" disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ flex: 1, pt: 0 }}>
        {loading && !stats ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : jobProgress.total === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" gutterBottom>
              {t('dashboard.noActiveJobs')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.noActiveJobsDescription')}
            </Typography>
          </Box>
        ) : (
          <Fade in={animationStarted}>
            <Box>
              {/* Progress Overview */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
                      <ScheduleIcon color="warning" fontSize="small" />
                      <Typography variant="h6" color="warning.main">
                        {jobProgress.pending}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('dashboard.pending')}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
                      <PlayArrowIcon color="info" fontSize="small" />
                      <Typography variant="h6" color="info.main">
                        {jobProgress.inProgress}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('dashboard.inProgress')}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="h6" color="success.main">
                        {jobProgress.completed}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('dashboard.completed')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Progress Bars */}
              <Box sx={{ mb: 3 }}>
                {/* Pending Progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.pending')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatPercentage(jobProgress.percentages.pending)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={animationStarted ? jobProgress.percentages.pending : 0}
                    color="warning"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* In Progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.inProgress')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatPercentage(jobProgress.percentages.inProgress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={animationStarted ? jobProgress.percentages.inProgress : 0}
                    color="info"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Completed */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.completed')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatPercentage(jobProgress.percentages.completed)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={animationStarted ? jobProgress.percentages.completed : 0}
                    color={getProgressColor(jobProgress.percentages.completed) as any}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Box>

              {/* Overall Completion Rate */}
              <Box sx={{ 
                textAlign: 'center', 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 2, 
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('dashboard.completionRate')}
                </Typography>
                <Typography 
                  variant="h4" 
                  color={getProgressColor(jobProgress.percentages.completed)}
                  sx={{ fontWeight: 'bold' }}
                >
                  {formatPercentage(jobProgress.percentages.completed)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('dashboard.of')} {jobProgress.total} {t('dashboard.totalJobs')}
                </Typography>
              </Box>

              {/* Quick Actions */}
              {jobProgress.pending > 0 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      // Navigate to repair tracking with pending filter
                      window.location.href = '/repair-tracking?status=pending';
                    }}
                  >
                    {t('dashboard.viewPendingJobs')} ({jobProgress.pending})
                  </Button>
                </Box>
              )}
            </Box>
          </Fade>
        )}
      </CardContent>
    </Card>
  );
};

export default JobProgress;
