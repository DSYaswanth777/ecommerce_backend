exports.isAdmin =  (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    console.log('User Role:', req.user); // Add this line
    // User is an admin
    return next();
  } else {
    return res.status(403).json({ message: 'Access denied' });
  }
};

