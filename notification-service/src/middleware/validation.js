const validateNotification = (req, res, next) => {
    const { type, userId, data } = req.body;
    if (!type || !userId || !data) {
      return res.status(400).json({ error: 'Invalid notification data' });
    }
    next();
  };
  
  module.exports = { validateNotification };