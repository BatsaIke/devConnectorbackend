const { validationResult } = require("express-validator");
const User = require("../model/UserModel.js");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");


// //@rout POST api/v1/users
// //@desc test route
// //access public
// const getUserDetails = async(req,res)=>{
//     res.send('user details here')
// }

//@rout POST api/users
//@desc test route
//access public
const createUserDetails = async (req, res) => {
  const errors = validationResult(req);
  //check if no errors
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;
  try {
    //check if user exist
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: "User already exist" }] });
    }
    //get users gravatar
    const avatar = gravatar.url(email, {
      s: 200,
      r: "pg",
      d: "mm",
    });
    //create instance of user
    user = new User({
      name,
      email,
      password,
      avatar,
    });

    //encrypt passeord using bcrypt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    //return jsonwebtoken
    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      {
        expiresIn: 360000,
      },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (error) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  //   getUserDetails,
  createUserDetails,
};
