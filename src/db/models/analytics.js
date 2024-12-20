const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Analytics = sequelize.define('Analytics', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    reactions: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    timeOfDay: {
      type: DataTypes.INTEGER
    },
    engagementRate: {
      type: DataTypes.FLOAT
    },
    contentType: {
      type: DataTypes.STRING
    }
  });

  Analytics.associate = (models) => {
    Analytics.belongsTo(models.Post);
  };

  return Analytics;
};  