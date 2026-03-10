import Report from '../models/Report.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/apiError.js';

export const getAllReports = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, type = '' } = req.query;

  const query = { tenantId: req.tenantId };
  if (type) {
    query.type = type;
  }

  const reports = await Report.find(query)
    .populate('createdBy', 'name email')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Report.countDocuments(query);

  res.json(
    ApiResponse.success(
      {
        reports,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
      'Reports retrieved successfully'
    )
  );
});

export const getReportById = catchAsync(async (req, res) => {
  const report = await Report.findById(req.params.id).populate(
    'createdBy',
    'name email'
  );

  if (!report) {
    throw ApiError.notFound('Report not found');
  }

  res.json(ApiResponse.success({ report }));
});

export const createReport = catchAsync(async (req, res) => {
  const {
    name,
    type,
    description,
    filters,
    dateRange,
    columns,
    chartType,
    isPublic,
    scheduledEmail,
  } = req.body;

  const report = await Report.create({
    name,
    type,
    description,
    filters,
    dateRange,
    columns,
    chartType,
    isPublic,
    scheduledEmail,
    tenantId: req.tenantId,
    createdBy: req.user.id,
  });

  res.status(201).json(
    ApiResponse.success({ report }, 'Report created successfully', 201)
  );
});

export const updateReport = catchAsync(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');

  if (!report) {
    throw ApiError.notFound('Report not found');
  }

  res.json(ApiResponse.success({ report }, 'Report updated successfully'));
});

export const deleteReport = catchAsync(async (req, res) => {
  const report = await Report.findByIdAndDelete(req.params.id);

  if (!report) {
    throw ApiError.notFound('Report not found');
  }

  res.json(ApiResponse.success({}, 'Report deleted successfully'));
});

export const getPublicReports = catchAsync(async (req, res) => {
  const reports = await Report.find({
    tenantId: req.tenantId,
    isPublic: true,
  }).populate('createdBy', 'name email');

  res.json(ApiResponse.success({ reports }));
});
