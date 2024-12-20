const { models } = require('../db');
const logger = require('../utils/logger');

class ContentPlanner {
  async createContentPlan(channelId, days = 7) {
    try {
      const topics = await this.generateTopics(days);
      const plan = [];

      for (const topic of topics) {
        const slots = await this.findOptimalTimeSlots(channelId, topic.date);
        plan.push({
          date: topic.date,
          topic: topic.title,
          slots,
          status: 'planned'
        });
      }

      await models.ContentPlan.bulkCreate(plan);
      return plan;
    } catch (error) {
      logger.error('Error creating content plan:', error);
      throw error;
    }
  }

  async generateTopics(days) {
    const completion = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: `Generate ${days} engaging topics for a content plan. 
                 Consider current trends and seasonal relevance.`
      }]
    });

    return JSON.parse(completion.data.choices[0].message.content);
  }

  async findOptimalTimeSlots(channelId, date) {
    const analytics = await models.Analytics.findAll({
      where: { channelId },
      attributes: ['timeOfDay', 'engagementRate'],
      order: [['engagementRate', 'DESC']],
      limit: 3
    });

    return analytics.map(a => a.timeOfDay);
  }
}

module.exports = new ContentPlanner();  