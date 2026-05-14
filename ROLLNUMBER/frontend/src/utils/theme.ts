'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c4dff', /* Deep vibrant violet */
      light: '#b47cff',
      dark: '#3f1dcb',
    },
    secondary: {
      main: '#00e5ff', /* Modern cyan accent */
    },
    background: {
      default: '#0d0e12', /* Deep rich space dark */
      paper: '#161820',
    },
    text: {
      primary: '#f1f3f5',
      secondary: '#adb5bd',
    },
    warning: {
      main: '#ff9100',
    },
    success: {
      main: '#00e676',
    },
    error: {
      main: '#ff1744',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h6: {
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
    body1: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          padding: '8px 20px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(124, 77, 255, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          backgroundImage: 'linear-gradient(to bottom right, #161820, #1c1f2b)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);
