import { createTheme } from '@mui/material/styles';

// Accent palettes selectable in Settings → Appearance.
export const ACCENTS = {
  indigo: { name: 'Indigo', main: '#4F46E5', dark: '#4338CA', light: '#818CF8' },
  blue: { name: 'Blue', main: '#2563EB', dark: '#1D4ED8', light: '#60A5FA' },
  emerald: { name: 'Emerald', main: '#059669', dark: '#047857', light: '#34D399' },
  violet: { name: 'Violet', main: '#7C3AED', dark: '#6D28D9', light: '#A78BFA' },
  rose: { name: 'Rose', main: '#E11D48', dark: '#BE123C', light: '#FB7185' },
};

export const createAppTheme = (mode = 'light', accentKey = 'indigo') => {
  const accent = ACCENTS[accentKey] || ACCENTS.indigo;
  const dark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: accent.main, dark: accent.dark, light: accent.light, contrastText: '#fff' },
      secondary: { main: dark ? '#A78BFA' : '#7C3AED', contrastText: '#fff' },
      success: { main: dark ? '#34D399' : '#059669' },
      warning: { main: dark ? '#FBBF24' : '#D97706' },
      error: { main: dark ? '#F87171' : '#DC2626' },
      info: { main: dark ? '#60A5FA' : '#2563EB' },
      background: {
        default: dark ? '#0B1020' : '#F6F7FB',
        paper: dark ? '#111731' : '#FFFFFF',
      },
      divider: dark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.08)',
      text: {
        primary: dark ? '#E7ECF6' : '#0F172A',
        secondary: dark ? '#94A3B8' : '#5B6478',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.015em' },
      h4: { fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${dark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.06)'}`,
            boxShadow: dark ? '0 8px 24px rgba(2,6,23,0.45)' : '0 1px 2px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.05)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${accent.main} 0%, ${accent.dark} 100%)`,
            '&:hover': { background: `linear-gradient(135deg, ${accent.dark} 0%, ${accent.main} 100%)` },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 600 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { borderRight: `1px solid ${dark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.06)'}` },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: '2px 8px',
            '&.Mui-selected': {
              backgroundColor: dark ? 'rgba(129,140,248,0.16)' : `${accent.main}14`,
              color: accent.main,
              '& .MuiListItemIcon-root': { color: accent.main },
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, minHeight: 48 },
        },
      },
    },
  });
};
