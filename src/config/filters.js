module.exports = {
  content: {
    blacklist: [
      'реклама', 'продажа', 'скидка', 'акция',
      'распродажа', 'промокод', 'affiliate',
      'заказать', 'купить', 'цена', 'стоимость'
    ],
    lengthLimits: {
      min: 10,
      max: 4096
    },
    excludedCategories: [
      'adult',
      'gambling',
      'violence'
    ]
  },
  media: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    maxFileSize: 20 * 1024 * 1024, // 20MB
    imageMinDimensions: {
      width: 100,
      height: 100
    },
    imageMaxDimensions: {
      width: 4096,
      height: 4096
    }
  }
};  