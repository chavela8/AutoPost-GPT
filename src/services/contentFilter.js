const { models } = require('../db');
const logger = require('../utils/logger');
const axios = require('axios');

class ContentFilter {
  constructor() {
    this.blacklist = new Set([
      'реклама', 'продажа', 'скидка', 'акция',
      'распродажа', 'промокод', 'affiliate'
    ]);

    this.contentTypes = {
      ADULT: 'adult',
      SPAM: 'spam',
      VIOLENCE: 'violence',
      GAMBLING: 'gambling'
    };
  }

  async shouldFilter(content) {
    try {
      if (!content || content.length < 10 || content.length > 4096) {
        return true;
      }

      const hasBlacklistedWords = Array.from(this.blacklist).some(
        word => content.toLowerCase().includes(word)
      );

      if (hasBlacklistedWords) {
        return true;
      }

      const contentType = await this.detectContentType(content);
      if (Object.values(this.contentTypes).includes(contentType)) {
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error in content filter:', error);
      return true;
    }
  }

  async detectMediaType(url) {
    try {
      const response = await axios.head(url);
      return response.headers['content-type'];
    } catch (error) {
      logger.error('Error detecting media type:', error);
      return null;
    }
  }

  async getMediaSize(url) {
    try {
      const response = await axios.head(url);
      return parseInt(response.headers['content-length'] || '0');
    } catch (error) {
      logger.error('Error getting media size:', error);
      return 0;
    }
  }

  async detectContentType(content) {
    // В реальном приложении здесь может быть интеграция с AI
    // для определения типа контента
    return null;
  }

  isMediaAllowed(type, size) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    const maxSize = 20 * 1024 * 1024; // 20MB

    return allowedTypes.includes(type) && size <= maxSize;
  }

  async filterMedia(mediaUrls) {
    try {
      const filteredUrls = [];
      for (const url of mediaUrls) {
        const mediaType = await this.detectMediaType(url);
        const mediaSize = await this.getMediaSize(url);
        
        if (this.isMediaAllowed(mediaType, mediaSize)) {
          filteredUrls.push(url);
        }
      }
      return filteredUrls;
    } catch (error) {
      logger.error('Error filtering media:', error);
      return [];
    }
  }
}

module.exports = { ContentFilter };