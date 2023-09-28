//**Importing User Model */
const User = require('../models/User');

//**Controller to get all customers */
exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' });
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      verfied:customer.isVerified,
      wishlist:customer.wishlist
    }));
    res.status(200).json({
      customers: formattedCustomers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
  }
};

//**Controller to search for a customer */
exports.searchCustomers = [
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
