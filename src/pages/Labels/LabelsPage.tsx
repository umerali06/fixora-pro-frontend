import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Preview as PreviewIcon,
  Palette as DesignIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Label as LabelIcon,
  Receipt as ReceiptIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import LabelDesigner from '../../components/LabelDesigner/LabelDesigner';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { labelsAPI } from '../../services/api';
import { useAppSelector } from '../../store/hooks';

interface LabelTemplate {
  id: string;
  name: string;
  type: 'product' | 'invoice' | 'repair' | 'custom';
  width: number;
  height: number;
  design: any[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  printCount: number;
}

interface PrintHistory {
  id: string;
  templateName: string;
  itemCount: number;
  printedAt: string;
  printedBy: string;
  status: 'success' | 'failed';
}

const LabelsPage: React.FC = () => {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [printHistory, setPrintHistory] = useState<PrintHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDesigner, setOpenDesigner] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [previewTemplate, setPreviewTemplate] = useState<LabelTemplate | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, templateId: '', templateName: '' });
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalPrints: 0,
    activeTemplates: 0,
    avgPrintsPerTemplate: 0
  });


  const templateTypes = [
    { value: 'product', label: 'Product Labels', icon: <InventoryIcon />, color: '#4CAF50' },
    { value: 'invoice', label: 'Invoice Labels', icon: <ReceiptIcon />, color: '#2196F3' },
    { value: 'repair', label: 'Repair Labels', icon: <BuildIcon />, color: '#FF9800' },
    { value: 'custom', label: 'Custom Labels', icon: <LabelIcon />, color: '#9C27B0' }
  ];

  useEffect(() => {
    if (isAuthenticated && token) {
    loadTemplates();
    loadPrintHistory();
      loadStats();
    } else {
      setLoading(false);
      setError('Please log in to access label templates');
    }
  }, [isAuthenticated, token, loadTemplates, loadPrintHistory, loadStats]);

  // Auto-refresh preview when templates are updated
  useEffect(() => {
    if (previewTemplate) {
      const latestTemplate = templates.find(t => t.id === previewTemplate.id);
      if (latestTemplate && latestTemplate.updatedAt !== previewTemplate.updatedAt) {
        console.log('🔄 Auto-refreshing preview with updated template data');
        setPreviewTemplate(latestTemplate);
      }
    }
  }, [templates, previewTemplate]);

  const loadTemplates = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setError('Please log in to access label templates');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading templates from backend...');
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = new Date().getTime();
      const data = await labelsAPI.getTemplates({ _t: cacheBuster });
      console.log('📋 Templates received from backend:', data.length, 'templates');
      
      // Transform backend data to frontend format
      const transformedTemplates: LabelTemplate[] = data.map((item: any) => ({
        id: item.id,
        name: item.title || item.name,
        type: item.type || 'custom',
        width: item.width || 50,
        height: item.height || 30,
        design: item.design || [],
        isDefault: item.isDefault || false,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        printCount: item.printCount || 0
      }));
      
      console.log('✅ Transformed templates:', transformedTemplates.length, 'templates');
      setTemplates(transformedTemplates);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Error loading templates:', error);
      if (error.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to load templates. Please try again.');
      }
      showSnackbar('Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const loadPrintHistory = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      const data = await labelsAPI.getPrintHistory();
      setPrintHistory(data || []);
    } catch (error: any) {
      console.error('Error loading print history:', error);
      if (error.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection and try again.');
      }
    }
  }, [isAuthenticated, token]);

  const loadStats = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      const data = await labelsAPI.getStats();
      setStats(data || {
        totalTemplates: 0,
        totalPrints: 0,
        activeTemplates: 0,
        avgPrintsPerTemplate: 0
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
      if (error.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection and try again.');
      }
    }
  }, [isAuthenticated, token]);

  const handleRefresh = () => {
    loadTemplates();
    loadPrintHistory();
    loadStats();
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setNewTemplate({
      name: '',
      type: 'custom',
      width: 50,
      height: 30
    });
    setOpenDesigner(true);
  };

  const handleEditTemplate = (template: LabelTemplate) => {
    setEditingTemplate(template);
    setOpenDesigner(true);
  };

  const handleSaveTemplate = async (templateData: any) => {
    try {
      console.log('🔍 Raw templateData received:', templateData);
      
      // Sanitize templateData to remove any circular references or non-serializable data
      const validTypes: ('product' | 'invoice' | 'repair' | 'custom')[] = ['product', 'invoice', 'repair', 'custom'];
      const sanitizedType = validTypes.includes(templateData.type) ? templateData.type : 'custom';
      
      // Ensure we have a valid name - use 'New Template' as default if empty
      const templateName = templateData.name?.trim() || `New Template ${Date.now()}`;
      
      const sanitizedData = {
        name: templateName,
        type: sanitizedType,
        width: Math.max(10, Math.min(1000, Number(templateData.width) || 50)),
        height: Math.max(10, Math.min(1000, Number(templateData.height) || 30)),
        design: Array.isArray(templateData.design) ? templateData.design : [],
        isDefault: Boolean(templateData.isDefault)
      };
      
      console.log('✅ Sanitized data:', sanitizedData);
      
      // Validate required fields
      if (!sanitizedData.name || sanitizedData.name.trim() === '') {
        throw new Error('Template name is required');
      }
      
      console.log('💾 Saving template:', sanitizedData);
    if (editingTemplate) {
      // Update existing template
        console.log('🔄 Updating template:', editingTemplate.id);
        const apiResponse = await labelsAPI.updateTemplate(editingTemplate.id, sanitizedData);
        console.log('✅ Template updated successfully:', apiResponse);
        
        // Immediately update local state to prevent UI lag
        const updatedTemplate: LabelTemplate = {
          ...editingTemplate,
          name: sanitizedData.name,
          type: sanitizedData.type,
          width: sanitizedData.width,
          height: sanitizedData.height,
          design: sanitizedData.design,
          isDefault: sanitizedData.isDefault,
          updatedAt: new Date().toISOString()
        };

        setTemplates(prevTemplates => 
          prevTemplates.map(template => 
            template.id === editingTemplate.id ? updatedTemplate : template
          )
        );

        // Update preview template if it's currently being previewed
        if (previewTemplate && previewTemplate.id === editingTemplate.id) {
          console.log('🔄 Updating preview template with new data:', updatedTemplate);
          setPreviewTemplate(updatedTemplate);
        }
        
      showSnackbar('Template updated successfully', 'success');
    } else {
      // Create new template
        console.log('➕ Creating new template');
        const newTemplate = await labelsAPI.createTemplate(sanitizedData);
        console.log('✅ Template created successfully:', newTemplate);
      showSnackbar('Template created successfully', 'success');
    }
      
    setOpenDesigner(false);
      setEditingTemplate(null);
      
      // Force refresh data from backend to ensure consistency
      setLastUpdated(new Date());
      await loadTemplates();
      await loadStats();
      
      console.log('🔄 UI refreshed after save');
    } catch (error: any) {
      console.error('❌ Error saving template:', error);
      
      // Handle specific error types
      if (error.message?.includes('circular structure')) {
        showSnackbar('Invalid template data. Please check your input and try again.', 'error');
      } else if (error.message?.includes('required')) {
        showSnackbar(error.message, 'error');
      } else {
        showSnackbar('Failed to save template', 'error');
      }
    }
  };

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    setDeleteDialog({ open: true, templateId, templateName });
  };

  const confirmDeleteTemplate = async () => {
    try {
      console.log('🗑️ Deleting template:', deleteDialog.templateId);
      await labelsAPI.deleteTemplate(deleteDialog.templateId);
      console.log('✅ Template deleted successfully from backend');
      
      // Immediately remove from local state to prevent UI lag
      setTemplates(prevTemplates => 
        prevTemplates.filter(template => template.id !== deleteDialog.templateId)
      );
      
        showSnackbar('Template deleted successfully', 'success');
      
      // Refresh data from backend to ensure consistency
      await loadTemplates();
      await loadStats();
      
      setDeleteDialog({ open: false, templateId: '', templateName: '' });
      console.log('🔄 UI refreshed after deletion');
      } catch (error) {
      console.error('❌ Error deleting template:', error);
        showSnackbar('Failed to delete template', 'error');
      setDeleteDialog({ open: false, templateId: '', templateName: '' });
    }
  };

  const cancelDeleteTemplate = () => {
    setDeleteDialog({ open: false, templateId: '', templateName: '' });
  };

  const handlePrintTemplate = async (template: LabelTemplate, data?: any) => {
    try {
      await labelsAPI.printLabels(template.id, data || {});
      showSnackbar(`Printing ${template.name}...`, 'success');
      loadTemplates();
      loadPrintHistory();
      loadStats();
    } catch (error) {
      console.error('Error printing template:', error);
      showSnackbar('Failed to print template', 'error');
    }
  };

  const handleSetDefault = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        // Send only the fields that the backend expects
        const updateData = {
          name: template.name,
          width: template.width,
          height: template.height,
          design: template.design,
          isDefault: true
        };
        await labelsAPI.updateTemplate(templateId, updateData);
      showSnackbar('Default template updated', 'success');
        loadTemplates();
      }
    } catch (error) {
      console.error('Error setting default template:', error);
      showSnackbar('Failed to set default template', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats.totalTemplates}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Templates
                </Typography>
              </Box>
              <LabelIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats.totalPrints}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Prints
                </Typography>
              </Box>
              <PrintIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats.activeTemplates}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Active Templates
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats.avgPrintsPerTemplate}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Avg per Template
                </Typography>
              </Box>
              <TrendingDownIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTemplates = () => (
    <Grid container spacing={3}>
      {templates.map((template) => {
        const typeConfig = templateTypes.find(t => t.value === template.type);
        return (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card sx={{ 
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: typeConfig?.color + '20',
                    color: typeConfig?.color,
                    mr: 2
                  }}>
                    {typeConfig?.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.width}mm × {template.height}mm
                    </Typography>
                  </Box>
                  {template.isDefault && (
                    <Chip 
                      label="Default" 
                      size="small" 
                      color="primary" 
                      sx={{ borderRadius: '6px' }}
                    />
                  )}
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                      <strong>{template.printCount}</strong> prints
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Updated {new Date(template.updatedAt).toLocaleDateString()}
                  </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    startIcon={<PreviewIcon />}
                    onClick={() => setPreviewTemplate(template)}
                    sx={{ borderRadius: '6px', textTransform: 'none' }}
                  >
                    Preview
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditTemplate(template)}
                    sx={{ borderRadius: '6px', textTransform: 'none' }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<PrintIcon />}
                    onClick={() => handlePrintTemplate(template)}
                    sx={{ borderRadius: '6px', textTransform: 'none' }}
                  >
                    Print
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleSetDefault(template.id)}
                    color={template.isDefault ? 'primary' : 'default'}
                    sx={{ borderRadius: '6px' }}
                  >
                    <SettingsIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTemplate(template.id, template.name)}
                    color="error"
                    sx={{ borderRadius: '6px' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  const renderPrintHistory = () => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Template</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Items</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Printed By</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {printHistory.map((item, index) => (
            <TableRow 
              key={item.id}
              sx={{ 
                '&:hover': { backgroundColor: '#F8FAFC' },
                '&:nth-of-type(even)': { backgroundColor: '#FAFBFC' }
              }}
            >
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {item.templateName}
                </Typography>
              </TableCell>
              <TableCell>
                <Badge badgeContent={item.itemCount} color="primary">
                  <Typography variant="body2">
                    {item.itemCount} labels
                  </Typography>
                </Badge>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {item.printedBy}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {new Date(item.printedAt).toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={item.status}
                  size="small"
                  color={item.status === 'success' ? 'success' : 'error'}
                  sx={{ borderRadius: '6px', textTransform: 'capitalize' }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderTemplateTypes = () => (
    <Grid container spacing={3}>
      {templateTypes.map((type) => (
        <Grid item xs={12} md={6} key={type.value}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => {
              setNewTemplate(prev => ({ ...prev, type: type.value as any }));
              handleCreateTemplate();
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: type.color + '20',
                  color: type.color,
                  mr: 2
                }}>
                  {type.icon}
                </Box>
                <Box>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {type.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create custom {type.label.toLowerCase()}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Design and customize labels for {type.label.toLowerCase()} with our drag-and-drop editor.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#EEF3FB', minHeight: '100vh' }}>
      <DashboardHeader />
      
    <Box sx={{ p: 3 }}>
        {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              backgroundColor: '#3B82F6',
              color: 'white'
            }}>
              <LabelIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1F2937' }}>
          Label Designer
        </Typography>
              <Typography variant="body1" color="text.secondary">
                Create and manage custom labels for your business
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ borderRadius: '8px' }}
            >
              Refresh
            </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
              disabled={!isAuthenticated}
              sx={{ borderRadius: '8px' }}
        >
          Create Template
        </Button>
      </Box>
        </Box>

        {/* Last Updated */}
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Last updated: {lastUpdated.toLocaleString()}
        </Typography>

        {/* Statistics Cards */}
        {renderStatsCards()}

        {/* Authentication Error Alert */}
        {!isAuthenticated && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: '8px' }}>
            Please log in to access label templates and manage your labels.
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        {/* No Data Alert */}
        {!loading && isAuthenticated && templates.length === 0 && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
            No label templates found. Create your first template to get started.
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 48
              }
            }}
          >
            <Tab label="Templates" icon={<LabelIcon />} iconPosition="start" />
            <Tab label="Create New" icon={<DesignIcon />} iconPosition="start" />
            <Tab label="Print History" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Tab Content */}
        {!loading && isAuthenticated && (
          <>
      {activeTab === 0 && renderTemplates()}
      {activeTab === 1 && renderTemplateTypes()}
      {activeTab === 2 && renderPrintHistory()}
          </>
        )}
      </Box>

      {/* Label Designer Dialog */}
      <Dialog 
        open={openDesigner} 
        onClose={() => setOpenDesigner(false)} 
        maxWidth="xl" 
        fullWidth
        fullScreen
      >
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <LabelDesigner
            template={editingTemplate || undefined}
            onSave={handleSaveTemplate}
            onPrint={handlePrintTemplate}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDesigner(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTemplate}>
            Save & Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onClose={() => setPreviewTemplate(null)} maxWidth="md" fullWidth>
        <DialogTitle>Template Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            {/* Template Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {previewTemplate?.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip 
                  label={`${previewTemplate?.width || 50}mm × ${previewTemplate?.height || 30}mm`} 
                  size="small" 
                  color="primary" 
                />
                <Chip 
                  label={previewTemplate?.type || 'custom'} 
                  size="small" 
                  variant="outlined" 
                />
                {previewTemplate?.isDefault && (
                  <Chip 
                    label="Default" 
                    size="small" 
                    color="success" 
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Last updated: {previewTemplate?.updatedAt ? new Date(previewTemplate.updatedAt).toLocaleString() : 'Unknown'}
              </Typography>
            </Box>

            {/* Template Preview */}
            <Box sx={{ textAlign: 'center' }}>
            <Paper
              elevation={2}
              sx={{
                display: 'inline-block',
                p: 2,
                backgroundColor: 'white',
                border: '1px solid #E0E0E0'
              }}
            >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Label Preview
              </Typography>
              <Box sx={{ 
                width: `${previewTemplate?.width || 50}px`, 
                height: `${previewTemplate?.height || 30}px`,
                border: '1px dashed #ccc',
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f9f9f9'
                }}>
                  <Typography variant="caption" color="text.secondary">
                    {previewTemplate?.name || 'Template'}
                  </Typography>
                </Box>
            </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewTemplate(null)}>Close</Button>
          <Button 
            onClick={() => {
              // Refresh preview with latest template data
              const latestTemplate = templates.find(t => t.id === previewTemplate?.id);
              if (latestTemplate) {
                setPreviewTemplate(latestTemplate);
              }
            }}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PrintIcon />}
            onClick={() => previewTemplate && handlePrintTemplate(previewTemplate)}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={cancelDeleteTemplate} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "{deleteDialog.templateName}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteTemplate} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteTemplate} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LabelsPage;
