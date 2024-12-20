const { describe, test, expect, beforeEach, jest } = require('@jest/globals');
const ErrorHandler = require('../src/utils/errorHandler');
const logger = require('../utils/logger');

jest.mock('../utils/logger');

describe('Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Processing', () => {
    test('should handle basic error', async () => {
      const error = new Error('Test error');
      const context = { userId: 1 };

      const result = await ErrorHandler.handle(error, context);

      expect(result.success).toBe(false);
      expect(result.error.message).toBe('Test error');
      expect(logger.error).toHaveBeenCalled();
    });

    test('should handle critical error', async () => {
      const error = new Error('Critical error');
      error.critical = true;

      const result = await ErrorHandler.handle(error);

      expect(result.success).toBe(false);
      expect(result.error.message).toBe('Critical error');
    });

    test('should mask error message in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Sensitive error');
      const result = await ErrorHandler.handle(error);

      expect(result.error.message).toBe('An unexpected error occurred');

      process.env.NODE_ENV = originalEnv;
    });

    test('should include error code if available', async () => {
      const error = new Error('Error with code');
      error.code = 'CUSTOM_ERROR';

      const result = await ErrorHandler.handle(error);

      expect(result.error.code).toBe('CUSTOM_ERROR');
    });

    test('should use UNKNOWN_ERROR code if not provided', async () => {
      const error = new Error('Error without code');

      const result = await ErrorHandler.handle(error);

      expect(result.error.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('Critical Error Detection', () => {
    test('should detect critical error by flag', () => {
      const error = new Error('Critical error');
      error.critical = true;

      expect(ErrorHandler.isCriticalError(error)).toBe(true);
    });

    test('should detect critical error by name', () => {
      const error = new Error('System error');
      error.name = 'SystemError';

      expect(ErrorHandler.isCriticalError(error)).toBe(true);
    });

    test('should detect critical error by code', () => {
      const error = new Error('Critical error');
      error.code = 'CRITICAL';

      expect(ErrorHandler.isCriticalError(error)).toBe(true);
    });

    test('should not detect normal error as critical', () => {
      const error = new Error('Normal error');

      expect(ErrorHandler.isCriticalError(error)).toBe(false);
    });
  });

  describe('Error Context', () => {
    test('should include timestamp in error info', async () => {
      const error = new Error('Test error');
      await ErrorHandler.handle(error);

      expect(logger.error).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          timestamp: expect.any(String)
        })
      );
    });

    test('should use ISO format for timestamp', async () => {
      const error = new Error('Test error');
      await ErrorHandler.handle(error);

      expect(logger.error).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        })
      );
    });

    test('should include stack trace in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      await ErrorHandler.handle(error);

      expect(logger.error).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          stack: expect.any(String)
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
});