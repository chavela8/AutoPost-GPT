const InstagramService = require('./instagram');
const VKService = require('./vk');
const FacebookService = require('./facebook');
const logger = require('../../utils/logger');

class SocialMediaManager {
  constructor() {
    this.platforms = {
      instagram: new InstagramService(),
      vk: new VKService(),
      facebook: new FacebookService()
    };
  }

  async publishToAll(content, options = {}) {
    const results = {};
    const errors = [];

    for (const [platform, service] of Object.entries(this.platforms)) {
      try {
        if (options[platform]?.enabled !== false) {
          results[platform] = await service.publish(content, options[platform]);
          logger.info(`Content published to ${platform} successfully`);
        }
      } catch (error) {
        logger.error(`Error publishing to ${platform}:`, error);
        errors.push({ platform, error });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors
    };
  }

  async getAnalytics(platform, timeRange) {
    try {
      const service = this.platforms[platform];
      if (!service) {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      return await service.getAnalytics(timeRange);
    } catch (error) {
      logger.error(`Error getting analytics for ${platform}:`, error);
      throw error;
    }
  }
}

module.exports = new SocialMediaManager();  