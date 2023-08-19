//**Importing User Model */
const User = require('../models/User');
//**Importing Middlewares */
const authorizationMiddleware = require('../middlewares/authorizationMiddleware');
const authenticationMiddleware = require('../middlewares/authenticationMiddleware');

//**Controller to get all customers */
exports.getCustomers = [
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  async (req, res) => {
    try {
      const customers = await User.find({ role: 'customer' }, 'name mobile email');
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while fetching customers' });
    }
  }
];

//**Controller to search for a customer */
exports.searchCustomers = [
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  async (req, res) => {
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
  }
];
