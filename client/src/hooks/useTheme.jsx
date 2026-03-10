import { useSelector } from 'react-redux';
import { useMemo } from 'react';

export const useAppTheme = () => {
  const mode = useSelector((state) => state.theme.mode);

  const theme = useMemo(() => ({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#dc004e',
        light: '#f50057',
        dark: '#c51162',
      },
      success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
      },
      warning: {
        main: '#f57c00',
        light: '#ff9800',
        dark: '#e65100',
      },
      error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 600 },
      h2: { fontSize: '2rem', fontWeight: 600 },
      h3: { fontSize: '1.75rem', fontWeight: 600 },
      h4: { fontSize: '1.5rem', fontWeight: 600 },
      h5: { fontSize: '1.25rem', fontWeight: 600 },
      h6: { fontSize: '1rem', fontWeight: 600 },
    },
    spacing: 8,
    shape: {
      borderRadius: 8,
    },
    shadows: mode === 'dark'
      ? [
          'none',
          '0 2px 4px rgba(0,0,0,0.2)',
          '0 4px 8px rgba(0,0,0,0.3)',
          '0 6px 12px rgba(0,0,0,0.4)',
          '0 8px 16px rgba(0,0,0,0.5)',
        ]
      : [
          'none',
          '0 2px 4px rgba(0,0,0,0.1)',
          '0 4px 8px rgba(0,0,0,0.12)',
          '0 6px 12px rgba(0,0,0,0.15)',
          '0 8px 16px rgba(0,0,0,0.2)',
        ],
  }), [mode]);

  return { theme, mode };
};

export default useAppTheme;
