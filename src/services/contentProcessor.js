const { Configuration, OpenAIApi } = require('openai');
const { models } = require('../db');
const logger = require('../utils/logger');

class ContentProcessor {
  constructor() {
    this.openai = new OpenAIApi(
      new Configuration({
        apiKey: process.env.OPENAI_API_KEY
      })
    );
  }

  async processContent(post) {
    try {
      if (!post.content) {
        throw new Error('Content cannot be empty');
      }

      const originalContent = post.content;

      // Перефразируем текст через GPT
      const processedContent = await this.rewriteContent(originalContent);
      
      // Генерируем хэштеги
      const hashtags = await this.generateHashtags(processedContent);
      
      // Добавляем эмодзи
      const contentWithEmoji = await this.addEmojis(processedContent);

      // Финальный контент
      const finalContent = `${contentWithEmoji}\n\n${hashtags}`;

      await post.update({
        processedContent: finalContent,
        status: 'processed'
      });

      return finalContent;
    } catch (error) {
      logger.error('Error processing content:', error);
      throw error;
    }
  }

  async rewriteContent(content) {
    const completion = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "Ты - редактор контента. Перефразируй текст, сохраняя смысл, " +
                "но делая его более интересным и уникальным."
      }, {
        role: "user",
        content
      }]
    });

    return completion.data.choices[0].message.content;
  }

  async generateHashtags(content) {
    const completion = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "Создай 3-5 релевантных хэштегов для этого текста"
      }, {
        role: "user",
        content
      }]
    });

    return completion.data.choices[0].message.content;
  }

  async addEmojis(content) {
    const completion = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "Добавь подходящие эмодзи в текст, делая его более живым и привлекательным"
      }, {
        role: "user",
        content
      }]
    });

    return completion.data.choices[0].message.content;
  }

  async detectToxicity(content) {
    const completion = await this.openai.createModeration({
      input: content
    });

    return completion.data.results[0].flagged;
  }

  async optimizeForPlatform(content, platform) {
    const platformGuidelines = {
      telegram: {
        maxLength: 4096,
        supportedFormats: ['text', 'markdown']
      },
      instagram: {
        maxLength: 2200,
        supportedFormats: ['text']
      },
      facebook: {
        maxLength: 63206,
        supportedFormats: ['text', 'html']
      }
    };

    const completion = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: `Оптимизируй текст для платформы ${platform}, ` +
                `учитывая ограничение в ${platformGuidelines[platform].maxLength} символов`
      }, {
        role: "user",
        content
      }]
    });

    return completion.data.choices[0].message.content;
  }
}

module.exports = new ContentProcessor();