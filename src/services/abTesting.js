const { models } = require('../db');
const logger = require('../utils/logger');

class ABTestingService {
  async createTest(options) {
    const {
      originalContent,
      variations,
      targetAudience,
      duration,
      metrics
    } = options;

    try {
      // Создаем варианты контента
      const testVariations = await Promise.all(
        variations.map(async (variation) => {
          const processed = await this.processContent(originalContent, variation);
          return {
            content: processed,
            metrics: {},
            audience: this.splitAudience(targetAudience, variations.length)
          };
        })
      );

      const test = await models.ABTest.create({
        originalContent,
        variations: testVariations,
        startDate: new Date(),
        duration,
        metrics,
        status: 'active'
      });

      this.scheduleTestCompletion(test.id, duration);
      return test;
    } catch (error) {
      logger.error('Error creating A/B test:', error);
      throw error;
    }
  }

  async analyzeResults(testId) {
    const test = await models.ABTest.findByPk(testId, {
      include: ['variations', 'metrics']
    });

    const winner = test.variations.reduce((best, current) => {
      return current.metrics.engagementRate > best.metrics.engagementRate
        ? current
        : best;
    });

    return {
      winner,
      improvements: this.calculateImprovements(test.originalMetrics, winner.metrics),
      recommendations: await this.generateRecommendations(test)
    };
  }
}

module.exports = new ABTestingService();  