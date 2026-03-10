import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    company: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'churned'],
      default: 'pending',
      index: true,
    },
    value: {
      type: Number,
      default: 0,
    },
    tags: [String],
    notes: {
      type: String,
      maxlength: 2000,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    lastContactDate: {
      type: Date,
    },
    nextFollowUp: {
      type: Date,
    },
    source: {
      type: String,
      enum: ['website', 'referral', 'social', 'advertisement', 'other'],
      default: 'other',
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.index({ name: 'text', email: 'text', company: 'text' });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
