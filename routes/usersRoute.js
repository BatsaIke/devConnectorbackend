const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const {createUserDetails}= require('../controller/usersController.js')

router
  .route("/")
  .post( [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Enter a valid email").isEmail(),
    check("password", "Enter a valid password").isLength({ min: 6 }),
  ],createUserDetails)

module.exports= router