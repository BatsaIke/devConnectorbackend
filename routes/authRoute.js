const express = require("express");
const router = express.Router();
const auth =require('../middleware/auth.js')
const { check } = require("express-validator");

const {
 getAuthenticatedUser, authenticateUser,
} = require("../controller/authController.js");

router
  .route("/")
  .get(auth, getAuthenticatedUser)
  .post([
    check("email", "Enter a valid email").isEmail(),
    check("password", "Password is required").exists()
  ],authenticateUser);
module.exports = router;
