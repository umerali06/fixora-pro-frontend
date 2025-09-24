import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  language: "en" | "de";
  theme: "light" | "dark";
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    duration?: number;
  }>;
  loading: boolean;
  globalLoading: boolean;
}

// Get saved language from localStorage or default to English
const getInitialLanguage = (): "en" | "de" => {
  try {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage === "en" || savedLanguage === "de") {
      return savedLanguage;
    }
  } catch (error) {
    console.warn("Could not access localStorage:", error);
  }
  return "en";
};

const initialState: UIState = {
  sidebarOpen: true,
  language: getInitialLanguage(),
  theme: "light",
  notifications: [],
  loading: false,
  globalLoading: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLanguage: (state, action: PayloadAction<"en" | "de">) => {
      state.language = action.payload;
      try {
        localStorage.setItem("language", action.payload);
        // Also update the HTML lang attribute
        document.documentElement.lang = action.payload;
      } catch (error) {
        console.warn("Could not save language to localStorage:", error);
      }
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<{
        id: string;
        type: "success" | "error" | "warning" | "info";
        message: string;
        duration?: number;
      }>
    ) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setLanguage,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
