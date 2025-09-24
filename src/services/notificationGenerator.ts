import { addNotification } from '../contexts/NotificationContext';

// Sample notification templates
const notificationTemplates = [
  {
    title: 'New Repair Job Assigned',
    message: 'iPhone 12 screen repair job #1234 has been assigned to you',
    type: 'info' as const,
    category: 'repair' as const,
    priority: 'high' as const,
    actionUrl: '/repair-tracking',
    actionText: 'View Job',
  },
  {
    title: 'Low Stock Alert',
    message: 'iPhone 12 screen protectors are running low (3 remaining)',
    type: 'warning' as const,
    category: 'inventory' as const,
    priority: 'medium' as const,
    actionUrl: '/stock',
    actionText: 'Restock',
  },
  {
    title: 'Payment Received',
    message: 'Payment of $150 received for invoice #INV-2024-001',
    type: 'success' as const,
    category: 'payment' as const,
    priority: 'low' as const,
    actionUrl: '/invoices',
    actionText: 'View Invoice',
  },
  {
    title: 'Customer Review',
    message: 'John Doe left a 5-star review for your repair service',
    type: 'success' as const,
    category: 'user' as const,
    priority: 'low' as const,
    actionUrl: '/customers',
    actionText: 'View Review',
  },
  {
    title: 'Warranty Expiring Soon',
    message: 'Warranty for Samsung Galaxy S21 expires in 7 days',
    type: 'warning' as const,
    category: 'warranty' as const,
    priority: 'medium' as const,
    actionUrl: '/warranties',
    actionText: 'View Details',
  },
  {
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 2-4 AM',
    type: 'info' as const,
    category: 'system' as const,
    priority: 'low' as const,
    actionUrl: '/settings',
    actionText: 'Learn More',
  },
  {
    title: 'New Customer Registration',
    message: 'Sarah Johnson has registered as a new customer',
    type: 'info' as const,
    category: 'user' as const,
    priority: 'low' as const,
    actionUrl: '/customers',
    actionText: 'View Profile',
  },
  {
    title: 'Refund Processed',
    message: 'Refund of $75 has been processed for order #ORD-2024-002',
    type: 'success' as const,
    category: 'refund' as const,
    priority: 'medium' as const,
    actionUrl: '/refunds',
    actionText: 'View Refund',
  },
];

// Generate a random notification
export const generateRandomNotification = () => {
  const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
  
  // Add some randomization to make it more realistic
  const randomId = Math.floor(Math.random() * 10000);
  const randomAmount = Math.floor(Math.random() * 500) + 50;
  const randomCustomer = ['John Doe', 'Sarah Johnson', 'Mike Smith', 'Lisa Brown', 'David Wilson'][Math.floor(Math.random() * 5)];
  
  const notification = {
    ...template,
    message: template.message
      .replace('#1234', `#${randomId}`)
      .replace('#INV-2024-001', `#INV-2024-${String(randomId).padStart(3, '0')}`)
      .replace('$150', `$${randomAmount}`)
      .replace('John Doe', randomCustomer)
      .replace('Samsung Galaxy S21', ['iPhone 13', 'Samsung Galaxy S22', 'Google Pixel 6', 'OnePlus 9'][Math.floor(Math.random() * 4)])
      .replace('ORD-2024-002', `ORD-2024-${String(randomId).padStart(3, '0')}`)
      .replace('$75', `$${Math.floor(Math.random() * 200) + 25}`),
  };

  return notification;
};

// Generate sample notifications for testing
export const generateSampleNotifications = (count: number = 5) => {
  const notifications = [];
  for (let i = 0; i < count; i++) {
    notifications.push(generateRandomNotification());
  }
  return notifications;
};

// Auto-generate notifications for testing (call this in development)
export const startNotificationGenerator = (intervalMs: number = 60000) => {
  // Generate initial notifications
  const initialNotifications = generateSampleNotifications(3);
  initialNotifications.forEach(notification => {
    addNotification(notification);
  });

  // Set up interval for new notifications
  const interval = setInterval(() => {
    const shouldGenerate = Math.random() < 0.3; // 30% chance every minute
    if (shouldGenerate) {
      const notification = generateRandomNotification();
      addNotification(notification);
    }
  }, intervalMs);

  return () => clearInterval(interval);
};
