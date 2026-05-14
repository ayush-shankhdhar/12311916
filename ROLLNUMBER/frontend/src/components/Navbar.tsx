'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Badge, IconButton, Box, Chip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import MenuIcon from '@mui/icons-material/Menu';

interface NavbarProps {
  onToggleSidebar: () => void;
  isConnected: boolean;
  unreadCount: number;
}

export default function Navbar({ onToggleSidebar, isConnected, unreadCount }: NavbarProps) {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <NotificationsIcon sx={{ display: 'flex', mr: 1.5, color: 'primary.light' }} />
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700, background: 'linear-gradient(45deg, #fff 30%, #b47cff 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          CampusHub Notify
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            icon={<SignalCellularAltIcon fontSize="small" />}
            label={isConnected ? 'Live connected' : 'Reconnecting'} 
            color={isConnected ? 'success' : 'warning'}
            variant="outlined"
            size="small"
          />

          <IconButton color="inherit">
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
