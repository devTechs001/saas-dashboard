import Notification from '../models/Notification.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/apiError.js';
import { emitToUser } from '../config/socket.js';

export const getNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;

  const query = { userId: req.user.id, tenantId: req.tenantId };

  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  const notifications = await Notification.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    userId: req.user.id,
    tenantId: req.tenantId,
    isRead: false,
  });

  res.json(
    ApiResponse.success(
      {
        notifications,
        unreadCount,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
      'Notifications retrieved successfully'
    )
  );
});

export const markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  res.json(ApiResponse.success({ notification }, 'Notification marked as read'));
});

export const markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, tenantId: req.tenantId, isRead: false },
    { isRead: true }
  );

  res.json(ApiResponse.success({}, 'All notifications marked as read'));
});

export const deleteNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  res.json(ApiResponse.success({}, 'Notification deleted successfully'));
});

export const createNotification = catchAsync(async (req, res) => {
  const { userId, title, message, type, actionUrl, metadata } = req.body;

  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    actionUrl,
    metadata,
    tenantId: req.tenantId,
  });

  emitToUser(userId.toString(), 'notification:new', { notification });

  res.status(201).json(
    ApiResponse.success(
      { notification },
      'Notification created successfully',
      201
    )
  );
});

export const broadcastNotification = catchAsync(async (req, res) => {
  const { title, message, type, actionUrl, metadata } = req.body;

  const notifications = await Notification.insertMany(
    req.body.userIds.map((userId) => ({
      userId,
      title,
      message,
      type,
      actionUrl,
      metadata,
      tenantId: req.tenantId,
    }))
  );

  req.body.userIds.forEach((userId) => {
    emitToUser(userId.toString(), 'notification:new', {
      notification: notifications.find((n) => n.userId.toString() === userId),
    });
  });

  res.status(201).json(
    ApiResponse.success(
      { count: notifications.length },
      'Broadcast sent successfully',
      201
    )
  );
});
