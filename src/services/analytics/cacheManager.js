const NodeCache = require('node-cache');
const logger = require('../../utils/logger');

class AnalyticsCacheManager {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 1800, // 30 минут
      checkperiod: 300, // проверка каждые 5 минут
      useClones: false
    });

    this.keys = {
      PERFORMANCE_METRICS: 'performance_metrics',
      TRENDING_TOPICS: 'trending_topics',
      ENGAGEMENT_STATS: 'engagement_stats'
    };
  }

  async getOrSet(key, fetchFunction, ttl = 1800) {
    try {
      let data = this.cache.get(key);
      if (data) {
        logger.debug(`Cache hit for key: ${key}`);
        return data;
      }

      logger.debug(`Cache miss for key: ${key}, fetching data`);
      data = await fetchFunction();
      this.cache.set(key, data, ttl);
      return data;
    } catch (error) {
      logger.error(`Cache error for key ${key}:`, error);
      throw error;
    }
  }

  async invalidateCache(key) {
    try {
      this.cache.del(key);
      logger.info(`Cache invalidated for key: ${key}`);
    } catch (error) {
      logger.error(`Error invalidating cache for key ${key}:`, error);
    }
  }
}

module.exports = new AnalyticsCacheManager();  