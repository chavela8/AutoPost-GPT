const { models } = require('../db');
const logger = require('../utils/logger');

class TagManager {
  async generateTags(content) {
    try {
      const completion = await this.openai.createCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "Extract 3-5 relevant tags from the following content"
        }, {
          role: "user",
          content
        }]
      });

      return completion.data.choices[0].message.content.split(',');
    } catch (error) {
      logger.error('Error generating tags:', error);
      return [];
    }
  }

  async addTagsToPost(postId, tags) {
    try {
      const post = await models.Post.findByPk(postId);
      await post.setTags(tags);
      return true;
    } catch (error) {
      logger.error('Error adding tags:', error);
      return false;
    }
  }

  async getPopularTags(limit = 10) {
    const tags = await models.Tag.findAll({
      attributes: [
        'name',
        [sequelize.fn('COUNT', sequelize.col('posts.id')), 'postCount']
      ],
      include: [{
        model: models.Post,
        attributes: []
      }],
      group: ['Tag.id'],
      order: [[sequelize.literal('postCount'), 'DESC']],
      limit
    });

    return tags;
  }
}

module.exports = new TagManager();  