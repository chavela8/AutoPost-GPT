const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    telegramId: {
      type: DataTypes.STRING,
      unique: true
    },
    username: {
      type: DataTypes.STRING
    },
    notificationLevel: {
      type: DataTypes.ENUM('all', 'errors', 'none'),
      defaultValue: 'all'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  });

  return Admin;
};  