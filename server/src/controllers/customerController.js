import Customer from '../models/Customer.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/apiError.js';
import { getIO } from '../config/socket.js';

export const getAllCustomers = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    sort = 'createdAt',
    order = 'desc',
  } = req.query;

  const query = { tenantId: req.tenantId };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) {
    query.status = status;
  }

  const customers = await Customer.find(query)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ [sort]: order === 'asc' ? 1 : -1 });

  const count = await Customer.countDocuments(query);

  res.json(
    ApiResponse.success(
      {
        customers,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
      'Customers retrieved successfully'
    )
  );
});

export const getCustomerById = catchAsync(async (req, res) => {
  const customer = await Customer.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!customer) {
    throw ApiError.notFound('Customer not found');
  }

  res.json(ApiResponse.success({ customer }));
});

export const createCustomer = catchAsync(async (req, res) => {
  const {
    name,
    email,
    company,
    phone,
    address,
    status,
    value,
    tags,
    notes,
    assignedTo,
    lastContactDate,
    nextFollowUp,
    source,
  } = req.body;

  const existingCustomer = await Customer.findOne({
    email,
    tenantId: req.tenantId,
  });
  if (existingCustomer) {
    throw ApiError.conflict('Customer with this email already exists');
  }

  const customer = await Customer.create({
    name,
    email,
    company,
    phone,
    address,
    status,
    value,
    tags,
    notes,
    assignedTo,
    lastContactDate,
    nextFollowUp,
    source,
    tenantId: req.tenantId,
    createdBy: req.user.id,
  });

  const io = getIO();
  if (io) {
    io.emit('customer_created', { customer, tenantId: req.tenantId });
  }

  res.status(201).json(
    ApiResponse.success({ customer }, 'Customer created successfully', 201)
  );
});

export const updateCustomer = catchAsync(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!customer) {
    throw ApiError.notFound('Customer not found');
  }

  const io = getIO();
  if (io) {
    io.emit('customer_updated', { customer, tenantId: req.tenantId });
  }

  res.json(ApiResponse.success({ customer }, 'Customer updated successfully'));
});

export const deleteCustomer = catchAsync(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);

  if (!customer) {
    throw ApiError.notFound('Customer not found');
  }

  const io = getIO();
  if (io) {
    io.emit('customer_deleted', { customerId: req.params.id, tenantId: req.tenantId });
  }

  res.json(ApiResponse.success({}, 'Customer deleted successfully'));
});

export const getCustomerStats = catchAsync(async (req, res) => {
  const stats = await Customer.aggregate([
    { $match: { tenantId: req.tenantId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$value' },
      },
    },
  ]);

  const totalCustomers = await Customer.countDocuments({ tenantId: req.tenantId });
  const totalValue = await Customer.aggregate([
    { $match: { tenantId: req.tenantId } },
    { $group: { _id: null, total: { $sum: '$value' } } },
  ]);

  res.json(
    ApiResponse.success({
      stats,
      totalCustomers,
      totalValue: totalValue[0]?.total || 0,
    })
  );
});

export const searchCustomers = catchAsync(async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    throw ApiError.badRequest('Search query must be at least 2 characters');
  }

  const customers = await Customer.find({
    tenantId: req.tenantId,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { company: { $regex: q, $options: 'i' } },
    ],
  })
    .limit(10)
    .select('name email company status');

  res.json(ApiResponse.success({ customers }));
});
