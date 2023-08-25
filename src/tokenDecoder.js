const jwt = require('jsonwebtoken');
require('dotenv').config(); // Make sure you have your .env loaded here

function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return null;
  }
}

module.exports = decodeToken;
