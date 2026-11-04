import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerReducer from './slices/customerSlice';
import analyticsReducer from './slices/analyticsSlice';
import notificationReducer from './slices/notificationSlice';
import themeReducer from './slices/themeSlice';
import maintenanceReducer from './slices/maintenanceSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    analytics: analyticsReducer,
    notifications: notificationReducer,
    theme: themeReducer,
    maintenance: maintenanceReducer,
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
