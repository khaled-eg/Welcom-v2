const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Validation schemas
 */
const schemas = {
  registerStudent: Joi.object({
    studentName: Joi.string()
      .min(2)
      .max(100)
      .pattern(/^[\u0600-\u06FF\s]+$/)
      .required()
      .messages({
        'string.empty': 'اسم الطالب مطلوب',
        'string.min': 'اسم الطالب يجب أن يكون حرفين على الأقل',
        'string.max': 'اسم الطالب طويل جداً',
        'string.pattern.base': 'يجب إدخال الاسم بالعربي فقط'
      }),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .required()
      .messages({
        'string.empty': 'رقم الهاتف مطلوب',
        'string.pattern.base': 'رقم الهاتف غير صحيح'
      }),
    gradeLevel: Joi.string()
      .required()
      .messages({
        'string.empty': 'الصف الدراسي مطلوب'
      })
  }),

  generateContent: Joi.object({
    studentId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'معرف الطالب يجب أن يكون رقماً',
        'number.positive': 'معرف الطالب غير صحيح',
        'any.required': 'معرف الطالب مطلوب'
      })
  }),

  studentId: Joi.object({
    studentId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'معرف الطالب يجب أن يكون رقماً',
        'number.positive': 'معرف الطالب غير صحيح',
        'any.required': 'معرف الطالب مطلوب'
      })
  })
};

/**
 * Validate request middleware
 */
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];

    if (!schema) {
      logger.error(`Validation schema not found: ${schemaName}`);
      return res.status(500).json({
        status: 'error',
        message: 'خطأ في التحقق من البيانات'
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));

      logger.warn('Validation failed:', errors);

      return res.status(400).json({
        status: 'error',
        message: errors[0].message,
        errors
      });
    }

    // Replace request body with validated value
    req.body = value;
    next();
  };
};

/**
 * Validate params middleware
 */
const validateParams = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];

    if (!schema) {
      logger.error(`Validation schema not found: ${schemaName}`);
      return res.status(500).json({
        status: 'error',
        message: 'خطأ في التحقق من البيانات'
      });
    }

    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));

      return res.status(400).json({
        status: 'error',
        message: errors[0].message,
        errors
      });
    }

    req.params = value;
    next();
  };
};

module.exports = {
  validate,
  validateParams,
  schemas
};
