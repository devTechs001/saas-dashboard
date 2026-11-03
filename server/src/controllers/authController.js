import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/apiError.js';
import logger from '../utils/logger.js';
import { isDbAvailable } from '../config/database.js';
import { memoryStore } from '../store/memoryStore.js';

// In memory-store mode (no MongoDB), auth runs against the in-memory users so
// login/register/profile work end-to-end on real HTTP endpoints.

export const register = catchAsync(async (req, res) => {
  const { name, email, password, role, permissions } = req.body;

  if (!isDbAvailable()) {
    if (memoryStore.findUserByEmail(email)) {
      throw ApiError.conflict('User with this email already exists');
    }
    const user = {
      id: memoryStore.uid('usr'),
      name: String(name || 'New user').trim().slice(0, 120),
      email: String(email || '').toLowerCase().trim(),
      password: bcrypt.hashSync(String(password || 'password123'), 10),
      role: ['admin', 'manager', 'viewer'].includes(role) ? role : 'viewer',
      permissions: permissions || ['read'],
      tenantId: 'default',
      title: '',
      status: 'offline',
      isActive: true,
      tasksDone: 0,
      createdAt: memoryStore.now(),
      lastLogin: null,
    };
    memoryStore.db.users.push(user);
    res.status(201).json(
      ApiResponse.success(
        { user: memoryStore.publicUser(user), token: `demo-user-${user.id}` },
        'User registered successfully',
        201
      )
    );
    return;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'viewer',
    permissions: permissions || ['read'],
    tenantId: req.tenantId || 'default',
  });

  const token = user.getSignedJwtToken();

  res.status(201).json(
    ApiResponse.success(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
        token,
      },
      'User registered successfully',
      201
    )
  );
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!isDbAvailable()) {
    const user = memoryStore.findUserByEmail(email);
    if (!user || !bcrypt.compareSync(String(password || ''), user.password || '')) {
      throw ApiError.unauthorized('Invalid credentials');
    }
    if (user.isActive === false) throw ApiError.unauthorized('Account is deactivated');
    user.lastLogin = memoryStore.now();
    res.json(
      ApiResponse.success(
        { user: memoryStore.publicUser(user), token: `demo-user-${user.id}` },
        'Login successful'
      )
    );
    return;
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Account is deactivated');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  user.lastLogin = new Date();
  await user.save();

  const token = user.getSignedJwtToken();

  res.json(
    ApiResponse.success(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          avatar: user.avatar,
        },
        token,
      },
      'Login successful'
    )
  );
});

export const getProfile = catchAsync(async (req, res) => {
  if (!isDbAvailable()) {
    const user = memoryStore.findUser(req.user.id || req.user._id);
    if (!user) throw ApiError.notFound('User not found');
    res.json(ApiResponse.success({ user: memoryStore.publicUser(user) }));
    return;
  }
  const user = await User.findById(req.user.id);
  res.json(ApiResponse.success({ user }));
});

export const updateProfile = catchAsync(async (req, res) => {
  const { name, avatar, coverPhoto, title, phone } = req.body;

  if (!isDbAvailable()) {
    const user = memoryStore.findUser(req.user.id || req.user._id);
    if (!user) throw ApiError.notFound('User not found');
    if (name !== undefined) user.name = String(name).trim().slice(0, 120);
    if (avatar !== undefined) user.avatar = avatar;
    if (coverPhoto !== undefined) user.coverPhoto = coverPhoto;
    if (title !== undefined) user.title = title;
    if (phone !== undefined) user.phone = phone;
    res.json(ApiResponse.success({ user: memoryStore.publicUser(user) }, 'Profile updated successfully'));
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, avatar, coverPhoto, title, phone },
    { new: true, runValidators: true }
  );

  res.json(ApiResponse.success({ user }, 'Profile updated successfully'));
});

// Request a password reset. Always returns the same generic message so the
// endpoint cannot be used to probe which emails are registered (security).
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });
    // Delivery (email) is handled by the notification service; the token is
    // only logged in development for local flows.
    if (process.env.NODE_ENV === 'development') {
      logger.info(`Password reset token for ${email}: ${resetToken}`);
    }
  }

  res.json(ApiResponse.success({}, 'If that email exists, a reset link has been sent'));
});

// Complete a password reset with the emailed token.
export const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) throw ApiError.badRequest('Token and password are required');

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) throw ApiError.badRequest('Reset token is invalid or has expired');

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json(ApiResponse.success({}, 'Password has been reset successfully'));
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json(ApiResponse.success({}, 'Password changed successfully'));
});

export const getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = '', role = '' } = req.query;

  const query = { tenantId: req.tenantId };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) {
    query.role = role;
  }

  const users = await User.find(query)
    .select('-password')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await User.countDocuments(query);

  res.json(
    ApiResponse.success(
      {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
      'Users retrieved successfully'
    )
  );
});

export const getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  res.json(ApiResponse.success({ user }));
});

export const updateUser = catchAsync(async (req, res) => {
  const { name, email, role, permissions, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role, permissions, isActive },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.json(ApiResponse.success({ user }, 'User updated successfully'));
});

export const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  res.json(ApiResponse.success({}, 'User deleted successfully'));
});
