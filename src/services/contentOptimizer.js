const { models } = require('../db');
const logger = require('../utils/logger');

class ContentOptimizer {
  async optimizeContent(content, targetMetrics = {}) {
    try {
      // Анализ успешного контента
      const successfulPosts = await this.getSuccessfulPosts();
      const patterns = await this.analyzePatterns(successfulPosts);

      // Генерация оптимизированного контента
      const optimized = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: `Optimize the content using these successful patterns: ${JSON.stringify(patterns)}`
        }, {
          role: "user",
          content
        }]
      });

      // Проверка оптимизированного контента
      const quality = await this.assessQuality(optimized.data.choices[0].message.content);
      
      if (quality.score < 0.8) {
        return await this.reoptimize(content, quality.recommendations);
      }

      return {
        content: optimized.data.choices[0].message.content,
        improvements: quality.improvements,
        predictedMetrics: await this.predictMetrics(optimized.data.choices[0].message.content)
      };
    } catch (error) {
      logger.error('Content optimization error:', error);
      throw error;
    }
  }

  async analyzePatterns(posts) {
    // Анализ паттернов успешного контента
    const patterns = {
      structure: await this.analyzeStructure(posts),
      language: await this.analyzeLanguage(posts),
      timing: await this.analyzeTiming(posts)
    };

    return patterns;
  }
}

module.exports = new ContentOptimizer();  