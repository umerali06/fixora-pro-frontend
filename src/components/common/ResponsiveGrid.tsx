import React from 'react';
import {
  Box,
  Grid,
  GridProps,
  Typography,
  Button,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom
} from '@mui/material';
import {
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Refresh as RefreshIcon,
  Inbox as InboxIcon
} from '@mui/icons-material';

export interface ResponsiveGridProps<T = any> extends Omit<GridProps, 'container'> {
  data?: T[];
  renderItem?: (item: T) => React.ReactNode;
  children?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  skeletonCount?: number;
  skeletonHeight?: number;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  responsiveBreakpoints?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onRefresh?: () => void;
  itemMinWidth?: number;
  spacing?: number;
}

const ResponsiveGrid = <T,>({
  data,
  renderItem,
  children,
  loading = false,
  empty = false,
  emptyMessage = 'No data available',
  emptyAction,
  skeletonCount = 6,
  skeletonHeight = 200,
  pagination,
  onPageChange,
  onPageSizeChange,
  responsiveBreakpoints = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3,
    xl: 2
  },
  viewMode = 'grid',
  onViewModeChange,
  onRefresh,
  itemMinWidth = 200,
  spacing = 2,
  ...gridProps
}: ResponsiveGridProps<T>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getDynamicBreakpoints = () => ({
    xs: responsiveBreakpoints.xs || 12,
    sm: responsiveBreakpoints.sm || 6,
    md: responsiveBreakpoints.md || 4,
    lg: responsiveBreakpoints.lg || 3,
    xl: responsiveBreakpoints.xl || 2
  });

  const getDynamicSpacing = () => (isMobile ? 1 : spacing);

  const renderSkeleton = () => (
    <Skeleton
      variant="rectangular"
      height={skeletonHeight}
      sx={{
        borderRadius: 2,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      }}
    />
  );

  const renderEmpty = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        textAlign: 'center'
      }}
    >
      <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {emptyMessage}
      </Typography>
      {emptyAction && (
        <Button
          variant="outlined"
          onClick={emptyAction.onClick}
          sx={{ mt: 2 }}
        >
          {emptyAction.label}
        </Button>
      )}
    </Box>
  );

  // Main content
  const renderContent = () => {
    if (loading) {
      return (
        <Zoom in={loading} timeout={200}>
          <Grid container spacing={getDynamicSpacing()} {...gridProps}>
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <Grid item key={index} {...getDynamicBreakpoints()}>
                {renderSkeleton()}
              </Grid>
            ))}
          </Grid>
        </Zoom>
      );
    }

    if (empty || !data || data.length === 0) {
      return (
        <Zoom in={empty} timeout={200}>
          {renderEmpty()}
        </Zoom>
      );
    }

    return (
      <Fade in={!loading} timeout={300}>
        <Grid
          container
          spacing={getDynamicSpacing()}
          sx={{
            minHeight: 200,
            '& .MuiGrid-item': {
              minWidth: itemMinWidth,
              display: 'flex'
            }
          }}
          {...gridProps}
        >
          {data.map((item, index) => (
            <Grid item key={index} {...getDynamicBreakpoints()}>
              {renderItem ? renderItem(item) : children}
            </Grid>
          ))}
        </Grid>
      </Fade>
    );
  };

  return (
    <Box>
      {/* Header with controls */}
      {(onViewModeChange || onRefresh || pagination) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onViewModeChange && (
              <>
                <Button
                  size="small"
                  variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                  onClick={() => onViewModeChange('grid')}
                  startIcon={<ViewModuleIcon />}
                >
                  Grid
                </Button>
                <Button
                  size="small"
                  variant={viewMode === 'list' ? 'contained' : 'outlined'}
                  onClick={() => onViewModeChange('list')}
                  startIcon={<ViewListIcon />}
                >
                  List
                </Button>
              </>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {onRefresh && (
              <Button
                size="small"
                variant="outlined"
                onClick={onRefresh}
                startIcon={<RefreshIcon />}
              >
                Refresh
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* Content */}
      {renderContent()}
    </Box>
  );
};

export default ResponsiveGrid;
