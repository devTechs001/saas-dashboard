import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import customerReducer from './slices/customerSlice.js';
import analyticsReducer from './slices/analyticsSlice.js';
import notificationReducer from './slices/notificationSlice.js';
import themeReducer from './slices/themeSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    analytics: analyticsReducer,
    notifications: notificationReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export default store;
