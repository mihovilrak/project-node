const authMiddleware = (req, res, next) => {

  if (req.session && req.session.user) {
    console.log("Authenticated user:", req.session.user);
    next();
  } else {
    console.log("No session or user found");
    res.status(403).json({ error: 'Access denied' })
  }
};

module.exports = authMiddleware;
