import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customers: [],
  customer: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCustomers: (state, action) => {
      state.customers = action.payload.customers;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },
    setCustomer: (state, action) => {
      state.customer = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    addCustomer: (state, action) => {
      state.customers.unshift(action.payload);
      state.pagination.total += 1;
    },
    updateCustomer: (state, action) => {
      const index = state.customers.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
      if (state.customer?._id === action.payload._id) {
        state.customer = action.payload;
      }
    },
    removeCustomer: (state, action) => {
      state.customers = state.customers.filter((c) => c._id !== action.payload);
      state.pagination.total -= 1;
    },
    clearCustomer: (state) => {
      state.customer = null;
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
  setCustomers,
  setCustomer,
  setStats,
  addCustomer,
  updateCustomer,
  removeCustomer,
  clearCustomer,
  setError,
  clearError,
} = customerSlice.actions;

export default customerSlice.reducer;
