const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Channel = sequelize.define('Channel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    telegramId: {
      type: DataTypes.STRING,
      unique: true
    },
    name: {
      type: DataTypes.STRING
    },
    type: {
      type: DataTypes.ENUM('source', 'target'),
      allowNull: false
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'ru'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return Channel;
};  