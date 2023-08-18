const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/customers', async (req, res) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    try {
      const customers = await User.find({ role: 'customer' }, 'name mobile email');
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while fetching customers' });
    }
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
});
router.get('/search/customer', async (req, res) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    try {
      const { searchField, searchTerm } = req.query;
      let query = { role: 'customer' };

      if (searchField && searchTerm) {
        const regex = new RegExp(searchTerm, 'i'); // Case-insensitive search
        switch (searchField) {
          case 'name':
            query.name = regex;
            break;
          case 'email':
            query.email = regex;
            break;
          case 'mobile':
            query.mobile = regex;
            break;
          default:
            break;
        }
      }

      const customers = await User.find(query, 'name mobile email');
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while fetching customers' });
    }
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
});

module.exports = router;

