import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Badge, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', { page: 1, limit: 10 }],
    queryFn: () => notificationService.getAll({ page: 1, limit: 10 }),
    select: (data) => data.data,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success':
        return '#2e7d32';
      case 'warning':
        return '#f57c00';
      case 'error':
        return '#d32f2f';
      default:
        return '#1976d2';
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount > 99 ? '99+' : unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
          },
        }}
      >
        <MenuItem onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
          <ListItemText primary="Mark all as read" />
        </MenuItem>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem>No notifications</MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => handleMarkAsRead(notification._id)}
              sx={{
                opacity: notification.isRead ? 0.6 : 1,
                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
              }}
            >
              <ListItemIcon>
                <Badge
                  variant="dot"
                  sx={{
                    color: getTypeColor(notification.type),
                    '& .MuiBadge-badge': { width: 12, height: 12 },
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={
                  <>
                    {notification.message}
                    <br />
                    <small>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </small>
                  </>
                }
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
