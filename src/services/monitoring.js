const { models } = require('../db');
const logger = require('../utils/logger');
const NotificationService = require('./notifier');

class MonitoringService {
  constructor() {
    this.notifier = new NotificationService();
    this.thresholds = {
      engagementRate: 0.02,
      viewsDecline: 20,
      errorRate: 0.05
    };
  }

  async monitorPerformance() {
    try {
      // Проверка показателей эффективности
      const metrics = await this.getRecentMetrics();
      
      if (metrics.engagementRate < this.thresholds.engagementRate) {
        await this.notifier.alert('low_engagement', {
          current: metrics.engagementRate,
          threshold: this.thresholds.engagementRate
        });
      }

      // Мониторинг ошибок
      const errors = await this.getErrorRate();
      if (errors.rate > this.thresholds.errorRate) {
        await this.notifier.alert('high_error_rate', {
          rate: errors.rate,
          details: errors.details
        });
      }

      // Анализ трендов
      const trends = await this.analyzeTrends();
      if (trends.needsAttention) {
        await this.notifier.alert('trend_alert', trends);
      }
    } catch (error) {
      logger.error('Monitoring error:', error);
    }
  }

  async analyzeTrends() {
    const recentPosts = await models.Post.findAll({
      where: {
        publishedAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: ['analytics']
    });

    return {
      viewsTrend: this.calculateTrend(recentPosts.map(p => p.analytics.views)),
      engagementTrend: this.calculateTrend(recentPosts.map(p => p.analytics.engagementRate)),
      needsAttention: false // Логика определения необходимости внимания
    };
  }
}

module.exports = new MonitoringService();  