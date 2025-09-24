import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Button,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress,
  Fade,
  Collapse,
  Badge,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  ExpandLess,
  ExpandMore,
  AccountCircle,
  Build as RepairIcon,
  Inventory as InventoryIcon,
  Receipt as InvoiceIcon,
  Payment as PaymentIcon,
  Assignment as TodoIcon,
  Settings as AdminIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  fetchActivities,
  deleteActivity,
  clearAllActivities,
  Activity,
} from '../../store/slices/activitiesSlice';
import { addNotification } from '../../store/slices/uiSlice';

const RecentActivities: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { activities, loading, error } = useAppSelector((state) => state.activities);

  // Local state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load activities on mount
  useEffect(() => {
    dispatch(fetchActivities({ page: 1, pageSize: 20 }));
  }, [dispatch]);

  // Auto-refresh activities every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      dispatch(fetchActivities({ page: 1, pageSize: 20 }));
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, autoRefresh]);

  // Handle notifications
  useEffect(() => {
    if (error) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: error,
      }));
    }
  }, [error, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchActivities({ page: 1, pageSize: 20 }));
  };

  const handleDeleteActivity = async (activity: Activity) => {
    try {
      await dispatch(deleteActivity(activity.id)).unwrap();
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        message: t('activities.deleteSuccess'),
      }));
    } catch (error) {
      console.error('Delete activity failed:', error);
    }
    setMenuAnchor(null);
  };

  const handleClearAll = async () => {
    try {
      await dispatch(clearAllActivities()).unwrap();
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        message: t('activities.clearAllSuccess'),
      }));
    } catch (error) {
      console.error('Clear activities failed:', error);
    }
  };

  const getActivityIcon = (type: Activity['type'], entityType: Activity['entityType']) => {
    switch (type) {
      case 'CUSTOMER_CREATED':
        return <AccountCircle />;
      case 'REPAIR_STARTED':
      case 'REPAIR_COMPLETED':
        return <RepairIcon />;
      case 'INVOICE_SENT':
        return <InvoiceIcon />;
      case 'PAYMENT_RECEIVED':
        return <PaymentIcon />;
      case 'INVENTORY_UPDATED':
        return <InventoryIcon />;
      case 'TODO_COMPLETED':
        return <TodoIcon />;
      default:
        switch (entityType) {
          case 'CUSTOMER': return <AccountCircle />;
          case 'REPAIR_TICKET': return <RepairIcon />;
          case 'INVOICE': return <InvoiceIcon />;
          case 'INVENTORY': return <InventoryIcon />;
          case 'TODO': return <TodoIcon />;
          default: return <AdminIcon />;
        }
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'CUSTOMER_CREATED': return 'primary';
      case 'REPAIR_STARTED': return 'info';
      case 'REPAIR_COMPLETED': return 'success';
      case 'INVOICE_SENT': return 'warning';
      case 'PAYMENT_RECEIVED': return 'success';
      case 'INVENTORY_UPDATED': return 'secondary';
      case 'TODO_COMPLETED': return 'success';
      default: return 'default';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t('activities.timeAgo.justNow');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('activities.timeAgo.minutesAgo', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('activities.timeAgo.hoursAgo', { count: hours });
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return t('activities.timeAgo.daysAgo', { count: days });
    }
  };

  const visibleActivities = showAll ? activities : activities.slice(0, 5);
  const hiddenCount = Math.max(0, activities.length - 5);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">
              {t('dashboard.recentActivities')}
            </Typography>
            {activities.length > 0 && (
              <Badge badgeContent={activities.length} color="primary" max={99}>
                <NotificationIcon fontSize="small" />
              </Badge>
            )}
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={autoRefresh ? t('activities.disableAutoRefresh') : t('activities.enableAutoRefresh')}>
              <IconButton
                onClick={() => setAutoRefresh(!autoRefresh)}
                size="small"
                color={autoRefresh ? 'primary' : 'default'}
              >
                <NotificationIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.refresh')}>
              <IconButton onClick={handleRefresh} size="small" disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {activities.length > 0 && (
              <Tooltip title={t('activities.clearAll')}>
                <IconButton onClick={handleClearAll} size="small">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ flex: 1, pt: 0, overflow: 'hidden' }}>
        {loading && activities.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : activities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" gutterBottom>
              {t('activities.noActivities')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('activities.noActivitiesDescription')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            <List dense sx={{ py: 0 }}>
              {visibleActivities.map((activity, index) => (
                <Fade in key={activity.id} timeout={300 + index * 100}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          setSelectedActivity(activity);
                          setMenuAnchor(e.currentTarget);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: `${getActivityColor(activity.type)}.main`,
                          width: 32,
                          height: 32,
                        }}
                      >
                        {getActivityIcon(activity.type, activity.entityType)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {activity.title}
                          </Typography>
                          <Chip
                            label={activity.entityType}
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {activity.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                              {activity.userName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(activity.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                </Fade>
              ))}
              
              {/* Show More/Less Button */}
              {hiddenCount > 0 && (
                <ListItem>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => setShowAll(!showAll)}
                    startIcon={showAll ? <ExpandLess /> : <ExpandMore />}
                    sx={{ mt: 1 }}
                  >
                    {showAll
                      ? t('activities.showLess')
                      : t('activities.showMore', { count: hiddenCount })
                    }
                  </Button>
                </ListItem>
              )}
            </List>
          </Box>
        )}
      </CardContent>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleDeleteActivity(selectedActivity!)}>
          <ClearIcon sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default RecentActivities;
