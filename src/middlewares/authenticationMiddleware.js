//**Middleware for authentication */
const passport = require("../passport/passport");
exports.isAuthenticated =   passport.authenticate("jwt", { session: false })

  