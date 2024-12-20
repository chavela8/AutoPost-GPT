require('dotenv').config();
const Bot = require('./bot');
const { sequelize } = require('./db');
const logger = require('./utils/logger');

async function startApp() {
  try {
    // Подключаемся к базе данных
    await sequelize.authenticate();
    await sequelize.sync();
    logger.info('Database connected successfully');

    // Запускаем бота
    const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
    bot.start();

  } catch (error) {
    logger.error('Error starting application:', error);
    process.exit(1);
  }
}

startApp();  