import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSocket } from './useSocket';
import { addNotification } from '../store/slices/notificationSlice';
import { playNotificationSound, playMessageSound } from '../utils/sound';

/**
 * App-wide realtime sync:
 *  - `notification:new`  → notification feed + toast + sound
 *  - `analytics:update`  → dashboard widgets re-fetch (React Query)
 *  - `customer:created|updated|deleted` → customer lists re-fetch
 *  - `report:generated`  → reports re-fetch + success toast/sound
 *  - `chat:message`      → message sound (chat page renders the message)
 *
 * Returns the socket connection state for live indicators in the UI.
 */
export const useRealtime = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { isConnected, subscribeToEvent } = useSocket();

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
    ].filter(Boolean);

    return () => {
      unsubscribers.forEach((off) => off());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return isConnected;
};

export default useRealtime;
