const { describe, test, expect, beforeEach, jest } = require('@jest/globals');
const contentProcessor = require('../src/services/contentProcessor');
const { models } = require('../src/db');

jest.mock('../src/db');
jest.mock('openai');

describe('Content Processor', () => {
  let mockPost;

  beforeEach(() => {
    mockPost = {
      id: 1,
      content: 'Test content',
      update: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('Content Processing', () => {
    test('should process content successfully', async () => {
      const processedContent = await contentProcessor.processContent(mockPost);
      expect(processedContent).toBeDefined();
      expect(processedContent).toContain('Mocked response');
      expect(mockPost.update).toHaveBeenCalled();
    });

    test('should handle empty content', async () => {
      mockPost.content = '';
      await expect(contentProcessor.processContent(mockPost)).rejects.toThrow('Content cannot be empty');
    });

    test('should add hashtags to content', async () => {
      const processedContent = await contentProcessor.processContent(mockPost);
      expect(processedContent).toContain('#');
    });

    test('should add emojis to content', async () => {
      const processedContent = await contentProcessor.processContent(mockPost);
      expect(processedContent).toBeDefined();
    });
  });

  describe('Content Rewriting', () => {
    test('should rewrite content while preserving meaning', async () => {
      const rewritten = await contentProcessor.rewriteContent('Original text');
      expect(rewritten).toBeDefined();
      expect(rewritten).not.toBe('Original text');
    });

    test('should handle API errors during rewriting', async () => {
      jest.spyOn(contentProcessor.openai, 'createChatCompletion')
        .mockRejectedValueOnce(new Error('API Error'));
      
      await expect(contentProcessor.rewriteContent('Test'))
        .rejects.toThrow('API Error');
    });
  });

  describe('Platform Optimization', () => {
    test('should optimize for different platforms', async () => {
      const platforms = ['telegram', 'instagram', 'facebook'];
      
      for (const platform of platforms) {
        const optimized = await contentProcessor.optimizeForPlatform('test content', platform);
        expect(optimized).toBeDefined();
        expect(optimized).toContain('Mocked response');
      }
    });

    test('should respect platform length limits', async () => {
      const longContent = 'a'.repeat(5000);
      const optimized = await contentProcessor.optimizeForPlatform(longContent, 'instagram');
      expect(optimized.length).toBeLessThanOrEqual(2200);
    });
  });

  describe('Toxicity Detection', () => {
    test('should detect toxic content', async () => {
      const isToxic = await contentProcessor.detectToxicity('toxic content');
      expect(isToxic).toBeDefined();
    });

    test('should handle API errors in toxicity detection', async () => {
      jest.spyOn(contentProcessor.openai, 'createModeration')
        .mockRejectedValueOnce(new Error('API Error'));
      
      await expect(contentProcessor.detectToxicity('test'))
        .rejects.toThrow('API Error');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors', async () => {
      mockPost.update.mockRejectedValueOnce(new Error('DB Error'));
      await expect(contentProcessor.processContent(mockPost))
        .rejects.toThrow('DB Error');
    });

    test('should handle null post', async () => {
      await expect(contentProcessor.processContent(null))
        .rejects.toThrow();
    });

    test('should handle undefined content', async () => {
      mockPost.content = undefined;
      await expect(contentProcessor.processContent(mockPost))
        .rejects.toThrow('Content cannot be empty');
    });
  });
});