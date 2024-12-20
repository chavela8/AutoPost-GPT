const express = require('express');
const router = express.Router();
const { models } = require('../db');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

// Получение статистики
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await models.Analytics.findAll({
      where: { channelId: req.query.channelId },
      include: [{ model: models.Post }]
    });
    res.json(stats);
  } catch (error) {
    logger.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Управление постами
router.post('/posts', authenticate, async (req, res) => {
  try {
    const post = await models.Post.create(req.body);
    res.json(post);
  } catch (error) {
    logger.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;  