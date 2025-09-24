import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Avatar,
  Fab,
  LinearProgress,
  Alert,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Switch,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { invoicesAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  notes?: string;
  // Additional fields from backend
  invoiceType?: string;
  title?: string;
  description?: string;
  subtotal?: number;
  paidAmount?: number;
  balance?: number;
  issuedAt?: string;
  sentAt?: string;
  viewedAt?: string;
  paidAt?: string;
  tags?: string;
  customerNotes?: string;
  internalNotes?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  averageInvoiceAmount: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
}

interface CreateInvoiceForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
  items: InvoiceItem[];
  tax: number;
  discount: number;
  status: string;
  // Additional fields from backend
  invoiceNumber: string;
  invoiceType: string;
  title: string;
  description: string;
  subtotal: number;
  total: number;
  paidAmount: number;
  balance: number;
  issuedAt: string;
  sentAt: string;
  viewedAt: string;
  paidAt: string;
  tags: string;
  customerNotes: string;
  internalNotes: string;
}

interface EditInvoiceForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
  items: InvoiceItem[];
  tax: number;
  discount: number;
  status: string;
  // Additional fields from backend
  invoiceNumber: string;
  invoiceType: string;
  title: string;
  description: string;
  subtotal: number;
  total: number;
  paidAmount: number;
  balance: number;
  issuedAt: string;
  sentAt: string;
  viewedAt: string;
  paidAt: string;
  tags: string;
  customerNotes: string;
  internalNotes: string;
}

const InvoicesPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  // State Management
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // Dialog Management
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [emailDialog, setEmailDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form Management
  const [createForm, setCreateForm] = useState<CreateInvoiceForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    dueDate: '',
    paymentTerms: 'Net 30',
    notes: '',
    items: [],
    tax: 0,
    discount: 0,
    status: 'draft',
    // Additional fields
    invoiceNumber: '',
    invoiceType: 'SALE',
    title: '',
    description: '',
    subtotal: 0,
    total: 0,
    paidAmount: 0,
    balance: 0,
    issuedAt: '',
    sentAt: '',
    viewedAt: '',
    paidAt: '',
    tags: '',
    customerNotes: '',
    internalNotes: ''
  });

  const [editForm, setEditForm] = useState<EditInvoiceForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    dueDate: '',
    paymentTerms: 'Net 30',
    notes: '',
    items: [],
    tax: 0,
    discount: 0,
    status: 'draft',
    // Additional fields
    invoiceNumber: '',
    invoiceType: 'SALE',
    title: '',
    description: '',
    subtotal: 0,
    total: 0,
    paidAmount: 0,
    balance: 0,
    issuedAt: '',
    sentAt: '',
    viewedAt: '',
    paidAt: '',
    tags: '',
    customerNotes: '',
    internalNotes: ''
  });

  const [emailForm, setEmailForm] = useState({
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchInvoicesData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchInvoicesData = async () => {
    // Check authentication before making API calls
    if (!isAuthenticated) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Use authenticated API service
      console.log('🔍 Frontend - About to fetch invoices and stats...');
      const [invoicesData, statsData] = await Promise.all([
        invoicesAPI.getInvoices(),
        invoicesAPI.getStats()
      ]);
      console.log('🔍 Frontend - API calls completed');

      // Handle response structure - check if data is wrapped or direct
      console.log('🔍 Frontend - invoicesData:', invoicesData);
      console.log('🔍 Frontend - statsData:', statsData);
      
      const invoices = Array.isArray(invoicesData) ? invoicesData : (invoicesData?.invoices || invoicesData?.data || []);
      const stats = statsData?.data || statsData || null;
      
      console.log('🔍 Frontend - processed invoices:', invoices);
      console.log('🔍 Frontend - processed stats:', stats);
      console.log('🔍 Frontend - invoices count:', invoices.length);
      console.log('🔍 Frontend - stats keys:', stats ? Object.keys(stats) : 'null');
      console.log('🔍 Frontend - Setting invoices and stats in state...');

      setInvoices(invoices);
      setStats(stats);
      
      console.log('✅ Frontend - State updated with invoices and stats');
    } catch (err) {
      console.error('Error fetching invoices data:', err);
      setError('Failed to load invoices data');
      
      // Fallback to mock data for development
    const mockInvoices: Invoice[] = [
      {
        id: 'INV-001',
        invoiceNumber: 'INV-2024-001',
        customerName: 'John Doe',
        customerEmail: 'john.doe@email.com',
        customerPhone: '+1-555-0123',
        amount: 150.00,
        tax: 15.00,
        total: 165.00,
        status: 'paid',
        dueDate: '2024-01-20',
        issueDate: '2024-01-15',
        paidDate: '2024-01-18',
        items: [
          {
            id: 'ITEM-001',
            description: 'iPhone 12 Screen Replacement',
            quantity: 1,
            unitPrice: 150.00,
            total: 150.00
          }
        ],
        notes: 'Screen replacement completed successfully'
      },
      {
        id: 'INV-002',
        invoiceNumber: 'INV-2024-002',
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@email.com',
        customerPhone: '+1-555-0456',
        amount: 89.99,
        tax: 9.00,
        total: 98.99,
        status: 'sent',
        dueDate: '2024-01-25',
        issueDate: '2024-01-16',
        items: [
          {
            id: 'ITEM-002',
            description: 'Samsung Galaxy Battery Replacement',
            quantity: 1,
            unitPrice: 89.99,
            total: 89.99
          }
        ]
      },
      {
        id: 'INV-003',
        invoiceNumber: 'INV-2024-003',
        customerName: 'Bob Johnson',
        customerEmail: 'bob.johnson@email.com',
        customerPhone: '+1-555-0789',
        amount: 120.00,
        tax: 12.00,
        total: 132.00,
        status: 'overdue',
        dueDate: '2024-01-10',
        issueDate: '2024-01-05',
        items: [
          {
            id: 'ITEM-003',
            description: 'Dell XPS 13 Keyboard Replacement',
            quantity: 1,
            unitPrice: 120.00,
            total: 120.00
          }
        ],
        notes: 'Customer requested extension'
      },
      {
        id: 'INV-004',
        invoiceNumber: 'INV-2024-004',
        customerName: 'Alice Brown',
        customerEmail: 'alice.brown@email.com',
        customerPhone: '+1-555-0321',
        amount: 39.99,
        tax: 4.00,
        total: 43.99,
        status: 'draft',
        dueDate: '2024-01-30',
        issueDate: '2024-01-17',
        items: [
          {
            id: 'ITEM-004',
            description: 'Software Troubleshooting Service',
            quantity: 1,
            unitPrice: 39.99,
            total: 39.99
          }
        ]
      }
    ];
    
    const mockStats: InvoiceStats = {
      totalInvoices: mockInvoices.length,
      paidInvoices: mockInvoices.filter(inv => inv.status === 'paid').length,
      pendingInvoices: mockInvoices.filter(inv => inv.status === 'sent').length,
      overdueInvoices: mockInvoices.filter(inv => inv.status === 'overdue').length,
      totalRevenue: mockInvoices.reduce((sum, inv) => sum + inv.total, 0),
      averageInvoiceAmount: mockInvoices.reduce((sum, inv) => sum + inv.total, 0) / mockInvoices.length,
      thisMonthRevenue: mockInvoices.reduce((sum, inv) => sum + inv.total, 0),
      lastMonthRevenue: 0
    };
    
    setInvoices(mockInvoices);
    setStats(mockStats);
    } finally {
    setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, invoice: Invoice) => {
    console.log('🔍 handleMenuOpen called - setting selectedInvoice:', invoice);
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    console.log('🔍 handleMenuClose called - isEditing:', isEditing);
    setAnchorEl(null);
    if (!isEditing) {
      console.log('🔍 Not editing, resetting selectedInvoice to null');
      setSelectedInvoice(null);
    } else {
      console.log('🔍 Editing, keeping selectedInvoice');
    }
  };

  const handleAction = (action: string) => {
    if (!selectedInvoice) return;
    
    switch (action) {
      case 'view':
        setViewDialog(true);
        setAnchorEl(null); // Close menu but keep selectedInvoice
        break;
      case 'edit':
        console.log('🔍 Edit action - selectedInvoice:', selectedInvoice);
        setIsEditing(true);
        setEditForm({
          customerName: selectedInvoice.customerName,
          customerEmail: selectedInvoice.customerEmail,
          customerPhone: selectedInvoice.customerPhone,
          dueDate: selectedInvoice.dueDate,
          paymentTerms: 'Net 30',
          notes: selectedInvoice.notes || '',
          items: selectedInvoice.items,
          tax: selectedInvoice.tax,
          discount: 0,
          status: selectedInvoice.status,
          // Additional fields
          invoiceNumber: selectedInvoice.invoiceNumber || '',
          invoiceType: selectedInvoice.invoiceType || 'SALE',
          title: selectedInvoice.title || '',
          description: selectedInvoice.description || '',
          subtotal: selectedInvoice.subtotal || 0,
          total: selectedInvoice.total || 0,
          paidAmount: selectedInvoice.paidAmount || 0,
          balance: selectedInvoice.balance || 0,
          issuedAt: selectedInvoice.issuedAt ? new Date(selectedInvoice.issuedAt).toISOString().split('T')[0] : '',
          sentAt: selectedInvoice.sentAt ? new Date(selectedInvoice.sentAt).toISOString().split('T')[0] : '',
          viewedAt: selectedInvoice.viewedAt ? new Date(selectedInvoice.viewedAt).toISOString().split('T')[0] : '',
          paidAt: selectedInvoice.paidAt ? new Date(selectedInvoice.paidAt).toISOString().split('T')[0] : '',
          tags: selectedInvoice.tags || '',
          customerNotes: selectedInvoice.customerNotes || '',
          internalNotes: selectedInvoice.internalNotes || ''
        });
        console.log('🔍 Edit action - editForm set, opening dialog');
        setEditDialog(true);
        setAnchorEl(null); // Close menu but keep selectedInvoice
        console.log('🔍 Edit action - dialog should be open now');
        break;
      case 'delete':
        handleDeleteInvoice(selectedInvoice);
        handleMenuClose();
        break;
      case 'download':
        handleDownloadInvoice(selectedInvoice);
        handleMenuClose();
        break;
      case 'email':
        handleEmailInvoice(selectedInvoice);
        handleMenuClose();
        break;
      case 'print':
        handlePrintInvoice(selectedInvoice);
        handleMenuClose();
        break;
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!window.confirm(t('Are you sure you want to delete this invoice?'))) {
      return;
    }

    try {
      setLoading(true);
      
      await invoicesAPI.delete(invoice.id);
      
      // Refresh data from server to get the latest invoices and stats
      await fetchInvoicesData();
      toast.success('Invoice deleted successfully!');
      
    } catch (err) {
      console.error('Error deleting invoice:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoice. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the download API endpoint
      const response = await invoicesAPI.download(invoice.id);
      
      // Check if response is binary data (PDF) or text (HTML fallback)
      const isBinary = response instanceof ArrayBuffer || response instanceof Uint8Array;
      
      if (isBinary) {
        // Handle PDF binary data
        if (!response || response.byteLength === 0) {
          throw new Error('Invalid PDF data received');
        }
        
        const blob = new Blob([response as any], { type: 'application/pdf' });
        
        if (blob.size === 0) {
          throw new Error('Generated PDF is empty');
        }
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoice.invoiceNumber}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
        
        toast.success('Invoice PDF downloaded successfully!');
        
      } else {
        // Handle HTML fallback
        const blob = new Blob([response], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoice.invoiceNumber}.html`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
        
        toast.success('Invoice downloaded as HTML. You can print it as PDF from your browser.');
      }
      
    } catch (err) {
      console.error('Error downloading invoice:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to download invoice. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportInvoices = async (format: 'csv' | 'json' = 'csv') => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the export API
      const response = await invoicesAPI.export(format);
      
      // Create download link
      const blob = new Blob([response], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoices.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Invoices exported as ${format.toUpperCase()} successfully!`);
      
    } catch (err) {
      console.error('Error exporting invoices:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to export invoices. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEmailForm({
      email: invoice.customerEmail,
      subject: `Invoice ${invoice.invoiceNumber}`,
      message: `Please find attached invoice ${invoice.invoiceNumber} for ${invoice.customerName}.`
    });
    setEmailDialog(true);
  };

  const handleSendEmail = async () => {
    if (!selectedInvoice) return;
    
    // Email form validation
    if (!emailForm.email.trim()) {
      toast.error('Email address is required');
      return;
    }
    
    if (!emailForm.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!emailForm.subject.trim()) {
      toast.error('Email subject is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call the email API endpoint
      const response = await invoicesAPI.email(selectedInvoice.id, {
        email: emailForm.email.trim(),
        subject: emailForm.subject.trim(),
        message: emailForm.message.trim()
      });
      
      toast.success(`Invoice email sent successfully to ${emailForm.email}!`);
      setEmailDialog(false);
      setSelectedInvoice(null);
      
      // Reset email form
      setEmailForm({
        email: '',
        subject: '',
        message: ''
      });
      
    } catch (error) {
      console.error('Error sending invoice email:', error);
      const errorMessage = `Failed to send invoice email: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = async (invoice: Invoice) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the print API endpoint
      const response = await invoicesAPI.print(invoice.id);
      
      // Open the print dialog in a new window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(response);
        printWindow.document.close();
        printWindow.focus();
        // The print dialog will open automatically due to the script in the HTML
      } else {
        toast.error('Unable to open print window. Please check your popup blocker.');
      }
      
    } catch (error) {
      console.error('Error printing invoice:', error);
      const errorMessage = `Failed to print invoice: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    console.log('🔍 handleSaveEdit called');
    console.log('🔍 selectedInvoice:', selectedInvoice);
    console.log('🔍 editForm:', editForm);
    
    if (!selectedInvoice) {
      console.log('❌ No selectedInvoice, returning');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      console.log('🔍 Starting invoice update...');

      // Calculate totals from form data
      const subtotal = editForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const taxAmount = (subtotal * editForm.tax) / 100;
      const discountAmount = (subtotal * editForm.discount) / 100;
      const total = subtotal + taxAmount - discountAmount;
      
      // Update form with calculated values
      setEditForm(prev => ({
        ...prev,
        subtotal: subtotal,
        total: total
      }));

      const invoiceData = {
        customerName: editForm.customerName.trim(),
        customerEmail: editForm.customerEmail.trim(),
        customerPhone: editForm.customerPhone.trim(),
        dueDate: editForm.dueDate,
        paymentTerms: editForm.paymentTerms,
        notes: editForm.notes.trim(),
        items: editForm.items,
        subtotal: subtotal,
        tax: editForm.tax,
        discount: editForm.discount,
        total: total,
        status: editForm.status,
        // Additional fields
        invoiceNumber: editForm.invoiceNumber.trim(),
        invoiceType: editForm.invoiceType,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        paidAmount: editForm.paidAmount,
        balance: total - editForm.paidAmount, // Calculate balance as total - paid
        issuedAt: editForm.issuedAt,
        sentAt: editForm.sentAt,
        viewedAt: editForm.viewedAt,
        paidAt: editForm.paidAt,
        tags: editForm.tags.trim(),
        customerNotes: editForm.customerNotes.trim(),
        internalNotes: editForm.internalNotes.trim()
      };

      // Update existing invoice
      console.log('🔍 Sending update request with data:', invoiceData);
      console.log('🔍 Invoice ID:', selectedInvoice.id);
      const result = await invoicesAPI.update(selectedInvoice.id, invoiceData);
      console.log('🔍 Frontend - update result:', result);
      
      setEditDialog(false);
      setSelectedInvoice(null);
      setIsEditing(false);
      
      // Show success message
      toast.success('Invoice updated successfully!');
      
      // Reset form
      setEditForm({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        dueDate: '',
        paymentTerms: 'Net 30',
        notes: '',
        items: [],
        tax: 0,
        discount: 0,
        status: 'draft',
        // Additional fields
        invoiceNumber: '',
        invoiceType: 'SALE',
        title: '',
        description: '',
        subtotal: 0,
        total: 0,
        paidAmount: 0,
        balance: 0,
        issuedAt: '',
        sentAt: '',
        viewedAt: '',
        paidAt: '',
        tags: '',
        customerNotes: '',
        internalNotes: ''
      });
      
      // Refresh data from server to get the latest invoices and stats
      await fetchInvoicesData();
      
    } catch (err) {
      console.error('❌ Error updating invoice:', err);
      console.error('❌ Error details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInvoice = async () => {
    // Form validation
    if (!createForm.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    
    if (!createForm.customerEmail.trim()) {
      toast.error('Customer email is required');
      return;
    }
    
    if (!createForm.customerEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!createForm.dueDate) {
      toast.error('Due date is required');
      return;
    }
    
    if (createForm.tax < 0) {
      toast.error('Tax cannot be negative');
      return;
    }
    
    if (createForm.discount < 0) {
      toast.error('Discount cannot be negative');
      return;
    }

    try {
      setLoading(true);
      
      // Calculate totals
      const subtotal = createForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const total = subtotal + createForm.tax - createForm.discount;
      
      const invoiceData = {
        customerName: createForm.customerName.trim(),
        customerEmail: createForm.customerEmail.trim(),
        customerPhone: createForm.customerPhone.trim(),
        dueDate: createForm.dueDate,
        paymentTerms: createForm.paymentTerms,
        notes: createForm.notes.trim(),
        items: createForm.items,
        subtotal: subtotal,
        tax: createForm.tax,
        discount: createForm.discount,
        total: total,
        status: createForm.status,
        // Additional fields
        invoiceNumber: createForm.invoiceNumber.trim(),
        invoiceType: createForm.invoiceType,
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        paidAmount: createForm.paidAmount,
        balance: total - createForm.paidAmount,
        issuedAt: createForm.issuedAt,
        sentAt: createForm.sentAt,
        viewedAt: createForm.viewedAt,
        paidAt: createForm.paidAt,
        tags: createForm.tags.trim(),
        customerNotes: createForm.customerNotes.trim(),
        internalNotes: createForm.internalNotes.trim()
      };

      // Create new invoice
      const result = await invoicesAPI.create(invoiceData);
      console.log('🔍 Frontend - create result:', result);
      
      setCreateDialog(false);
      
      // Show success message
      toast.success('Invoice created successfully!');
      
      // Reset form
      setCreateForm({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        dueDate: '',
        paymentTerms: 'Net 30',
        notes: '',
        items: [],
        tax: 0,
        discount: 0,
        status: 'draft',
        // Additional fields
        invoiceNumber: '',
        invoiceType: 'SALE',
        title: '',
        description: '',
        subtotal: 0,
        total: 0,
        paidAmount: 0,
        balance: 0,
        issuedAt: '',
        sentAt: '',
        viewedAt: '',
        paidAt: '',
        tags: '',
        customerNotes: '',
        internalNotes: ''
      });
      
      // Refresh data from server to get the latest invoices and stats
      console.log('🔄 Frontend - About to refresh data after invoice creation...');
      await fetchInvoicesData();
      console.log('✅ Frontend - Data refresh completed after invoice creation');
      
    } catch (err) {
      console.error('Error saving invoice:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save invoice. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'info';
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getDateFilterColor = (dateFilter: string) => {
    switch (dateFilter) {
      case 'overdue':
        return 'error';
      case 'due_soon':
        return 'warning';
      case 'recent':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const today = new Date();
      const dueDate = new Date(invoice.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'overdue':
          matchesDate = daysUntilDue < 0 && invoice.status !== 'paid';
          break;
        case 'due_soon':
          matchesDate = daysUntilDue >= 0 && daysUntilDue <= 7 && invoice.status !== 'paid';
          break;
        case 'recent':
          matchesDate = daysUntilDue > 7;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getInvoiceSummary = () => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
    const pendingAmount = invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    return { totalInvoices, totalAmount, paidInvoices, overdueInvoices, pendingAmount };
  };

  const summary = getInvoiceSummary();

  if (loading) {
    return (
      <Box>
        <DashboardHeader />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Dashboard Header */}
      <DashboardHeader />
      
      <Box sx={{ p: 3, backgroundColor: '#EEF3FB', minHeight: 'calc(100vh - 64px)' }}>
      {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon sx={{ color: '#3BB2FF', fontSize: 28 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1A202C' }}>
              {t('Invoice Management')}
        </Typography>
      </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchInvoicesData}
            sx={{ ml: 2 }}
          >
            {t('Refresh')}
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExportInvoices('csv')}
            sx={{ ml: 1 }}
          >
            {t('Export CSV')}
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExportInvoices('json')}
            sx={{ ml: 1 }}
          >
            {t('Export JSON')}
          </Button>

      </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Invoice Statistics Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white',
                height: '100%'
              }}>
            <CardContent>
                  <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                    {t('Total Invoices')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.totalInvoices || 0}
                  </Typography>
            </CardContent>
          </Card>
        </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                color: 'white',
                height: '100%'
              }}>
            <CardContent>
                  <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                    {t('Paid Invoices')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.paidInvoices || 0}
                  </Typography>
            </CardContent>
          </Card>
        </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                color: 'white',
                height: '100%'
              }}>
            <CardContent>
                  <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                    {t('Total Revenue')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ${(stats?.totalRevenue || 0).toFixed(2)}
                  </Typography>
            </CardContent>
          </Card>
        </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
                color: 'white',
                height: '100%'
              }}>
            <CardContent>
                  <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                    {t('Overdue Invoices')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.overdueInvoices || 0}
                  </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder={t('Search invoices...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('Status')}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t('Status')}
                  onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('All Statuses')}</MenuItem>
                  <MenuItem value="draft">{t('Draft')}</MenuItem>
                  <MenuItem value="sent">{t('Sent')}</MenuItem>
                  <MenuItem value="paid">{t('Paid')}</MenuItem>
                  <MenuItem value="overdue">{t('Overdue')}</MenuItem>
                  <MenuItem value="cancelled">{t('Cancelled')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('Date Filter')}</InputLabel>
                <Select
                  value={dateFilter}
                  label={t('Date Filter')}
                  onChange={(e: SelectChangeEvent) => setDateFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('All Dates')}</MenuItem>
                  <MenuItem value="overdue">{t('Overdue')}</MenuItem>
                  <MenuItem value="due_soon">{t('Due Soon')}</MenuItem>
                  <MenuItem value="recent">{t('Recent')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedInvoice(null);
                  setCreateForm({
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    dueDate: '',
                    paymentTerms: 'Net 30',
                    notes: '',
                    items: [],
                    tax: 0,
                    discount: 0,
                    status: 'draft',
                    // Additional fields
                    invoiceNumber: '',
                    invoiceType: 'SALE',
                    title: '',
                    description: '',
                    subtotal: 0,
                    total: 0,
                    paidAmount: 0,
                    balance: 0,
                    issuedAt: '',
                    sentAt: '',
                    viewedAt: '',
                    paidAt: '',
                    tags: '',
                    customerNotes: '',
                    internalNotes: ''
                  });
                  setCreateDialog(true);
                }}
              >
                {t('New Invoice')}
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
              >
                {t('Export')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>{t('Invoice')}</strong></TableCell>
                  <TableCell><strong>{t('Customer')}</strong></TableCell>
                  <TableCell><strong>{t('Amount')}</strong></TableCell>
                  <TableCell><strong>{t('Status')}</strong></TableCell>
                  <TableCell><strong>{t('Issue Date')}</strong></TableCell>
                  <TableCell><strong>{t('Due Date')}</strong></TableCell>
                  <TableCell><strong>{t('Actions')}</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: '#3BB2FF' }}>
                          <ReceiptIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {invoice.invoiceNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('ID')}: {invoice.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {invoice.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.customerEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${(invoice.total || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('Tax')}: ${(invoice.tax || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(invoice.status)}
                        color={getStatusColor(invoice.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, invoice)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          console.log('🔍 Menu onClose called');
          handleMenuClose();
        }}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <ViewIcon sx={{ mr: 1 }} />
          {t('View Details')}
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>
          <EditIcon sx={{ mr: 1 }} />
          {t('Edit Invoice')}
        </MenuItem>
        <MenuItem onClick={() => handleAction('download')}>
          <DownloadIcon sx={{ mr: 1 }} />
          {t('Download PDF')}
        </MenuItem>
        <MenuItem onClick={() => handleAction('email')}>
          <EmailIcon sx={{ mr: 1 }} />
          {t('Send Email')}
        </MenuItem>
        <MenuItem onClick={() => handleAction('print')}>
          <PrintIcon sx={{ mr: 1 }} />
          {t('Print')}
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('Delete Invoice')}
        </MenuItem>
      </Menu>

      {/* Create/Edit Invoice Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {t('Create New Invoice')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Customer Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Customer Name')}
                  value={createForm.customerName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                  error={!createForm.customerName}
                  helperText={!createForm.customerName ? t('Customer name is required') : ''}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Customer Email')}
                  type="email"
                  value={createForm.customerEmail}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Customer Phone')}
                  value={createForm.customerPhone}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Due Date')}
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              {/* Payment Terms */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('Payment Terms')}</InputLabel>
                  <Select
                    value={createForm.paymentTerms}
                    label={t('Payment Terms')}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  >
                    <MenuItem value="Net 15">{t('Net 15 days')}</MenuItem>
                    <MenuItem value="Net 30">{t('Net 30 days')}</MenuItem>
                    <MenuItem value="Net 60">{t('Net 60 days')}</MenuItem>
                    <MenuItem value="Due on Receipt">{t('Due on Receipt')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('Status')}</InputLabel>
                  <Select
                    value={createForm.status}
                    label={t('Status')}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="draft">{t('Draft')}</MenuItem>
                    <MenuItem value="sent">{t('Sent')}</MenuItem>
                    <MenuItem value="paid">{t('Paid')}</MenuItem>
                    <MenuItem value="overdue">{t('Overdue')}</MenuItem>
                    <MenuItem value="cancelled">{t('Cancelled')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Tax and Discount */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('Tax (%)')}
                  type="number"
                  value={createForm.tax || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('Discount (%)')}
                  type="number"
                  value={createForm.discount || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Invoice Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  {t('Invoice Information')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Invoice Number')}
                  value={createForm.invoiceNumber}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  placeholder="Auto-generated if empty"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('Invoice Type')}</InputLabel>
                  <Select
                    value={createForm.invoiceType}
                    label={t('Invoice Type')}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, invoiceType: e.target.value }))}
                  >
                    <MenuItem value="SALE">{t('Sale')}</MenuItem>
                    <MenuItem value="SERVICE">{t('Service')}</MenuItem>
                    <MenuItem value="REPAIR">{t('Repair')}</MenuItem>
                    <MenuItem value="REFUND">{t('Refund')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Title')}
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Invoice title"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Tags')}
                  value={createForm.tags}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., urgent, repair, warranty"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Description')}
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={2}
                  placeholder="Invoice description"
                />
              </Grid>

              {/* Invoice Items Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  {t('Invoice Items')}
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('Description')}</TableCell>
                            <TableCell align="right">{t('Quantity')}</TableCell>
                            <TableCell align="right">{t('Unit Price')}</TableCell>
                            <TableCell align="right">{t('Total')}</TableCell>
                            <TableCell align="center">{t('Actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {createForm.items.map((item, index) => (
                            <TableRow key={item.id || index}>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={item.description}
                                  onChange={(e) => {
                                    const newItems = [...createForm.items];
                                    newItems[index] = { ...item, description: e.target.value };
                                    setCreateForm(prev => ({ ...prev, items: newItems }));
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newItems = [...createForm.items];
                                    const quantity = parseInt(e.target.value) || 0;
                                    newItems[index] = { 
                                      ...item, 
                                      quantity,
                                      total: quantity * item.unitPrice
                                    };
                                    setCreateForm(prev => ({ ...prev, items: newItems }));
                                  }}
                                  sx={{ width: 80 }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => {
                                    const newItems = [...createForm.items];
                                    const unitPrice = parseFloat(e.target.value) || 0;
                                    newItems[index] = { 
                                      ...item, 
                                      unitPrice,
                                      total: item.quantity * unitPrice
                                    };
                                    setCreateForm(prev => ({ ...prev, items: newItems }));
                                  }}
                                  sx={{ width: 100 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  ${(item.total || 0).toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const newItems = createForm.items.filter((_, i) => i !== index);
                                    setCreateForm(prev => ({ ...prev, items: newItems }));
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const newItem: InvoiceItem = {
                          id: `item-${Date.now()}`,
                          description: '',
                          quantity: 1,
                          unitPrice: 0,
                          total: 0
                        };
                        setCreateForm(prev => ({ 
                          ...prev, 
                          items: [...prev.items, newItem] 
                        }));
                      }}
                      sx={{ mt: 2 }}
                    >
                      {t('Add Item')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Calculated Totals */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  {t('Calculated Totals')}
                </Typography>
                <Card variant="outlined" sx={{ bgcolor: '#f8f9fa' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1">
                            {t('Subtotal')}:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            ${createForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1">
                            {t('Tax')} ({createForm.tax}%):
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            ${((createForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) * createForm.tax) / 100).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1">
                            {t('Discount')} ({createForm.discount}%):
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            -${((createForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) * createForm.discount) / 100).toFixed(2)}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {t('Total')}:
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            ${(createForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) + 
                                (createForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) * createForm.tax) / 100 - 
                                (createForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) * createForm.discount) / 100).toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Additional Fields */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  {t('Additional Information')}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Customer Notes')}
                  value={createForm.customerNotes}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, customerNotes: e.target.value }))}
                  multiline
                  rows={2}
                  placeholder={t('Notes visible to customer...')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Internal Notes')}
                  value={createForm.internalNotes}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, internalNotes: e.target.value }))}
                  multiline
                  rows={2}
                  placeholder={t('Internal notes (not visible to customer)...')}
                />
              </Grid>

              {/* Invoice Dates */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('Issued At')}
                  type="date"
                  value={createForm.issuedAt}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, issuedAt: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('Sent At')}
                  type="date"
                  value={createForm.sentAt}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, sentAt: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('Viewed At')}
                  type="date"
                  value={createForm.viewedAt}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, viewedAt: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('Paid At')}
                  type="date"
                  value={createForm.paidAt}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, paidAt: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Payment Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Paid Amount')}
                  type="number"
                  value={createForm.paidAmount || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) || 0 }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Balance')}
                  type="number"
                  value={createForm.balance || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Notes')}
                  value={createForm.notes}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                  multiline
                  rows={3}
                  placeholder={t('Additional notes for this invoice...')}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveInvoice}
            disabled={loading}
          >
            {t('Create Invoice')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => {
          setEditDialog(false);
          setSelectedInvoice(null);
          setIsEditing(false);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {t('Edit Invoice')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Invoice Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  {t('Invoice Information')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Invoice Number')}
                  value={editForm.invoiceNumber}
                  onChange={(e) => setEditForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('Invoice Type')}</InputLabel>
                  <Select
                    value={editForm.invoiceType}
                    label={t('Invoice Type')}
                    onChange={(e) => setEditForm(prev => ({ ...prev, invoiceType: e.target.value }))}
                  >
                    <MenuItem value="SALE">{t('Sale')}</MenuItem>
                    <MenuItem value="SERVICE">{t('Service')}</MenuItem>
                    <MenuItem value="REPAIR">{t('Repair')}</MenuItem>
                    <MenuItem value="REFUND">{t('Refund')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Title')}
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Tags')}
                  value={editForm.tags}
                  onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., urgent, repair, warranty"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Description')}
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Customer Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  {t('Customer Information')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Customer Name')}
                  value={editForm.customerName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                  error={!editForm.customerName}
                  helperText={!editForm.customerName ? t('Customer name is required') : ''}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Customer Email')}
                  type="email"
                  value={editForm.customerEmail}
                  onChange={(e) => setEditForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Customer Phone')}
                  value={editForm.customerPhone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Due Date')}
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              {/* Payment Terms */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('Payment Terms')}</InputLabel>
                  <Select
                    value={editForm.paymentTerms}
                    label={t('Payment Terms')}
                    onChange={(e) => setEditForm(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  >
                    <MenuItem value="Net 15">{t('Net 15 days')}</MenuItem>
                    <MenuItem value="Net 30">{t('Net 30 days')}</MenuItem>
                    <MenuItem value="Net 60">{t('Net 60 days')}</MenuItem>
                    <MenuItem value="Due on Receipt">{t('Due on Receipt')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('Status')}</InputLabel>
                  <Select
                    value={editForm.status}
                    label={t('Status')}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="draft">{t('Draft')}</MenuItem>
                    <MenuItem value="sent">{t('Sent')}</MenuItem>
                    <MenuItem value="paid">{t('Paid')}</MenuItem>
                    <MenuItem value="overdue">{t('Overdue')}</MenuItem>
                    <MenuItem value="cancelled">{t('Cancelled')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Tax and Discount */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('Tax (%)')}
                  type="number"
                  value={editForm.tax || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('Discount (%)')}
                  type="number"
                  value={editForm.discount || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Invoice Items Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  {t('Invoice Items')}
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('Description')}</TableCell>
                            <TableCell align="right">{t('Quantity')}</TableCell>
                            <TableCell align="right">{t('Unit Price')}</TableCell>
                            <TableCell align="right">{t('Total')}</TableCell>
                            <TableCell align="center">{t('Actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {editForm.items.map((item, index) => (
                            <TableRow key={item.id || index}>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={item.description}
                                  onChange={(e) => {
                                    const newItems = [...editForm.items];
                                    newItems[index] = { ...item, description: e.target.value };
                                    setEditForm(prev => ({ ...prev, items: newItems }));
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newItems = [...editForm.items];
                                    const quantity = parseInt(e.target.value) || 0;
                                    newItems[index] = { 
                                      ...item, 
                                      quantity,
                                      total: quantity * item.unitPrice
                                    };
                                    setEditForm(prev => ({ ...prev, items: newItems }));
                                  }}
                                  sx={{ width: 80 }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => {
                                    const newItems = [...editForm.items];
                                    const unitPrice = parseFloat(e.target.value) || 0;
                                    newItems[index] = { 
                                      ...item, 
                                      unitPrice,
                                      total: item.quantity * unitPrice
                                    };
                                    setEditForm(prev => ({ ...prev, items: newItems }));
                                  }}
                                  sx={{ width: 100 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  ${(item.total || 0).toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const newItems = editForm.items.filter((_, i) => i !== index);
                                    setEditForm(prev => ({ ...prev, items: newItems }));
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const newItem: InvoiceItem = {
                          id: `item-${Date.now()}`,
                          description: '',
                          quantity: 1,
                          unitPrice: 0,
                          total: 0
                        };
                        setEditForm(prev => ({ 
                          ...prev, 
                          items: [...prev.items, newItem] 
                        }));
                      }}
                      sx={{ mt: 2 }}
                    >
                      {t('Add Item')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Calculated Totals */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  {t('Calculated Totals')}
                </Typography>
                <Card variant="outlined" sx={{ bgcolor: '#f8f9fa' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1">
                            {t('Subtotal')}:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            ${editForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1">
                            {t('Tax')} ({editForm.tax}%):
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            ${((editForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) * editForm.tax) / 100).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1">
                            {t('Discount')} ({editForm.discount}%):
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            -${((editForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) * editForm.discount) / 100).toFixed(2)}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {t('Total')}:
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            ${(editForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) + 
                                (editForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) * editForm.tax) / 100 - 
                                (editForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) * editForm.discount) / 100).toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Additional Fields */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  {t('Additional Information')}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Customer Notes')}
                  value={editForm.customerNotes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, customerNotes: e.target.value }))}
                  multiline
                  rows={2}
                  placeholder={t('Notes visible to customer...')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Internal Notes')}
                  value={editForm.internalNotes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, internalNotes: e.target.value }))}
                  multiline
                  rows={2}
                  placeholder={t('Internal notes (not visible to customer)...')}
                />
              </Grid>

              {/* Invoice Dates */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('Issued At')}
                  type="date"
                  value={editForm.issuedAt}
                  onChange={(e) => setEditForm(prev => ({ ...prev, issuedAt: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('Sent At')}
                  type="date"
                  value={editForm.sentAt}
                  onChange={(e) => setEditForm(prev => ({ ...prev, sentAt: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('Viewed At')}
                  type="date"
                  value={editForm.viewedAt}
                  onChange={(e) => setEditForm(prev => ({ ...prev, viewedAt: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('Paid At')}
                  type="date"
                  value={editForm.paidAt}
                  onChange={(e) => setEditForm(prev => ({ ...prev, paidAt: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Payment Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Paid Amount')}
                  type="number"
                  value={editForm.paidAmount || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) || 0 }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Balance')}
                  type="number"
                  value={editForm.balance || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Notes')}
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  multiline
                  rows={3}
                  placeholder={t('Additional notes for this invoice...')}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialog(false);
            setSelectedInvoice(null);
            setIsEditing(false);
          }}>
            {t('Cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              console.log('🔍 Update Invoice button clicked');
              handleSaveEdit();
            }}
            disabled={loading}
          >
            {t('Update Invoice')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => {
          setViewDialog(false);
          setSelectedInvoice(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {t('Invoice Details')}
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box sx={{ mt: 2 }}>
              {/* Invoice Header */}
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedInvoice.invoiceNumber}
          </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                  <Chip 
                    label={selectedInvoice.status.toUpperCase()} 
                    color={selectedInvoice.status === 'paid' ? 'success' : 
                           selectedInvoice.status === 'overdue' ? 'error' : 'warning'} 
                  />
                </Box>
              </Box>

              {/* Invoice Details Grid */}
              <Grid container spacing={3}>
                {/* Customer Information */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', bgcolor: '#f8f9fa' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: '#3BB2FF', fontWeight: 600 }}>
                        {t('Customer Information')}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Name')}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedInvoice.customerName}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Email')}
                        </Typography>
                        <Typography variant="body1">
                          {selectedInvoice.customerEmail}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Phone')}
                        </Typography>
                        <Typography variant="body1">
                          {selectedInvoice.customerPhone}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Invoice Information */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', bgcolor: '#f8f9fa' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: '#3BB2FF', fontWeight: 600 }}>
                        {t('Invoice Information')}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Issue Date')}
                        </Typography>
                        <Typography variant="body1">
                          {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Due Date')}
                        </Typography>
                        <Typography variant="body1">
                          {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Total Amount')}
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                          ${(selectedInvoice?.total || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Invoice Items */}
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: '#f8f9fa' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: '#3BB2FF', fontWeight: 600 }}>
                        {t('Invoice Items')}
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>{t('Description')}</TableCell>
                              <TableCell align="right">{t('Quantity')}</TableCell>
                              <TableCell align="right">{t('Unit Price')}</TableCell>
                              <TableCell align="right">{t('Total')}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedInvoice.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">${(item.unitPrice || 0).toFixed(2)}</TableCell>
                                <TableCell align="right">${(item.total || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: '#fff3cd', border: '1px solid #ffeaa7' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#d68910', fontWeight: 600 }}>
                          {t('Notes')}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#856404' }}>
                          {selectedInvoice.notes}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            startIcon={<EmailIcon />}
            onClick={() => {
              setViewDialog(false);
              if (selectedInvoice) handleEmailInvoice(selectedInvoice);
            }}
          >
            {t('Email')}
          </Button>
          <Button 
            startIcon={<PrintIcon />}
            onClick={() => {
              setViewDialog(false);
              if (selectedInvoice) handlePrintInvoice(selectedInvoice);
            }}
          >
            {t('Print')}
          </Button>
          <Button onClick={() => {
            setViewDialog(false);
            setSelectedInvoice(null);
          }}>
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="create invoice"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => {
          setSelectedInvoice(null);
          setCreateForm({
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            dueDate: '',
            paymentTerms: 'Net 30',
            notes: '',
            items: [],
            tax: 0,
            discount: 0,
            status: 'draft',
            // Additional fields
            invoiceNumber: '',
            invoiceType: 'SALE',
            title: '',
            description: '',
            subtotal: 0,
            total: 0,
            paidAmount: 0,
            balance: 0,
            issuedAt: '',
            sentAt: '',
            viewedAt: '',
            paidAt: '',
            tags: '',
            customerNotes: '',
            internalNotes: ''
          });
          setCreateDialog(true);
        }}
      >
        <AddIcon />
      </Fab>

      {/* Email Invoice Dialog */}
      <Dialog
        open={emailDialog}
        onClose={() => {
          setEmailDialog(false);
          setSelectedInvoice(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('Send Invoice Email')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label={t('Email Address')}
              value={emailForm.email}
              onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label={t('Subject')}
              value={emailForm.subject}
              onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label={t('Message')}
              value={emailForm.message}
              onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
              multiline
              rows={4}
              sx={{ mb: 2 }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEmailDialog(false);
            setSelectedInvoice(null);
          }}>
            {t('Cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSendEmail}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
          >
            {t('Send Email')}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default InvoicesPage;

