'use client';

import React, { useState, useEffect } from 'react';
import { Box, Snackbar, Alert, SnackbarCloseReason, Toolbar } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSocket } from '../hooks/useSocket';
import { clientLog } from '../services/logger';
import { notificationApi } from '../services/api';

const drawerWidth = 260;

export default function ClientLayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  /* Snackbars for real-time push highlights */
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  /* Arbitrary mock student ID assuming pre-authorization as per instruction #5 */
  const mockStudentId = 'ST10923';
  
  const { isConnected, lastMessage } = useSocket(mockStudentId);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  /* Pre-fetch initial unread count and watch socket broadcasts */
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await notificationApi.getAll({ isRead: false, studentId: mockStudentId, limit: 1 });
        setUnreadCount(res.meta?.total || 0);
      } catch (err) {
        clientLog('error', 'component', 'Unable to fetch unread status count for global badge');
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      clientLog('info', 'component', `New incoming notification toast: ${lastMessage.message}`);
      setUnreadCount(prev => prev + 1);
      setToastMsg(`New ${lastMessage.type}: ${lastMessage.message.substring(0, 60)}...`);
      setToastOpen(true);
      
      /* Custom browser Event to reload lists dynamically across pages */
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notification_received', { detail: lastMessage }));
      }
    }
  }, [lastMessage]);

  const handleCloseToast = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') return;
    setToastOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar 
        onToggleSidebar={handleDrawerToggle} 
        isConnected={isConnected} 
        unreadCount={unreadCount} 
      />
      
      <Sidebar 
        mobileOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* clearance shim for fixed top navbar */}
        <Toolbar /> 
        
        <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      </Box>

      <Snackbar 
        open={toastOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity="info" 
          variant="filled" 
          sx={{ width: '100%', borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
