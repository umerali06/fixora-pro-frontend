import api from './api';

const notificationAPI = {
  // Get notifications for a user
  getNotifications: async (userId: string, organizationId: string, limit: number = 50) => {
    const response = await api.get('/notifications', {
      params: { userId, organizationId, limit },
    });
    return response.data.data || response.data;
  },

  // Create a new notification
  createNotification: async (notificationData: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    category: 'system' | 'user' | 'order' | 'repair' | 'inventory' | 'payment' | 'warranty' | 'refund';
    priority: 'low' | 'medium' | 'high';
    actionUrl?: string;
    actionText?: string;
  }, organizationId: string) => {
    const response = await api.post('/notifications', notificationData, {
      params: { organizationId },
    });
    return response.data.data || response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string, userId: string) => {
    const response = await api.patch(`/notifications/${notificationId}/read`, {}, {
      params: { userId },
    });
    return response.data.data || response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string, organizationId: string) => {
    const response = await api.patch('/notifications/read-all', {}, {
      params: { userId, organizationId },
    });
    return response.data.data || response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId: string, userId: string) => {
    const response = await api.delete(`/notifications/${notificationId}`, {
      params: { userId },
    });
    return response.data.data || response.data;
  },

  // Clear all notifications
  clearAllNotifications: async (userId: string, organizationId: string) => {
    const response = await api.delete('/notifications', {
      params: { userId, organizationId },
    });
    return response.data.data || response.data;
  },

  // Get notification settings
  getNotificationSettings: async (userId: string, organizationId: string) => {
    const response = await api.get('/notifications/settings', {
      params: { userId, organizationId },
    });
    return response.data.data || response.data;
  },

  // Update notification settings
  updateNotificationSettings: async (
    userId: string,
    organizationId: string,
    settings: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      lowStock?: boolean;
      jobCompletion?: boolean;
      paymentReminders?: boolean;
      newUser?: boolean;
      orderUpdate?: boolean;
      repairUpdate?: boolean;
      warrantyExpiry?: boolean;
      systemMaintenance?: boolean;
      quietHoursEnabled?: boolean;
      quietHoursStart?: string;
      quietHoursEnd?: string;
      timezone?: string;
      frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
      channels?: string[];
    }
  ) => {
    const response = await api.put('/notifications/settings', settings, {
      params: { userId, organizationId },
    });
    return response.data.data || response.data;
  },

  // Get notification statistics
  getNotificationStats: async (organizationId: string) => {
    const response = await api.get('/notifications/stats', {
      params: { organizationId },
    });
    return response.data.data || response.data;
  },

  // Send notification
  sendNotification: async (
    userId: string,
    organizationId: string,
    notificationData: {
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
      category: 'system' | 'user' | 'order' | 'repair' | 'inventory' | 'payment' | 'warranty' | 'refund';
      priority: 'low' | 'medium' | 'high';
      actionUrl?: string;
      actionText?: string;
    }
  ) => {
    const response = await api.post('/notifications/send', notificationData, {
      params: { userId, organizationId },
    });
    return response.data.data || response.data;
  },
};

export default notificationAPI;
