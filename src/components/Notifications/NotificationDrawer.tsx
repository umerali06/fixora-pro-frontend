import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Button,
  Divider,
  Badge,
  Tooltip,
  Avatar,
  Paper,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';

// Define Notification interface locally to avoid import issues
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'user' | 'order' | 'repair' | 'inventory' | 'payment' | 'warranty' | 'refund';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  userId?: string;
  organizationId?: string;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon color="success" />;
    case 'warning':
      return <WarningIcon color="warning" />;
    case 'error':
      return <ErrorIcon color="error" />;
    default:
      return <InfoIcon color="info" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return '#10B981';
    case 'warning':
      return '#F59E0B';
    case 'error':
      return '#EF4444';
    default:
      return '#3BB2FF';
  }
};

const getCategoryColor = (category: Notification['category']) => {
  switch (category) {
    case 'system':
      return '#6B7280';
    case 'user':
      return '#3BB2FF';
    case 'order':
      return '#10B981';
    case 'repair':
      return '#F59E0B';
    case 'inventory':
      return '#8B5CF6';
    case 'payment':
      return '#EF4444';
    case 'warranty':
      return '#06B6D4';
    case 'refund':
      return '#84CC16';
    default:
      return '#6B7280';
  }
};

const formatTimeAgo = (timestamp: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};

const NotificationDrawer: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    closeDrawer,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // Navigate to the action URL
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  const handleRefresh = () => {
    // This would typically fetch new notifications from the server
    window.location.reload();
  };

  return (
    <Drawer
      anchor="right"
      open={isDrawerOpen}
      onClose={closeDrawer}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          backgroundColor: '#FFFFFF',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon sx={{ color: '#3BB2FF' }} />
            </Badge>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1A202C' }}>
              Notifications
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={closeDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Actions */}
        {notifications.length > 0 && (
          <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0' }}>
            <Stack direction="row" spacing={1} justifyContent="space-between">
              <Button
                size="small"
                startIcon={<MarkEmailReadIcon />}
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                sx={{ textTransform: 'none' }}
              >
                Mark all as read
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleClearAll}
                sx={{ textTransform: 'none' }}
              >
                Clear all
              </Button>
            </Stack>
          </Box>
        )}

        {/* Notifications List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3,
                textAlign: 'center',
              }}
            >
              <NotificationsIcon sx={{ fontSize: 64, color: '#E2E8F0', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
                No notifications
              </Typography>
              <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                You're all caught up! New notifications will appear here.
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      backgroundColor: notification.read ? 'transparent' : '#F0F9FF',
                      borderLeft: notification.read ? 'none' : `3px solid ${getNotificationColor(notification.type)}`,
                      '&:hover': {
                        backgroundColor: notification.read ? '#F8FAFC' : '#E0F2FE',
                      },
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: getNotificationColor(notification.type),
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: notification.read ? 500 : 600,
                              color: '#1A202C',
                              flex: 1,
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#3BB2FF',
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#6B7280',
                              mb: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {notification.message}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={notification.category}
                              size="small"
                              sx={{
                                backgroundColor: getCategoryColor(notification.category),
                                color: 'white',
                                fontSize: '0.75rem',
                                height: 20,
                              }}
                            />
                            <Typography variant="caption" sx={{ color: '#99A7BD' }}>
                              {formatTimeAgo(notification.timestamp)}
                            </Typography>
                            {notification.priority === 'high' && (
                              <Chip
                                label="High"
                                size="small"
                                color="error"
                                sx={{ fontSize: '0.75rem', height: 20 }}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        sx={{ color: '#99A7BD' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default NotificationDrawer;
