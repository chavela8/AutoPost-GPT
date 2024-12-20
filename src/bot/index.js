const TelegramBot = require('node-telegram-bot-api');
const { handleMessage } = require('./handlers/messageHandler');
const { handleCommand } = require('./handlers/commandHandler');
const logger = require('../utils/logger');

class Bot {
  constructor(token) {
    this.bot = new TelegramBot(token, { polling: true });
    this.initHandlers();
  }

  initHandlers() {
    this.bot.on('message', async (msg) => {
      try {
        if (msg.text?.startsWith('/')) {
          await handleCommand(this.bot, msg);
        } else {
          await handleMessage(this.bot, msg);
        }
      } catch (error) {
        logger.error('Error handling message:', error);
      }
    });
  }

  start() {
    logger.info('Bot started successfully');
  }
}

module.exports = Bot;  