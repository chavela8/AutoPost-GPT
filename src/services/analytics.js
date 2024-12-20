const { models } = require('../db');
const logger = require('../utils/logger');

class AnalyticsService {
  async trackPostPerformance(postId) {
    try {
      const post = await models.Post.findByPk(postId);
      const views = await this.getPostViews(post.sourceMessageId);
      const reactions = await this.getPostReactions(post.sourceMessageId);
      
      await models.Analytics.create({
        postId,
        views,
        reactions,
        publishedAt: post.publishedAt,
        timeOfDay: new Date(post.publishedAt).getHours()
      });
    } catch (error) {
      logger.error('Error tracking post performance:', error);
    }
  }

  async getBestPublishingTimes() {
    const results = await models.Analytics.findAll({
      attributes: [
        'timeOfDay',
        [sequelize.fn('AVG', sequelize.col('views')), 'avgViews'],
        [sequelize.fn('AVG', sequelize.col('reactions')), 'avgReactions']
      ],
      group: ['timeOfDay'],
      order: [[sequelize.literal('avgViews'), 'DESC']]
    });

    return results;
  }

  async getContentPerformanceReport() {
    // Анализ наиболее успешных тем и форматов контента
    // на основе просмотров и реакций
  }
}

module.exports = new AnalyticsService();  