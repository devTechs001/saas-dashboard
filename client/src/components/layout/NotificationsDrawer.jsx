import React from 'react';
import {
  Box, Typography, SwipeableDrawer, IconButton, Stack, Divider, Chip, Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaymentIcon from '@mui/icons-material/PaymentOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAddAltOutlined';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import RocketIcon from '@mui/icons-material/RocketLaunchOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { markAllAsRead } from '../../store/slices/notificationSlice';
import { notifications as mockNotifications } from '../../data/mockData';
import { formatRelative } from '../../utils/format';
import { EmptyState, AppAvatar } from '../ui';

const TYPE_ICONS = {
  billing: { icon: <PaymentIcon fontSize="small" />, color: '#059669' },
  ai: { icon: <AutoAwesomeIcon fontSize="small" />, color: '#7C3AED' },
  user: { icon: <PersonAddIcon fontSize="small" />, color: '#2563EB' },
  report: { icon: <DescriptionIcon fontSize="small" />, color: '#D97706' },
  deploy: { icon: <RocketIcon fontSize="small" />, color: '#DB2777' },
  system: { icon: <NotificationsNoneIcon fontSize="small" />, color: '#64748B' },
};

const NotificationsDrawer = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const storeItems = useSelector((state) => state.notifications?.notifications);
  const raw = storeItems?.length ? storeItems : mockNotifications;
  // Normalize: store uses isRead, mock data uses read.
  const items = raw.map((n) => ({ ...n, read: n.read ?? n.isRead ?? false }));
  const unread = items.filter((n) => !n.read).length;

  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, bgcolor: 'background.paper' } }}
    >
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={800}>Notifications</Typography>
          <Typography variant="caption" color="text.secondary">
            {unread ? `${unread} unread` : 'You are all caught up'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </Box>
      <Divider />

      <Box sx={{ flex: 1, overflow: 'auto', px: 1.5, py: 1 }}>
        {items.length === 0 ? (
          <EmptyState title="No notifications" message="Important updates about your workspace will show up here." />
        ) : (
          items.map((n) => {
            const t = TYPE_ICONS[n.type] || TYPE_ICONS.system;
            return (
              <Stack
                key={n.id}
                direction="row"
                spacing={1.5}
                sx={{
                  p: 1.75, borderRadius: 2.5, mb: 0.75, cursor: 'pointer',
                  bgcolor: n.read ? 'transparent' : 'action.hover',
                  border: '1px solid', borderColor: n.read ? 'transparent' : 'divider',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
              >
                <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${t.color}1A`, color: t.color, flexShrink: 0 }}>
                  {t.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={700} noWrap>{n.title}</Typography>
                    {!n.read && <Chip size="small" label="New" sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: 'error.main', color: '#fff' }} />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block">{n.message}</Typography>
                  <Typography variant="caption" color="text.disabled">{formatRelative(n.time)}</Typography>
                </Box>
              </Stack>
            );
          })
        )}
      </Box>

      <Divider />
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <Button fullWidth variant="outlined" onClick={() => dispatch(markAllAsRead())}>Mark all read</Button>
        <Button fullWidth variant="contained" onClick={onClose}>Close</Button>
      </Box>
    </SwipeableDrawer>
  );
};

export default NotificationsDrawer;
