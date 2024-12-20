const { describe, test, expect, beforeEach, jest } = require('@jest/globals');
const { ContentFilter } = require('../src/services/contentFilter');

describe('Content Filter', () => {
  let filter;

  beforeEach(() => {
    filter = new ContentFilter();
    jest.clearAllMocks();
  });

  describe('Content Filtering', () => {
    test('should filter blacklisted words', async () => {
      const content = 'Реклама нового продукта';
      const shouldFilter = await filter.shouldFilter(content);
      expect(shouldFilter).toBe(true);
    });

    test('should filter too short content', async () => {
      const content = 'Hi';
      const shouldFilter = await filter.shouldFilter(content);
      expect(shouldFilter).toBe(true);
    });

    test('should filter too long content', async () => {
      const content = 'a'.repeat(5000);
      const shouldFilter = await filter.shouldFilter(content);
      expect(shouldFilter).toBe(true);
    });

    test('should allow valid content', async () => {
      const content = 'This is a valid piece of content that should pass the filter';
      const shouldFilter = await filter.shouldFilter(content);
      expect(shouldFilter).toBe(false);
    });

    test('should handle null content', async () => {
      const shouldFilter = await filter.shouldFilter(null);
      expect(shouldFilter).toBe(true);
    });

    test('should handle empty content', async () => {
      const shouldFilter = await filter.shouldFilter('');
      expect(shouldFilter).toBe(true);
    });

    test('should detect multiple blacklisted words', async () => {
      const content = 'Реклама и скидка на все товары';
      const shouldFilter = await filter.shouldFilter(content);
      expect(shouldFilter).toBe(true);
    });

    // Добавлен новый тест
    test('should filter content matching multiple conditions', async () => {
      const content = 'a'.repeat(5000) + ' реклама';
      const shouldFilter = await filter.shouldFilter(content);
      expect(shouldFilter).toBe(true);
    });
  });

  describe('Media Filtering', () => {
    test('should filter media by type', async () => {
      const urls = ['image.jpg', 'video.mp4', 'document.pdf'];
      jest.spyOn(filter, 'detectMediaType').mockImplementation(async (url) => {
        if (url.endsWith('.jpg')) return 'image/jpeg';
        if (url.endsWith('.mp4')) return 'video/mp4';
        return 'application/pdf';
      });
      jest.spyOn(filter, 'getMediaSize').mockResolvedValue(1024 * 1024); // 1MB

      const filteredUrls = await filter.filterMedia(urls);
      expect(filteredUrls).toHaveLength(2); // только jpg и mp4
    });

    test('should filter media by size', async () => {
      const urls = ['large.jpg', 'small.jpg'];
      jest.spyOn(filter, 'detectMediaType').mockResolvedValue('image/jpeg');
      jest.spyOn(filter, 'getMediaSize').mockImplementation(async (url) => {
        return url.startsWith('large') ? 30 * 1024 * 1024 : 1024 * 1024;
      });

      const filteredUrls = await filter.filterMedia(urls);
      expect(filteredUrls).toHaveLength(1); // только small.jpg
    });

    test('should handle empty media array', async () => {
      const filteredUrls = await filter.filterMedia([]);
      expect(filteredUrls).toHaveLength(0);
    });

    test('should handle invalid media urls', async () => {
      jest.spyOn(filter, 'detectMediaType').mockResolvedValue(null);
      jest.spyOn(filter, 'getMediaSize').mockResolvedValue(0);

      const filteredUrls = await filter.filterMedia(['invalid.url']);
      expect(filteredUrls).toHaveLength(0);
    });
  });

  describe('Content Type Detection', () => {
    test('should detect content type', async () => {
      const content = 'Normal content';
      const type = await filter.detectContentType(content);
      expect(type).toBeNull();
    });

    test('should handle adult content', async () => {
      jest.spyOn(filter, 'detectContentType').mockResolvedValue(filter.contentTypes.ADULT);
      const content = 'Some content';
      const shouldFilter = await filter.shouldFilter(content);
      expect(shouldFilter).toBe(true);
    });

    test('should handle spam content', async () => {
      jest.spyOn(filter, 'detectContentType').mockResolvedValue(filter.contentTypes.SPAM);
      const content = 'Some content';
      const shouldFilter = await filter.shouldFilter(content);
      expect(shouldFilter).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle errors in content filtering', async () => {
      jest.spyOn(filter, 'detectContentType').mockRejectedValue(new Error('API Error'));
      const content = 'Test content';
      const shouldFilter = await filter.shouldFilter(content);
      expect(shouldFilter).toBe(true); // При ошибке лучше отфильтровать
    });

    test('should handle errors in media filtering', async () => {
      jest.spyOn(filter, 'detectMediaType').mockRejectedValue(new Error('Network Error'));
      const urls = ['test.jpg'];
      const filteredUrls = await filter.filterMedia(urls);
      expect(filteredUrls).toHaveLength(0);
    });
  });
});