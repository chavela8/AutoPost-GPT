const logger = require('../../utils/logger');
const { models } = require('../../db');

const commands = {
  async start(bot, msg) {
    await bot.sendMessage(msg.chat.id, 'Бот запущен и готов к работе!');
  },

  async addSource(bot, msg) {
    const channelId = msg.text.split(' ')[1];
    if (!channelId) {
      await bot.sendMessage(msg.chat.id, 'Пожалуйста, укажите ID канала-источника');
      return;
    }

    try {
      await models.Channel.create({
        telegramId: channelId,
        type: 'source',
        name: channelId
      });
      await bot.sendMessage(msg.chat.id, 'Канал-источник успешно добавлен');
    } catch (error) {
      logger.error('Error adding source channel:', error);
      await bot.sendMessage(msg.chat.id, 'Ошибка при добавлении канала');
    }
  },

  async schedule(bot, msg) {
    const [, channelId, postsPerDay] = msg.text.split(' ');
    if (!channelId || !postsPerDay) {
      await bot.sendMessage(msg.chat.id, 'Укажите ID канала и количество постов в д  нь');
      return;
    }

    try {
      await models.Schedule.create({
        channelId,
        postsPerDay: parseInt(postsPerDay)
      });
      await bot.sendMessage(msg.chat.id, 'Расписание успешно настроено');
    } catch (error) {
      logger.error('Error setting schedule:', error);
      await bot.sendMessage(msg.chat.id, 'Ошибка при настройке расписания');
    }
  }
};

async function handleCommand(bot, msg) {
  const command = msg.text.split(' ')[0].substring(1);
  if (commands[command]) {
    await commands[command](bot, msg);
  }
}

module.exports = { handleCommand };  