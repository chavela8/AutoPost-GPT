const { models } = require('../db');
const logger = require('../utils/logger');

class NotificationService {
  constructor(bot) {
    this.bot = bot;
  }

  async notifyAdmins(message, level = 'info') {
    try {
      const admins = await models.Admin.findAll({ where: { isActive: true } });
      
      for (const admin of admins) {
        if (level === 'error' || admin.notificationLevel === 'all') {
          await this.bot.sendMessage(admin.telegramId, message);
        }
      }
    } catch (error) {
      logger.error('Error sending notifications:', error);
    }
  }

  async sendDailyReport(channelId) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const stats = await models.Post.findAndCountAll({
      where: {
        channelId,
        publishedAt: {
          [Op.gte]: yesterday
        }
      }
    });

    const report = `📊 Ежедневный отчет:\n` +
                  `Опубликовано постов: ${stats.count}\n` +
                  `Среднее количество просмотров: ${averageViews}\n` +
                  `Лучшее время публикации: ${bestTime}`;

    await this.notifyAdmins(report);
  }
}

module.exports = NotificationService;  