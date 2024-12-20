const { models } = require('../db');
const { Storage } = require('@google-cloud/storage');
const logger = require('../utils/logger');
const path = require('path');

class BackupService {
  constructor() {
    this.storage = new Storage({
      keyFilename: path.join(__dirname, '../../config/google-cloud-key.json')
    });
    this.bucket = this.storage.bucket(process.env.BACKUP_BUCKET);
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString();
      const backup = {
        posts: await models.Post.findAll(),
        channels: await models.Channel.findAll(),
        analytics: await models.Analytics.findAll()
      };

      const filename = `backup-${timestamp}.json`;
      const file = this.bucket.file(filename);

      await file.save(JSON.stringify(backup), {
        contentType: 'application/json',
        metadata: {
          timestamp,
          type: 'full-backup'
        }
      });

      logger.info(`Backup created successfully: ${filename}`);
      return filename;
    } catch (error) {
      logger.error('Backup creation failed:', error);
      throw error;
    }
  }

  async restoreFromBackup(filename) {
    try {
      const file = this.bucket.file(filename);
      const [content] = await file.download();
      const backup = JSON.parse(content.toString());

      await models.sequelize.transaction(async (t) => {
        await models.Post.bulkCreate(backup.posts, { transaction: t });
        await models.Channel.bulkCreate(backup.channels, { transaction: t });
        await models.Analytics.bulkCreate(backup.analytics, { transaction: t });
      });

      logger.info(`Restore completed from backup: ${filename}`);
      return true;
    } catch (error) {
      logger.error('Restore failed:', error);
      throw error;
    }
  }
}

module.exports = new BackupService();  