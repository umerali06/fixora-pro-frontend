import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  category: 'REPAIR' | 'INVENTORY' | 'CUSTOMER' | 'ADMIN' | 'OTHER';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface TodosState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  filters: {
    completed: boolean | null;
    priority: string[];
    category: string[];
  };
}

const initialState: TodosState = {
  todos: [],
  loading: false,
  error: null,
  filters: {
    completed: null,
    priority: [],
    category: [],
  },
};

// Async thunks
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async () => {
    const response = await api.get('/v1/todos');
    return response.data;
  }
);

export const createTodo = createAsyncThunk(
  'todos/createTodo',
  async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
    const response = await api.post('/v1/todos', todoData);
    return response.data;
  }
);

export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async ({ id, data }: { id: string; data: Partial<Todo> }) => {
    const response = await api.put(`/v1/todos/${id}`, data);
    return response.data;
  }
);

export const toggleTodo = createAsyncThunk(
  'todos/toggleTodo',
  async (id: string) => {
    const response = await api.patch(`/v1/todos/${id}/toggle`);
    return response.data;
  }
);

export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async (id: string) => {
    await api.delete(`/v1/todos/${id}`);
    return id;
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addTodoOptimistic: (state, action: PayloadAction<Todo>) => {
      state.todos.unshift(action.payload);
    },
    removeTodoOptimistic: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter(todo => todo.id !== action.payload);
    },
    updateTodoOptimistic: (state, action: PayloadAction<Todo>) => {
      const index = state.todos.findIndex(todo => todo.id === action.payload.id);
      if (index !== -1) {
        state.todos[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch todos
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch todos';
      })
      
      // Create todo
      .addCase(createTodo.fulfilled, (state, action) => {
        const existingIndex = state.todos.findIndex(todo => todo.id === action.payload.id);
        if (existingIndex === -1) {
          state.todos.unshift(action.payload);
        }
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create todo';
      })
      
      // Update todo
      .addCase(updateTodo.fulfilled, (state, action) => {
        const index = state.todos.findIndex(todo => todo.id === action.payload.id);
        if (index !== -1) {
          state.todos[index] = action.payload;
        }
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update todo';
      })
      
      // Toggle todo
      .addCase(toggleTodo.fulfilled, (state, action) => {
        const index = state.todos.findIndex(todo => todo.id === action.payload.id);
        if (index !== -1) {
          state.todos[index] = action.payload;
        }
      })
      .addCase(toggleTodo.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to toggle todo';
      })
      
      // Delete todo
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.todos = state.todos.filter(todo => todo.id !== action.payload);
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete todo';
      });
  },
});

export const {
  setFilters,
  clearError,
  addTodoOptimistic,
  removeTodoOptimistic,
  updateTodoOptimistic,
} = todosSlice.actions;

export default todosSlice.reducer;
