exports.isAdmin =  (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    // User is an admin
    return next();
  } else {
    return res.status(403).json({ message: 'Access denied' });
  }
};

