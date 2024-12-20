const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sourceMessageId: {
      type: DataTypes.INTEGER
    },
    content: {
      type: DataTypes.TEXT
    },
    processedContent: {
      type: DataTypes.TEXT
    },
    mediaUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('pending', 'processed', 'published', 'failed'),
      defaultValue: 'pending'
    },
    scheduledFor: {
      type: DataTypes.DATE
    },
    publishedAt: {
      type: DataTypes.DATE
    }
  });

  Post.associate = (models) => {
    Post.belongsTo(models.Channel, { as: 'sourceChannel' });
    Post.belongsTo(models.Channel, { as: 'targetChannel' });
  };

  return Post;
};  