const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GeneratedFile = sequelize.define('GeneratedFile', {
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
  fileType: {
    type: DataTypes.ENUM('video', 'certificate_ar', 'certificate_en'),
    allowNull: false,
    field: 'file_type'
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_path'
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_url'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    field: 'file_size',
    comment: 'File size in bytes'
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
  tableName: 'generated_files',
  timestamps: true,
  underscored: true
});

module.exports = GeneratedFile;
