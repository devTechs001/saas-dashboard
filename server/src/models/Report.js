import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a report name'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['analytics', 'crm', 'revenue', 'custom'],
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    filters: {
      type: Object,
      default: {},
    },
    dateRange: {
      startDate: Date,
      endDate: Date,
    },
    columns: [String],
    chartType: {
      type: String,
      enum: ['bar', 'line', 'pie', 'table', 'area'],
      default: 'table',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    scheduledEmail: {
      enabled: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
      },
      recipients: [String],
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
