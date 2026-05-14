'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

interface Props {
  title?: string;
  subtitle?: string;
}

export default function NotificationListEmpty({ 
  title = "You're all caught up!", 
  subtitle = "There are no notifications matching your filters." 
}: Props) {
  return (
    <Paper
      sx={{
        p: 8,
        textAlign: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '2px dashed rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        borderRadius: 5
      }}
    >
      <NotificationsOffIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3 }} />
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Paper>
  );
}
