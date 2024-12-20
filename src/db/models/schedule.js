const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Schedule = sequelize.define('Schedule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    channelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    postsPerDay: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    minInterval: {
      type: DataTypes.INTEGER, // в минутах
      defaultValue: 60
    },
    activeHoursStart: {
      type: DataTypes.INTEGER,
      defaultValue: 9
    },
    activeHoursEnd: {
      type: DataTypes.INTEGER,
      defaultValue: 21
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC+3'
    }
  });

  Schedule.associate = (models) => {
    Schedule.belongsTo(models.Channel);
  };

  return Schedule;
};  