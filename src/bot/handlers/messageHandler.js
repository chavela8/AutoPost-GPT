const { processContent } = require('../../services/contentProcessor');
const { schedulePost } = require('../../services/scheduler');
const logger = require('../../utils/logger');

async function handleMessage(bot, msg) {
  try {
    // Проверяем, что сообщение из канала-источника
    const sourceChannel = await models.Channel.findOne({
      where: { telegramId: msg.chat.id.toString(), type: 'source' }
    });

    if (!sourceChannel) return;

    // Создаем новый пост
    const post = await models.Post.create({
      sourceMessageId: msg.message_id,
      content: msg.text || '',
      sourceChannelId: sourceChannel.id,
      mediaUrls: msg.photo ? [msg.photo[msg.photo.length - 1].file_id] : []
    });

    // Обрабатываем контент
    const processedContent = await processContent(post);
    
    // Планируем публикацию
    await schedulePost(post.id);

  } catch (error) {
    logger.error('Error handling message:', error);
  }
}

module.exports = { handleMessage };  