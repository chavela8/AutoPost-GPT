const schedule = require('node-schedule');
const { models } = require('../db');
const { publishPost } = require('./publisher');
const logger = require('../utils/logger');

async function schedulePost(postId) {
  try {
    const post = await models.Post.findByPk(postId);
    const channel = await models.Channel.findOne({ where: { type: 'target' } });
    const scheduleSettings = await models.Schedule.findOne({ 
      where: { channelId: channel.id } 
    });

    // Получаем следующее доступное время для публикации
    const nextSlot = await calculateNextTimeSlot(scheduleSettings);

    // Планируем публикацию
    post.scheduledFor = nextSlot;
    await post.save();

    schedule.scheduleJob(nextSlot, async () => {
      try {
        await publishPost(post.id);
      } catch (error) {
        logger.error(`Failed to publish post ${post.id}:`, error);
      }
    });

  } catch (error) {
    logger.error('Error scheduling post:', error);
    throw error;
  }
}

async function calculateNextTimeSlot(scheduleSettings) {
  const now = new Date();
  const startHour = scheduleSettings.activeHoursStart;
  const endHour = scheduleSettings.activeHoursEnd;
  
  let nextSlot = new Date(now);
  nextSlot.setHours(startHour);
  nextSlot.setMinutes(0);
  nextSlot.setSeconds(0);

  if (now.getHours() >= endHour) {
    nextSlot.setDate(nextSlot.getDate() + 1);
  } else if (now.getHours() < startHour) {
    nextSlot.setHours(startHour);
  }

  return nextSlot;
}

module.exports = { schedulePost };