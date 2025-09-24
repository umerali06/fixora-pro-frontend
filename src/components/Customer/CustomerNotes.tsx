import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Note as NoteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface CustomerNote {
  id: string;
  type: 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING';
  subject: string;
  content: string;
  contactMethod?: string;
  contactPerson?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
  createdBy: string;
}

interface CustomerNotesProps {
  customerId: string;
  orgId: string;
  onNoteChange?: () => void;
}

const CustomerNotes: React.FC<CustomerNotesProps> = ({ customerId, orgId, onNoteChange }) => {
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'NOTE' as const,
    subject: '',
    content: '',
    contactMethod: '',
    contactPerson: '',
    followUpRequired: false,
    followUpDate: ''
  });

  // Load notes
  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll use sample data until we implement the backend
      const sampleNotes: CustomerNote[] = [
        {
          id: '1',
          type: 'NOTE',
          subject: 'Initial Contact',
          content: 'Customer contacted us about phone repair service. Very interested in our pricing.',
          contactMethod: 'PHONE',
          contactPerson: 'John Doe',
          followUpRequired: true,
          followUpDate: '2024-01-15',
          createdAt: '2024-01-10T10:00:00Z',
          createdBy: 'Technician 1'
        },
        {
          id: '2',
          type: 'CALL',
          subject: 'Follow-up Call',
          content: 'Called customer to follow up on repair quote. Customer confirmed appointment.',
          contactMethod: 'PHONE',
          contactPerson: 'John Doe',
          followUpRequired: false,
          createdAt: '2024-01-12T14:30:00Z',
          createdBy: 'Technician 1'
        },
        {
          id: '3',
          type: 'EMAIL',
          subject: 'Repair Status Update',
          content: 'Sent email with repair status update. Customer replied with questions about warranty.',
          contactMethod: 'EMAIL',
          contactPerson: 'John Doe',
          followUpRequired: true,
          followUpDate: '2024-01-18',
          createdAt: '2024-01-15T09:15:00Z',
          createdBy: 'Technician 2'
        }
      ];
      
      setNotes(sampleNotes);
    } catch (error) {
      setError('Failed to load notes');
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [customerId]);

  const handleOpenDialog = () => {
    setFormData({
      type: 'NOTE',
      subject: '',
      content: '',
      contactMethod: '',
      contactPerson: '',
      followUpRequired: false,
      followUpDate: ''
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      type: 'NOTE',
      subject: '',
      content: '',
      contactMethod: '',
      contactPerson: '',
      followUpRequired: false,
      followUpDate: ''
    });
  };

  const handleSubmit = async () => {
    if (!formData.subject.trim() || !formData.content.trim()) {
      setError('Subject and content are required');
      return;
    }

    try {
      const newNote: CustomerNote = {
        id: Date.now().toString(),
        type: formData.type,
        subject: formData.subject,
        content: formData.content,
        contactMethod: formData.contactMethod,
        contactPerson: formData.contactPerson,
        followUpRequired: formData.followUpRequired,
        followUpDate: formData.followUpDate,
        createdAt: new Date().toISOString(),
        createdBy: 'Current User' // This should come from auth context
      };

      setNotes([newNote, ...notes]);
      handleCloseDialog();
      onNoteChange?.();
    } catch (error) {
      setError('Failed to save note');
      console.error('Error saving note:', error);
    }
  };

  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'CALL':
        return <PhoneIcon />;
      case 'EMAIL':
        return <EmailIcon />;
      case 'MEETING':
        return <ScheduleIcon />;
      default:
        return <NoteIcon />;
    }
  };

  const getNoteColor = (type: string) => {
    switch (type) {
      case 'CALL':
        return '#4CAF50';
      case 'EMAIL':
        return '#2196F3';
      case 'MEETING':
        return '#FF9800';
      default:
        return '#9C27B0';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <NoteIcon />
              Notes & Communication History
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              size="small"
            >
              Add Note
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <List>
            {notes.map((note, index) => (
              <React.Fragment key={note.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: getNoteColor(note.type) }}>
                      {getNoteIcon(note.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {note.subject}
                        </Typography>
                        <Chip
                          label={note.type}
                          size="small"
                          sx={{ backgroundColor: getNoteColor(note.type), color: 'white' }}
                        />
                        {note.followUpRequired && (
                          <Chip
                            label="Follow-up Required"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {note.content}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                          {note.contactMethod && (
                            <Chip
                              label={`${note.contactMethod}: ${note.contactPerson}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {note.followUpDate && (
                            <Chip
                              label={`Follow-up: ${new Date(note.followUpDate).toLocaleDateString('de-DE')}`}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(note.createdAt)} • {note.createdBy}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notes.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>

          {notes.length === 0 && (
            <Box textAlign="center" py={4}>
              <NoteIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No notes yet. Add your first note to start tracking customer interactions.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Note Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Note</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Note Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                label="Note Type"
              >
                <MenuItem value="NOTE">General Note</MenuItem>
                <MenuItem value="CALL">Phone Call</MenuItem>
                <MenuItem value="EMAIL">Email</MenuItem>
                <MenuItem value="MEETING">Meeting</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
            />

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Contact Method"
                value={formData.contactMethod}
                onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                margin="normal"
                placeholder="e.g., Phone, Email, In-person"
              />

              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                margin="normal"
                placeholder="e.g., John Doe"
              />
            </Box>

            <Box display="flex" alignItems="center" gap={2} mt={2}>
              <FormControl>
                <InputLabel>Follow-up Required</InputLabel>
                <Select
                  value={formData.followUpRequired ? 'yes' : 'no'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    followUpRequired: e.target.value === 'yes' 
                  })}
                  label="Follow-up Required"
                >
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                </Select>
              </FormControl>

              {formData.followUpRequired && (
                <TextField
                  label="Follow-up Date"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save Note
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerNotes;
