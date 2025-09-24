import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  List,
  ListItem,
  Badge,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications,
  Person as PersonIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  PlayArrow as PlayArrowIcon,
  FilterList as FilterListIcon,
  Menu as MenuIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import LanguageSwitch from '../common/LanguageSwitch';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDrawer from '../Notifications/NotificationDrawer';

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
}

interface FilterState {
  dateRange: string;
  status: string[];
  priority: string[];
  category: string[];
  amountRange: [number, number];
  assignedTo: string[];
  tags: string[];
}

type FilterValue = string | string[] | [number, number] | number;

interface FilterPreset {
  id: number;
  name: string;
  filters: Partial<FilterState>;
}

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: string;
  action: string;
}

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  action: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Get user data from Redux store
  const { user } = useAppSelector((state) => state.auth);
  
  // Dropdown menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Notification context
  const { unreadCount, openDrawer } = useNotifications();

  // Help drawer state
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);

  // Filter drawer state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    dateRange: 'all',
    status: [],
    priority: [],
    category: [],
    amountRange: [0, 10000],
    assignedTo: [],
    tags: []
  });
  const [filterPresets] = useState<FilterPreset[]>([
    { id: 1, name: 'High Priority Jobs', filters: { priority: ['high'], status: ['in_progress'] } },
    { id: 2, name: 'Overdue Items', filters: { status: ['overdue'] } },
    { id: 3, name: 'This Week', filters: { dateRange: 'week' } },
    { id: 4, name: 'Low Stock', filters: { category: ['inventory'], status: ['low_stock'] } }
  ]);
  
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    try {
      await dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleClose();
  };
  
  const handleProfile = () => {
    // Add profile navigation logic here
    console.log('Profile clicked');
    handleClose();
  };
  
  const handleSettings = () => {
    // Add settings navigation logic here
    console.log('Settings clicked');
    handleClose();
  };
  
  // Helper function to get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'MANAGER':
        return 'Manager';
      case 'STAFF':
        return 'Staff Member';
      case 'CASHIER':
        return 'Cashier';
      case 'TECHNICIAN':
        return 'Technician';
      default:
        return role;
    }
  };

  // Search functionality with NLP support
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // NLP-powered search function
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Simulate NLP-powered search with intelligent query processing
      const results = await performNLPSearch(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Advanced NLP search implementation
  const performNLPSearch = async (query: string): Promise<SearchResult[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // NLP query processing - extract intent and entities
    const processedQuery = processQueryWithNLP(query);
    
    // Simulate search results based on query intent
    return generateSearchResults(processedQuery);
  };

  // NLP query processing
  const processQueryWithNLP = (query: string): { intent: string; entities: string[]; originalQuery: string } => {
    const lowerQuery = query.toLowerCase();
    
    // Extract search intent
    let intent = 'general';
    let entities: string[] = [];
    
    // Customer-related queries
    if (lowerQuery.includes('customer') || lowerQuery.includes('client') || lowerQuery.includes('contact')) {
      intent = 'customers';
      entities = extractEntities(lowerQuery, ['customer', 'client', 'contact', 'phone', 'email']);
    }
    // Job/Repair queries
    else if (lowerQuery.includes('job') || lowerQuery.includes('repair') || lowerQuery.includes('ticket')) {
      intent = 'jobs';
      entities = extractEntities(lowerQuery, ['job', 'repair', 'ticket', 'status', 'device']);
    }
    // Inventory queries
    else if (lowerQuery.includes('stock') || lowerQuery.includes('inventory') || lowerQuery.includes('part')) {
      intent = 'inventory';
      entities = extractEntities(lowerQuery, ['stock', 'inventory', 'part', 'quantity', 'price']);
    }
    // Invoice queries
    else if (lowerQuery.includes('invoice') || lowerQuery.includes('payment') || lowerQuery.includes('bill')) {
      intent = 'invoices';
      entities = extractEntities(lowerQuery, ['invoice', 'payment', 'bill', 'amount', 'date']);
    }
    
    return { intent, entities, originalQuery: query };
  };

  // Extract entities from query
  const extractEntities = (query: string, keywords: string[]): string[] => {
    const entities: string[] = [];
    keywords.forEach(keyword => {
      if (query.includes(keyword)) {
        entities.push(keyword);
      }
    });
    return entities;
  };

  // Generate search results based on NLP processing
  const generateSearchResults = (processedQuery: { intent: string; entities: string[]; originalQuery: string }): SearchResult[] => {
    const { intent, originalQuery } = processedQuery;
    
    // Simulate database results based on intent
    switch (intent) {
      case 'customers':
        return [
          { type: 'customer', id: '1', title: 'John Doe', subtitle: 'Customer', description: 'Phone: +1-555-0123', action: 'View Customer' },
          { type: 'customer', id: '2', title: 'Jane Smith', subtitle: 'Customer', description: 'Email: jane@email.com', action: 'View Customer' }
        ];
      case 'jobs':
        return [
          { type: 'job', id: '1', title: 'iPhone Repair #1234', subtitle: 'In Progress', description: 'Device: iPhone 12, Issue: Screen', action: 'View Job' },
          { type: 'job', id: '2', title: 'Laptop Repair #5678', subtitle: 'Completed', description: 'Device: MacBook Pro, Issue: Battery', action: 'View Job' }
        ];
      case 'inventory':
        return [
          { type: 'inventory', id: '1', title: 'iPhone Screen', subtitle: 'In Stock', description: 'Quantity: 15, Price: $89.99', action: 'View Item' },
          { type: 'inventory', id: '2', title: 'Laptop Battery', subtitle: 'Low Stock', description: 'Quantity: 3, Price: $129.99', action: 'View Item' }
        ];
      case 'invoices':
        return [
          { type: 'invoice', id: '1', title: 'Invoice #INV-001', subtitle: 'Paid', description: 'Amount: $299.99, Date: 2024-01-15', action: 'View Invoice' },
          { type: 'invoice', id: '2', title: 'Invoice #INV-002', subtitle: 'Pending', description: 'Amount: $149.99, Date: 2024-01-16', action: 'View Invoice' }
        ];
      default:
        return [
          { type: 'general', id: '1', title: 'Search Results', subtitle: 'Multiple Categories', description: `Found results for "${originalQuery}"`, action: 'View All Results' }
        ];
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    // Debounce search to avoid too many API calls
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  // Search timeout ref
  const searchTimeout = React.useRef<NodeJS.Timeout>();

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // Close search results when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchBox = document.querySelector('[data-search-box]');
      if (searchBox && !searchBox.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search result click
  const handleSearchResultClick = (result: SearchResult) => {
    console.log('Search result clicked:', result);
    
    // Navigate based on result type
    switch (result.type) {
      case 'customer':
        navigate('/contacts');
        break;
      case 'job':
        navigate('/jobs');
        break;
      case 'inventory':
        navigate('/stock');
        break;
      case 'invoice':
        navigate('/invoices');
        break;
      default:
        // Show general search results
        console.log('Showing general search results for:', result.title);
    }
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };

  // Button click handlers
  const handleHowToStart = () => {
    // Navigate to onboarding/tutorial page
    navigate('/onboarding');
    console.log('How to start clicked - navigating to onboarding');
  };

  const handleHelpClick = () => {
    // Open help drawer
    setHelpDrawerOpen(true);
    console.log('Help clicked - opening help drawer');
  };

  const handleFilterClick = () => {
    setFilterDrawerOpen(true);
  };

  // Filter functionality
  const handleFilterChange = (filterType: keyof FilterState, value: FilterValue) => {
    setActiveFilters((prev: FilterState) => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleFilterPreset = (preset: FilterPreset) => {
    setActiveFilters((prev: FilterState) => ({
      ...prev,
      ...preset.filters
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      dateRange: 'all',
      status: [],
      priority: [],
      category: [],
      amountRange: [0, 10000],
      assignedTo: [],
      tags: []
    });
  };

  const applyFilters = () => {
    // In real app, this would trigger a filtered data fetch
    console.log('Applying filters:', activeFilters);
    
    // Simulate filter application
    const filteredData = applyFiltersToData(activeFilters);
    console.log('Filtered results:', filteredData);
    
    // Close filter drawer
    setFilterDrawerOpen(false);
    
    // Show success message (in real app, this would update the dashboard)
    alert(`Filters applied! Found ${filteredData.length} results.`);
  };

  // Simulate filtering data (in real app, this would be API call)
  const applyFiltersToData = (filters: FilterState) => {
    // Mock data for demonstration
    const mockData = [
      { id: 1, title: 'iPhone Repair', status: 'in_progress', priority: 'high', category: 'repair', amount: 299, assignedTo: 'John', tags: ['urgent'] },
      { id: 2, title: 'Laptop Service', status: 'completed', priority: 'medium', category: 'service', amount: 150, assignedTo: 'Jane', tags: ['maintenance'] },
      { id: 3, title: 'Screen Replacement', status: 'pending', priority: 'low', category: 'repair', amount: 89, assignedTo: 'Mike', tags: ['parts'] }
    ];

    let filtered = mockData;

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(item => filters.status.includes(item.status));
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(item => filters.priority.includes(item.priority));
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(item => filters.category.includes(item.category));
    }

    // Apply amount range filter
    filtered = filtered.filter(item => 
      item.amount >= filters.amountRange[0] && item.amount <= filters.amountRange[1]
    );

    // Apply assigned to filter
    if (filters.assignedTo.length > 0) {
      filtered = filtered.filter(item => filters.assignedTo.includes(item.assignedTo));
    }

    return filtered;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.values(activeFilters).forEach((value: FilterValue) => {
      if (Array.isArray(value) && value.length > 0) count += value.length;
      else if (typeof value === 'string' && value !== 'all') count += 1;
      else if (typeof value === 'number' && value !== 0) count += 1;
    });
    return count;
  };

  const handleNotificationsClick = () => {
    openDrawer();
  };


  return (
     <Box sx={{ 
       position: 'sticky',
       top: 0,
       backgroundColor: '#F9FAFB',
       borderBottom: '1px solid #E5E7EB',
       height: '64px',
       width: '100%',
       zIndex: 1000,
       boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
       '@keyframes spin': {
         '0%': { transform: 'rotate(0deg)' },
         '100%': { transform: 'rotate(360deg)' }
       }
     }}>
      {/* Header Content */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        maxWidth: '1360px',
        mx: 'auto'
      }}>
        {/* Left Side - Mobile Menu + Welcome Message */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Mobile Menu Button */}
          {(isMobile || isTablet) && (
            <IconButton
              onClick={onMenuToggle}
              sx={{
                backgroundColor: '#3B82F6',
                color: 'white',
                width: 36,
                height: 36,
                '&:hover': { backgroundColor: '#2563EB' }
              }}
            >
              <MenuIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          )}
          
                                          {/* Welcome Message */}
                 <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column' }}>
                   <Typography sx={{ 
                     fontSize: { xs: '14px', sm: '16px' }, 
                     fontWeight: 600, 
                     color: '#1F2937',
                     lineHeight: 1.2
                   }}>
                     Welcome {user?.firstName || 'FIXORA PRO'}
                   </Typography>
                   <Typography sx={{ 
                     fontSize: { xs: '12px', sm: '14px' }, 
                     fontWeight: 400, 
                     color: '#6B7280',
                     lineHeight: 1.2
                   }}>
                     {new Date().toLocaleDateString('en-US', { 
                       month: '2-digit', 
                       day: '2-digit', 
                       year: 'numeric' 
                     })} {new Date().toLocaleTimeString('en-US', { 
                       hour: '2-digit', 
                       minute: '2-digit', 
                       second: '2-digit' 
                     })}
                   </Typography>
                 </Box>
        </Box>

                 {/* Center - Global Search */}
         <Box 
           data-search-box
           sx={{ 
             display: { xs: 'none', md: 'flex' },
             position: 'relative',
             alignItems: 'center',
             backgroundColor: '#FFFFFF',
             borderRadius: '12px',
             px: 3,
             py: 1.5,
             minWidth: 400,
             border: '1px solid #E5E7EB',
             boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
           }}
         >
           <SearchIcon sx={{ color: '#9CA3AF', mr: 2, fontSize: '18px' }} />
           <TextField
             placeholder="Search customers, jobs, inventory, invoices..."
             variant="standard"
             size="small"
             value={searchQuery}
             onChange={handleSearchChange}
             sx={{ 
               flex: 1,
               '& .MuiInput-root': {
                 fontSize: '14px',
                 color: '#374151'
               },
               '& .MuiInput-root::before': { borderBottom: 'none' },
               '& .MuiInput-root::after': { borderBottom: 'none' }
             }}
           />
           
           {/* Search Results Dropdown */}
           {searchQuery && searchResults.length > 0 && (
             <Box sx={{
               position: 'absolute',
               top: '100%',
               left: 0,
               right: 0,
               backgroundColor: '#FFFFFF',
               borderRadius: '12px',
               border: '1px solid #E5E7EB',
               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
               mt: 1,
               maxHeight: 400,
               overflow: 'auto',
               zIndex: 1001
             }}>
               {searchResults.map((result, index) => (
                 <Box
                   key={result.id}
                   sx={{
                     p: 2,
                     borderBottom: index < searchResults.length - 1 ? '1px solid #F3F4F6' : 'none',
                     cursor: 'pointer',
                     '&:hover': {
                       backgroundColor: '#F9FAFB'
                     }
                   }}
                   onClick={() => handleSearchResultClick(result)}
                 >
                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <Box>
                       <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151', mb: 0.5 }}>
                         {result.title}
                       </Typography>
                       <Typography sx={{ fontSize: '12px', color: '#6B7280', mb: 0.5 }}>
                         {result.subtitle}
                       </Typography>
                       <Typography sx={{ fontSize: '11px', color: '#9CA3AF' }}>
                         {result.description}
                       </Typography>
                     </Box>
                     <Typography sx={{ 
                       fontSize: '11px', 
                       color: '#3B82F6', 
                       fontWeight: 500,
                       textTransform: 'uppercase'
                     }}>
                       {result.action}
                     </Typography>
                   </Box>
                 </Box>
               ))}
             </Box>
           )}
           
           {/* Loading indicator */}
           {isSearching && (
             <Box sx={{ ml: 2 }}>
               <Box sx={{
                 width: 16,
                 height: 16,
                 border: '2px solid #E5E7EB',
                 borderTop: '2px solid #3B82F6',
                 borderRadius: '50%',
                 animation: 'spin 1s linear infinite'
               }} />
             </Box>
           )}
         </Box>

        {/* Right Side - Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 },
          flexWrap: 'nowrap'
        }}>
                           {/* How to Start Button */}
                 <Button
                   variant="contained"
                   startIcon={<PlayArrowIcon sx={{ fontSize: '16px' }} />}
                   onClick={handleHowToStart}
                   sx={{
                     display: { xs: 'none', xl: 'flex' },
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white',
                     borderRadius: '20px',
                     px: 3,
                     py: 1,
                     textTransform: 'none',
                     fontWeight: 600,
                     fontSize: '13px',
                     minHeight: '36px',
                     '&:hover': {
                       background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                     }
                   }}
                 >
                   How to start?
                 </Button>
          
                           {/* Help Button */}
                 <IconButton
                   onClick={handleHelpClick}
                   sx={{
                     display: { xs: 'none', lg: 'flex' },
                     backgroundColor: '#F3F4F6',
                     color: '#6B7280',
                     width: 36,
                     height: 36,
                     '&:hover': { backgroundColor: '#E5E7EB' }
                   }}
                 >
                   <HelpIcon sx={{ fontSize: '18px' }} />
                 </IconButton>
                 
                                   {/* Filter Button */}
                  <IconButton
                    onClick={handleFilterClick}
                    sx={{
                      display: { xs: 'none', lg: 'flex' },
                      backgroundColor: getActiveFilterCount() > 0 ? '#DBEAFE' : '#F3F4F6',
                      color: getActiveFilterCount() > 0 ? '#1E40AF' : '#6B7280',
                      width: 36,
                      height: 36,
                      '&:hover': { backgroundColor: getActiveFilterCount() > 0 ? '#BFDBFE' : '#E5E7EB' }
                    }}
                  >
                    <Badge badgeContent={getActiveFilterCount()} color="primary" max={99}>
                      <FilterListIcon sx={{ fontSize: '18px' }} />
                    </Badge>
                  </IconButton>
          
                           {/* Notifications */}
                 <IconButton
                   onClick={handleNotificationsClick}
                   sx={{
                     display: { xs: 'none', sm: 'flex' },
                     backgroundColor: '#F3F4F6',
                     color: '#6B7280',
                     width: 36,
                     height: 36,
                     '&:hover': { backgroundColor: '#E5E7EB' }
                   }}
                 >
                   <Badge badgeContent={unreadCount} color="error" max={99}>
                     <Notifications sx={{ fontSize: '18px' }} />
                   </Badge>
                 </IconButton>
          
                 {/* Language Switcher */}
                 <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                   <LanguageSwitch />
                 </Box>
          
                           {/* Profile Section */}
                 <Box 
                   sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: 1.5, 
                     ml: 1,
                     cursor: 'pointer',
                     '&:hover': {
                       opacity: 0.8
                     }
                   }}
                   onClick={handleProfileClick}
                 >
                   <Avatar sx={{ 
                     backgroundColor: '#3B82F6',
                     width: 36,
                     height: 36
                   }}>
                     {user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || <PersonIcon sx={{ fontSize: '18px' }} />}
                   </Avatar>
                   <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
                     <Typography sx={{ 
                       fontSize: '13px',
                       fontWeight: 600,
                       color: '#1F2937',
                       lineHeight: 1.2
                     }}>
                       {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'FIXORA PRO'}
                     </Typography>
                     <Typography sx={{ 
                       fontSize: '11px',
                       fontWeight: 400,
                       color: '#6B7280',
                       lineHeight: 1.2
                     }}>
                       {user ? getRoleDisplayName(user.role) : 'User'}
                     </Typography>
                   </Box>
                   <KeyboardArrowDownIcon sx={{ 
                     color: '#6B7280', 
                     fontSize: '16px',
                     display: { xs: 'none', md: 'block' }
                   }} />
                 </Box>
                 
                 {/* Profile Dropdown Menu */}
                 <Menu
                   anchorEl={anchorEl}
                   open={open}
                   onClose={handleClose}
                   onClick={handleClose}
                   PaperProps={{
                     elevation: 0,
                     sx: {
                       overflow: 'visible',
                       filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                       mt: 1.5,
                       minWidth: 200,
                       borderRadius: '12px',
                       border: '1px solid #E5E7EB',
                       backgroundColor: '#FFFFFF',
                       '& .MuiMenuItem-root': {
                         borderRadius: '8px',
                         margin: '2px 8px',
                         padding: '12px 16px',
                         '&:hover': {
                           backgroundColor: '#F3F4F6',
                         },
                       },
                       '& .MuiListItemIcon-root': {
                         minWidth: '36px',
                         color: '#6B7280',
                       },
                       '& .MuiListItemText-primary': {
                         fontSize: '14px',
                         fontWeight: 500,
                         color: '#374151',
                       },
                       '& .MuiDivider-root': {
                         margin: '8px 16px',
                         borderColor: '#E5E7EB',
                       },
                       '&:before': {
                         content: '""',
                         display: 'block',
                         position: 'absolute',
                         top: 0,
                         right: 14,
                         width: 10,
                         height: 10,
                         bgcolor: 'background.paper',
                         transform: 'translateY(-50%) rotate(45deg)',
                         zIndex: 0,
                         borderLeft: '1px solid #E5E7EB',
                         borderTop: '1px solid #E5E7EB',
                       },
                     },
                   }}
                   transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                   anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                 >
                   <MenuItem onClick={handleProfile}>
                     <ListItemIcon>
                       <AccountCircleIcon fontSize="small" />
                     </ListItemIcon>
                     <ListItemText>Profile</ListItemText>
                   </MenuItem>
                   <MenuItem onClick={handleSettings}>
                     <ListItemIcon>
                       <SettingsIcon fontSize="small" />
                     </ListItemIcon>
                     <ListItemText>Settings</ListItemText>
                   </MenuItem>
                   <Divider />
                   <MenuItem onClick={handleLogout} sx={{ color: '#EF4444' }}>
                     <ListItemIcon>
                       <LogoutIcon fontSize="small" sx={{ color: '#EF4444' }} />
                     </ListItemIcon>
                     <ListItemText>Logout</ListItemText>
                   </MenuItem>
                                    </Menu>
         </Box>
       </Box>

       {/* Notification Drawer */}
       <NotificationDrawer />

        {/* Advanced Filter Drawer */}
        <Drawer
          anchor="right"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 450 },
              backgroundColor: '#FFFFFF',
              boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          {/* Filter Drawer Header */}
          <Box sx={{
            p: 3,
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: '20px', fontWeight: 600, color: '#1F2937' }}>
                Advanced Filters
              </Typography>
              <IconButton
                onClick={() => setFilterDrawerOpen(false)}
                sx={{ color: '#6B7280' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            
            {/* Active filters summary */}
            {getActiveFilterCount() > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Chip
                  label={`${getActiveFilterCount()} active filters`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Button
                  variant="text"
                  size="small"
                  onClick={clearAllFilters}
                  sx={{
                    color: '#EF4444',
                    textTransform: 'none',
                    fontSize: '11px',
                    p: 0,
                    minWidth: 'auto'
                  }}
                >
                  Clear All
                </Button>
              </Box>
            )}
          </Box>

          {/* Filter Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            {/* Filter Presets */}
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', mb: 2 }}>
                Quick Filters
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filterPresets.map((preset) => (
                  <Chip
                    key={preset.id}
                    label={preset.name}
                    size="small"
                    variant="outlined"
                    onClick={() => handleFilterPreset(preset)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#F3F4F6' }
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Date Range Filter */}
            <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
              <AccordionSummary sx={{ backgroundColor: '#F9FAFB' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  Date Range
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Date Range</InputLabel>
                  <Select
                    value={activeFilters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    label="Select Date Range"
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="quarter">This Quarter</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* Status Filter */}
            <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
              <AccordionSummary sx={{ backgroundColor: '#F9FAFB' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  Status
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['pending', 'in_progress', 'completed', 'cancelled', 'overdue'].map((status) => (
                    <FormControlLabel
                      key={status}
                      control={
                        <Checkbox
                          checked={activeFilters.status.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFilterChange('status', [...activeFilters.status, status]);
                            } else {
                              handleFilterChange('status', activeFilters.status.filter((s: string) => s !== status));
                            }
                          }}
                          size="small"
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: '13px', color: '#6B7280', textTransform: 'capitalize' }}>
                          {status.replace('_', ' ')}
                        </Typography>
                      }
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Priority Filter */}
            <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
              <AccordionSummary sx={{ backgroundColor: '#F9FAFB' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  Priority
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['low', 'medium', 'high', 'urgent'].map((priority) => (
                    <FormControlLabel
                      key={priority}
                      control={
                        <Checkbox
                          checked={activeFilters.priority.includes(priority)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFilterChange('priority', [...activeFilters.priority, priority]);
                            } else {
                              handleFilterChange('priority', activeFilters.priority.filter((p: string) => p !== priority));
                            }
                          }}
                          size="small"
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: '13px', color: '#6B7280', textTransform: 'capitalize' }}>
                          {priority}
                        </Typography>
                      }
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Category Filter */}
            <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
              <AccordionSummary sx={{ backgroundColor: '#F9FAFB' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  Category
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['repair', 'service', 'maintenance', 'inventory', 'billing', 'support'].map((category) => (
                    <FormControlLabel
                      key={category}
                      control={
                        <Checkbox
                          checked={activeFilters.category.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFilterChange('category', [...activeFilters.category, category]);
                            } else {
                              handleFilterChange('category', activeFilters.category.filter((c: string) => c !== category));
                            }
                          }}
                          size="small"
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: '13px', color: '#6B7280', textTransform: 'capitalize' }}>
                          {category}
                        </Typography>
                      }
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Amount Range Filter */}
            <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
              <AccordionSummary sx={{ backgroundColor: '#F9FAFB' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  Amount Range
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ px: 2 }}>
                                     <Slider
                     value={activeFilters.amountRange}
                     onChange={(_, value) => handleFilterChange('amountRange', value as [number, number])}
                     valueLabelDisplay="auto"
                     min={0}
                     max={10000}
                     step={100}
                     sx={{ mb: 2 }}
                   />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                                         <TextField
                       label="Min Amount"
                       type="number"
                       value={activeFilters.amountRange[0]}
                       onChange={(e) => handleFilterChange('amountRange', [parseInt(e.target.value) || 0, activeFilters.amountRange[1]] as [number, number])}
                       size="small"
                       sx={{ flex: 1 }}
                     />
                     <TextField
                       label="Max Amount"
                       type="number"
                       value={activeFilters.amountRange[1]}
                       onChange={(e) => handleFilterChange('amountRange', [activeFilters.amountRange[0], parseInt(e.target.value) || 10000] as [number, number])}
                       size="small"
                       sx={{ flex: 1 }}
                     />
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Assigned To Filter */}
            <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
              <AccordionSummary sx={{ backgroundColor: '#F9FAFB' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  Assigned To
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['John', 'Jane', 'Mike', 'Sarah', 'David'].map((person) => (
                    <FormControlLabel
                      key={person}
                      control={
                        <Checkbox
                          checked={activeFilters.assignedTo.includes(person)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFilterChange('assignedTo', [...activeFilters.assignedTo, person]);
                            } else {
                              handleFilterChange('assignedTo', activeFilters.assignedTo.filter((p: string) => p !== person));
                            }
                          }}
                          size="small"
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                          {person}
                        </Typography>
                      }
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Tags Filter */}
            <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
              <AccordionSummary sx={{ backgroundColor: '#F9FAFB' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  Tags
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['urgent', 'maintenance', 'parts', 'warranty', 'express', 'bulk'].map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant={activeFilters.tags.includes(tag) ? "filled" : "outlined"}
                      color={activeFilters.tags.includes(tag) ? "primary" : "default"}
                      onClick={() => {
                        if (activeFilters.tags.includes(tag)) {
                          handleFilterChange('tags', activeFilters.tags.filter((t: string) => t !== tag));
                        } else {
                          handleFilterChange('tags', [...activeFilters.tags, tag]);
                        }
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Filter Drawer Footer */}
          <Box sx={{
            p: 3,
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB'
          }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={clearAllFilters}
                sx={{
                  borderColor: '#D1D5DB',
                  color: '#6B7280',
                  textTransform: 'none'
                }}
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={applyFilters}
                sx={{
                  backgroundColor: '#3B82F6',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#2563EB' }
                }}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
                 </Drawer>

         {/* Help Drawer */}
         <Drawer
           anchor="right"
           open={helpDrawerOpen}
           onClose={() => setHelpDrawerOpen(false)}
           PaperProps={{
             sx: {
               width: { xs: '100%', sm: 500 },
               backgroundColor: '#FFFFFF',
               boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.1)'
             }
           }}
         >
           {/* Help Drawer Header */}
           <Box sx={{
             p: 3,
             borderBottom: '1px solid #E5E7EB',
             backgroundColor: '#F9FAFB'
           }}>
             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
               <Typography sx={{ fontSize: '20px', fontWeight: 600, color: '#1F2937' }}>
                 Help & Support
               </Typography>
               <IconButton
                 onClick={() => setHelpDrawerOpen(false)}
                 sx={{ color: '#6B7280' }}
               >
                 <CloseIcon />
               </IconButton>
             </Box>
           </Box>

           {/* Help Content */}
           <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
             {/* Quick Help Section */}
             <Box sx={{ mb: 4 }}>
               <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', mb: 2 }}>
                 Quick Help
               </Typography>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                 <Button
                   variant="outlined"
                   fullWidth
                   startIcon={<HelpIcon />}
                   onClick={() => window.open('/docs/getting-started', '_blank')}
                   sx={{
                     justifyContent: 'flex-start',
                     textTransform: 'none',
                     borderColor: '#D1D5DB',
                     color: '#374151'
                   }}
                 >
                   Getting Started Guide
                 </Button>
                 <Button
                   variant="outlined"
                   fullWidth
                   startIcon={<SettingsIcon />}
                   onClick={() => window.open('/docs/user-manual', '_blank')}
                   sx={{
                     justifyContent: 'flex-start',
                     textTransform: 'none',
                     borderColor: '#D1D5DB',
                     color: '#374151'
                   }}
                 >
                   User Manual
                 </Button>
                 <Button
                   variant="outlined"
                   fullWidth
                   startIcon={<PersonIcon />}
                   onClick={() => window.open('/docs/faq', '_blank')}
                   sx={{
                     justifyContent: 'flex-start',
                     textTransform: 'none',
                     borderColor: '#D1D5DB',
                     color: '#374151'
                   }}
                 >
                   Frequently Asked Questions
                 </Button>
               </Box>
             </Box>

             {/* Common Tasks Section */}
             <Box sx={{ mb: 4 }}>
               <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', mb: 2 }}>
                 Common Tasks
               </Typography>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                 <Box sx={{
                   p: 2,
                   border: '1px solid #E5E7EB',
                   borderRadius: '8px',
                   backgroundColor: '#F9FAFB'
                 }}>
                   <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', mb: 1 }}>
                     How to create a new repair job?
                   </Typography>
                   <Typography sx={{ fontSize: '12px', color: '#6B7280', mb: 1 }}>
                     1. Go to Jobs section 2. Click "Add New Job" 3. Fill in customer and device details 4. Set priority and estimated completion date
                   </Typography>
                   <Button
                     variant="text"
                     size="small"
                     onClick={() => navigate('/jobs')}
                     sx={{
                       color: '#3B82F6',
                       textTransform: 'none',
                       fontSize: '11px',
                       p: 0,
                       minWidth: 'auto'
                     }}
                   >
                     Go to Jobs
                   </Button>
                 </Box>

                 <Box sx={{
                   p: 2,
                   border: '1px solid #E5E7EB',
                   borderRadius: '8px',
                   backgroundColor: '#F9FAFB'
                 }}>
                   <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', mb: 1 }}>
                     How to manage inventory?
                   </Typography>
                   <Typography sx={{ fontSize: '12px', color: '#6B7280', mb: 1 }}>
                     1. Navigate to Stock section 2. Add new items or update quantities 3. Set low stock alerts 4. Track item costs and suppliers
                   </Typography>
                   <Button
                     variant="text"
                     size="small"
                     onClick={() => navigate('/stock')}
                     sx={{
                       color: '#3B82F6',
                       textTransform: 'none',
                       fontSize: '11px',
                       p: 0,
                       minWidth: 'auto'
                     }}
                   >
                     Go to Stock
                   </Button>
                 </Box>

                 <Box sx={{
                   p: 2,
                   border: '1px solid #E5E7EB',
                   borderRadius: '8px',
                   backgroundColor: '#F9FAFB'
                 }}>
                   <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', mb: 1 }}>
                     How to generate invoices?
                   </Typography>
                   <Typography sx={{ fontSize: '12px', color: '#6B7280', mb: 1 }}>
                     1. Complete a repair job 2. Go to Invoices section 3. Create new invoice from job 4. Add parts and labor costs 5. Send to customer
                   </Typography>
                   <Button
                     variant="text"
                     size="small"
                     onClick={() => navigate('/invoices')}
                     sx={{
                       color: '#3B82F6',
                       textTransform: 'none',
                       fontSize: '11px',
                       p: 0,
                       minWidth: 'auto'
                     }}
                   >
                     Go to Invoices
                   </Button>
                 </Box>
               </Box>
             </Box>

             {/* Support Section */}
             <Box sx={{ mb: 4 }}>
               <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', mb: 2 }}>
                 Need More Help?
               </Typography>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                 <Button
                   variant="contained"
                   fullWidth
                   startIcon={<PersonIcon />}
                   onClick={() => window.open('mailto:support@fixorapro.com', '_blank')}
                   sx={{
                     backgroundColor: '#3B82F6',
                     textTransform: 'none',
                     '&:hover': { backgroundColor: '#2563EB' }
                   }}
                 >
                   Contact Support
                 </Button>
                 <Button
                   variant="outlined"
                   fullWidth
                   startIcon={<HelpIcon />}
                   onClick={() => window.open('/docs', '_blank')}
                   sx={{
                     textTransform: 'none',
                     borderColor: '#D1D5DB',
                     color: '#374151'
                   }}
                 >
                   View Full Documentation
                 </Button>
               </Box>
             </Box>
           </Box>

           {/* Help Drawer Footer */}
           <Box sx={{
             p: 3,
             borderTop: '1px solid #E5E7EB',
             backgroundColor: '#F9FAFB'
           }}>
             <Typography sx={{
               fontSize: '11px',
               color: '#9CA3AF',
               textAlign: 'center'
             }}>
               FIXORA PRO v1.0.0 • Need help? Contact our support team
             </Typography>
           </Box>
        </Drawer>
      </Box>
    );
};

export default DashboardHeader;
