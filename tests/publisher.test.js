const { describe, test, expect, beforeEach, jest } = require('@jest/globals');
const { publishPost } = require('../src/services/publisher');
const { models } = require('../src/db');
const logger = require('../utils/logger');

jest.mock('../src/db');
jest.mock('../utils/logger');

describe('Publisher Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Post Publishing', () => {
    test('should publish post successfully', async () => {
      const mockPost = {
        id: 1,
        status: 'processed',
        save: jest.fn(),
        processedContent: 'Test content'
      };

      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);

      const result = await publishPost(1);
      
      expect(result).toBe(mockPost);
      expect(mockPost.status).toBe('published');
      expect(mockPost.publishedAt).toBeInstanceOf(Date);
      expect(mockPost.save).toHaveBeenCalled();
    });

    test('should set correct publication timestamp', async () => {
      const mockPost = {
        id: 1,
        status: 'processed',
        processedContent: 'Test content',
        save: jest.fn()
      };

      const beforePublish = new Date();
      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);
      
      await publishPost(1);
      const afterPublish = new Date();
      
      expect(mockPost.publishedAt.getTime()).toBeGreaterThanOrEqual(beforePublish.getTime());
      expect(mockPost.publishedAt.getTime()).toBeLessThanOrEqual(afterPublish.getTime());
    });

    test('should throw error for non-existent post', async () => {
      models.Post.findByPk = jest.fn().mockResolvedValue(null);
      await expect(publishPost(999)).rejects.toThrow('Post with id 999 not found');
    });

    test('should handle database errors', async () => {
      const mockPost = {
        id: 1,
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);

      await expect(publishPost(1)).rejects.toThrow('Database error');
      expect(logger.error).toHaveBeenCalled();
    });

    test('should validate post status before publishing', async () => {
      const mockPost = {
        id: 1,
        status: 'draft',
        save: jest.fn()
      };

      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);
      await expect(publishPost(1)).rejects.toThrow('Post is not ready for publishing');
    });

    test('should handle empty processed content', async () => {
      const mockPost = {
        id: 1,
        status: 'processed',
        processedContent: '',
        save: jest.fn()
      };

      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);
      await expect(publishPost(1)).rejects.toThrow('Post has no processed content');
    });

    test('should handle undefined processed content', async () => {
      const mockPost = {
        id: 1,
        status: 'processed',
        save: jest.fn()
      };

      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);
      await expect(publishPost(1)).rejects.toThrow('Post has no processed content');
    });
  });

  describe('Publishing Validation', () => {
    test('should check for required fields', async () => {
      const mockPost = {
        id: 1,
        status: 'processed',
        save: jest.fn()
      };

      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);
      await expect(publishPost(1)).rejects.toThrow();
    });

    test('should validate post ID', async () => {
      await expect(publishPost(null)).rejects.toThrow('Invalid post ID');
      await expect(publishPost(undefined)).rejects.toThrow('Invalid post ID');
      await expect(publishPost(-1)).rejects.toThrow('Invalid post ID');
      await expect(publishPost(0)).rejects.toThrow('Invalid post ID');
    });
  });

  describe('Error Logging', () => {
    test('should log publishing errors', async () => {
      models.Post.findByPk = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await expect(publishPost(1)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalledWith(
        'Error publishing post:',
        expect.any(Error)
      );
    });

    test('should include post ID in error logs', async () => {
      const postId = 123;
      models.Post.findByPk = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await expect(publishPost(postId)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(postId.toString()),
        expect.any(Error)
      );
    });

    test('should preserve original error message', async () => {
      const errorMessage = 'Custom error message';
      models.Post.findByPk = jest.fn().mockRejectedValue(new Error(errorMessage));
      
      await expect(publishPost(1)).rejects.toThrow(errorMessage);
    });
  });
});