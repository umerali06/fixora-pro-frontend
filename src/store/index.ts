import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import uiReducer from './slices/uiSlice';
import customersReducer from './slices/customersSlice';
import inventoryReducer from './slices/inventorySlice';
import repairTicketsReducer from './slices/repairTicketsSlice';
import invoicesReducer from './slices/invoicesSlice';
import todosReducer from './slices/todosSlice';
import activitiesReducer from './slices/activitiesSlice';
import dashboardStatsReducer from './slices/dashboardStatsSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
    customers: customersReducer,
    inventory: inventoryReducer,
    repairTickets: repairTicketsReducer,
    invoices: invoicesReducer,
    todos: todosReducer,
    activities: activitiesReducer,
    dashboardStats: dashboardStatsReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 