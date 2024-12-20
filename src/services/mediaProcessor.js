const sharp = require('sharp');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class MediaProcessor {
  async processImage(imageUrl) {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // Оптимизация изображения
      const optimized = await sharp(buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Сохранение в облачное хранилище
      const filename = `${uuidv4()}.jpg`;
      await this.uploadToStorage(optimized, filename);

      return filename;
    } catch (error) {
      logger.error('Error processing image:', error);
      throw error;
    }
  }

  async generateImageFromText(text) {
    // Интеграция с DALL-E для генерации изображений
    // на основе содержания поста
  }
}

module.exports = new MediaProcessor();  