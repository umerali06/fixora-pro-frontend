import { dashboardAPI } from './api';

// Dashboard data types
export interface DashboardOverview {
  totalRevenue: number;
  revenueChange: number;
  activeRepairs: number;
  repairsChange: number;
  completedToday: number;
  completedChange: number;
  pendingEstimates: number;
  estimatesChange: number;
}

export interface DashboardStats {
  totalCustomers: number;
  totalOrders: number;
  totalRepairs: number;
  totalInvoices: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  monthlyRepairs: number;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'repair' | 'invoice' | 'customer';
  action: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export interface SystemStatus {
  database: 'operational' | 'warning' | 'error';
  api: 'operational' | 'warning' | 'error';
  email: 'operational' | 'warning' | 'error';
  lastBackup: string;
  lowStockAlerts: number;
  pendingNotifications: number;
}

// Dashboard service class
class DashboardService {
  // Get dashboard overview data
  async getOverview(): Promise<DashboardOverview> {
    try {
      const data = await dashboardAPI.getOverview();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      // Return default data on error
      return {
        totalRevenue: 0,
        revenueChange: 0,
        activeRepairs: 0,
        repairsChange: 0,
        completedToday: 0,
        completedChange: 0,
        pendingEstimates: 0,
        estimatesChange: 0
      };
    }
  }

  // Get dashboard statistics
  async getStats(): Promise<DashboardStats> {
    try {
      const data = await dashboardAPI.getStats();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default data on error
      return {
        totalCustomers: 0,
        totalOrders: 0,
        totalRepairs: 0,
        totalInvoices: 0,
        monthlyRevenue: 0,
        monthlyOrders: 0,
        monthlyRepairs: 0
      };
    }
  }

  // Get recent activity
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const data = await dashboardAPI.getRecentActivity(limit);
      return data.data || data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Return default data on error
      return [];
    }
  }

  // Get system status
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const data = await dashboardAPI.getSystemStatus();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching system status:', error);
      // Return default data on error
      return {
        database: 'operational',
        api: 'operational',
        email: 'operational',
        lastBackup: new Date().toISOString(),
        lowStockAlerts: 0,
        pendingNotifications: 0
      };
    }
  }

  // Get mock data for development/testing
  getMockOverview(): DashboardOverview {
    return {
      totalRevenue: 15420.50,
      revenueChange: 12.5,
      activeRepairs: 8,
      repairsChange: -5.2,
      completedToday: 12,
      completedChange: 8.3,
      pendingEstimates: 3,
      estimatesChange: 15.7
    };
  }

  getMockStats(): DashboardStats {
    return {
      totalCustomers: 156,
      totalOrders: 89,
      totalRepairs: 45,
      totalInvoices: 67,
      monthlyRevenue: 15420.50,
      monthlyOrders: 23,
      monthlyRepairs: 18
    };
  }

  getMockRecentActivity(): RecentActivity[] {
    return [
      {
        id: '1',
        type: 'repair',
        action: 'completed',
        description: 'iPhone 12 screen replacement completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        userId: 'user1',
        userName: 'John Tech'
      },
      {
        id: '2',
        type: 'order',
        action: 'created',
        description: 'New order #ORD-2024-001 created',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        userId: 'user2',
        userName: 'Sarah Admin'
      },
      {
        id: '3',
        type: 'invoice',
        action: 'sent',
        description: 'Invoice #INV-2024-045 sent to customer',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
        userId: 'user1',
        userName: 'John Tech'
      },
      {
        id: '4',
        type: 'customer',
        action: 'added',
        description: 'New customer Mike Johnson added',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        userId: 'user3',
        userName: 'Lisa Sales'
      },
      {
        id: '5',
        type: 'repair',
        action: 'started',
        description: 'MacBook Pro repair started',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
        userId: 'user1',
        userName: 'John Tech'
      }
    ];
  }

  getMockSystemStatus(): SystemStatus {
    return {
      database: 'operational',
      api: 'operational',
      email: 'operational',
      lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      lowStockAlerts: 2,
      pendingNotifications: 3
    };
  }
}

// Export singleton instance
export default new DashboardService();

