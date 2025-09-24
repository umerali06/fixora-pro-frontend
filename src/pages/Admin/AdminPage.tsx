import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import SettingsPage from '../Settings/SettingsPage';
import NotificationSettings from '../../components/Notifications/NotificationSettings';
import { adminAPI } from '../../services/api';
import { getOrgIdFromToken } from '../../utils/auth';
import toast from 'react-hot-toast';

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  title: string | null;
  department: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Array<{
    role: {
      name: string;
      description: string;
    };
  }>;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string;
  isSystem: boolean;
  createdAt: string;
  _count: {
    userRoles: number;
  };
}

interface AdminStats {
  totalUsers: number;
  totalCustomers: number;
  totalJobs: number;
  totalRevenue: number;
  activeJobs: number;
  completedJobsThisMonth: number;
}

interface CreateUserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  title: string;
  department: string;
  roleName: string;
}

// Main Component
const AdminPage: React.FC = () => {
  const { } = useOutletContext<{ sidebarOpen: boolean }>();
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Dialog states
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [createRoleDialog, setCreateRoleDialog] = useState(false);
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [editRoleDialog, setEditRoleDialog] = useState(false);
  const [viewUserDialog, setViewUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // Form states
  const [createUserForm, setCreateUserForm] = useState<CreateUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    title: '',
    department: '',
    roleName: ''
  });

  const [editUserForm, setEditUserForm] = useState<CreateUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    title: '',
    department: '',
    roleName: ''
  });
  
  const [createRoleForm, setCreateRoleForm] = useState({
    name: '',
    description: '',
    permissions: ''
  });

  const [editRoleForm, setEditRoleForm] = useState({
    name: '',
    description: '',
    permissions: ''
  });
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Bulk actions
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');


  // Fetch admin data
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const orgId = getOrgIdFromToken();
      if (!orgId) {
        setError('Organization ID not found. Please log in again.');
        return;
      }

      const [usersData, rolesData, statsData] = await Promise.all([
        adminAPI.getUsers({ orgId }),
        adminAPI.getRoles({ orgId }),
        adminAPI.getDashboardStats({ orgId })
      ]);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setStats(statsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const handleCreateUser = async () => {
    try {
      if (!createUserForm.firstName || !createUserForm.lastName || !createUserForm.email || !createUserForm.password || !createUserForm.roleName) {
        toast.error('First name, last name, email, password, and role are required');
        return;
      }

      const orgId = getOrgIdFromToken();
      if (!orgId) {
        toast.error('Organization ID not found. Please log in again.');
        return;
      }

      const newUser = await adminAPI.createUser({
        ...createUserForm,
        orgId
      });
      setUsers(prev => [newUser, ...prev]);
      setCreateUserDialog(false);
      setCreateUserForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        title: '',
        department: '',
        roleName: ''
      });
      toast.success('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error creating user: ${errorMessage}`);
    }
  };

  // Edit user
  const handleEditUser = async () => {
    try {
      if (!selectedUser || !editUserForm.firstName || !editUserForm.lastName || !editUserForm.email || !editUserForm.roleName) {
        toast.error('First name, last name, email, and role are required');
        return;
      }

      const updateData: any = {
        firstName: editUserForm.firstName,
        lastName: editUserForm.lastName,
        email: editUserForm.email,
        phone: editUserForm.phone || null,
        title: editUserForm.title || null,
        department: editUserForm.department || null,
        roleName: editUserForm.roleName
      };

      // Only include password if it's provided
      if (editUserForm.password) {
        updateData.password = editUserForm.password;
      }

      const updatedUser = await adminAPI.updateUser(selectedUser.id, updateData);
      setUsers(prev => prev.map(user => user.id === selectedUser.id ? updatedUser : user));
      setEditUserDialog(false);
      setSelectedUser(null);
      setEditUserForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        title: '',
        department: '',
        roleName: ''
      });
      toast.success('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error updating user: ${errorMessage}`);
    }
  };

  // Create new role
  const handleCreateRole = async () => {
    try {
      if (!createRoleForm.name) {
        toast.error('Role name is required');
        return;
      }

      const orgId = getOrgIdFromToken();
      if (!orgId) {
        toast.error('Organization ID not found. Please log in again.');
        return;
      }

      const newRole = await adminAPI.createRole({
        ...createRoleForm,
        orgId
      });
      setRoles(prev => [newRole, ...prev]);
      setCreateRoleDialog(false);
      setCreateRoleForm({
        name: '',
        description: '',
        permissions: ''
      });
      toast.success('Role created successfully!');
    } catch (error) {
      console.error('Error creating role:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error creating role: ${errorMessage}`);
    }
  };

  // Toggle user status
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const updatedUser = await adminAPI.updateUser(userId, { isActive: !currentStatus });
      setUsers(prev => prev.map(user => user.id === userId ? updatedUser : user));
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error updating user status: ${errorMessage}`);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        await adminAPI.deleteUser(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
        toast.success('User deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error deleting user: ${errorMessage}`);
    }
  };

  // Delete role
  const handleDeleteRole = async (roleId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
        await adminAPI.deleteRole(roleId);
        setRoles(prev => prev.filter(role => role.id !== roleId));
        toast.success('Role deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error deleting role: ${errorMessage}`);
    }
  };

  // Handle user selection
  const handleUserSelect = (user: User, action: 'view' | 'edit' | 'delete') => {
    setSelectedUser(user);
    if (action === 'view') {
      setViewUserDialog(true);
    } else if (action === 'edit') {
      // Populate edit form with user data
      setEditUserForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '', // Don't populate password for security
        phone: user.phone || '',
        title: user.title || '',
        department: user.department || '',
        roleName: user.roles[0]?.role.name || ''
      });
      setEditUserDialog(true);
    } else if (action === 'delete') {
      handleDeleteUser(user.id);
    }
  };

  // Edit role
  const handleEditRole = async () => {
    try {
      if (!selectedRole || !editRoleForm.name) {
        toast.error('Role name is required');
        return;
      }

      const updatedRole = await adminAPI.updateRole(selectedRole.id, editRoleForm);
      setRoles(prev => prev.map(role => role.id === selectedRole.id ? updatedRole : role));
      setEditRoleDialog(false);
      setSelectedRole(null);
      setEditRoleForm({
        name: '',
        description: '',
        permissions: ''
      });
      toast.success('Role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error updating role: ${errorMessage}`);
    }
  };

  // Handle role selection
  const handleRoleSelect = (role: Role, action: 'edit' | 'delete') => {
    setSelectedRole(role);
    if (action === 'edit') {
      setEditRoleForm({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || ''
      });
      setEditRoleDialog(true);
    } else if (action === 'delete') {
      handleDeleteRole(role.id);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchAdminData();
  };

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || 
      user.roles.some(userRole => userRole.role.name === filterRole);
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' && user.isActive) ||
      (filterStatus === 'INACTIVE' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Load data on component mount
  useEffect(() => {
    fetchAdminData();
  }, []);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
        return 'error';
      case 'MANAGER':
        return 'warning';
      case 'TECHNICIAN':
        return 'info';
      case 'CUSTOMER_SERVICE':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#EEF3FB', minHeight: '100vh' }}>
      {/* Page Header */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminIcon sx={{ color: '#3BB2FF', fontSize: { xs: 24, sm: 28 } }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1A202C', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Admin Dashboard
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#99A7BD', textAlign: { xs: 'center', sm: 'left' } }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
          sx={{ 
            borderRadius: '12px',
            borderColor: '#3BB2FF',
            color: '#3BB2FF',
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              borderColor: '#6A6BFF',
              backgroundColor: 'rgba(59, 178, 255, 0.04)',
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            minHeight: '110px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 0.5 }}>
                    {loading ? <CircularProgress size={24} /> : (stats?.totalUsers || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                    Total Users
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                  color: 'white'
                }}>
                  <AdminIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            minHeight: '110px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 0.5 }}>
                    {loading ? <CircularProgress size={24} /> : (stats?.totalJobs || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                    Total Jobs
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white'
                }}>
                  <SecurityIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            minHeight: '110px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 0.5 }}>
                    {loading ? <CircularProgress size={24} /> : `$${stats?.totalRevenue || 0}`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                    Total Revenue
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: 'white'
                }}>
                  <SettingsIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            minHeight: '110px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 0.5 }}>
                    {loading ? <CircularProgress size={24} /> : (stats?.activeJobs || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                    Active Jobs
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  color: 'white'
                }}>
                  <SecurityIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
      }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              borderBottom: '1px solid #E2E8F0',
              '& .MuiTab-root': {
                color: '#99A7BD',
                fontWeight: 500,
                minWidth: { xs: 'auto', sm: 120 },
                px: { xs: 2, sm: 3 },
                '&.Mui-selected': {
                  color: '#3BB2FF',
                }
              }
            }}
          >
            <Tab label="Users" />
            <Tab label="Roles" />
            <Tab label="Settings" />
            <Tab label="Notifications" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Users Actions and Search Bar */}
          <Card sx={{ 
            mb: 3, 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ color: '#99A7BD', mr: 1 }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: '#3BB2FF',
                        },
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={6} sm={3} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value="ALL">All Roles</MenuItem>
                      {roles.map(role => (
                        <MenuItem key={role.id} value={role.name}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6} sm={3} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value="ALL">All Status</MenuItem>
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="INACTIVE">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'stretch', md: 'flex-end' }, mt: { xs: 1, md: 0 } }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    sx={{ 
                      borderRadius: '12px',
                      borderColor: '#3BB2FF',
                      color: '#3BB2FF',
                      flex: { xs: 1, md: 'none' },
                      '&:hover': {
                        borderColor: '#6A6BFF',
                        backgroundColor: 'rgba(59, 178, 255, 0.04)',
                      }
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Refresh</Box>
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setCreateUserDialog(true)}
                    sx={{ 
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                      flex: { xs: 1, md: 'none' },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
                      }
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Add User</Box>
                    <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>Add</Box>
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card sx={{ 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            minHeight: '400px',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1A202C' }}>
                Users List ({filteredUsers.length})
              </Typography>
              
              {/* Desktop Table */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    borderRadius: '12px', 
                    boxShadow: 'none',
                    overflowX: 'auto',
                    maxWidth: '100%',
                    '&::-webkit-scrollbar': {
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#c1c1c1',
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: '#a8a8a8',
                      },
                    },
                  }}
                >
                  <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '25%' }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '25%' }}>Contact</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '15%' }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '10%' }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '10%' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '10%' }}>Created</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '5%' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} hover sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ 
                                bgcolor: '#3BB2FF',
                                width: 40,
                                height: 40
                              }}>
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: '#1A202C' }}>
                                  {user.firstName} {user.lastName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                                  {user.title || 'User'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <EmailIcon sx={{ fontSize: 16, color: '#99A7BD', flexShrink: 0 }} />
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: '#1A202C',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%'
                                  }}
                                  title={user.email}
                                >
                                  {user.email}
                                </Typography>
                              </Box>
                              {user.phone && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PhoneIcon sx={{ fontSize: 16, color: '#99A7BD', flexShrink: 0 }} />
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: '#1A202C',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      maxWidth: '100%'
                                    }}
                                    title={user.phone}
                                  >
                                    {user.phone}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {user.roles.map((userRole, index) => (
                                <Chip
                                  key={index}
                                  label={userRole.role.name}
                                  color={getRoleColor(userRole.role.name) as any}
                                  size="small"
                                  sx={{ borderRadius: '8px' }}
                                />
                              ))}
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#1A202C',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%'
                              }}
                              title={user.department || 'General'}
                            >
                              {user.department || 'General'}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={user.isActive ? 'Active' : 'Inactive'}
                                color={getStatusColor(user.isActive) as any}
                                size="small"
                                sx={{ borderRadius: '8px' }}
                              />
                              <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                  sx={{ 
                                    color: user.isActive ? '#EF4444' : '#10B981',
                                    '&:hover': { backgroundColor: user.isActive ? '#FEE2E2' : '#D1FAE5' }
                                  }}
                                >
                                  {user.isActive ? <DeleteIcon /> : <PersonAddIcon />}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#99A7BD',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%'
                              }}
                              title={formatDate(user.createdAt)}
                            >
                              {formatDate(user.createdAt)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleUserSelect(user, 'view')}
                                  sx={{ color: '#3BB2FF' }}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleUserSelect(user, 'edit')}
                                  sx={{ color: '#6A6BFF' }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleUserSelect(user, 'delete')}
                                  sx={{ color: '#EF4444' }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile Cards */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {filteredUsers.map((user) => (
                  <Card key={user.id} sx={{ 
                    mb: 2, 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: '#3BB2FF',
                            width: 48,
                            height: 48
                          }}>
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1A202C' }}>
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                              {user.title || 'User'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleUserSelect(user, 'view')}
                              sx={{ color: '#3BB2FF' }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              onClick={() => handleUserSelect(user, 'edit')}
                              sx={{ color: '#6A6BFF' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              onClick={() => handleUserSelect(user, 'delete')}
                              sx={{ color: '#EF4444' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 0.5 }}>
                          Contact Information
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 16, color: '#99A7BD' }} />
                          <Typography variant="body2" sx={{ color: '#1A202C' }}>
                            {user.email}
                          </Typography>
                        </Box>
                        {user.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: '#99A7BD' }} />
                            <Typography variant="body2" sx={{ color: '#1A202C' }}>
                              {user.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 0.5 }}>
                          Role & Department
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                          {user.roles.map((userRole, index) => (
                            <Chip
                              key={index}
                              label={userRole.role.name}
                              color={getRoleColor(userRole.role.name) as any}
                              size="small"
                              sx={{ borderRadius: '8px' }}
                            />
                          ))}
                        </Box>
                        <Typography variant="body2" sx={{ color: '#1A202C' }}>
                          Department: {user.department || 'General'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={getStatusColor(user.isActive) as any}
                            size="small"
                            sx={{ borderRadius: '8px' }}
                          />
                          <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                              sx={{ 
                                color: user.isActive ? '#EF4444' : '#10B981',
                                '&:hover': { backgroundColor: user.isActive ? '#FEE2E2' : '#D1FAE5' }
                              }}
                            >
                              {user.isActive ? <DeleteIcon /> : <PersonAddIcon />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                          {formatDate(user.createdAt)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              
              {filteredUsers.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" sx={{ color: '#99A7BD' }}>
                    No users found matching your criteria
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 1 && (
        <>
          {/* Roles Actions Bar */}
          <Card sx={{ 
            mb: 3, 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={8}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1A202C' }}>
                    Manage Roles & Permissions
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    sx={{ 
                      borderRadius: '12px',
                      borderColor: '#3BB2FF',
                      color: '#3BB2FF',
                      flex: { xs: 1, sm: 'none' },
                      '&:hover': {
                        borderColor: '#6A6BFF',
                        backgroundColor: 'rgba(59, 178, 255, 0.04)',
                      }
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Refresh</Box>
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SecurityIcon />}
                    onClick={() => setCreateRoleDialog(true)}
                    sx={{ 
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
                      flex: { xs: 1, sm: 'none' },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
                      }
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Add Role</Box>
                    <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>Add</Box>
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Roles Table */}
          <Card sx={{ 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            minHeight: '400px',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1A202C' }}>
                Roles List ({roles.length})
              </Typography>
              
              {/* Desktop Table */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    borderRadius: '12px', 
                    boxShadow: 'none',
                    overflowX: 'auto',
                    maxWidth: '100%',
                    '&::-webkit-scrollbar': {
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#c1c1c1',
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: '#a8a8a8',
                      },
                    },
                  }}
                >
                  <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '20%' }}>Role Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '25%' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '20%' }}>Permissions</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '10%' }}>Users</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '10%' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '10%' }}>Created</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1A202C', width: '5%' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id} hover sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ 
                                p: 1, 
                                borderRadius: '8px', 
                                background: getRoleColor(role.name) === 'error' ? '#FEE2E2' :
                                           getRoleColor(role.name) === 'warning' ? '#FEF3C7' :
                                           getRoleColor(role.name) === 'info' ? '#DBEAFE' :
                                           getRoleColor(role.name) === 'secondary' ? '#E9D5FF' : '#F3F4F6',
                                color: getRoleColor(role.name) === 'error' ? '#DC2626' :
                                       getRoleColor(role.name) === 'warning' ? '#D97706' :
                                       getRoleColor(role.name) === 'info' ? '#2563EB' :
                                       getRoleColor(role.name) === 'secondary' ? '#7C3AED' : '#6B7280'
                              }}>
                                <SecurityIcon sx={{ fontSize: 20 }} />
                              </Box>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: '#1A202C' }}>
                                  {role.name}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#1A202C',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%'
                              }}
                              title={role.description || 'No description'}
                            >
                              {role.description || 'No description'}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#99A7BD', 
                                fontSize: '0.875rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%'
                              }}
                              title={role.permissions || 'No permissions set'}
                            >
                              {role.permissions ? role.permissions.substring(0, 30) + '...' : 'No permissions set'}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              label={role._count.userRoles}
                              size="small"
                              sx={{ 
                                borderRadius: '8px',
                                backgroundColor: role._count.userRoles > 0 ? '#10B981' : '#F3F4F6',
                                color: role._count.userRoles > 0 ? 'white' : '#6B7280'
                              }}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              label={role.isSystem ? 'System' : 'Custom'}
                              color={role.isSystem ? 'default' : 'primary'}
                              size="small"
                              sx={{ borderRadius: '8px' }}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#99A7BD',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%'
                              }}
                              title={formatDate(role.createdAt)}
                            >
                              {formatDate(role.createdAt)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Edit Role">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRoleSelect(role, 'edit')}
                                  disabled={role.isSystem}
                                  sx={{ color: role.isSystem ? '#D1D5DB' : '#6A6BFF' }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Role">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRoleSelect(role, 'delete')}
                                  disabled={role.isSystem || role._count.userRoles > 0}
                                  sx={{ color: (role.isSystem || role._count.userRoles > 0) ? '#D1D5DB' : '#EF4444' }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile Cards */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {roles.map((role) => (
                  <Card key={role.id} sx={{ 
                    mb: 2, 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ 
                            p: 1, 
                            borderRadius: '8px', 
                            background: getRoleColor(role.name) === 'error' ? '#FEE2E2' :
                                       getRoleColor(role.name) === 'warning' ? '#FEF3C7' :
                                       getRoleColor(role.name) === 'info' ? '#DBEAFE' :
                                       getRoleColor(role.name) === 'secondary' ? '#E9D5FF' : '#F3F4F6',
                            color: getRoleColor(role.name) === 'error' ? '#DC2626' :
                                   getRoleColor(role.name) === 'warning' ? '#D97706' :
                                   getRoleColor(role.name) === 'info' ? '#2563EB' :
                                   getRoleColor(role.name) === 'secondary' ? '#7C3AED' : '#6B7280'
                          }}>
                            <SecurityIcon sx={{ fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1A202C' }}>
                              {role.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                              {role.isSystem ? 'System Role' : 'Custom Role'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Role">
                            <IconButton
                              size="small"
                              onClick={() => handleRoleSelect(role, 'edit')}
                              disabled={role.isSystem}
                              sx={{ color: role.isSystem ? '#D1D5DB' : '#6A6BFF' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Role">
                            <IconButton
                              size="small"
                              onClick={() => handleRoleSelect(role, 'delete')}
                              disabled={role.isSystem || role._count.userRoles > 0}
                              sx={{ color: (role.isSystem || role._count.userRoles > 0) ? '#D1D5DB' : '#EF4444' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 0.5 }}>
                          Description
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1A202C' }}>
                          {role.description || 'No description'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 0.5 }}>
                          Permissions
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#99A7BD', fontSize: '0.875rem' }}>
                          {role.permissions ? role.permissions.substring(0, 100) + '...' : 'No permissions set'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={`${role._count.userRoles} users`}
                            size="small"
                            sx={{ 
                              borderRadius: '8px',
                              backgroundColor: role._count.userRoles > 0 ? '#10B981' : '#F3F4F6',
                              color: role._count.userRoles > 0 ? 'white' : '#6B7280'
                            }}
                          />
                          <Chip
                            label={role.isSystem ? 'System' : 'Custom'}
                            color={role.isSystem ? 'default' : 'primary'}
                            size="small"
                            sx={{ borderRadius: '8px' }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#99A7BD' }}>
                          {formatDate(role.createdAt)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              
              {roles.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" sx={{ color: '#99A7BD' }}>
                    No roles found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 2 && (
        <SettingsPage />
      )}

      {activeTab === 3 && (
        <NotificationSettings />
      )}

      {/* Edit User Dialog */}
      <Dialog 
        open={editUserDialog} 
        onClose={() => setEditUserDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid #E2E8F0',
          background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
          color: 'white'
        }}>
          Edit User
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={editUserForm.firstName}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={editUserForm.lastName}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password (leave empty to keep current)"
                type="password"
                value={editUserForm.password}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, password: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editUserForm.phone}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, phone: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title"
                value={editUserForm.title}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, title: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={editUserForm.department}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, department: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role *</InputLabel>
                <Select
                  value={editUserForm.roleName}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, roleName: e.target.value }))}
                  sx={{ borderRadius: '12px' }}
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.name}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => {
              setEditUserDialog(false);
              setSelectedUser(null);
              setEditUserForm({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                phone: '',
                title: '',
                department: '',
                roleName: ''
              });
            }}
            sx={{ 
              borderRadius: '12px',
              color: '#99A7BD',
              '&:hover': { backgroundColor: '#F1F5F9' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditUser}
            variant="contained"
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
              }
            }}
          >
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog 
        open={createUserDialog} 
        onClose={() => setCreateUserDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid #E2E8F0',
          background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
          color: 'white'
        }}>
          Add New User
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={createUserForm.firstName}
                onChange={(e) => setCreateUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={createUserForm.lastName}
                onChange={(e) => setCreateUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={createUserForm.email}
                onChange={(e) => setCreateUserForm(prev => ({ ...prev, email: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password *"
                type="password"
                value={createUserForm.password}
                onChange={(e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={createUserForm.phone}
                onChange={(e) => setCreateUserForm(prev => ({ ...prev, phone: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title"
                value={createUserForm.title}
                onChange={(e) => setCreateUserForm(prev => ({ ...prev, title: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={createUserForm.department}
                onChange={(e) => setCreateUserForm(prev => ({ ...prev, department: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role *</InputLabel>
                <Select
                  value={createUserForm.roleName}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, roleName: e.target.value }))}
                  sx={{ borderRadius: '12px' }}
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.name}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setCreateUserDialog(false)}
            sx={{ 
              borderRadius: '12px',
              color: '#99A7BD',
              '&:hover': { backgroundColor: '#F1F5F9' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
              }
            }}
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog 
        open={createRoleDialog} 
        onClose={() => setCreateRoleDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid #E2E8F0',
          background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
          color: 'white'
        }}>
          Add New Role
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role Name *"
                value={createRoleForm.name}
                onChange={(e) => setCreateRoleForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., SENIOR_TECHNICIAN"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={createRoleForm.description}
                onChange={(e) => setCreateRoleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Senior technician with advanced repair skills"
                multiline
                rows={2}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Permissions"
                value={createRoleForm.permissions}
                onChange={(e) => setCreateRoleForm(prev => ({ ...prev, permissions: e.target.value }))}
                placeholder="e.g., READ_JOBS, WRITE_JOBS, MANAGE_CUSTOMERS"
                multiline
                rows={3}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setCreateRoleDialog(false)}
            sx={{ 
              borderRadius: '12px',
              color: '#99A7BD',
              '&:hover': { backgroundColor: '#F1F5F9' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateRole}
            variant="contained"
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
              }
            }}
          >
            Create Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog 
        open={viewUserDialog} 
        onClose={() => setViewUserDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid #E2E8F0',
          background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
          color: 'white'
        }}>
          User Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Full Name
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C', fontWeight: 500 }}>
                  {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Title
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {selectedUser.title || 'User'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {selectedUser.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Phone
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {selectedUser.phone || 'Not provided'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Department
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {selectedUser.department || 'General'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Status
                </Typography>
                <Chip
                  label={selectedUser.isActive ? 'Active' : 'Inactive'}
                  color={getStatusColor(selectedUser.isActive) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Roles
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedUser.roles.map((userRole, index) => (
                    <Chip
                      key={index}
                      label={userRole.role.name}
                      color={getRoleColor(userRole.role.name) as any}
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Created
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {formatDate(selectedUser.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#99A7BD', mb: 1 }}>
                  Last Updated
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A202C' }}>
                  {formatDate(selectedUser.updatedAt)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setViewUserDialog(false)}
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog 
        open={editRoleDialog} 
        onClose={() => setEditRoleDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid #E2E8F0',
          background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
          color: 'white'
        }}>
          Edit Role
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role Name *"
                value={editRoleForm.name}
                onChange={(e) => setEditRoleForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., SENIOR_TECHNICIAN"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={editRoleForm.description}
                onChange={(e) => setEditRoleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Senior technician with advanced repair skills"
                multiline
                rows={2}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Permissions"
                value={editRoleForm.permissions}
                onChange={(e) => setEditRoleForm(prev => ({ ...prev, permissions: e.target.value }))}
                placeholder="e.g., READ_JOBS, WRITE_JOBS, MANAGE_CUSTOMERS"
                multiline
                rows={3}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => {
              setEditRoleDialog(false);
              setSelectedRole(null);
              setEditRoleForm({
                name: '',
                description: '',
                permissions: ''
              });
            }}
            sx={{ 
              borderRadius: '12px',
              color: '#99A7BD',
              '&:hover': { backgroundColor: '#F1F5F9' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditRole}
            variant="contained"
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3BB2FF 0%, #6A6BFF 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2A9BFF 0%, #5A5BFF 100%)',
              }
            }}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;
