const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
// import jsonwebtoken
const jwt = require('jsonwebtoken');
// import config to access the jwt secret
const config = require('config');
// we import express-validator that will help with user input validation, things like making sure the user inputted an email and a we can even set a minimum length for a password.
const { check, validationResult } = require('express-validator');
// import bcrypt to allow us to encrypy our user passwords
const bcrypt = require('bcryptjs');

const User = require('../../models/User');

// @route  GET api/auth
// @desc   Test route; returns the string "Auth route"
// #access Public (Public access routes do not require access tokens)
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  POST api/auth
// @desc   Authenticate user and get token
// @access Public (Public access routes do not require access tokens)
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the request's body so that we can access the email, and password without having to call req.body everytime
    const { email, password } = req.body;

    try {
      // See if there is not a user
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      // Return jsonwebtoken
      // create payload, which will consist of a object with a user that has an id property
      // the id property is retrieved by calling user.id
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// module.exports = router adds the users.js functionaliy to the router so that it can be imported in other files and used by the application
module.exports = router;
