import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface RepairDevice {
  id: string;
  type: 'PHONE' | 'TABLET' | 'LAPTOP' | 'DESKTOP' | 'WATCH' | 'OTHER';
  brand: string;
  model: string;
  imei?: string;
  serialNumber?: string;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'BROKEN';
  issues: string[];
  estimatedCost: number;
  actualCost?: number;
  notes?: string;
}

export interface RepairTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  devices: RepairDevice[];
  status: 'RECEIVED' | 'DIAGNOSED' | 'WAITING_PARTS' | 'IN_REPAIR' | 'COMPLETED' | 'READY_FOR_PICKUP' | 'DELIVERED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  totalEstimatedCost: number;
  totalActualCost: number;
  depositPaid: number;
  balanceDue: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  technicianId?: string;
  technicianName?: string;
  notes: string;
  internalNotes: string;
  photos: string[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  signatureRequired: boolean;
  signatureUrl?: string;
  warrantyInfo?: {
    warrantyPeriod: number; // in days
    warrantyExpiry: string;
    warrantyTerms: string;
  };
}

interface RepairTicketsState {
  tickets: RepairTicket[];
  selectedTicket: RepairTicket | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    status: string[];
    priority: string[];
    technician: string[];
    dateRange: {
      start: string | null;
      end: string | null;
    };
    paymentStatus: string[];
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
}

const initialState: RepairTicketsState = {
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: null,
  searchQuery: '',
  filters: {
    status: [],
    priority: [],
    technician: [],
    dateRange: {
      start: null,
      end: null,
    },
    paymentStatus: [],
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
};

// Async thunks
export const fetchRepairTickets = createAsyncThunk(
  'repairTickets/fetchRepairTickets',
  async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    filters?: any;
  }) => {
    const response = await api.get('/v1/repair-tickets', { params });
    return response.data;
  }
);

export const fetchRepairTicketById = createAsyncThunk(
  'repairTickets/fetchRepairTicketById',
  async (id: string) => {
    const response = await api.get(`/v1/repair-tickets/${id}`);
    return response.data;
  }
);

export const createRepairTicket = createAsyncThunk(
  'repairTickets/createRepairTicket',
  async (ticketData: Omit<RepairTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/v1/repair-tickets', ticketData);
    return response.data;
  }
);

export const updateRepairTicket = createAsyncThunk(
  'repairTickets/updateRepairTicket',
  async ({ id, data }: { id: string; data: Partial<RepairTicket> }) => {
    const response = await api.put(`/v1/repair-tickets/${id}`, data);
    return response.data;
  }
);

export const updateRepairTicketStatus = createAsyncThunk(
  'repairTickets/updateRepairTicketStatus',
  async ({ id, status, notes }: { id: string; status: RepairTicket['status']; notes?: string }) => {
    const response = await api.patch(`/v1/repair-tickets/${id}/status`, { status, notes });
    return response.data;
  }
);

export const deleteRepairTicket = createAsyncThunk(
  'repairTickets/deleteRepairTicket',
  async (id: string) => {
    await api.delete(`/v1/repair-tickets/${id}`);
    return id;
  }
);

export const bulkUpdateStatus = createAsyncThunk(
  'repairTickets/bulkUpdateStatus',
  async ({ ids, status, notes }: { ids: string[]; status: RepairTicket['status']; notes?: string }) => {
    const response = await api.post('/v1/repair-tickets/bulk-update-status', { ids, status, notes });
    return response.data;
  }
);

export const assignTechnician = createAsyncThunk(
  'repairTickets/assignTechnician',
  async ({ ticketId, technicianId }: { ticketId: string; technicianId: string }) => {
    const response = await api.patch(`/v1/repair-tickets/${ticketId}/assign-technician`, { technicianId });
    return response.data;
  }
);

export const addRepairNote = createAsyncThunk(
  'repairTickets/addRepairNote',
  async ({ ticketId, note, isInternal }: { ticketId: string; note: string; isInternal: boolean }) => {
    const response = await api.post(`/v1/repair-tickets/${ticketId}/notes`, { note, isInternal });
    return response.data;
  }
);

export const uploadRepairPhotos = createAsyncThunk(
  'repairTickets/uploadRepairPhotos',
  async ({ ticketId, photos }: { ticketId: string; photos: File[] }) => {
    const formData = new FormData();
    photos.forEach(photo => formData.append('photos', photo));
    const response = await api.post(`/v1/repair-tickets/${ticketId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
);

export const generateInvoice = createAsyncThunk(
  'repairTickets/generateInvoice',
  async (ticketId: string) => {
    const response = await api.post(`/v1/repair-tickets/${ticketId}/generate-invoice`);
    return response.data;
  }
);

const repairTicketsSlice = createSlice({
  name: 'repairTickets',
  initialState,
  reducers: {
    setSelectedTicket: (state, action: PayloadAction<RepairTicket | null>) => {
      state.selectedTicket = action.payload;
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
    selectAllTickets: (state) => {
      state.bulkOperations.selectedIds = state.tickets.map(ticket => ticket.id);
    },
    clearSelectedTickets: (state) => {
      state.bulkOperations.selectedIds = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    resetRepairTicketsState: () => initialState,
    updateTicketInList: (state, action: PayloadAction<RepairTicket>) => {
      const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch repair tickets
      .addCase(fetchRepairTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepairTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.tickets;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchRepairTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch repair tickets';
      })
      
      // Create repair ticket
      .addCase(createRepairTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRepairTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createRepairTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create repair ticket';
      })
      
      // Update repair ticket
      .addCase(updateRepairTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRepairTicket.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        if (state.selectedTicket?.id === action.payload.id) {
          state.selectedTicket = action.payload;
        }
      })
      .addCase(updateRepairTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update repair ticket';
      })
      
      // Update repair ticket status
      .addCase(updateRepairTicketStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRepairTicketStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        if (state.selectedTicket?.id === action.payload.id) {
          state.selectedTicket = action.payload;
        }
      })
      .addCase(updateRepairTicketStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update ticket status';
      })
      
      // Delete repair ticket
      .addCase(deleteRepairTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRepairTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = state.tickets.filter(ticket => ticket.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedTicket?.id === action.payload) {
          state.selectedTicket = null;
        }
        state.bulkOperations.selectedIds = state.bulkOperations.selectedIds.filter(id => id !== action.payload);
      })
      .addCase(deleteRepairTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete repair ticket';
      })
      
      // Bulk update status
      .addCase(bulkUpdateStatus.pending, (state) => {
        state.bulkOperations.bulkLoading = true;
        state.error = null;
      })
      .addCase(bulkUpdateStatus.fulfilled, (state, action) => {
        state.bulkOperations.bulkLoading = false;
        action.payload.forEach((updatedTicket: RepairTicket) => {
          const index = state.tickets.findIndex(ticket => ticket.id === updatedTicket.id);
          if (index !== -1) {
            state.tickets[index] = updatedTicket;
          }
        });
        state.bulkOperations.selectedIds = [];
      })
      .addCase(bulkUpdateStatus.rejected, (state, action) => {
        state.bulkOperations.bulkLoading = false;
        state.error = action.error.message || 'Failed to update ticket statuses';
      });
  },
});

export const {
  setSelectedTicket,
  setSearchQuery,
  setFilters,
  setPagination,
  setSelectedIds,
  toggleSelectedId,
  selectAllTickets,
  clearSelectedTickets,
  clearError,
  resetRepairTicketsState,
  updateTicketInList,
} = repairTicketsSlice.actions;

export default repairTicketsSlice.reducer;
