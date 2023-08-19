const express = require('express');
const router = express.Router();
const { getCustomers, searchCustomers } = require('../controllers/customerController');

// Middleware to check if the user is authenticated
const isAdminAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Access denied' });
};

router.get('/customers', isAdminAuthenticated, getCustomers);
router.get('/search/customer', isAdminAuthenticated, searchCustomers);

module.exports = router;
