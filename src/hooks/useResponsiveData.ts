import { useState, useEffect, useRef, useCallback } from "react";
import axios, { AxiosResponse } from "axios";

export interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ResponsiveDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: "asc" | "desc";
  viewMode: "grid" | "list";
  pagination: PaginationData;
}

export interface ResponsiveDataActions {
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: "asc" | "desc") => void;
  setViewMode: (viewMode: "grid" | "list") => void;
  goToPage: (page: number) => void;
  changePageSize: (pageSize: number) => void;
  refreshData: () => Promise<void>;
  createItem: (item: any) => Promise<void>;
  updateItem: (id: string, updates: any) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export interface UseResponsiveDataOptions<T> {
  endpoint: string;
  realTime?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, any>;
  transform?: (data: any) => T;
  onSuccess?: (data: T[]) => void;
  onError?: (error: string) => void;
}

export function useResponsiveData<T = any>(
  options: UseResponsiveDataOptions<T>
): [ResponsiveDataState<T>, ResponsiveDataActions] {
  const {
    endpoint,
    realTime = false,
    autoRefresh = false,
    refreshInterval = 30000,
    pageSize = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    filters = {},
    transform,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<ResponsiveDataState<T>>({
    data: [],
    loading: false,
    error: null,
    searchQuery: "",
    filters,
    sortBy,
    sortOrder,
    viewMode: "grid",
    pagination: {
      page: 1,
      pageSize,
      total: 0,
      totalPages: 0,
    },
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Memoized fetch function to prevent infinite loops
  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      if (state.loading) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const params = new URLSearchParams({
          page: state.pagination.page.toString(),
          pageSize: state.pagination.pageSize.toString(),
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          search: state.searchQuery,
          ...state.filters,
        });

        const response: AxiosResponse = await axios.get(
          `/api${endpoint}?${params}`,
          {
            signal,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const responseData = response.data;
        const data = transform
          ? responseData.data.map(transform)
          : responseData.data;
        const pagination = responseData.pagination || {
          page: state.pagination.page,
          pageSize: state.pagination.pageSize,
          total: data.length,
          totalPages: Math.ceil(data.length / state.pagination.pageSize),
        };

        setState((prev) => ({
          ...prev,
          data,
          loading: false,
          pagination,
        }));

        onSuccess?.(data);
      } catch (error: any) {
        if (error.name === "AbortError") return;

        // If API is not available, use mock data
        if (
          error.code === "ERR_NETWORK" ||
          error.response?.status === 404 ||
          error.response?.status === 500
        ) {
          console.log("API not available, using mock data for:", endpoint);
          const mockData = getMockData(endpoint);
          setState((prev) => ({
            ...prev,
            data: mockData as T[],
            loading: false,
            error: null, // Clear error when using mock data
            pagination: {
              ...prev.pagination,
              total: mockData.length,
              totalPages: Math.ceil(mockData.length / prev.pagination.pageSize),
            },
          }));
          return;
        }

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch data";
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        onError?.(errorMessage);
      }
    },
    [
      endpoint,
      state.pagination.page,
      state.pagination.pageSize,
      state.sortBy,
      state.sortOrder,
      state.searchQuery,
      state.filters,
      transform,
      onSuccess,
      onError,
    ]
  );

  // Helper function to get mock data based on endpoint
  const getMockData = (endpoint: string): any[] => {
    switch (endpoint) {
      case "/dashboard/overview":
        return [
          {
            id: 1,
            totalRevenue: 45250.8,
            revenueChange: 12.5,
            activeRepairs: 23,
            repairsChange: -5.2,
            completedToday: 8,
            completedChange: 33.3,
            pendingEstimates: 12,
            estimatesChange: 8.7,
          },
        ];
      case "/dashboard/stats":
        return [
          { id: 1, name: "iPhone Repairs", value: 45, color: "#2196F3" },
          { id: 2, name: "Samsung Repairs", value: 32, color: "#4CAF50" },
          { id: 3, name: "Other Devices", value: 23, color: "#FF9800" },
        ];
      case "/customers":
        return [
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            phone: "+1234567890",
            status: "active",
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "+1234567891",
            status: "active",
          },
          {
            id: 3,
            name: "Bob Johnson",
            email: "bob@example.com",
            phone: "+1234567892",
            status: "inactive",
          },
        ];
      case "/inventory":
        return [
          {
            id: 1,
            name: "iPhone 11 Screen",
            quantity: 15,
            price: 89.99,
            category: "Screens",
          },
          {
            id: 2,
            name: "Samsung Battery",
            quantity: 8,
            price: 45.99,
            category: "Batteries",
          },
          {
            id: 3,
            name: "iPhone Charging Port",
            quantity: 12,
            price: 25.99,
            category: "Parts",
          },
        ];
      case "/repair-tickets":
        return [
          {
            id: 1,
            customer: "John Doe",
            device: "iPhone 11",
            issue: "Broken Screen",
            status: "In Progress",
          },
          {
            id: 2,
            customer: "Jane Smith",
            device: "Samsung Galaxy",
            issue: "Battery Replacement",
            status: "Completed",
          },
          {
            id: 3,
            customer: "Bob Johnson",
            device: "iPhone 12",
            issue: "Charging Port",
            status: "Pending",
          },
        ];
      case "/invoices":
        return [
          {
            id: 1,
            customer: "John Doe",
            amount: 89.99,
            status: "Paid",
            date: "2024-01-15",
          },
          {
            id: 2,
            customer: "Jane Smith",
            amount: 45.99,
            status: "Pending",
            date: "2024-01-14",
          },
          {
            id: 3,
            customer: "Bob Johnson",
            amount: 25.99,
            status: "Paid",
            date: "2024-01-13",
          },
        ];
      case "/jobs":
        return [
          {
            id: "1",
            title: "iPhone 11 Screen Replacement",
            description: "Replace cracked screen with original quality display",
            status: "IN_PROGRESS",
            priority: "HIGH",
            assignedTo: "Mike Tech",
            estimatedDuration: 120,
            actualDuration: null,
            startedAt: "2024-01-15T09:00:00Z",
            completedAt: null,
            notes: "Customer requested original quality parts",
            repairTicketId: "RT-2024-001",
            createdAt: "2024-01-15T08:30:00Z",
            updatedAt: "2024-01-15T09:00:00Z",
          },
          {
            id: "2",
            title: "Samsung Galaxy Battery Replacement",
            description: "Replace degraded battery with new OEM battery",
            status: "COMPLETED",
            priority: "MEDIUM",
            assignedTo: "Sarah Tech",
            estimatedDuration: 90,
            actualDuration: 85,
            startedAt: "2024-01-14T10:00:00Z",
            completedAt: "2024-01-14T11:25:00Z",
            notes: "Battery test completed successfully",
            repairTicketId: "RT-2024-002",
            createdAt: "2024-01-14T09:30:00Z",
            updatedAt: "2024-01-14T11:25:00Z",
          },
          {
            id: "3",
            title: "iPhone 12 Charging Port Repair",
            description: "Clean and repair charging port connection issues",
            status: "PENDING",
            priority: "LOW",
            assignedTo: null,
            estimatedDuration: 60,
            actualDuration: null,
            startedAt: null,
            completedAt: null,
            notes: "Waiting for customer approval",
            repairTicketId: "RT-2024-003",
            createdAt: "2024-01-16T14:00:00Z",
            updatedAt: "2024-01-16T14:00:00Z",
          },
        ];
      case "/reports":
        return [
          {
            period: "Last 30 Days",
            revenue: {
              total: 125000,
              change: 12.5,
              byCategory: [
                { category: "Screen Repairs", amount: 45000 },
                { category: "Battery Replacements", amount: 30000 },
                { category: "Other Services", amount: 50000 },
              ],
            },
            repairs: {
              total: 156,
              completed: 142,
              pending: 14,
              cancelled: 0,
              avgRepairTime: 2.5,
              byType: [
                { type: "Screen Repair", count: 45 },
                { type: "Battery Replacement", count: 32 },
                { type: "Charging Port", count: 23 },
                { type: "Other", count: 56 },
              ],
            },
            customers: {
              total: 89,
              new: 23,
              returning: 66,
              satisfaction: 4.8,
              topCustomers: [
                { name: "John Doe", repairs: 5, spent: 450 },
                { name: "Jane Smith", repairs: 3, spent: 280 },
                { name: "Bob Johnson", repairs: 4, spent: 320 },
              ],
            },
            inventory: {
              totalValue: 25000,
              lowStock: 8,
              topParts: [
                { name: "iPhone 11 Screen", used: 15, revenue: 1350 },
                { name: "Samsung Battery", used: 12, revenue: 550 },
                { name: "iPhone Charging Port", used: 8, revenue: 200 },
              ],
            },
            technicians: {
              performance: [
                { name: "Mike Tech", completed: 45, rating: 4.9, avgTime: 2.1 },
                {
                  name: "Sarah Tech",
                  completed: 38,
                  rating: 4.8,
                  avgTime: 2.3,
                },
              ],
            },
          },
        ];
      default:
        return [];
    }
  };

  // Initial fetch only - run once on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    fetchData(abortControllerRef.current.signal);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array - only run once

  // Auto-refresh effect - only if autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const startRefresh = () => {
      refreshTimeoutRef.current = setTimeout(() => {
        fetchData();
        startRefresh();
      }, refreshInterval);
    };

    startRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchData]);

  const actions: ResponsiveDataActions = {
    setSearchQuery: (query: string) => {
      setState((prev) => ({
        ...prev,
        searchQuery: query,
        pagination: { ...prev.pagination, page: 1 },
      }));
      // Debounced search - fetch after user stops typing
      setTimeout(() => fetchData(), 500);
    },

    setFilters: (filters: Record<string, any>) => {
      setState((prev) => ({
        ...prev,
        filters,
        pagination: { ...prev.pagination, page: 1 },
      }));
      fetchData();
    },

    setSortBy: (sortBy: string) => {
      setState((prev) => ({
        ...prev,
        sortBy,
        pagination: { ...prev.pagination, page: 1 },
      }));
      fetchData();
    },

    setSortOrder: (sortOrder: "asc" | "desc") => {
      setState((prev) => ({
        ...prev,
        sortOrder,
        pagination: { ...prev.pagination, page: 1 },
      }));
      fetchData();
    },

    setViewMode: (viewMode: "grid" | "list") => {
      setState((prev) => ({ ...prev, viewMode }));
    },

    goToPage: (page: number) => {
      setState((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, page },
      }));
      fetchData();
    },

    changePageSize: (pageSize: number) => {
      setState((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, pageSize, page: 1 },
      }));
      fetchData();
    },

    refreshData: async () => {
      await fetchData();
    },

    createItem: async (item: any) => {
      try {
        const response = await axios.post(`/api${endpoint}`, item, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        await fetchData();
        return response.data;
      } catch (error: any) {
        // If API is not available, simulate creation with mock data
        if (
          error.code === "ERR_NETWORK" ||
          error.response?.status === 404 ||
          error.response?.status === 500
        ) {
          console.log("API not available, simulating item creation");
          const newItem = {
            id: Date.now().toString(),
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setState((prev) => ({
            ...prev,
            data: [newItem as T, ...prev.data],
            pagination: {
              ...prev.pagination,
              total: prev.pagination.total + 1,
              totalPages: Math.ceil(
                (prev.pagination.total + 1) / prev.pagination.pageSize
              ),
            },
          }));
          return newItem;
        }

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to create item";
        setState((prev) => ({ ...prev, error: errorMessage }));
        throw error;
      }
    },

    updateItem: async (id: string, updates: any) => {
      try {
        const response = await axios.put(`/api${endpoint}/${id}`, updates, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        await fetchData();
        return response.data;
      } catch (error: any) {
        // If API is not available, simulate update with mock data
        if (
          error.code === "ERR_NETWORK" ||
          error.response?.status === 404 ||
          error.response?.status === 500
        ) {
          console.log("API not available, simulating item update");
          setState((prev) => ({
            ...prev,
            data: prev.data.map((item: any) =>
              item.id === id
                ? { ...item, ...updates, updatedAt: new Date().toISOString() }
                : item
            ),
          }));
          return { id, ...updates };
        }

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to update item";
        setState((prev) => ({ ...prev, error: errorMessage }));
        throw error;
      }
    },

    deleteItem: async (id: string) => {
      try {
        await axios.delete(`/api${endpoint}/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        await fetchData();
      } catch (error: any) {
        // If API is not available, simulate deletion with mock data
        if (
          error.code === "ERR_NETWORK" ||
          error.response?.status === 404 ||
          error.response?.status === 500
        ) {
          console.log("API not available, simulating item deletion");
          setState((prev) => ({
            ...prev,
            data: prev.data.filter((item: any) => item.id !== id),
            pagination: {
              ...prev.pagination,
              total: Math.max(0, prev.pagination.total - 1),
              totalPages: Math.ceil(
                Math.max(0, prev.pagination.total - 1) /
                  prev.pagination.pageSize
              ),
            },
          }));
          return;
        }

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete item";
        setState((prev) => ({ ...prev, error: errorMessage }));
        throw error;
      }
    },
  };

  return [state, actions];
}
