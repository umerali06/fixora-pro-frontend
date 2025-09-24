import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Menu,
  MenuItem as MenuItemComponent,
  Fade,
  CircularProgress,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  fetchTodos,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  addTodoOptimistic,
  Todo,
} from '../../store/slices/todosSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { addLocalActivity } from '../../store/slices/activitiesSlice';

const TodoList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { todos, loading, error } = useAppSelector((state) => state.todos);

  // Local state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Todo['priority'],
    category: 'OTHER' as Todo['category'],
    dueDate: '',
  });

  // Load todos on mount
  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  // Handle notifications
  useEffect(() => {
    if (error) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: error,
      }));
    }
  }, [error, dispatch]);

  const handleAddTodo = () => {
    setEditingTodo(null);
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      category: 'OTHER',
      dueDate: '',
    });
    setDialogOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      category: todo.category,
      dueDate: todo.dueDate || '',
    });
    setDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleSaveTodo = async () => {
    if (!formData.title.trim()) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: t('validation.required'),
      }));
      return;
    }

    try {
      if (editingTodo) {
        // Update existing todo
        await dispatch(updateTodo({
          id: editingTodo.id,
          data: {
            ...formData,
            dueDate: formData.dueDate || undefined,
          },
        })).unwrap();
        
        // Add activity
        dispatch(addLocalActivity({
          type: 'USER_ACTION',
          title: 'Todo Updated',
          description: `Updated todo: ${formData.title}`,
          entityType: 'TODO',
          entityId: editingTodo.id,
        }));

        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'success',
          message: t('todos.updateSuccess'),
        }));
      } else {
        // Create new todo
        const newTodoData = {
          ...formData,
          completed: false,
          dueDate: formData.dueDate || undefined,
        };

        // Optimistic update
        const tempTodo: Todo = {
          id: `temp-${Date.now()}`,
          ...newTodoData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dispatch(addTodoOptimistic(tempTodo));

        await dispatch(createTodo(newTodoData)).unwrap();
        
        // Add activity
        dispatch(addLocalActivity({
          type: 'TODO_COMPLETED',
          title: 'Todo Created',
          description: `Created new todo: ${formData.title}`,
          entityType: 'TODO',
        }));

        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'success',
          message: t('todos.createSuccess'),
        }));
      }

      setDialogOpen(false);
      setEditingTodo(null);
    } catch (error) {
      console.error('Save todo failed:', error);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      await dispatch(toggleTodo(todo.id)).unwrap();
      
      // Add activity
      dispatch(addLocalActivity({
        type: 'TODO_COMPLETED',
        title: todo.completed ? 'Todo Reopened' : 'Todo Completed',
        description: `${todo.completed ? 'Reopened' : 'Completed'} todo: ${todo.title}`,
        entityType: 'TODO',
        entityId: todo.id,
      }));

      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        message: todo.completed ? t('todos.reopened') : t('todos.completed'),
      }));
    } catch (error) {
      console.error('Toggle todo failed:', error);
    }
  };

  const handleDeleteTodo = async (todo: Todo) => {
    try {
      await dispatch(deleteTodo(todo.id)).unwrap();
      
      // Add activity
      dispatch(addLocalActivity({
        type: 'USER_ACTION',
        title: 'Todo Deleted',
        description: `Deleted todo: ${todo.title}`,
        entityType: 'TODO',
        entityId: todo.id,
      }));

      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        message: t('todos.deleteSuccess'),
      }));
    } catch (error) {
      console.error('Delete todo failed:', error);
    }
    setMenuAnchor(null);
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'URGENT': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: Todo['category']) => {
    switch (category) {
      case 'REPAIR': return '🔧';
      case 'INVENTORY': return '📦';
      case 'CUSTOMER': return '👤';
      case 'ADMIN': return '⚙️';
      default: return '📋';
    }
  };

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  const urgentTodos = activeTodos.filter(todo => todo.priority === 'URGENT');

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">
              {t('dashboard.todos')} ({activeTodos.length})
            </Typography>
            {urgentTodos.length > 0 && (
              <Chip
                label={`${urgentTodos.length} urgent`}
                color="error"
                size="small"
                icon={<FlagIcon />}
              />
            )}
          </Box>
        }
        action={
          <Tooltip title={t('todos.addTodo')}>
            <IconButton onClick={handleAddTodo} size="small">
              <AddIcon />
            </IconButton>
          </Tooltip>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ flex: 1, pt: 0, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            {activeTodos.length === 0 && completedTodos.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" gutterBottom>
                  {t('todos.noTodos')}
                </Typography>
                <Button variant="outlined" onClick={handleAddTodo} startIcon={<AddIcon />}>
                  {t('todos.addFirstTodo')}
                </Button>
              </Box>
            ) : (
              <List dense sx={{ py: 0 }}>
                {/* Active Todos */}
                {activeTodos.map((todo) => (
                  <Fade in key={todo.id}>
                    <ListItem 
                      disablePadding
                      sx={{ 
                        borderLeft: 4, 
                        borderColor: `${getPriorityColor(todo.priority)}.main`,
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <ListItemButton onClick={() => handleToggleTodo(todo)} sx={{ pl: 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Checkbox
                            edge="start"
                            checked={todo.completed}
                            tabIndex={-1}
                            disableRipple
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  textDecoration: todo.completed ? 'line-through' : 'none',
                                  fontWeight: todo.priority === 'URGENT' ? 600 : 400,
                                }}
                              >
                                {getCategoryIcon(todo.category)} {todo.title}
                              </Typography>
                              <Chip
                                label={todo.priority}
                                size="small"
                                color={getPriorityColor(todo.priority) as any}
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              {todo.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {todo.description}
                                </Typography>
                              )}
                              {todo.dueDate && (
                                <Chip
                                  icon={<ScheduleIcon />}
                                  label={new Date(todo.dueDate).toLocaleDateString()}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 18, fontSize: '0.65rem' }}
                                />
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTodo(todo);
                              setMenuAnchor(e.currentTarget);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItemButton>
                    </ListItem>
                  </Fade>
                ))}

                {/* Completed Todos Section */}
                {completedTodos.length > 0 && (
                  <>
                    <ListItemButton onClick={() => setShowCompleted(!showCompleted)} sx={{ mt: 2 }}>
                      <ListItemIcon>
                        {showCompleted ? <ExpandLess /> : <ExpandMore />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography variant="body2" color="text.secondary">
                            {t('todos.completed')} ({completedTodos.length})
                          </Typography>
                        }
                      />
                    </ListItemButton>
                    
                    <Collapse in={showCompleted}>
                      {completedTodos.map((todo) => (
                        <Fade in key={todo.id}>
                          <ListItem 
                            disablePadding
                            sx={{ 
                              ml: 2,
                              opacity: 0.7,
                              mb: 1,
                              borderRadius: 1,
                            }}
                          >
                            <ListItemButton onClick={() => handleToggleTodo(todo)}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Checkbox
                                  edge="start"
                                  checked={todo.completed}
                                  tabIndex={-1}
                                  disableRipple
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                                  >
                                    {getCategoryIcon(todo.category)} {todo.title}
                                  </Typography>
                                }
                              />
                              <ListItemSecondaryAction>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTodo(todo);
                                    setMenuAnchor(e.currentTarget);
                                  }}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItemButton>
                          </ListItem>
                        </Fade>
                      ))}
                    </Collapse>
                  </>
                )}
              </List>
            )}
          </Box>
        )}
      </CardContent>

      {/* Todo Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTodo ? t('todos.editTodo') : t('todos.addTodo')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label={t('todos.title')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label={t('todos.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{t('todos.priority')}</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Todo['priority'] })}
                  label={t('todos.priority')}
                >
                  <MenuItem value="LOW">{t('todos.priorities.low')}</MenuItem>
                  <MenuItem value="MEDIUM">{t('todos.priorities.medium')}</MenuItem>
                  <MenuItem value="HIGH">{t('todos.priorities.high')}</MenuItem>
                  <MenuItem value="URGENT">{t('todos.priorities.urgent')}</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>{t('todos.category')}</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Todo['category'] })}
                  label={t('todos.category')}
                >
                  <MenuItem value="REPAIR">{t('todos.categories.repair')}</MenuItem>
                  <MenuItem value="INVENTORY">{t('todos.categories.inventory')}</MenuItem>
                  <MenuItem value="CUSTOMER">{t('todos.categories.customer')}</MenuItem>
                  <MenuItem value="ADMIN">{t('todos.categories.admin')}</MenuItem>
                  <MenuItem value="OTHER">{t('todos.categories.other')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <TextField
              fullWidth
              label={t('todos.dueDate')}
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSaveTodo} variant="contained">
            {editingTodo ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItemComponent onClick={() => handleEditTodo(selectedTodo!)}>
          <EditIcon sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItemComponent>
        <MenuItemComponent onClick={() => handleDeleteTodo(selectedTodo!)}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItemComponent>
      </Menu>
    </Card>
  );
};

export default TodoList;
