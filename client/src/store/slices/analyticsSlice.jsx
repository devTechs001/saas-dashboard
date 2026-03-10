import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dashboardStats: null,
  analytics: [],
  topPages: [],
  deviceBreakdown: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDashboardStats: (state, action) => {
      state.dashboardStats = action.payload;
      state.loading = false;
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
      state.loading = false;
    },
    setTopPages: (state, action) => {
      state.topPages = action.payload;
    },
    setDeviceBreakdown: (state, action) => {
      state.deviceBreakdown = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setDashboardStats,
  setAnalytics,
  setTopPages,
  setDeviceBreakdown,
  setError,
  clearError,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
