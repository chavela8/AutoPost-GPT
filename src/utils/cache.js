const NodeCache = require('node-cache');
const logger = require('./logger');

class CacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 3600, // 1 час
      checkperiod: 600 // проверка каждые 10 минут
    });
  }

  async getOrSet(key, fetchFunction, ttl = 3600) {
    try {
      let value = this.cache.get(key);
      if (value) return value;

      value = await fetchFunction();
      this.cache.set(key, value, ttl);
      return value;
    } catch (error) {
      logger.error('Cache error:', error);
      return null;
    }
  }
}

module.exports = new CacheService();  