//**Import jwt for token generration */
const jwt = require("jsonwebtoken");
//**Token Generation */
const generateToken = (user) => {
    return jwt.sign(
      { id: user.id, username: user.username, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  };

  module.exports = { generateToken };
