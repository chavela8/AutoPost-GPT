const logger = require('./logger');

class ErrorHandler {
  static async handle(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      code: error.code,
      context,
      timestamp: new Date().toISOString()
    };

    // Логируем ошибку с контекстом
    logger.error('Error occurred:', errorInfo);

    // Определяем тип ошибки
    if (error.name === 'SequelizeError') {
      return this.handleDatabaseError(error);
    } else if (error.name === 'OpenAIError') {
      return this.handleAIError(error);
    } else if (error.name === 'TelegramError') {
      return this.handleTelegramError(error);
    }

    // Отправляем уведомление администраторам для критических ошибок
    if (this.isCriticalError(error)) {
      await this.notifyAdmins(errorInfo);
    }

    // Сохраняем ошибку в базу данных для анализа
    await this.saveErrorLog(errorInfo);

    return {
      success: false,
      error: {
        message: this.getSafeErrorMessage(error),
        code: error.code || 'UNKNOWN_ERROR'
      }
    };
  }

  static isCriticalError(error) {
    return error.critical || 
           error.name === 'SystemError' || 
           error.code === 'CRITICAL';
  }

  static getSafeErrorMessage(error) {
    return process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message;
  }
}

module.exports = ErrorHandler;  