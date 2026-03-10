import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/apiError.js';

export const register = catchAsync(async (req, res) => {
  const { name, email, password, role, permissions } = req.body;

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
  const user = await User.findById(req.user.id);
  res.json(ApiResponse.success({ user }));
});

export const updateProfile = catchAsync(async (req, res) => {
  const { name, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, avatar },
    { new: true, runValidators: true }
  );

  res.json(ApiResponse.success({ user }, 'Profile updated successfully'));
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
