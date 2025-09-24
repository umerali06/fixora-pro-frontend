import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  variant: string;
  quantity: number;
  minQuantity: number;
  price: number;
  costPrice: number;
  location: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  description?: string;
  image?: string;
  supplier?: string;
  barcode?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastRestocked?: string;
  expiryDate?: string;
}

interface InventoryState {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    categories: string[];
    status: string[];
    location: string[];
    priceRange: {
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
}

const initialState: InventoryState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  searchQuery: '',
  filters: {
    categories: [],
    status: [],
    location: [],
    priceRange: {
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
};

// Async thunks
export const fetchInventoryItems = createAsyncThunk(
  'inventory/fetchInventoryItems',
  async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    filters?: any;
  }) => {
    const response = await api.get('/v1/inventory', { params });
    return response.data;
  }
);

export const fetchInventoryItemById = createAsyncThunk(
  'inventory/fetchInventoryItemById',
  async (id: string) => {
    const response = await api.get(`/v1/inventory/${id}`);
    return response.data;
  }
);

export const createInventoryItem = createAsyncThunk(
  'inventory/createInventoryItem',
  async (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/v1/inventory', itemData);
    return response.data;
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateInventoryItem',
  async ({ id, data }: { id: string; data: Partial<InventoryItem> }) => {
    const response = await api.put(`/v1/inventory/${id}`, data);
    return response.data;
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteInventoryItem',
  async (id: string) => {
    await api.delete(`/v1/inventory/${id}`);
    return id;
  }
);

export const bulkDeleteInventoryItems = createAsyncThunk(
  'inventory/bulkDeleteInventoryItems',
  async (ids: string[]) => {
    await api.post('/v1/inventory/bulk-delete', { ids });
    return ids;
  }
);

export const bulkUpdateInventoryItems = createAsyncThunk(
  'inventory/bulkUpdateInventoryItems',
  async ({ ids, data }: { ids: string[]; data: Partial<InventoryItem> }) => {
    const response = await api.post('/v1/inventory/bulk-update', { ids, data });
    return response.data;
  }
);

export const adjustInventoryQuantity = createAsyncThunk(
  'inventory/adjustInventoryQuantity',
  async ({ id, adjustment, reason }: { id: string; adjustment: number; reason: string }) => {
    const response = await api.post(`/v1/inventory/${id}/adjust-quantity`, { adjustment, reason });
    return response.data;
  }
);

export const bulkImportInventory = createAsyncThunk(
  'inventory/bulkImportInventory',
  async (items: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const response = await api.post('/v1/inventory/bulk-import', { items });
    return response.data;
  }
);

export const getInventoryCategories = createAsyncThunk(
  'inventory/getInventoryCategories',
  async () => {
    const response = await api.get('/v1/inventory/categories');
    return response.data;
  }
);

export const getInventoryLocations = createAsyncThunk(
  'inventory/getInventoryLocations',
  async () => {
    const response = await api.get('/v1/inventory/locations');
    return response.data;
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<InventoryItem | null>) => {
      state.selectedItem = action.payload;
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
    selectAllItems: (state) => {
      state.bulkOperations.selectedIds = state.items.map(item => item.id);
    },
    clearSelectedItems: (state) => {
      state.bulkOperations.selectedIds = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    resetInventoryState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch inventory items
      .addCase(fetchInventoryItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch inventory items';
      })
      
      // Create inventory item
      .addCase(createInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create inventory item';
      })
      
      // Update inventory item
      .addCase(updateInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update inventory item';
      })
      
      // Delete inventory item
      .addCase(deleteInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
        // Remove from selected items if it was selected
        state.bulkOperations.selectedIds = state.bulkOperations.selectedIds.filter(id => id !== action.payload);
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete inventory item';
      })
      
      // Bulk delete inventory items
      .addCase(bulkDeleteInventoryItems.pending, (state) => {
        state.bulkOperations.bulkLoading = true;
        state.error = null;
      })
      .addCase(bulkDeleteInventoryItems.fulfilled, (state, action) => {
        state.bulkOperations.bulkLoading = false;
        state.items = state.items.filter(item => !action.payload.includes(item.id));
        state.pagination.total -= action.payload.length;
        state.bulkOperations.selectedIds = [];
        if (state.selectedItem && action.payload.includes(state.selectedItem.id)) {
          state.selectedItem = null;
        }
      })
      .addCase(bulkDeleteInventoryItems.rejected, (state, action) => {
        state.bulkOperations.bulkLoading = false;
        state.error = action.error.message || 'Failed to delete inventory items';
      })
      
      // Bulk update inventory items
      .addCase(bulkUpdateInventoryItems.pending, (state) => {
        state.bulkOperations.bulkLoading = true;
        state.error = null;
      })
      .addCase(bulkUpdateInventoryItems.fulfilled, (state, action) => {
        state.bulkOperations.bulkLoading = false;
        action.payload.forEach((updatedItem: InventoryItem) => {
          const index = state.items.findIndex(item => item.id === updatedItem.id);
          if (index !== -1) {
            state.items[index] = updatedItem;
          }
        });
        state.bulkOperations.selectedIds = [];
      })
      .addCase(bulkUpdateInventoryItems.rejected, (state, action) => {
        state.bulkOperations.bulkLoading = false;
        state.error = action.error.message || 'Failed to update inventory items';
      })
      
      // Adjust inventory quantity
      .addCase(adjustInventoryQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adjustInventoryQuantity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(adjustInventoryQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to adjust inventory quantity';
      })
      
      // Bulk import inventory
      .addCase(bulkImportInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkImportInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [...action.payload.items, ...state.items];
        state.pagination.total += action.payload.items.length;
      })
      .addCase(bulkImportInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to import inventory items';
      });
  },
});

export const {
  setSelectedItem,
  setSearchQuery,
  setFilters,
  setPagination,
  setSelectedIds,
  toggleSelectedId,
  selectAllItems,
  clearSelectedItems,
  clearError,
  resetInventoryState,
} = inventorySlice.actions;

export default inventorySlice.reducer;
