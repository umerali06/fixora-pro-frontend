import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  company?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  totalRepairs: number;
  totalSpent: number;
  lastVisit?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}

interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    status: string[];
    dateRange: {
      start: string | null;
      end: string | null;
    };
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  bulkOperations: {
    selectedIds: string[];
    isAllSelected: boolean;
    bulkLoading: boolean;
  };
}

const initialState: CustomersState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
  searchQuery: '',
  filters: {
    status: [],
    dateRange: {
      start: null,
      end: null,
    },
  },
  pagination: {
    page: 1,
    pageSize: 25,
    total: 0,
  },
  bulkOperations: {
    selectedIds: [],
    isAllSelected: false,
    bulkLoading: false,
  },
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    filters?: any;
  }) => {
    const response = await api.get('/v1/customers', { params });
    return response.data;
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (id: string) => {
    const response = await api.get(`/v1/customers/${id}`);
    return response.data;
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalRepairs' | 'totalSpent'>) => {
    const response = await api.post('/v1/customers', customerData);
    return response.data;
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, data }: { id: string; data: Partial<Customer> }) => {
    const response = await api.put(`/v1/customers/${id}`, data);
    return response.data;
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id: string) => {
    await api.delete(`/v1/customers/${id}`);
    return id;
  }
);

export const bulkDeleteCustomers = createAsyncThunk(
  'customers/bulkDeleteCustomers',
  async (ids: string[]) => {
    await api.post('/v1/customers/bulk-delete', { ids });
    return ids;
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetCustomersState: () => initialState,
    setSelectedIds: (state, action: PayloadAction<string[]>) => {
      state.bulkOperations.selectedIds = action.payload;
      state.bulkOperations.isAllSelected = action.payload.length === state.customers.length;
    },
    toggleSelectedId: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const selectedIds = state.bulkOperations.selectedIds;
      if (selectedIds.includes(id)) {
        state.bulkOperations.selectedIds = selectedIds.filter(selectedId => selectedId !== id);
      } else {
        state.bulkOperations.selectedIds.push(id);
      }
      state.bulkOperations.isAllSelected = state.bulkOperations.selectedIds.length === state.customers.length;
    },
    selectAllCustomers: (state) => {
      state.bulkOperations.selectedIds = state.customers.map(customer => customer.id);
      state.bulkOperations.isAllSelected = true;
    },
    clearSelectedCustomers: (state) => {
      state.bulkOperations.selectedIds = [];
      state.bulkOperations.isAllSelected = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.customers;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customers';
      })
      
      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customer';
      })
      
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create customer';
      })
      
      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customers.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update customer';
      })
      
      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(c => c.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedCustomer?.id === action.payload) {
          state.selectedCustomer = null;
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete customer';
      })
      
      // Bulk delete customers
      .addCase(bulkDeleteCustomers.pending, (state) => {
        state.bulkOperations.bulkLoading = true;
        state.error = null;
      })
      .addCase(bulkDeleteCustomers.fulfilled, (state, action) => {
        state.bulkOperations.bulkLoading = false;
        state.customers = state.customers.filter(c => !action.payload.includes(c.id));
        state.pagination.total -= action.payload.length;
        state.bulkOperations.selectedIds = [];
        state.bulkOperations.isAllSelected = false;
        if (state.selectedCustomer && action.payload.includes(state.selectedCustomer.id)) {
          state.selectedCustomer = null;
        }
      })
      .addCase(bulkDeleteCustomers.rejected, (state, action) => {
        state.bulkOperations.bulkLoading = false;
        state.error = action.error.message || 'Failed to delete customers';
      });
  },
});

export const {
  setSelectedCustomer,
  setSearchQuery,
  setFilters,
  setPagination,
  clearError,
  resetCustomersState,
  setSelectedIds,
  toggleSelectedId,
  selectAllCustomers,
  clearSelectedCustomers,
} = customersSlice.actions;

export default customersSlice.reducer;
