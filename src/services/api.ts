import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getValidToken } from '../store/slices/authSlice';
import { withTimeoutAndRetry } from '../utils/timeoutHandler';


// API base configuration
// Use environment variables for both development and production
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

console.log('🔧 API Configuration:', {
  baseUrl: API_BASE_URL,
  envVar: process.env.REACT_APP_API_URL,
  nodeEnv: process.env.NODE_ENV
});

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getValidToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 API Request with token:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenLength: token.length,
        tokenStart: token.substring(0, 20) + '...'
      });
    } else {
      console.log('⚠️ API Request without token:', {
        url: config.url,
        method: config.method
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    console.log('🔐 API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.response?.data?.message || error.message,
      code: error.code,
      timeout: error.code === 'ECONNABORTED'
    });

    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('⏰ Request timeout:', {
        url: error.config?.url,
        timeout: error.config?.timeout,
        message: 'Request took longer than expected. Please try again.'
      });
      
      // Don't logout on timeout, just show error
      return Promise.reject({
        ...error,
        message: 'Request timeout. Please check your connection and try again.',
        isTimeout: true
      });
    }

    if (error.response?.status === 401) {
      // Only logout if it's an authentication error, not permission error
      const errorMessage = error.response?.data?.message || '';
      const isAuthError = errorMessage.includes('token') || 
                         errorMessage.includes('authentication') || 
                         errorMessage.includes('expired') ||
                         errorMessage.includes('invalid');
      
      if (isAuthError) {
        console.log('🔐 Authentication error detected, logging out user');
        localStorage.removeItem('token');
        // Don't redirect immediately, let the component handle it
        // window.location.href = '/login';
      } else {
        console.log('🔐 Permission error (not auth error), not logging out');
      }
    }
    return Promise.reject(error);
  }
);

// Dashboard API calls
export const dashboardAPI = {
  // Get dashboard overview data
  getOverview: async () => {
    const response = await api.get('/dashboard/overview');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get recent activity
  getRecentActivity: async (limit = 10) => {
    const response = await api.get(`/dashboard/activity?limit=${limit}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get system status
  getSystemStatus: async () => {
    const response = await api.get('/dashboard/system-status');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get revenue trend data for charts
  getRevenueTrendData: async () => {
    const response = await api.get('/dashboard/charts/revenue-trend');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get monthly performance data for charts
  getMonthlyPerformanceData: async () => {
    const response = await api.get('/dashboard/charts/monthly-performance');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }
};

// Customer API calls
export const customerAPI = {
  // Get all customers
  getAll: async (params?: any) => {
    try {
      const response = await withTimeoutAndRetry(
        () => api.get('/customers', { params }),
        25000, // 25 second timeout
        2 // 2 retries
      );
      
      console.log('🔍 CustomerAPI.getAll - Full response:', response.data);
      console.log('🔍 CustomerAPI.getAll - response.data.data:', response.data.data);
      console.log('🔍 CustomerAPI.getAll - response.data.data type:', typeof response.data.data);
      console.log('🔍 CustomerAPI.getAll - response.data.data isArray:', Array.isArray(response.data.data));
      
      // Handle wrapped response structure from backend
      const data = response.data.data || response.data;
      console.log('🔍 CustomerAPI.getAll - Extracted data:', data);
      console.log('🔍 CustomerAPI.getAll - Extracted data type:', typeof data);
      console.log('🔍 CustomerAPI.getAll - Extracted data isArray:', Array.isArray(data));
      
      // If data has a customers property (paginated response), return customers array
      const result = Array.isArray(data) ? data : (data.customers || []);
      console.log('🔍 CustomerAPI.getAll - Final result:', result);
      console.log('🔍 CustomerAPI.getAll - Final result length:', result.length);
      return result;
    } catch (error) {
      console.error('❌ CustomerAPI.getAll - Error:', error);
      throw error;
    }
  },

  // Get customer by ID
  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || null;
  },

  // Create new customer
  create: async (data: any) => {
    const response = await api.post('/customers', data);
    // Handle wrapped response structure from backend
    return response.data.data || null;
  },

  // Update customer
  update: async (id: string, data: any) => {
    const response = await api.put(`/customers/${id}`, data);
    // Handle wrapped response structure from backend
    return response.data.data || null;
  },

  // Delete customer
  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || null;
  },

  // Search customers
  search: async (query: string) => {
    const response = await api.get(`/customers/search?q=${query}`);
    // Handle wrapped response structure from backend
    return response.data.data || [];
  },

  // Get customer statistics
  getStats: async (params?: any) => {
    const response = await api.get('/customers/stats', { 
      params 
    });
    console.log('🔍 CustomerAPI.getStats - Full response:', response.data);
    console.log('🔍 CustomerAPI.getStats - response.data.data:', response.data.data);
    // Handle wrapped response structure from backend
    return response.data.data || null;
  }
};

// Inventory API calls
export const inventoryAPI = {
  // Get all items
  getAll: async (params?: any) => {
    const response = await api.get('/inventory', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get item by ID
  getById: async (id: string) => {
    const response = await api.get(`/inventory/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Create new item
  create: async (data: any) => {
    const response = await api.post('/inventory/stock-items', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Update item
  update: async (id: string, data: any) => {
    const response = await api.put(`/inventory/stock-items/${id}`, data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Delete item
  delete: async (id: string) => {
    const response = await api.delete(`/inventory/stock-items/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get low stock items
  getLowStock: async () => {
    const response = await api.get('/inventory/low-stock');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get stock movements
  getStockMovements: async (params?: any) => {
    const response = await api.get('/inventory/stock-movements', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get stock items (alias for getAll)
  getStockItems: async (params?: any) => {
    const response = await api.get('/inventory/stock-items', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get stock statistics
  getStockStats: async () => {
    const response = await api.get('/inventory/stats');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get services
  getServices: async () => {
    console.log('🔍 API: Calling /inventory/services');
    try {
    const response = await api.get('/inventory/services');
      console.log('✅ API: Services response received:', response.status, response.data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
    } catch (error) {
      console.error('❌ API: Services request failed:', error);
      throw error;
    }
  },

  // Get service stats
  getServiceStats: async () => {
    console.log('🔍 API: Calling /inventory/service-stats');
    try {
    const response = await api.get('/inventory/service-stats');
      console.log('✅ API: Service stats response received:', response.status, response.data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
    } catch (error) {
      console.error('❌ API: Service stats request failed:', error);
      throw error;
    }
  }
};

// Jobs API calls
export const jobsAPI = {
  // Get all jobs
  getAll: async (params?: any) => {
    const response = await api.get('/jobs', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get job by ID
  getById: async (id: string) => {
    const response = await api.get(`/jobs/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Create new job
  create: async (data: any) => {
    const response = await api.post('/jobs', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Update job
  update: async (id: string, data: any) => {
    const response = await api.put(`/jobs/${id}`, data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Delete job
  delete: async (id: string) => {
    const response = await api.delete(`/jobs/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get job stats
  getStats: async () => {
    const response = await api.get('/jobs/stats');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get jobs list
  getJobs: async () => {
    const response = await api.get('/jobs/list');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get job notes
  getNotes: async (jobId?: string) => {
    const params = jobId ? { jobId } : {};
    const response = await api.get('/jobs/notes', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Create job note
  createNote: async (data: { jobId: string, content: string }) => {
    const response = await api.post('/jobs/notes', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get customers for jobs
  getCustomers: async () => {
    const response = await api.get('/jobs/customers');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get technicians for jobs
  getTechnicians: async () => {
    const response = await api.get('/jobs/technicians');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }
};

// Order API calls
export const orderAPI = {
  // Get all orders
  getAll: async (params?: any) => {
    const response = await api.get('/orders', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get order by ID
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Create new order
  create: async (data: any) => {
    const response = await api.post('/orders', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Update order
  update: async (id: string, data: any) => {
    const response = await api.put(`/orders/${id}`, data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Delete order
  delete: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get orders by status
  getByStatus: async (status: string) => {
    const response = await api.get(`/orders/status/${status}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }
};

// Repair Ticket API calls
export const repairTicketAPI = {
  // Get all repair tickets
  getAll: async (params?: any) => {
    const response = await api.get('/repair-tickets', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get repair ticket by ID
  getById: async (id: string) => {
    const response = await api.get(`/repair-tickets/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Create new repair ticket
  create: async (data: any) => {
    const response = await api.post('/repair-tickets', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Update repair ticket
  update: async (id: string, data: any) => {
    const response = await api.put(`/repair-tickets/${id}`, data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Delete repair ticket
  delete: async (id: string, orgId?: string) => {
    const params = orgId ? { orgId } : {};
    const response = await api.delete(`/repair-tickets/${id}`, { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get tickets by status
  getByStatus: async (status: string) => {
    const response = await api.get(`/repair-tickets/status/${status}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Update ticket status
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/repair-tickets/${id}/status`, { status });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }
};

// Invoice API calls
export const invoiceAPI = {
  // Get all invoices
  getAll: async (params?: any) => {
    const response = await api.get('/invoices', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get invoice by ID
  getById: async (id: string) => {
    const response = await api.get(`/invoices/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Create new invoice
  create: async (data: any) => {
    const response = await api.post('/invoices', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Update invoice
  update: async (id: string, data: any) => {
    const response = await api.put(`/invoices/${id}`, data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Delete invoice
  delete: async (id: string) => {
    const response = await api.delete(`/invoices/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get invoices by status
  getByStatus: async (status: string) => {
    const response = await api.get(`/invoices/status/${status}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Mark invoice as paid
  markAsPaid: async (id: string) => {
    const response = await api.patch(`/invoices/${id}/paid`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }
};

// Booking API calls
export const bookingAPI = {
  // Get all booking widgets
  getWidgets: async (params?: any) => {
    const response = await api.get('/booking/widgets', { params });
    return response.data.data || response.data;
  },

  // Get widget by ID
  getWidget: async (id: string) => {
    const response = await api.get(`/booking/widgets/${id}`);
    return response.data.data || response.data;
  },

  // Create new booking widget
  createWidget: async (data: any) => {
    const response = await api.post('/booking/widgets', data);
    return response.data.data || response.data;
  },

  // Update booking widget
  updateWidget: async (id: string, data: any) => {
    const response = await api.put(`/booking/widgets/${id}`, data);
    return response.data.data || response.data;
  },

  // Delete booking widget
  deleteWidget: async (id: string) => {
    const response = await api.delete(`/booking/widgets/${id}`);
    return response.data.data || response.data;
  },

  // Generate embed code
  generateEmbedCode: async (widgetId: string) => {
    const response = await api.post(`/booking/widgets/${widgetId}/embed`);
    return response.data.data || response.data;
  },

  // Get booking statistics
  getStats: async () => {
    const response = await api.get('/booking/stats');
    return response.data.data || response.data;
  },

  // Get all bookings
  getBookings: async (params?: any) => {
    const response = await api.get('/booking/bookings', { params });
    return response.data.data || response.data;
  },

  // Get booking by ID
  getBooking: async (id: string) => {
    const response = await api.get(`/booking/bookings/${id}`);
    return response.data.data || response.data;
  },

  // Update booking status
  updateBookingStatus: async (id: string, status: string) => {
    const response = await api.patch(`/booking/bookings/${id}/status`, { status });
    return response.data.data || response.data;
  },

  // Get available time slots
  getTimeSlots: async (widgetId: string, date: string) => {
    const response = await api.get(`/booking/timeslots/${widgetId}`, {
      params: { date }
    });
    return response.data.data || response.data;
  },

  // Submit booking
  submitBooking: async (data: any) => {
    const response = await api.post('/booking/submit', data);
    return response.data.data || response.data;
  }
};

// Invoices API calls (alias for invoiceAPI)
export const invoicesAPI = {
  // Get all invoices
  getInvoices: async (params?: any) => {
    const response = await api.get('/invoices', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get invoice by ID
  getById: async (id: string) => {
    const response = await api.get(`/invoices/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Create new invoice
  create: async (data: any) => {
    const response = await api.post('/invoices', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Update invoice
  update: async (id: string, data: any) => {
    const response = await api.put(`/invoices/${id}`, data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Delete invoice
  delete: async (id: string) => {
    const response = await api.delete(`/invoices/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get invoice stats
  getStats: async () => {
    const response = await api.get('/invoices/statistics/summary');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Export invoices
  export: async (format: 'csv' | 'json' = 'csv') => {
    const response = await api.get('/invoices/export', {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Email invoice
  email: async (invoiceId: string, emailData: { email: string; subject: string; message: string }) => {
    const response = await api.post(`/invoices/${invoiceId}/email`, emailData);
    return response.data;
  },

  // Print invoice
  print: async (invoiceId: string) => {
    const response = await api.get(`/invoices/${invoiceId}/print`, {
      responseType: 'text'
    });
    return response.data;
  },

  // Download invoice as PDF/HTML
  download: async (invoiceId: string) => {
    const response = await api.get(`/invoices/${invoiceId}/download`, {
      responseType: 'arraybuffer'
    });
    return response.data;
  }
};

// Reporting API calls
export const reportingAPI = {
  // Get dashboard summary
  getDashboardSummary: async (params?: any) => {
    const response = await api.get('/reports/dashboard/summary', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get sales report
  getSalesReport: async (params?: any) => {
    const response = await api.get('/reports/sales', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get repair report
  getRepairReport: async (params?: any) => {
    const response = await api.get('/reports/repairs', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get inventory report
  getInventoryReport: async (params?: any) => {
    const response = await api.get('/reports/inventory', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get customer report
  getCustomerReport: async (params?: any) => {
    const response = await api.get('/reports/customers', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get financial report
  getFinancialReport: async (params?: any) => {
    const response = await api.get('/reports/financial', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Export report
  exportReport: async (data: any) => {
    const response = await api.post('/reports/export', data, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Generate PDF
  generatePDF: async (params: any) => {
    const response = await api.get('/reports/pdf', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

// Notification API calls
export const notificationAPI = {
  // Get all notifications
  getAll: async (params?: any) => {
    const response = await api.get('/notifications', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Delete notification
  delete: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }
};

// Technicians API calls
export const techniciansAPI = {
  // Get all technicians
  getAll: async (params?: any) => {
    const response = await api.get('/technicians', { params });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get technician by ID
  getById: async (id: string) => {
    const response = await api.get(`/technicians/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Create new technician
  create: async (data: any) => {
    const response = await api.post('/technicians', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Update technician
  update: async (id: string, data: any) => {
    const response = await api.put(`/technicians/${id}`, data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Delete technician
  delete: async (id: string) => {
    const response = await api.delete(`/technicians/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get technician statistics
  getStats: async () => {
    const response = await api.get('/technicians/stats/overview');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }
};

// Admin API calls
export const adminAPI = {
  // Get all users
  getUsers: async (params?: any) => {
    const response = await api.get('/admin/users', { 
      params 
    });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get user by ID
  getUserById: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Create new user
  createUser: async (data: any) => {
    const response = await api.post('/admin/users', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Update user
  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/admin/users/${id}`, data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Delete user
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get all roles
  getRoles: async (params?: any) => {
    const response = await api.get('/admin/roles', { 
      params 
    });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Create new role
  createRole: async (data: any) => {
    const response = await api.post('/admin/roles', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Update role
  updateRole: async (id: string, data: any) => {
    const response = await api.put(`/admin/roles/${id}`, data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Delete role
  deleteRole: async (id: string) => {
    const response = await api.delete(`/admin/roles/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  },

  // Get admin dashboard stats
  getDashboardStats: async (params?: any) => {
    const response = await api.get('/admin/stats/dashboard', { 
      params 
    });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }
};

// Refunds API calls
export const refundsAPI = {
  // Get all refunds
  getAll: async (params?: any) => {
    const response = await api.get('/refunds', { params });
    return response.data.data || response.data;
  },

  // Get refund by ID
  getById: async (refundId: string) => {
    const response = await api.get(`/refunds/${refundId}`);
    return response.data.data || response.data;
  },

  // Create refund
  create: async (refundData: any) => {
    const response = await api.post('/refunds', refundData);
    return response.data.data || response.data;
  },

  // Update refund
  update: async (refundId: string, refundData: any) => {
    const response = await api.put(`/refunds/${refundId}`, refundData);
    return response.data.data || response.data;
  },

  // Delete refund
  delete: async (refundId: string) => {
    const response = await api.delete(`/refunds/${refundId}`);
    return response.data;
  },

  // Approve refund
  approve: async (refundId: string) => {
    const response = await api.post(`/refunds/${refundId}/approve`);
    return response.data.data || response.data;
  },

  // Process refund
  process: async (refundId: string) => {
    const response = await api.post(`/refunds/${refundId}/process`);
    return response.data.data || response.data;
  },

  // Get refund statistics
  getStats: async () => {
    const response = await api.get('/refunds/stats');
    return response.data.data || response.data;
  }
};

// Warranties API calls
export const warrantiesAPI = {
  // Get all warranties
  getAll: async (params?: any) => {
    try {
      const response = await withTimeoutAndRetry(
        () => api.get('/warranties', { params }),
        25000, // 25 second timeout
        2 // 2 retries
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ WarrantiesAPI.getAll - Error:', error);
      throw error;
    }
  },

  // Get warranty by ID
  getById: async (warrantyId: string) => {
    const response = await api.get(`/warranties/${warrantyId}`);
    return response.data.data || response.data;
  },

  // Create warranty
  create: async (warrantyData: any) => {
    const response = await api.post('/warranties', warrantyData);
    return response.data.data || response.data;
  },

  // Update warranty
  update: async (warrantyId: string, warrantyData: any) => {
    const response = await api.put(`/warranties/${warrantyId}`, warrantyData);
    return response.data.data || response.data;
  },

  // Delete warranty
  delete: async (warrantyId: string) => {
    const response = await api.delete(`/warranties/${warrantyId}`);
    return response.data;
  },

  // Get warranty statistics
  getStats: async () => {
    const response = await api.get('/warranties/stats');
    return response.data.data || response.data;
  }
};

// Expense API calls
export const expensesAPI = {
  // Get all expenses
  getAll: async (params?: any) => {
    const response = await api.get('/expenses', { params });
    return response.data.data || response.data;
  },

  // Get expense by ID
  getById: async (id: string) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data.data || response.data;
  },

  // Create new expense
  create: async (data: any) => {
    const response = await api.post('/expenses', data);
    return response.data.data || response.data;
  },

  // Update expense
  update: async (id: string, data: any) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data.data || response.data;
  },

  // Delete expense
  delete: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data.data || response.data;
  },

  // Get expense statistics
  getStats: async (params?: any) => {
    const response = await api.get('/expenses/stats', { params });
    return response.data.data || response.data;
  }
};

// Expense Categories API calls
export const expenseCategoriesAPI = {
  // Get all expense categories
  getAll: async () => {
    const response = await api.get('/expenses/categories');
    return response.data.data || response.data;
  },

  // Create new expense category
  create: async (data: any) => {
    const response = await api.post('/expenses/categories', data);
    return response.data.data || response.data;
  },

  // Update expense category
  update: async (id: string, data: any) => {
    const response = await api.put(`/expenses/categories/${id}`, data);
    return response.data.data || response.data;
  },

  // Delete expense category
  delete: async (id: string) => {
    const response = await api.delete(`/expenses/categories/${id}`);
    return response.data.data || response.data;
  }
};

// Configuration API calls
export const configurationAPI = {
  // Get all settings
  getAllSettings: async () => {
    const response = await api.get('/configuration/settings');
    return response.data;
  },

  // Update settings
  updateSettings: async (settings: any[]) => {
    const response = await api.put('/configuration/settings', { settings });
    return response.data;
  },

  // Email Configuration
  getEmailConfig: async () => {
    const response = await api.get('/configuration/email');
    return response.data;
  },

  updateEmailConfig: async (config: any) => {
    const response = await api.put('/configuration/email', config);
    return response.data;
  },

  // Currency Configuration
  getCurrencyConfig: async () => {
    const response = await api.get('/configuration/currency');
    return response.data;
  },

  updateCurrencyConfig: async (config: any) => {
    const response = await api.put('/configuration/currency', config);
    return response.data;
  },

  // Tax Configuration
  getTaxConfig: async () => {
    const response = await api.get('/configuration/tax');
    return response.data;
  },

  updateTaxConfig: async (config: any) => {
    const response = await api.put('/configuration/tax', config);
    return response.data;
  },

  // reCAPTCHA Configuration
  getRecaptchaConfig: async () => {
    const response = await api.get('/configuration/recaptcha');
    return response.data;
  },

  updateRecaptchaConfig: async (config: any) => {
    const response = await api.put('/configuration/recaptcha', config);
    return response.data;
  }
};

// Search API calls
export const searchAPI = {
  // Advanced search
  search: async (filters: any) => {
    const response = await api.post('/search/search', filters);
    return response.data;
  },

  // Quick search
  quickSearch: async (query: string, limit: number = 10) => {
    const response = await api.get('/search', { 
      params: { q: query, limit } 
    });
    return response.data;
  },

  // Search by type
  searchByType: async (type: string, filters: any) => {
    const response = await api.get(`/search/${type}`, { params: filters });
    return response.data;
  },

  // Get suggestions
  getSuggestions: async (query: string, limit: number = 10) => {
    const response = await api.get('/search/suggestions', { 
      params: { q: query, limit } 
    });
    return response.data;
  },

  // Get recent searches
  getRecentSearches: async (limit: number = 10) => {
    const response = await api.get('/search/analytics/recent', { 
      params: { limit } 
    });
    return response.data;
  },

  // Get search statistics
  getSearchStats: async (days: number = 30) => {
    const response = await api.get('/search/analytics/stats', { 
      params: { days } 
    });
    return response.data;
  }
};

// Labels API calls
export const labelsAPI = {
  // Get all label templates
  getTemplates: async (params?: any) => {
    const response = await api.get('/labels/templates', { params });
    return response.data.data || response.data;
  },

  // Get template by ID
  getTemplate: async (id: string) => {
    const response = await api.get(`/labels/templates/${id}`);
    return response.data.data || response.data;
  },

  // Create new template
  createTemplate: async (data: any) => {
    const response = await api.post('/labels/templates', data);
    return response.data.data || response.data;
  },

  // Update template
  updateTemplate: async (id: string, data: any) => {
    const response = await api.put(`/labels/templates/${id}`, data);
    return response.data.data || response.data;
  },

  // Delete template
  deleteTemplate: async (id: string) => {
    const response = await api.delete(`/labels/templates/${id}`);
    return response.data.data || response.data;
  },

  // Generate preview
  generatePreview: async (template: any, data: any) => {
    const response = await api.post('/labels/preview', { template, data });
    return response.data.data || response.data;
  },

  // Print labels
  printLabels: async (templateId: string, data: any) => {
    // Transform data to match backend expectations
    const printData = {
      templateId,
      items: data?.items || [data] || [{ content: 'Sample label content' }], // Ensure items is an array
      printerSettings: data?.printerSettings || {
        copies: 1,
        paperSize: 'A4',
        orientation: 'portrait'
      }
    };
    const response = await api.post('/labels/print', printData);
    return response.data.data || response.data;
  },

  // Get print history
  getPrintHistory: async (params?: any) => {
    const response = await api.get('/labels/print-history', { params });
    return response.data.data || response.data;
  },

  // Get label statistics
  getStats: async () => {
    const response = await api.get('/labels/stats');
    return response.data.data || response.data;
  }
};

// Export the main API instance
export default api;
export { api }; 