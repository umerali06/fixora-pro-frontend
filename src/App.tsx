import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';

// Import i18n configuration
import './i18n';

import { getCurrentUser, initializeAuth } from './store/slices/authSlice';
import { setLanguage } from './store/slices/uiSlice';

// Components
import LoadingScreen from './components/common/LoadingScreen';
import NotificationSystem from './components/common/NotificationSystem';
import LanguageSwitch from './components/common/LanguageSwitch';

// Providers
import { ResponsiveDataProvider } from './providers/ResponsiveDataProvider';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import MainLayout from './components/Layout/MainLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import JobsPage from './pages/Jobs/JobsPage';
import ContactsPage from './pages/Contacts/ContactsPage';
import StockPage from './pages/Stock/StockPage';
import POSPage from './pages/POS/POSPage';
import ReportsPage from './pages/Reports/ReportsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import AppsPage from './pages/Apps/AppsPage';
import RepairTrackingPage from './pages/RepairTracking/RepairTrackingPage';
import ServicesPage from './pages/Services/ServicesPage';
import TicketsPage from './pages/Tickets/TicketsPage';
import InvoicesPage from './pages/Invoices/InvoicesPage';
import DevicesPage from './pages/Devices/DevicesPage';
import CustomersPage from './pages/Customers/CustomersPage';
import TechniciansPage from './pages/Technicians/TechniciansPage';
import AdminPage from './pages/Admin/AdminPage';
import CustomerProfilePage from './pages/Customers/CustomerProfilePage';
import CustomerManagementPage from './pages/Customers/CustomerManagementPage';
import BrandsPage from './pages/Brands/BrandsPage';
import ExpensesPage from './pages/Expenses/ExpensesPage';
import RefundsPage from './pages/Refunds/RefundsPage';
import BackupsPage from './pages/Backups/BackupsPage';
import WarrantiesPage from './pages/Warranties/WarrantiesPage';
import ConfigurationPage from './pages/Configuration/ConfigurationPage';
import BookingWidgetsPage from './pages/Booking/BookingWidgetsPage';
import LabelsPage from './pages/Labels/LabelsPage';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { isAuthenticated, token, loading } = useAppSelector((state) => state.auth);
  const { language } = useAppSelector((state) => state.ui);

  // Initialize authentication on app load
  useEffect(() => {
    console.log('🚀 App useEffect - Initializing auth...');
    console.log('🚀 App useEffect - token:', !!token);
    console.log('🚀 App useEffect - isAuthenticated:', isAuthenticated);
    
    // Initialize auth headers
    initializeAuth();
    
    // Always try to get current user if we have a token, regardless of isAuthenticated state
    if (token) {
      console.log('🚀 App useEffect - Dispatching getCurrentUser...');
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);

  // Handle language changes and synchronization
  useEffect(() => {
    const syncLanguage = async () => {
      if (language !== i18n.language) {
        console.log('Syncing language from Redux to i18n:', language);
        try {
          await i18n.changeLanguage(language);
        } catch (error) {
          console.error('Error syncing language:', error);
        }
      }
    };
    
    syncLanguage();
  }, [language, i18n]);

  // Initialize language on app start and sync Redux with i18n
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const savedLanguage = localStorage.getItem('language') || 'en';
        
        // Ensure Redux store has the correct language
        if (language !== savedLanguage) {
          dispatch(setLanguage(savedLanguage as 'en' | 'de'));
        }
        
        // Ensure i18n has the correct language
        if (savedLanguage !== i18n.language) {
          await i18n.changeLanguage(savedLanguage);
        }
        
        console.log('Language initialized:', savedLanguage);
      } catch (error) {
        console.error('Error initializing language:', error);
      }
    };
    
    initializeLanguage();
  }, [dispatch, i18n, language]);

  // Redirect authenticated users from login page
  useEffect(() => {
    if (isAuthenticated && window.location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Show loading spinner during initial auth check
  if (loading && token) {
    return <LoadingScreen message="Initializing application..." />;
  }

  return (
    <LanguageProvider>
      <NotificationProvider>
        <ResponsiveDataProvider>
          <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
        {/* Protected Routes - Using MainLayout with individual page components */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
      </Route>
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<JobsPage />} />
      </Route>
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ContactsPage />} />
      </Route>
      <Route
        path="/stock"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StockPage />} />
      </Route>
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ServicesPage />} />
      </Route>
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<InvoicesPage />} />
      </Route>
      <Route
        path="/repair-tracking"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RepairTrackingPage />} />
      </Route>
      <Route
        path="/apps"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AppsPage />} />
      </Route>
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SettingsPage />} />
      </Route>
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReportsPage />} />
      </Route>
      <Route
        path="/devices"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DevicesPage />} />
      </Route>
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<POSPage />} />
      </Route>
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TicketsPage />} />
      </Route>
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomersPage />} />
        <Route path="management" element={<CustomerManagementPage />} />
      </Route>
      <Route
        path="/customers/:customerId"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerProfilePage />} />
      </Route>
      <Route
        path="/technicians"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TechniciansPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminPage />} />
      </Route>
      <Route
        path="/brands"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<BrandsPage />} />
      </Route>
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ExpensesPage />} />
      </Route>
      <Route
        path="/refunds"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RefundsPage />} />
      </Route>
      <Route
        path="/backups"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<BackupsPage />} />
      </Route>
      <Route
        path="/warranties"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WarrantiesPage />} />
      </Route>
      <Route
        path="/configuration"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ConfigurationPage />} />
      </Route>
      <Route
        path="/booking-widgets"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<BookingWidgetsPage />} />
      </Route>
      <Route
        path="/labels"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LabelsPage />} />
      </Route>
      
      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        {/* Global Notification System */}
        <NotificationSystem />
        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4caf50',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#f44336',
                secondary: '#fff',
              },
            },
          }}
        />
        {/* Floating Language Switcher - Only show when authenticated */}
        {isAuthenticated && <LanguageSwitch showFloating={true} />}
        </ResponsiveDataProvider>
      </NotificationProvider>
    </LanguageProvider>
  );
};

export default App; 