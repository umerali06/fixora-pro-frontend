import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as InvoiceIcon,
  People as CustomerIcon,
  Work as OrderIcon,
  Build as RepairIcon,
  Inventory as ProductIcon,
  Close as CloseIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { searchAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  status?: string;
  amount?: number;
  date: string;
  customerName?: string;
  relevanceScore: number;
  metadata: any;
}

interface SearchFilters {
  query: string;
  type: 'all' | 'invoice' | 'customer' | 'order' | 'repair' | 'product';
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  customerId?: string;
}

interface AdvancedSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  showFilters?: boolean;
  maxResults?: number;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onResultSelect,
  placeholder = "Search invoices, customers, orders...",
  showFilters = true,
  maxResults = 10
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFiltersState, setShowFiltersState] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all'
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchStats, setSearchStats] = useState<any>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const searchTypes = [
    { value: 'all', label: 'All', icon: <SearchIcon /> },
    { value: 'invoice', label: 'Invoices', icon: <InvoiceIcon /> },
    { value: 'customer', label: 'Customers', icon: <CustomerIcon /> },
    { value: 'order', label: 'Orders', icon: <OrderIcon /> },
    { value: 'repair', label: 'Repairs', icon: <RepairIcon /> },
    { value: 'product', label: 'Products', icon: <ProductIcon /> }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' }
  ];

  useEffect(() => {
    // Load recent searches and stats
    loadRecentSearches();
    loadSearchStats();
    
    // Close results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      // Debounce search
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        performSearch();
        loadSuggestions();
      }, 300);
    } else {
      setResults([]);
      setSuggestions([]);
      setShowResults(false);
    }
  }, [query, filters]);

  const loadRecentSearches = async () => {
    try {
      const response = await searchAPI.getRecentSearches();
      if (response.success) {
        setRecentSearches(response.data.map((search: any) => search.query));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const loadSearchStats = async () => {
    try {
      const response = await searchAPI.getSearchStats();
      if (response.success) {
        setSearchStats(response.data);
      }
    } catch (error) {
      console.error('Error loading search stats:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await searchAPI.getSuggestions(query, 5);
      if (response.success) {
        setSuggestions(response.data);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchFilters = {
        ...filters,
        query: query.trim(),
        limit: maxResults
      };

      const response = await searchAPI.search(searchFilters);
      if (response.success) {
        setResults(response.data.results);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowResults(false);
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    }
    setShowResults(false);
  };

  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setShowResults(false);
    setFilters({ query: '', type: 'all' });
  };

  const getResultIcon = (type: string) => {
    const typeConfig = searchTypes.find(t => t.value === type);
    return typeConfig?.icon || <SearchIcon />;
  };

  const getResultColor = (type: string) => {
    const colors: { [key: string]: string } = {
      invoice: '#4CAF50',
      customer: '#2196F3',
      order: '#FF9800',
      repair: '#9C27B0',
      product: '#795548'
    };
    return colors[type] || '#757575';
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box ref={searchRef} sx={{ position: 'relative', width: '100%' }}>
      {/* Search Input */}
      <TextField
        ref={inputRef}
        fullWidth
        value={query}
        onChange={handleQueryChange}
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loading && <CircularProgress size={20} />}
              {query && (
                <IconButton size="small" onClick={clearSearch}>
                  <ClearIcon />
                </IconButton>
              )}
              {showFilters && (
                <IconButton size="small" onClick={() => setShowFiltersState(!showFiltersState)}>
                  <FilterIcon />
                </IconButton>
              )}
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'white'
          }
        }}
      />

      {/* Search Results Dropdown */}
      {showResults && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: '400px',
            overflow: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '12px',
            mt: 1
          }}
        >
          {/* Suggestions */}
          {suggestions.length > 0 && !loading && (
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Suggestions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {suggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      size="small"
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
              <Divider />
            </>
          )}

          {/* Search Results */}
          {results.length > 0 ? (
            <List sx={{ p: 0 }}>
              {results.map((result, index) => (
                <ListItem
                  key={`${result.type}-${result.id}`}
                  button
                  onClick={() => handleResultClick(result)}
                  sx={{
                    '&:hover': { backgroundColor: '#F5F5F5' },
                    borderBottom: index < results.length - 1 ? '1px solid #E0E0E0' : 'none'
                  }}
                >
                  <ListItemIcon sx={{ color: getResultColor(result.type) }}>
                    {getResultIcon(result.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {result.title}
                        </Typography>
                        <Chip
                          label={result.type}
                          size="small"
                          sx={{
                            backgroundColor: getResultColor(result.type),
                            color: 'white',
                            fontSize: '0.7rem'
                          }}
                        />
                        {result.status && (
                          <Chip
                            label={result.status}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {result.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          {result.amount && (
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {formatAmount(result.amount)}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(result.date)}
                          </Typography>
                          {result.customerName && (
                            <Typography variant="caption" color="text.secondary">
                              • {result.customerName}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  <ArrowIcon sx={{ color: 'text.secondary' }} />
                </ListItem>
              ))}
            </List>
          ) : !loading && query && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No results found for "{query}"
              </Typography>
            </Box>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Searching...
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Advanced Filters Dialog */}
      <Dialog
        open={showFiltersState}
        onClose={() => setShowFiltersState(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Advanced Search Filters
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Search Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  {searchTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date From"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date To"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Min Amount"
                type="number"
                value={filters.amountMin || ''}
                onChange={(e) => handleFilterChange('amountMin', parseFloat(e.target.value) || undefined)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Amount"
                type="number"
                value={filters.amountMax || ''}
                onChange={(e) => handleFilterChange('amountMax', parseFloat(e.target.value) || undefined)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFiltersState(false)}>Cancel</Button>
          <Button onClick={clearSearch}>Clear All</Button>
          <Button variant="contained" onClick={() => setShowFiltersState(false)}>
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedSearch;
