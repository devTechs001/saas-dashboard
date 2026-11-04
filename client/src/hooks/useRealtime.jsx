import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSocket } from './useSocket';
import { addNotification } from '../store/slices/notificationSlice';
import { setMode, setAccent, setSoundEnabled } from '../store/slices/themeSlice';
import { setMaintenanceState } from '../store/slices/maintenanceSlice';
import { playNotificationSound, playMessageSound } from '../utils/sound';
import api from '../services/api';

/**
 * App-wide realtime sync:
 *  - `notification:new`  → notification feed + toast + sound
 *  - `analytics:update`  → dashboard widgets re-fetch (React Query)
 *  - `customer:created|updated|deleted` → customer lists re-fetch
 *  - `report:generated`  → reports re-fetch + success toast/sound
 *  - `chat:message`      → message sound (chat page renders the message)
 *  - `maintenance:update`→ maintenance banner/controls update live
 *  - `settings:updated`  → theme/sound settings sync across sessions
 *
 * Settings changes made here are broadcast to the user's other sessions,
 * and remote changes apply locally — without echo loops.
 *
 * Returns the socket connection state for live indicators in the UI.
 */
export const useRealtime = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { isConnected, subscribeToEvent, emitEvent } = useSocket();

  // ---- settings sync (real time) ----
  const mode = useSelector((s) => s.theme.mode);
  const accent = useSelector((s) => s.theme.accent);
  const soundEnabled = useSelector((s) => s.theme.soundEnabled);
  const applyingRemote = useRef(false);
  const lastSynced = useRef(JSON.stringify({ mode, accent, soundEnabled }));

  useEffect(() => {
    const sig = JSON.stringify({ mode, accent, soundEnabled });
    if (sig === lastSynced.current) return;
    lastSynced.current = sig;
    if (applyingRemote.current) {
      applyingRemote.current = false;
      return;
    }
    emitEvent('settings:updated', { mode, accent, soundEnabled });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, accent, soundEnabled]);

  // ---- maintenance status: initial fetch (works without sockets) ----
  useEffect(() => {
    let cancelled = false;
    api
      .get('/maintenance')
      .then((res) => {
        if (!cancelled && res.data?.data) dispatch(setMaintenanceState(res.data.data));
      })
      .catch(() => {
        /* API offline — banner stays hidden */
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isConnected) return undefined;

    const unsubscribers = [
      subscribeToEvent('notification:new', ({ notification }) => {
        if (!notification) return;
        dispatch(addNotification(notification));
        toast(notification.title || 'New notification', {
          icon: '🔔',
          duration: 4500,
        });
        playNotificationSound();
      }),
      subscribeToEvent('analytics:update', () => {
        queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        queryClient.invalidateQueries({ queryKey: ['deviceBreakdown'] });
        queryClient.invalidateQueries({ queryKey: ['topPages'] });
      }),
      subscribeToEvent('customer:created', () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      }),
      subscribeToEvent('customer:updated', () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      }),
      subscribeToEvent('customer:deleted', () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      }),
      subscribeToEvent('report:generated', (payload) => {
        queryClient.invalidateQueries({ queryKey: ['reports'] });
        toast.success(payload?.title ? `Report ready: ${payload.title}` : 'Your report is ready');
        playNotificationSound();
      }),
      subscribeToEvent('chat:message', () => {
        playMessageSound();
      }),
      subscribeToEvent('maintenance:update', (payload) => {
        if (!payload) return;
        dispatch(setMaintenanceState(payload));
        if (payload.level && payload.level !== 'none') {
          toast(payload.message || 'Maintenance mode updated by an admin', { icon: '🛠️', duration: 6000 });
        }
      }),
      subscribeToEvent('settings:updated', (payload) => {
        if (!payload) return;
        applyingRemote.current = true;
        if (payload.mode) dispatch(setMode(payload.mode));
        if (payload.accent) dispatch(setAccent(payload.accent));
        if (payload.soundEnabled !== undefined) dispatch(setSoundEnabled(payload.soundEnabled));
        toast('Settings synced from another session', { icon: '🔄', duration: 3000 });
      }),
    ].filter(Boolean);

    return () => {
      unsubscribers.forEach((off) => off());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return isConnected;
};

export default useRealtime;
