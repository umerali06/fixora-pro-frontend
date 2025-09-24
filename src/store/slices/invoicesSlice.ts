import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
  inventoryItemId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'SUMUP';
  paymentDate?: string;
  dueDate: string;
  issueDate: string;
  notes?: string;
  terms?: string;
  repairTicketId?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  remindersSent: number;
  lastReminderSent?: string;
}

interface InvoicesState {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    status: string[];
    paymentMethod: string[];
    dateRange: {
      start: string | null;
      end: string | null;
    };
    amountRange: {
      min: number | null;
      max: number | null;
    };
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  bulkOperations: {
    selectedIds: string[];
    bulkLoading: boolean;
  };
  stats: {
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    overdueAmount: number;
    draftCount: number;
    sentCount: number;
    paidCount: number;
    overdueCount: number;
  };
}

const initialState: InvoicesState = {
  invoices: [],
  selectedInvoice: null,
  loading: false,
  error: null,
  searchQuery: '',
  filters: {
    status: [],
    paymentMethod: [],
    dateRange: {
      start: null,
      end: null,
    },
    amountRange: {
      min: null,
      max: null,
    },
  },
  pagination: {
    page: 1,
    pageSize: 25,
    total: 0,
  },
  bulkOperations: {
    selectedIds: [],
    bulkLoading: false,
  },
  stats: {
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    overdueAmount: 0,
    draftCount: 0,
    sentCount: 0,
    paidCount: 0,
    overdueCount: 0,
  },
};

// Async thunks
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    filters?: any;
  }) => {
    const response = await api.get('/v1/invoices', { params });
    return response.data;
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'invoices/fetchInvoiceById',
  async (id: string) => {
    const response = await api.get(`/v1/invoices/${id}`);
    return response.data;
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt' | 'remindersSent'>) => {
    const response = await api.post('/v1/invoices', invoiceData);
    return response.data;
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/updateInvoice',
  async ({ id, data }: { id: string; data: Partial<Invoice> }) => {
    const response = await api.put(`/v1/invoices/${id}`, data);
    return response.data;
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/deleteInvoice',
  async (id: string) => {
    await api.delete(`/v1/invoices/${id}`);
    return id;
  }
);

export const sendInvoice = createAsyncThunk(
  'invoices/sendInvoice',
  async ({ id, email, subject, message }: { id: string; email?: string; subject?: string; message?: string }) => {
    const response = await api.post(`/v1/invoices/${id}/send`, { email, subject, message });
    return response.data;
  }
);

export const markInvoiceAsPaid = createAsyncThunk(
  'invoices/markInvoiceAsPaid',
  async ({ id, paymentMethod, paymentDate, notes }: { 
    id: string; 
    paymentMethod: Invoice['paymentMethod']; 
    paymentDate?: string; 
    notes?: string; 
  }) => {
    const response = await api.patch(`/v1/invoices/${id}/mark-paid`, { paymentMethod, paymentDate, notes });
    return response.data;
  }
);

export const sendReminder = createAsyncThunk(
  'invoices/sendReminder',
  async ({ id, message }: { id: string; message?: string }) => {
    const response = await api.post(`/v1/invoices/${id}/send-reminder`, { message });
    return response.data;
  }
);

export const bulkSendInvoices = createAsyncThunk(
  'invoices/bulkSendInvoices',
  async ({ ids, subject, message }: { ids: string[]; subject?: string; message?: string }) => {
    const response = await api.post('/v1/invoices/bulk-send', { ids, subject, message });
    return response.data;
  }
);

export const bulkDeleteInvoices = createAsyncThunk(
  'invoices/bulkDeleteInvoices',
  async (ids: string[]) => {
    await api.post('/v1/invoices/bulk-delete', { ids });
    return ids;
  }
);

export const generateInvoicePDF = createAsyncThunk(
  'invoices/generateInvoicePDF',
  async (id: string) => {
    const response = await api.get(`/v1/invoices/${id}/pdf`, { responseType: 'blob' });
    return { id, blob: response.data };
  }
);

export const fetchInvoiceStats = createAsyncThunk(
  'invoices/fetchInvoiceStats',
  async (dateRange?: { start: string; end: string }) => {
    const response = await api.get('/v1/invoices/stats', { params: dateRange });
    return response.data;
  }
);

export const createInvoiceFromRepairTicket = createAsyncThunk(
  'invoices/createInvoiceFromRepairTicket',
  async (repairTicketId: string) => {
    const response = await api.post('/v1/invoices/from-repair-ticket', { repairTicketId });
    return response.data;
  }
);

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setSelectedInvoice: (state, action: PayloadAction<Invoice | null>) => {
      state.selectedInvoice = action.payload;
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
    setSelectedIds: (state, action: PayloadAction<string[]>) => {
      state.bulkOperations.selectedIds = action.payload;
    },
    toggleSelectedId: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.bulkOperations.selectedIds.indexOf(id);
      if (index > -1) {
        state.bulkOperations.selectedIds.splice(index, 1);
      } else {
        state.bulkOperations.selectedIds.push(id);
      }
    },
    selectAllInvoices: (state) => {
      state.bulkOperations.selectedIds = state.invoices.map(invoice => invoice.id);
    },
    clearSelectedInvoices: (state) => {
      state.bulkOperations.selectedIds = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    resetInvoicesState: () => initialState,
    updateInvoiceInList: (state, action: PayloadAction<Invoice>) => {
      const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.invoices;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch invoices';
      })
      
      // Create invoice
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create invoice';
      })
      
      // Update invoice
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        if (state.selectedInvoice?.id === action.payload.id) {
          state.selectedInvoice = action.payload;
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update invoice';
      })
      
      // Delete invoice
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.filter(invoice => invoice.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedInvoice?.id === action.payload) {
          state.selectedInvoice = null;
        }
        state.bulkOperations.selectedIds = state.bulkOperations.selectedIds.filter(id => id !== action.payload);
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete invoice';
      })
      
      // Send invoice
      .addCase(sendInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        if (state.selectedInvoice?.id === action.payload.id) {
          state.selectedInvoice = action.payload;
        }
      })
      .addCase(sendInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send invoice';
      })
      
      // Mark invoice as paid
      .addCase(markInvoiceAsPaid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markInvoiceAsPaid.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        if (state.selectedInvoice?.id === action.payload.id) {
          state.selectedInvoice = action.payload;
        }
      })
      .addCase(markInvoiceAsPaid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to mark invoice as paid';
      })
      
      // Bulk delete invoices
      .addCase(bulkDeleteInvoices.pending, (state) => {
        state.bulkOperations.bulkLoading = true;
        state.error = null;
      })
      .addCase(bulkDeleteInvoices.fulfilled, (state, action) => {
        state.bulkOperations.bulkLoading = false;
        state.invoices = state.invoices.filter(invoice => !action.payload.includes(invoice.id));
        state.pagination.total -= action.payload.length;
        state.bulkOperations.selectedIds = [];
        if (state.selectedInvoice && action.payload.includes(state.selectedInvoice.id)) {
          state.selectedInvoice = null;
        }
      })
      .addCase(bulkDeleteInvoices.rejected, (state, action) => {
        state.bulkOperations.bulkLoading = false;
        state.error = action.error.message || 'Failed to delete invoices';
      })
      
      // Fetch invoice stats
      .addCase(fetchInvoiceStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const {
  setSelectedInvoice,
  setSearchQuery,
  setFilters,
  setPagination,
  setSelectedIds,
  toggleSelectedId,
  selectAllInvoices,
  clearSelectedInvoices,
  clearError,
  resetInvoicesState,
  updateInvoiceInList,
} = invoicesSlice.actions;

export default invoicesSlice.reducer;
