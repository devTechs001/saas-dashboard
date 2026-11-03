import { createSlice } from '@reduxjs/toolkit';

const themeFromStorage = localStorage.getItem('theme');
const accentFromStorage = localStorage.getItem('accent');
const soundFromStorage = localStorage.getItem('soundEnabled');

const initialState = {
  // mode: 'light' | 'dark' | 'system' — dark is the default theme
  mode: themeFromStorage || 'dark',
  accent: accentFromStorage || 'indigo',
  soundEnabled: soundFromStorage !== 'false',
  sidebarOpen: true,
  mobileSidebarOpen: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.mode);
    },
    setMode: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setAccent: (state, action) => {
      state.accent = action.payload;
      localStorage.setItem('accent', action.payload);
    },
    setSoundEnabled: (state, action) => {
      state.soundEnabled = Boolean(action.payload);
      localStorage.setItem('soundEnabled', state.soundEnabled ? 'true' : 'false');
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    setMobileSidebarOpen: (state, action) => {
      state.mobileSidebarOpen = action.payload;
    },
  },
});

export const {
  toggleMode,
  setMode,
  setAccent,
  setSoundEnabled,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileSidebar,
  setMobileSidebarOpen,
} = themeSlice.actions;

export default themeSlice.reducer;
