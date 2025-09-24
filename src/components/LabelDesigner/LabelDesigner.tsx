import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Toolbar,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Preview as PreviewIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  QrCode as QrCodeIcon,
  Straighten as LineIcon,
  CropSquare as RectangleIcon,
  Circle as CircleIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignRight as AlignRightIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon
} from '@mui/icons-material';

interface LabelElement {
  id: string;
  type: 'text' | 'image' | 'barcode' | 'qr' | 'line' | 'rectangle' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  rotation?: number;
  opacity?: number;
  zIndex: number;
}

interface LabelTemplate {
  id: string;
  name: string;
  type: 'product' | 'invoice' | 'repair' | 'custom';
  width: number;
  height: number;
  design: LabelElement[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  printCount: number;
}

interface LabelDesignerProps {
  template?: LabelTemplate | null;
  onSave?: (template: LabelTemplate) => void;
  onPrint?: (template: LabelTemplate, data: any) => void;
  data?: any;
}

const LabelDesigner: React.FC<LabelDesignerProps> = ({
  template,
  onSave,
  onPrint,
  data = {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<LabelElement[]>(template?.design || []);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState(template?.name || 'New Template');
  const [templateType, setTemplateType] = useState(template?.type || 'custom');
  const [isDefault, setIsDefault] = useState(template?.isDefault || false);
  const [canvasSize, setCanvasSize] = useState({
    width: template?.width || 50,
    height: template?.height || 30
  });
  const [zoom, setZoom] = useState(100);
  const [showPreview, setShowPreview] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'
  ];

  const elementTypes = [
    { type: 'text', label: 'Text', icon: <TextIcon /> },
    { type: 'barcode', label: 'Barcode', icon: <QrCodeIcon /> },
    { type: 'qr', label: 'QR Code', icon: <QrCodeIcon /> },
    { type: 'line', label: 'Line', icon: <LineIcon /> },
    { type: 'rectangle', label: 'Rectangle', icon: <RectangleIcon /> },
    { type: 'circle', label: 'Circle', icon: <CircleIcon /> }
  ];

  useEffect(() => {
    drawCanvas();
  }, [elements, canvasSize, zoom]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const scale = zoom / 100;
    canvas.width = canvasSize.width * scale;
    canvas.height = canvasSize.height * scale;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height, scale);

    // Draw elements
    elements
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach(element => {
        drawElement(ctx, element, scale);
      });
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Vertical lines
    for (let x = 0; x <= width; x += 10 * scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += 10 * scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: LabelElement, scale: number) => {
    const x = element.x * scale;
    const y = element.y * scale;
    const width = element.width * scale;
    const height = element.height * scale;

    ctx.save();

    // Apply rotation
    if (element.rotation) {
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);
    }

    // Apply opacity
    ctx.globalAlpha = element.opacity || 1;

    switch (element.type) {
      case 'text':
        drawTextElement(ctx, element, x, y, width, height);
        break;
      case 'barcode':
        drawBarcodeElement(ctx, element, x, y, width, height);
        break;
      case 'qr':
        drawQRElement(ctx, element, x, y, width, height);
        break;
      case 'line':
        drawLineElement(ctx, element, x, y, width, height);
        break;
      case 'rectangle':
        drawRectangleElement(ctx, element, x, y, width, height);
        break;
      case 'circle':
        drawCircleElement(ctx, element, x, y, width, height);
        break;
    }

    // Draw selection border
    if (selectedElement === element.id) {
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  const drawTextElement = (ctx: CanvasRenderingContext2D, element: LabelElement, x: number, y: number, width: number, height: number) => {
    ctx.font = `${element.fontStyle || 'normal'} ${element.fontWeight || 'normal'} ${(element.fontSize || 12) * (zoom / 100)}px ${element.fontFamily || 'Arial'}`;
    ctx.fillStyle = element.color || '#000000';
    ctx.textAlign = element.textAlign || 'left';
    ctx.textBaseline = 'top';

    // Handle text decoration
    if (element.textDecoration === 'underline') {
      ctx.fillText(element.content, x, y);
      ctx.beginPath();
      ctx.moveTo(x, y + (element.fontSize || 12) * (zoom / 100) + 2);
      ctx.lineTo(x + ctx.measureText(element.content).width, y + (element.fontSize || 12) * (zoom / 100) + 2);
      ctx.stroke();
    } else {
      ctx.fillText(element.content, x, y);
    }
  };

  const drawBarcodeElement = (ctx: CanvasRenderingContext2D, element: LabelElement, x: number, y: number, width: number, height: number) => {
    // Simple barcode representation
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
    ctx.fillStyle = '#000000';
    ctx.font = `${(element.fontSize || 8) * (zoom / 100)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(element.content, x + width / 2, y + height - 2);
  };

  const drawQRElement = (ctx: CanvasRenderingContext2D, element: LabelElement, x: number, y: number, width: number, height: number) => {
    // Simple QR code representation
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#FFFFFF';
    const cellSize = Math.min(width, height) / 25;
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(x + i * cellSize, y + j * cellSize, cellSize, cellSize);
        }
      }
    }
  };

  const drawLineElement = (ctx: CanvasRenderingContext2D, element: LabelElement, x: number, y: number, width: number, height: number) => {
    ctx.strokeStyle = element.color || '#000000';
    ctx.lineWidth = element.borderWidth || 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y + height);
    ctx.stroke();
  };

  const drawRectangleElement = (ctx: CanvasRenderingContext2D, element: LabelElement, x: number, y: number, width: number, height: number) => {
    if (element.backgroundColor) {
      ctx.fillStyle = element.backgroundColor;
      ctx.fillRect(x, y, width, height);
    }
    if (element.borderColor) {
      ctx.strokeStyle = element.borderColor;
      ctx.lineWidth = element.borderWidth || 1;
      ctx.strokeRect(x, y, width, height);
    }
  };

  const drawCircleElement = (ctx: CanvasRenderingContext2D, element: LabelElement, x: number, y: number, width: number, height: number) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;

    if (element.backgroundColor) {
      ctx.fillStyle = element.backgroundColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
    if (element.borderColor) {
      ctx.strokeStyle = element.borderColor;
      ctx.lineWidth = element.borderWidth || 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const addElement = (type: string) => {
    const newElement: LabelElement = {
      id: `element_${Date.now()}`,
      type: type as any,
      x: 10,
      y: 10,
      width: type === 'text' ? 100 : 50,
      height: type === 'text' ? 20 : 50,
      content: type === 'text' ? 'Sample Text' : 'Sample',
      fontSize: 12,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      color: '#000000',
      zIndex: elements.length
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<LabelElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: `element_${Date.now()}`,
        x: element.x + 10,
        y: element.y + 10,
        zIndex: elements.length
      };
      setElements(prev => [...prev, newElement]);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvasSize.width / rect.width);
    const y = (event.clientY - rect.top) * (canvasSize.height / rect.height);

    // Find clicked element
    const clickedElement = elements.find(el => 
      x >= el.x && x <= el.x + el.width &&
      y >= el.y && y <= el.y + el.height
    );

    setSelectedElement(clickedElement?.id || null);
  };

  const getSelectedElement = () => {
    return elements.find(el => el.id === selectedElement);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Toolbar */}
      <Box sx={{ width: 250, borderRight: '1px solid #E0E0E0', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Label Designer
        </Typography>

        {/* Canvas Settings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Canvas Settings
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Width (mm)"
                type="number"
                size="small"
                value={canvasSize.width}
                onChange={(e) => setCanvasSize(prev => ({ ...prev, width: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height (mm)"
                type="number"
                size="small"
                value={canvasSize.height}
                onChange={(e) => setCanvasSize(prev => ({ ...prev, height: Number(e.target.value) }))}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Zoom: {zoom}%
            </Typography>
            <Slider
              value={zoom}
              onChange={(e, value) => setZoom(value as number)}
              min={25}
              max={200}
              step={25}
            />
          </Box>
        </Box>

        {/* Template Settings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Template Settings
          </Typography>
          <TextField
            fullWidth
            label="Template Name"
            size="small"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Template Type</InputLabel>
            <Select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value as 'product' | 'invoice' | 'repair' | 'custom')}
            >
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="invoice">Invoice</MenuItem>
              <MenuItem value="repair">Repair</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
            }
            label="Set as Default"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Add Elements */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Add Elements
          </Typography>
          <Grid container spacing={1}>
            {elementTypes.map((type) => (
              <Grid item xs={6} key={type.type}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={type.icon}
                  onClick={() => addElement(type.type)}
                >
                  {type.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Element Properties */}
        {selectedElement && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Element Properties
            </Typography>
            {getSelectedElement()?.type === 'text' && (
              <>
                <TextField
                  fullWidth
                  label="Text Content"
                  size="small"
                  value={getSelectedElement()?.content || ''}
                  onChange={(e) => updateElement(selectedElement, { content: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Font Family</InputLabel>
                  <Select
                    value={getSelectedElement()?.fontFamily || 'Arial'}
                    onChange={(e) => updateElement(selectedElement, { fontFamily: e.target.value })}
                  >
                    {fonts.map(font => (
                      <MenuItem key={font} value={font}>{font}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Font Size"
                  type="number"
                  size="small"
                  value={getSelectedElement()?.fontSize || 12}
                  onChange={(e) => updateElement(selectedElement, { fontSize: Number(e.target.value) })}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => updateElement(selectedElement, { fontWeight: getSelectedElement()?.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    color={getSelectedElement()?.fontWeight === 'bold' ? 'primary' : 'default'}
                  >
                    <BoldIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => updateElement(selectedElement, { fontStyle: getSelectedElement()?.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    color={getSelectedElement()?.fontStyle === 'italic' ? 'primary' : 'default'}
                  >
                    <ItalicIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => updateElement(selectedElement, { textDecoration: getSelectedElement()?.textDecoration === 'underline' ? 'none' : 'underline' })}
                    color={getSelectedElement()?.textDecoration === 'underline' ? 'primary' : 'default'}
                  >
                    <UnderlineIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => updateElement(selectedElement, { textAlign: 'left' })}
                    color={getSelectedElement()?.textAlign === 'left' ? 'primary' : 'default'}
                  >
                    <AlignLeftIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => updateElement(selectedElement, { textAlign: 'center' })}
                    color={getSelectedElement()?.textAlign === 'center' ? 'primary' : 'default'}
                  >
                    <AlignCenterIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => updateElement(selectedElement, { textAlign: 'right' })}
                    color={getSelectedElement()?.textAlign === 'right' ? 'primary' : 'default'}
                  >
                    <AlignRightIcon />
                  </IconButton>
                </Box>
              </>
            )}
            <TextField
              fullWidth
              label="X Position"
              type="number"
              size="small"
              value={getSelectedElement()?.x || 0}
              onChange={(e) => updateElement(selectedElement, { x: Number(e.target.value) })}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="Y Position"
              type="number"
              size="small"
              value={getSelectedElement()?.y || 0}
              onChange={(e) => updateElement(selectedElement, { y: Number(e.target.value) })}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="Width"
              type="number"
              size="small"
              value={getSelectedElement()?.width || 0}
              onChange={(e) => updateElement(selectedElement, { width: Number(e.target.value) })}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="Height"
              type="number"
              size="small"
              value={getSelectedElement()?.height || 0}
              onChange={(e) => updateElement(selectedElement, { height: Number(e.target.value) })}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="Color"
              type="color"
              size="small"
              value={getSelectedElement()?.color || '#000000'}
              onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => deleteElement(selectedElement)}
              >
                Delete
              </Button>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => duplicateElement(selectedElement)}
              >
                Duplicate
              </Button>
            </Box>
          </Box>
        )}

        {/* Elements List */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Elements ({elements.length})
          </Typography>
          <List dense>
            {elements.map((element, index) => (
              <ListItem
                key={element.id}
                button
                selected={selectedElement === element.id}
                onClick={() => setSelectedElement(element.id)}
              >
                <ListItemText
                  primary={`${element.type} ${index + 1}`}
                  secondary={element.content}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={() => deleteElement(element.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* Canvas Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Canvas Toolbar */}
        <Toolbar sx={{ borderBottom: '1px solid #E0E0E0' }}>
          <Button
            startIcon={<SaveIcon />}
            onClick={() => onSave?.({
              id: template?.id || `template_${Date.now()}`,
              name: templateName,
              type: templateType,
              width: canvasSize.width,
              height: canvasSize.height,
              design: elements,
              isDefault: isDefault,
              createdAt: template?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              printCount: template?.printCount || 0
            })}
          >
            Save
          </Button>
          <Button
            startIcon={<PreviewIcon />}
            onClick={() => setShowPreview(true)}
          >
            Preview
          </Button>
          <Button
            startIcon={<PrintIcon />}
            onClick={() => onPrint?.({
              id: template?.id || `template_${Date.now()}`,
              name: template?.name || 'New Template',
              type: template?.type || 'custom',
              width: canvasSize.width,
              height: canvasSize.height,
              design: elements,
              isDefault: template?.isDefault || false,
              createdAt: template?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              printCount: template?.printCount || 0
            }, data)}
          >
            Print
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            startIcon={<UndoIcon />}
            disabled
          >
            Undo
          </Button>
          <Button
            startIcon={<RedoIcon />}
            disabled
          >
            Redo
          </Button>
        </Toolbar>

        {/* Canvas */}
        <Box sx={{ flex: 1, p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              backgroundColor: 'white',
              border: '1px solid #E0E0E0'
            }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              style={{
                cursor: 'crosshair',
                border: '1px solid #E0E0E0',
                backgroundColor: 'white'
              }}
            />
          </Paper>
        </Box>
      </Box>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>Label Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Paper
              elevation={2}
              sx={{
                display: 'inline-block',
                p: 2,
                backgroundColor: 'white',
                border: '1px solid #E0E0E0'
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  border: '1px solid #E0E0E0',
                  backgroundColor: 'white'
                }}
              />
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />}>
            Print
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

export default LabelDesigner;
