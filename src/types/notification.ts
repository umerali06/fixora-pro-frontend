export interface Notification {
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

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  lowStock: boolean;
  jobCompletion: boolean;
  paymentReminders: boolean;
  newUser: boolean;
  orderUpdate: boolean;
  repairUpdate: boolean;
  warrantyExpiry: boolean;
  systemMaintenance: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: Notification['type'];
  category: Notification['category'];
  priority: Notification['priority'];
  enabled: boolean;
  variables: string[];
}

export interface NotificationPreferences {
  userId: string;
  organizationId: string;
  settings: NotificationSettings;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
}
