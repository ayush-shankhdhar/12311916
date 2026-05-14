'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Tabs, Tab, Pagination, 
  FormControl, Select, MenuItem, InputLabel, Button, 
  SelectChangeEvent, Paper 
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import RefreshIcon from '@mui/icons-material/Refresh';
import { INotification, PaginationMeta } from '../types';
import { notificationApi } from '../services/api';
import { clientLog } from '../services/logger';
import NotificationCard from '../components/NotificationCard';
import NotificationSkeleton from '../components/NotificationSkeleton';
import NotificationListEmpty from '../components/NotificationListEmpty';

export default function AllNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 5, total: 0, totalPages: 0 });
  
  /* Filters State */
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [readFilter, setReadFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  const mockStudentId = 'ST10923';

  const loadData = useCallback(async () => {
    setLoading(true);
    clientLog('info', 'page', `Page triggered loadData. Filter={type:${typeFilter}, read:${readFilter}} Page=${page}`);
    try {
      const res = await notificationApi.getAll({
        page,
        limit: 5,
        studentId: mockStudentId,
        ...(typeFilter !== 'ALL' && { notification_type: typeFilter }),
        ...(readFilter === 'READ' && { isRead: true }),
        ...(readFilter === 'UNREAD' && { isRead: false })
      });

      setNotifications(res.data);
      if (res.meta) setMeta(res.meta);
    } catch (error: any) {
      clientLog('error', 'page', `Failed loadData error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, readFilter, page]);

  // Fetch data
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh list when alert event triggers
  useEffect(() => {
    const handler = () => {
      clientLog('debug', 'page', 'Live socket message event detected - refreshing stream');
      loadData();
    };
    window.addEventListener('notification_received', handler);
    return () => window.removeEventListener('notification_received', handler);
  }, [loadData]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      /* Instantly update list state avoiding flash */
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err: any) {
      clientLog('error', 'page', `Mark read failed for ${id}`);
    }
  };

  const handleTypeChange = (event: React.SyntheticEvent, newValue: string) => {
    clientLog('debug', 'page', `User switched category filter: ${newValue}`);
    setTypeFilter(newValue);
    setPage(1);
  };

  const handleReadChange = (event: SelectChangeEvent) => {
    clientLog('debug', 'page', `User switched status filter: ${event.target.value}`);
    setReadFilter(event.target.value);
    setPage(1);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
            Notifications Center
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Real-time updates regarding classes, results and placements.
          </Typography>
        </Box>
        <Button 
          startIcon={<RefreshIcon />} 
          variant="outlined" 
          onClick={() => loadData()}
          sx={{ borderColor: 'rgba(255,255,255,0.15)', color: 'text.primary' }}
        >
          Refresh Feed
        </Button>
      </Box>

      {/* Filters Toolbar */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 4, 
          borderRadius: 4, 
          backgroundColor: 'rgba(255,255,255,0.01)',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: { xs: '100%', md: 'auto' } }}>
          <Tabs 
            value={typeFilter} 
            onChange={handleTypeChange} 
            textColor="primary" 
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Notifications" value="ALL" sx={{ fontWeight: 600 }} />
            <Tab label="Placements" value="Placement" sx={{ fontWeight: 600 }} />
            <Tab label="Results" value="Result" sx={{ fontWeight: 600 }} />
            <Tab label="Events" value="Event" sx={{ fontWeight: 600 }} />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' }, justifyContent: 'flex-end' }}>
          <TuneIcon sx={{ color: 'text.secondary', opacity: 0.7 }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={readFilter}
              label="Status"
              onChange={handleReadChange}
            >
              <MenuItem value="ALL">Show All</MenuItem>
              <MenuItem value="UNREAD">Unread Only</MenuItem>
              <MenuItem value="READ">Read Only</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Notifications Stream Grid */}
      <Box sx={{ mb: 5 }}>
        {loading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <NotificationListEmpty />
        ) : (
          <>
            {notifications.map(item => (
              <NotificationCard 
                key={item._id} 
                item={item} 
                onMarkRead={handleMarkRead} 
              />
            ))}
          </>
        )}
      </Box>

      {/* Pagination Footer */}
      {!loading && meta.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Pagination 
            count={meta.totalPages} 
            page={page} 
            onChange={(e, val) => {
              clientLog('debug', 'page', `Navigating to page index ${val}`);
              setPage(val);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            color="primary" 
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 3,
                fontWeight: 700
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
}
