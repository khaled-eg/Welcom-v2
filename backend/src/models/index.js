const Student = require('./Student');
const Request = require('./Request');
const GeneratedFile = require('./GeneratedFile');

// Define associations
Student.hasMany(Request, { foreignKey: 'studentId', as: 'requests' });
Request.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Student.hasMany(GeneratedFile, { foreignKey: 'studentId', as: 'files' });
GeneratedFile.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

module.exports = {
  Student,
  Request,
  GeneratedFile
};
