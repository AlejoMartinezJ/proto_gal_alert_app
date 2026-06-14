import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0A0E1A',
      paper: '#111827',
    },
    primary: {
      main: '#EF4444', // accent-critical as primary for actions like Report
    },
    secondary: {
      main: '#3B82F6', // accent-transit
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#9CA3AF',
    },
    divider: 'rgba(255,255,255,0.08)',
    warning: {
      main: '#F59E0B', // accent-alert
    },
    info: {
      main: '#3B82F6', // accent-transit
    },
    success: {
      main: '#10B981', // accent-safe
    },
    error: {
      main: '#EF4444', // accent-critical
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          backgroundColor: '#1C2436', // surface-elevated
        },
        elevation2: {
          backgroundColor: '#1C2436',
        },
      },
    },
  },
});

// Custom colors that don't fit directly in the standard palette
export const customColors = {
  accentAssigned: '#8B5CF6',
  surfaceElevated: '#1C2436',
};

export default theme;
