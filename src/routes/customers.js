//**Express Initilzation */
const express = require("express");
//**Router Initilaztion */
const router = express.Router();
const passport = require("../passport/passport");

//**Importing Controllers */
const {
  getCustomers,
} = require("../controllers/customerController");
//**Importing Middlewares */
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");
//**Route to get all Customers */
router.get(
  "/customers",
  passport.authenticate('jwt', { session: false }),
  authorizationMiddleware.isAdmin,
  getCustomers
);

router.get(
 "/search-customer",
 passport.authenticate('jwt',{session:false} ),
 authorizationMiddleware.isAdmin
)
module.exports = router;
