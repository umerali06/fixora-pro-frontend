import { useEffect, useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import notificationAPI from '../services/notificationAPI';
import { getOrgIdFromToken, getUserIdFromToken } from '../utils/auth';

export const useNotificationPolling = (intervalMs: number = 30000) => {
  const { addNotification } = useNotifications();

  const fetchNotifications = useCallback(async () => {
    try {
      const userId = getUserIdFromToken();
      const orgId = getOrgIdFromToken();
      
      if (!userId || !orgId) return;

      const response = await notificationAPI.getNotifications(userId, orgId, 10);
      
      if (response.success && response.data) {
        // Check for new notifications and add them
        const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const existingIds = new Set(existingNotifications.map((n: any) => n.id));
        
        const newNotifications = response.data.filter((notification: any) => 
          !existingIds.has(notification.id)
        );

        newNotifications.forEach((notification: any) => {
          addNotification({
            title: notification.title,
            message: notification.message,
            type: notification.type,
            category: notification.category,
            priority: notification.priority,
            actionUrl: notification.actionUrl,
            actionText: notification.actionText,
          });
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [addNotification]);

  useEffect(() => {
    // Fetch notifications immediately
    fetchNotifications();

    // Set up polling interval
    const interval = setInterval(fetchNotifications, intervalMs);

    return () => clearInterval(interval);
  }, [fetchNotifications, intervalMs]);

  return { fetchNotifications };
};
