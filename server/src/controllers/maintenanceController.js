/**
 * Maintenance API — public status + admin control surface.
 */
import { memoryStore as store } from '../store/memoryStore.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/apiError.js';
import {
  getMaintenance, setMaintenance, isLoginBlocked, isRegistrationBlocked,
  isWriteBlocked, LEVEL_LIST,
} from '../store/maintenanceStore.js';
import { emitToWorkspace, getIO } from '../config/socket.js';

export const getStatus = catchAsync(async (req, res) => {
  const m = getMaintenance();
  res.json(
    ApiResponse.success({
      ...m,
      effective: {
        loginBlocked: isLoginBlocked(),
        registrationBlocked: isRegistrationBlocked(),
        writesBlocked: isWriteBlocked(),
      },
    })
  );
});

export const setMaintenanceMode = catchAsync(async (req, res) => {
  const { level, allowLogin, allowRegistration, allowWrites, message, until } = req.body;
  let next;
  try {
    next = setMaintenance(
      { level, allowLogin, allowRegistration, allowWrites, message, until },
      req.user?.name || 'Admin'
    );
  } catch (e) {
    throw ApiError.badRequest(e.message);
  }
  store.logAudit({
    actor: req.user?.name || 'Admin',
    action: `Set maintenance level → ${next.level} (login: ${next.allowLogin ? 'allowed' : 'blocked'}, registration: ${next.allowRegistration ? 'allowed' : 'blocked'}, writes: ${next.allowWrites ? 'allowed' : 'blocked'})`,
    target: 'maintenance',
    ip: req.ip || '—',
    type: 'maintenance',
  });
  // Real-time: every connected client updates its banners/controls live.
  const payload = {
    ...next,
    effective: {
      loginBlocked: isLoginBlocked(),
      registrationBlocked: isRegistrationBlocked(),
      writesBlocked: isWriteBlocked(),
    },
  };
  const s = getIO();
  if (s) s.emit('maintenance:update', payload);
  emitToWorkspace('default', 'maintenance:update', payload);
  res.json(
    ApiResponse.success(
      {
        ...next,
        effective: {
          loginBlocked: isLoginBlocked(),
          registrationBlocked: isRegistrationBlocked(),
          writesBlocked: isWriteBlocked(),
        },
      },
      'Maintenance settings updated'
    )
  );
});

export const getLevels = catchAsync(async (req, res) => {
  res.json(ApiResponse.success({ levels: LEVEL_LIST }));
});
