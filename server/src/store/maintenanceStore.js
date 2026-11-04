/**
 * Maintenance mode state.
 *
 * The admin console sets a maintenance LEVEL plus granular restriction flags
 * used while "repairs" are in progress:
 *   level:            'none' | 'partial' | 'full'
 *   allowLogin:       can non-admin users log in?
 *   allowRegistration: can new users register?
 *   allowWrites:      are mutating API calls allowed ("block controls")?
 *
 * Semantics:
 *   'none'    — everything allowed (flags ignored).
 *   'partial' — restrictions come from the individual flags.
 *   'full'    — lockdown: no login/registration/writes for non-admins; the
 *               API stays read-only and admins keep access to fix things.
 */

const state = {
  level: 'none',
  allowLogin: true,
  allowRegistration: true,
  allowWrites: true,
  message: '',
  until: null,
  updatedBy: null,
  updatedAt: null,
};

const LEVELS = ['none', 'partial', 'full'];

export const getMaintenance = () => ({ ...state });

export const setMaintenance = (patch = {}, updatedBy = null) => {
  if (patch.level !== undefined) {
    if (!LEVELS.includes(patch.level)) {
      throw new Error(`Level must be one of: ${LEVELS.join(', ')}`);
    }
    state.level = patch.level;
  }
  for (const flag of ['allowLogin', 'allowRegistration', 'allowWrites']) {
    if (patch[flag] !== undefined) state[flag] = Boolean(patch[flag]);
  }
  if (patch.message !== undefined) state.message = String(patch.message).slice(0, 500);
  if (patch.until !== undefined) state.until = patch.until || null;
  state.updatedBy = updatedBy;
  state.updatedAt = new Date().toISOString();
  return { ...state };
};

// Effective restrictions — level 'full' forces everything off, 'none' on.
export const isLoginBlocked = () =>
  state.level === 'full' ? true : state.level === 'none' ? false : !state.allowLogin;
export const isRegistrationBlocked = () =>
  state.level === 'full' ? true : state.level === 'none' ? false : !state.allowRegistration;
export const isWriteBlocked = () =>
  state.level === 'full' ? true : state.level === 'none' ? false : !state.allowWrites;
export const isMaintenanceActive = () => state.level !== 'none';

export const LEVEL_LIST = LEVELS;
