'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Drawer, Box, Toolbar, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Divider, Typography 
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { clientLog } from '../services/logger';

const drawerWidth = 260;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { text: 'All Notifications', icon: <NotificationsActiveIcon />, path: '/' },
    { text: 'Priority Inbox', icon: <StarBorderIcon />, path: '/priority' },
  ];

  const handleNavigate = (path: string) => {
    clientLog('debug', 'page', `Navigating user from sidebar to ${path}`);
    router.push(path);
    onClose();
  };

  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
          NAVIGATION
        </Typography>
      </Toolbar>
      <Divider sx={{ opacity: 0.1 }} />
      <List sx={{ px: 1.5, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'rgba(124, 77, 255, 0.12)' : 'transparent',
                  color: isActive ? 'primary.light' : 'inherit',
                  '&:hover': {
                    backgroundColor: 'rgba(124, 77, 255, 0.06)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(124, 77, 255, 0.16)',
                    '&:hover': {
                      backgroundColor: 'rgba(124, 77, 255, 0.22)',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.light' : 'text.secondary', minWidth: 42 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography sx={{ fontWeight: isActive ? 700 : 500, fontSize: '0.95rem' }}>{item.text}</Typography>}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 3, mt: 'auto', position: 'absolute', bottom: 0, width: '100%' }}>
        <PaperCardMock />
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer rendering */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }} /* Optimization for mobile render */
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundImage: 'none', backgroundColor: 'background.paper' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer permanent rendering */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'background.paper' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

function PaperCardMock() {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 4,
        background: 'linear-gradient(135deg, #3f1dcb 0%, #7c4dff 100%)',
        boxShadow: '0 4px 20px rgba(124,77,255,0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUpIcon sx={{ fontSize: 20 }} />
        <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.9, textTransform: 'uppercase' }}>
          System Health
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        Optimization Engine active (O(N log K) enabled)
      </Typography>
    </Box>
  );
}
