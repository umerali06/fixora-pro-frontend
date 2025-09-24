import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';

interface ResponsiveTableCardProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  };
  avatar?: {
    src?: string;
    alt?: string;
    fallback?: string;
    color?: string;
  };
  primaryInfo: {
    label: string;
    value: string | number;
  };
  secondaryInfo?: {
    label: string;
    value: string | number;
  }[];
  actions?: {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onMore?: () => void;
  };
  onClick?: () => void;
}

const ResponsiveTableCard: React.FC<ResponsiveTableCardProps> = ({
  title,
  subtitle,
  status,
  avatar,
  primaryInfo,
  secondaryInfo = [],
  actions,
  onClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile) {
    return null; // Only show cards on mobile/tablet
  }

  return (
    <Card
      sx={{
        mb: 1,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          elevation: onClick ? 4 : 1,
          transform: onClick ? 'translateY(-1px)' : 'none',
        },
        transition: 'all 0.2s ease-in-out',
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header Row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
          {avatar && (
            <Avatar
              src={avatar.src}
              sx={{
                width: 40,
                height: 40,
                mr: 1.5,
                bgcolor: avatar.color || 'primary.main',
                fontSize: '0.9rem'
              }}
            >
              {avatar.fallback}
            </Avatar>
          )}
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {title}
            </Typography>
            
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {status && (
            <Chip
              label={status.label}
              color={status.color}
              size="small"
              sx={{
                fontSize: '0.7rem',
                height: 24,
                ml: 1
              }}
            />
          )}
        </Box>

        {/* Primary Info */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {primaryInfo.label}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.1rem',
              color: 'primary.main'
            }}
          >
            {primaryInfo.value}
          </Typography>
        </Box>

        {/* Secondary Info Grid */}
        {secondaryInfo.length > 0 && (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
            gap: 1,
            mb: 1.5 
          }}>
            {secondaryInfo.map((info, index) => (
              <Box key={index}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem', display: 'block' }}
                >
                  {info.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {info.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Actions */}
        {actions && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 1 }}>
            {actions.onView && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onView?.();
                }}
                sx={{ color: 'primary.main' }}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            )}
            {actions.onEdit && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onEdit?.();
                }}
                sx={{ color: 'primary.main' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {actions.onDelete && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onDelete?.();
                }}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
            {actions.onMore && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onMore?.();
                }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ResponsiveTableCard;
