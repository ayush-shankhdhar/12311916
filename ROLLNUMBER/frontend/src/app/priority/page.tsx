'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Stack, Tooltip, IconButton
} from '@mui/material';
import { 
  AutoAwesome as AutoAwesomeIcon, 
  Help as HelpOutlineIcon, 
  Speed as SpeedIcon, 
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import { INotification } from '../../types';
import { notificationApi } from '../../services/api';
import { clientLog } from '../../services/logger';
import NotificationCard from '../../components/NotificationCard';
import NotificationSkeleton from '../../components/NotificationSkeleton';
import NotificationListEmpty from '../../components/NotificationListEmpty';

export default function PriorityInboxPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const fetchPriority = async () => {
    setLoading(true);
    clientLog('info', 'page', 'Rendering Priority Page - calling optimization service endpoint');
    try {
      const res = await notificationApi.getPriority(10);
      setNotifications(res.data);
    } catch (error: any) {
      clientLog('error', 'page', `Priority retrieval fail: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriority();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      clientLog('error', 'page', 'Mark read status fail on priority tab');
    }
  };

  return (
    <Box>
      {/* Hero Header Accent */}
      <Paper
        sx={{
          p: 4,
          mb: 5,
          borderRadius: 5,
          background: 'linear-gradient(135deg, rgba(63,29,203,0.15) 0%, rgba(124,77,255,0.05) 100%)',
          border: '1px solid rgba(124,77,255,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            right: -20, 
            bottom: -30, 
            opacity: 0.05, 
            transform: 'rotate(-15deg)' 
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 200 }} />
        </Box>

        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <AutoAwesomeIcon sx={{ color: 'primary.light' }} />
              <Typography variant="h4" sx={{ fontWeight: 850, letterSpacing: '-0.5px' }}>
                Priority Smart Inbox
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 600, mb: 2 }}>
              Dynamic view ranking the most relevant notifications for you using an O(N log K) 
              MinHeap algorithm weighting Placements &gt; Results &gt; Events, balanced with real-time recency.
            </Typography>
            
            <Stack direction="row" sx={{ gap: 1.5 }}>
              <Tooltip title="Algorithm complexity scale: O(N log K) guarantees ultra-fast ranking on massive streams">
                <Button 
                  variant="text" 
                  size="small" 
                  startIcon={<SpeedIcon />}
                  sx={{ color: 'secondary.main', pointerEvents: 'none', fontWeight: 700 }}
                >
                  HEAP-OPTIMIZED
                </Button>
              </Tooltip>
            </Stack>
          </Box>

          <Button 
            startIcon={<RefreshIcon />} 
            variant="contained" 
            onClick={fetchPriority}
            sx={{
              background: 'linear-gradient(45deg, #7c4dff, #00e5ff)',
              color: '#000',
              fontWeight: 800,
              '&:hover': { opacity: 0.9 }
            }}
          >
            Refresh Priority
          </Button>
        </Stack>
      </Paper>

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
          Top 10 Urgent Alerts
        </Typography>
        <Tooltip title="These are computed dynamically upon fetching based on type weights and recency. Real-time changes will affect rank positioning.">
          <IconButton size="small" sx={{ opacity: 0.6 }}><HelpOutlineIcon fontSize="small" /></IconButton>
        </Tooltip>
      </Box>

      {/* Notification List */}
      <Box sx={{ mb: 6 }}>
        {loading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <NotificationListEmpty 
            title="Nothing Urgent Right Now!" 
            subtitle="High importance announcements will pop here the minute they launch." 
          />
        ) : (
          <>
            {notifications.map(item => (
              <NotificationCard 
                key={item._id} 
                item={item} 
                onMarkRead={handleMarkRead}
                showPriorityIndicator={true}
              />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
}
