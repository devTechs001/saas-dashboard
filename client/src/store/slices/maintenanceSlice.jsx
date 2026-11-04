import { createSlice } from '@reduxjs/toolkit';

/**
 * Maintenance mode state mirrored from GET /api/maintenance and the
 * `maintenance:update` realtime event. The banner and forms read this.
 */
const initialState = {
  loaded: false,
  level: 'none', // 'none' | 'partial' | 'full'
  allowLogin: true,
  allowRegistration: true,
  allowWrites: true,
  message: '',
  until: null,
  updatedBy: null,
  updatedAt: null,
  effective: {
    loginBlocked: false,
    registrationBlocked: false,
    writesBlocked: false,
  },
};

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    setMaintenanceState: (state, action) => {
      const p = action.payload || {};
      if (p.level !== undefined) state.level = p.level;
      if (p.allowLogin !== undefined) state.allowLogin = Boolean(p.allowLogin);
      if (p.allowRegistration !== undefined) state.allowRegistration = Boolean(p.allowRegistration);
      if (p.allowWrites !== undefined) state.allowWrites = Boolean(p.allowWrites);
      if (p.message !== undefined) state.message = p.message;
      if (p.until !== undefined) state.until = p.until;
      if (p.updatedBy !== undefined) state.updatedBy = p.updatedBy;
      if (p.updatedAt !== undefined) state.updatedAt = p.updatedAt;
      if (p.effective !== undefined) state.effective = p.effective;
      else {
        state.effective = {
          loginBlocked: state.level === 'full' ? true : state.level === 'none' ? false : !state.allowLogin,
          registrationBlocked: state.level === 'full' ? true : state.level === 'none' ? false : !state.allowRegistration,
          writesBlocked: state.level === 'full' ? true : state.level === 'none' ? false : !state.allowWrites,
        };
      }
      state.loaded = true;
    },
  },
});

export const { setMaintenanceState } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
