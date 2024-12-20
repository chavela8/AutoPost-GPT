const Bull = require('bull');
const logger = require('../../utils/logger');
const { processContent } = require('../contentProcessor');
const { optimizeContent } = require('../contentOptimizer');

class ContentQueue {
  constructor() {
    this.contentQueue = new Bull('content-processing', {
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    });

    this.setupQueueHandlers();
  }

  setupQueueHandlers() {
    this.contentQueue.process(async (job) => {
      const { content, type, options } = job.data;
      logger.info(`Processing content job ${job.id} of type ${type}`);

      try {
        switch (type) {
          case 'process':
            return await processContent(content, options);
          case 'optimize':
            return await optimizeContent(content, options);
          default:
            throw new Error(`Unknown job type: ${type}`);
        }
      } catch (error) {
        logger.error(`Error processing job ${job.id}:`, error);
        throw error;
      }
    });

    this.contentQueue.on('completed', (job) => {
      logger.info(`Job ${job.id} completed successfully`);
    });

    this.contentQueue.on('failed', (job, error) => {
      logger.error(`Job ${job.id} failed:`, error);
    });
  }

  async addToQueue(content, type, options = {}) {
    try {
      const job = await this.contentQueue.add({
        content,
        type,
        options,
        timestamp: Date.now()
      });

      logger.info(`Added content to queue, job ID: ${job.id}`);
      return job;
    } catch (error) {
      logger.error('Error adding content to queue:', error);
      throw error;
    }
  }
}

module.exports = new ContentQueue();  