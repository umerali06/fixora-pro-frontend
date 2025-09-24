import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';

export interface ResponsiveTableColumn {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  hideOn?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  format?: (value: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  columns: ResponsiveTableColumn[];
  data: any[];
  rowKey: string;
  onRowClick?: (row: any) => void;
  maxHeight?: string | number;
  stickyHeader?: boolean;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  rowKey,
  onRowClick,
  maxHeight = '70vh',
  stickyHeader = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getDisplayStyle = (hideOn?: string) => {
    if (!hideOn) return {};
    
    return {
      display: {
        xs: hideOn === 'xs' ? 'none' : 'table-cell',
        sm: hideOn === 'sm' || hideOn === 'xs' ? 'none' : 'table-cell',
        md: ['md', 'sm', 'xs'].includes(hideOn) ? 'none' : 'table-cell',
        lg: ['lg', 'md', 'sm', 'xs'].includes(hideOn) ? 'none' : 'table-cell',
        xl: ['xl', 'lg', 'md', 'sm', 'xs'].includes(hideOn) ? 'none' : 'table-cell',
      }
    };
  };

  return (
    <Paper sx={{ 
      width: '100%', 
      overflow: 'hidden',
      '& .MuiTableContainer-root': {
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '10px',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          },
        },
      }
    }}>
      <TableContainer sx={{ 
        maxHeight: { xs: '60vh', sm: '70vh', md: maxHeight },
        overflowX: 'auto'
      }}>
        <Table 
          stickyHeader={stickyHeader} 
          size={isMobile ? 'small' : 'medium'}
          sx={{ 
            minWidth: { xs: 300, sm: 650 },
            '& .MuiTableCell-root': {
              padding: { xs: '4px 6px', sm: '8px 12px' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: { xs: '100px', sm: '150px', md: '200px' }
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              fontWeight: 600,
              backgroundColor: theme.palette.grey[50],
              borderBottom: `2px solid ${theme.palette.divider}`,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    minWidth: column.minWidth,
                    ...getDisplayStyle(column.hideOn)
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                hover
                key={row[rowKey]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:nth-of-type(odd)': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  '&:hover': {
                    backgroundColor: onRowClick ? theme.palette.action.selected : undefined,
                  },
                  minHeight: { xs: 48, sm: 56 }
                }}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    sx={getDisplayStyle(column.hideOn)}
                  >
                    <Box sx={{ 
                      maxWidth: '100%', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      {column.format ? column.format(row[column.id]) : row[column.id]}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ResponsiveTable;
