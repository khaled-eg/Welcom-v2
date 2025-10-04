const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'student_name',
    validate: {
      notEmpty: {
        msg: 'اسم الطالب مطلوب'
      },
      len: {
        args: [2, 100],
        msg: 'اسم الطالب يجب أن يكون بين 2 و 100 حرف'
      },
      isArabic(value) {
        if (!/^[\u0600-\u06FF\s]+$/.test(value)) {
          throw new Error('يجب إدخال الاسم بالعربي فقط');
        }
      }
    }
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: {
      msg: 'رقم الهاتف مسجل مسبقاً'
    },
    field: 'phone_number',
    validate: {
      notEmpty: {
        msg: 'رقم الهاتف مطلوب'
      },
      is: {
        args: /^[0-9]{10,15}$/,
        msg: 'رقم الهاتف غير صحيح'
      }
    }
  },
  gradeLevel: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'grade_level',
    validate: {
      notEmpty: {
        msg: 'الصف الدراسي مطلوب'
      }
    }
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
  tableName: 'students',
  timestamps: true,
  underscored: true
});

module.exports = Student;
