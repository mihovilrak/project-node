// Get session user
exports.session = async (req, res) => {
  try {
    if (req.session.user) {
      res.status(200).json({ user: req.session.user });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};