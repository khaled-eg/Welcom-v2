const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Request = sequelize.define('Request', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'student_id',
    references: {
      model: 'students',
      key: 'id'
    }
  },
  requestType: {
    type: DataTypes.ENUM('video', 'certificate_ar', 'certificate_en'),
    allowNull: false,
    field: 'request_type'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
    allowNull: false
  },
  jobId: {
    type: DataTypes.STRING(100),
    field: 'job_id',
    comment: 'Bull queue job ID'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    field: 'error_message'
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'requests_log',
  timestamps: true,
  underscored: true
});

module.exports = Request;
