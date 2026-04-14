import { body, param, query, validationResult } from 'express-validator';
import ApiError from '../utils/apiError.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  throw ApiError.badRequest('Validation failed: ' + extractedErrors.map(e => e.message).join(', '));
};

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'manager', 'viewer']).withMessage('Invalid role'),
  validate,
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

export const customerValidator = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('company').optional().trim(),
  body('phone').optional().trim(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'churned']).withMessage('Invalid status'),
  body('value').optional().isNumeric().withMessage('Value must be a number'),
  validate,
];

export const reportValidator = [
  body('name').trim().notEmpty().withMessage('Report name is required'),
  body('type').isIn(['analytics', 'crm', 'revenue', 'custom']).withMessage('Invalid report type'),
  body('description').optional().trim(),
  validate,
];

export const idValidator = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate,
];
