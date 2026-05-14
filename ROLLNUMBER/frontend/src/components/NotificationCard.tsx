'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Tooltip, Divider } from '@mui/material';
import { 
  CheckCircleOutlined as CheckCircleOutlineIcon, 
  CheckCircle as CheckCircleIcon, 
  Event as EventIcon, 
  School as SchoolIcon, 
  Work as WorkIcon, 
  Stars as StarsIcon 
} from '@mui/icons-material';
import { INotification } from '../types';


interface NotificationCardProps {
  item: INotification;
  onMarkRead: (id: string) => void;
  showPriorityIndicator?: boolean;
}

export default function NotificationCard({ item, onMarkRead, showPriorityIndicator = false }: NotificationCardProps) {
  
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Placement':
        return { color: '#ff1744', icon: <WorkIcon fontSize="small" />, label: 'Placement' };
      case 'Result':
        return { color: '#00e5ff', icon: <SchoolIcon fontSize="small" />, label: 'Academic Result' };
      case 'Event':
      default:
        return { color: '#00e676', icon: <EventIcon fontSize="small" />, label: 'Campus Event' };
    }
  };

  const styles = getTypeStyles(item.type);
  const dateLabel = new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <Card
      sx={{
        mb: 2,
        opacity: item.isRead ? 0.65 : 1,
        borderLeft: `5px solid ${item.isRead ? '#333' : styles.color}`,
        transition: 'all 0.25s ease-in-out',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: item.isRead ? 'none' : 'translateX(4px)',
          boxShadow: item.isRead ? 'none' : `0 10px 35px rgba(0, 0, 0, 0.4)`,
        },
      }}
    >
      {showPriorityIndicator && !item.isRead && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -10, 
            right: 15, 
            zIndex: 1,
            backgroundColor: 'warning.main', 
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.3,
            borderRadius: 5,
            fontSize: '0.7rem',
            fontWeight: 800,
            boxShadow: '0 4px 10px rgba(255,145,0,0.4)'
          }}
        >
          <StarsIcon sx={{ fontSize: '0.9rem' }} /> HIGH PRIORITY
        </Box>
      )}

      <CardContent sx={{ p: '20px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip 
                icon={styles.icon}
                label={styles.label}
                size="small"
                sx={{ 
                  borderColor: styles.color, 
                  color: styles.color, 
                  fontWeight: 700,
                  '& .MuiChip-icon': { color: styles.color } 
                }}
                variant="outlined"
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {dateLabel}
              </Typography>
            </Box>

            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: item.isRead ? 400 : 600, 
                color: item.isRead ? 'text.secondary' : 'text.primary',
                lineClamp: 3, 
                mb: 1 
              }}
            >
              {item.message}
            </Typography>
          </Box>

          <Box>
            {item.isRead ? (
              <Tooltip title="Already Read">
                <span>
                  <IconButton disabled color="default">
                    <CheckCircleIcon sx={{ color: 'text.secondary', opacity: 0.5 }} />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <Tooltip title="Mark as Read">
                <IconButton 
                  onClick={() => onMarkRead(item._id)} 
                  color="primary"
                  sx={{ 
                    backgroundColor: 'rgba(124, 77, 255, 0.08)',
                    '&:hover': { backgroundColor: 'primary.main', color: '#fff' }
                  }}
                >
                  <CheckCircleOutlineIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
