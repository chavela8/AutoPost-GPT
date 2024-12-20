const { Configuration, OpenAIApi } = require('openai');
const { models } = require('../db');
const logger = require('../utils/logger');

class ContentModerator {
  constructor() {
    this.openai = new OpenAIApi(
      new Configuration({
        apiKey: process.env.OPENAI_API_KEY
      })
    );
  }

  async moderateContent(content) {
    try {
      // Проверка на токсичность через OpenAI
      const moderation = await this.openai.createModeration({
        input: content
      });

      if (moderation.data.results[0].flagged) {
        return {
          approved: false,
          reason: 'Content flagged as inappropriate'
        };
      }

      // Дополнительные проверки
      const customChecks = await this.runCustomChecks(content);

      return {
        approved: customChecks.passed,
        reason: customChecks.reason
      };
    } catch (error) {
      logger.error('Moderation error:', error);
      throw error;
    }
  }

  async runCustomChecks(content) {
    // Пользовательские правила модерации
    // Например, проверка на спам, рекламу и т.д.
  }
}

module.exports = new ContentModerator();  