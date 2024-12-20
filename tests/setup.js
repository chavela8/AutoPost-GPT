require('dotenv').config();

// Импортируем jest явно
const jest = require('@jest/globals').jest;

// Mock для OpenAI
jest.mock('openai', () => ({
  Configuration: jest.fn(),
  OpenAIApi: jest.fn().mockImplementation(() => ({
    createChatCompletion: jest.fn().mockResolvedValue({
      data: {
        choices: [{ message: { content: 'Mocked response #hashtag' } }]
      }
    }),
    createModeration: jest.fn().mockResolvedValue({
      data: {
        results: [{ flagged: false }]
      }
    })
  }))
}));

// Глобальные моки для тестов
global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn()
};

// Очистка моков будет происходить в каждом тестовом файле