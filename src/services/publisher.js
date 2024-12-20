const logger = require('../utils/logger');
const { models } = require('../db');

async function publishPost(postId) {
  try {
    // Валидация ID
    if (!postId || postId < 0) {
      throw new Error('Invalid post ID');
    }

    // Получаем пост
    const post = await models.Post.findByPk(postId);
    if (!post) {
      throw new Error(`Post with id ${postId} not found`);
    }

    // Проверяем статус
    if (post.status !== 'processed') {
      throw new Error('Post is not ready for publishing');
    }

    // Проверяем наличие обработанного контента
    if (!post.processedContent) {
      throw new Error('Post has no processed content');
    }

    // Публикуем пост
    post.status = 'published';
    post.publishedAt = new Date();
    await post.save();

    return post;
  } catch (error) {
    logger.error('Error publishing post:', error);
    throw error;
  }
}

module.exports = { publishPost };