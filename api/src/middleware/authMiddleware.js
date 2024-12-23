module.exports = (req, res, next) => {
  // Check if the user is authenticated
  if (req.session && req.session.user) {
    next();
  } else {
    console.log("No session or user found");
    res.status(403).json({ error: 'Access denied' })
  }
};
