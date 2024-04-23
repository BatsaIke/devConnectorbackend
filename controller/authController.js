const User = require('../model/UserModel.js')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { validationResult } = require("express-validator"); 

//@rout GET api/auth
//@desc test route
//access public
const getAuthenticatedUser = async(req,res)=>{ 
    try {
        const user= await User.findById(req.user.id).select("-password")
        res.json(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
        
    }
}

//@rout POST api/auth
//@desc authenticate user and get token
//access public
const authenticateUser = async (req, res) => {
  const errors = validationResult(req);

  // Check if there are validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid user" }] });
    }

    // Check if the provided password matches with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid user" }] });
    }

    // If the email and password are valid, generate a token
    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      {
        expiresIn: 36000000,
      },
      (err, token) => {
        if (err) throw err;
        // Return only the token on successful login
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};


module.exports={
    getAuthenticatedUser,
    authenticateUser
   
}