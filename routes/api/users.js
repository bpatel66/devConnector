// This file will contain all the user routes that our application will use to perform http requests for data pretaining to our user collection
// we import express to allow us to call express.Router to allow us to perform http requests for various routes.
const express = require('express');
const router = express.Router();
// import user model
const User = require('../../models/User');
// import gravatar package
const gravatar = require('gravatar');
// import bcrypt to allow us to encrypy our user passwords
const bcrypt = require('bcryptjs');

// we import express-validator that will help with user input validation, things like making sure the user inputted an email and a we can even set a minimum length for a password.
const { check, validationResult } = require('express-validator');

// @route  POST api/users
// @desc   Register user
// @access Public (Public access routes do not require access tokens)
router.post(
  '/',
  [
    // the check function takes in the field that is being checked as well as a custom error message string.
    // the check function also has rules that you can invoke like '.not' and '.isEmpty' which checks if there is something is inputted and if what is inputted is not an empty
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the request's body so that we can access the name, email, and password without having to call req.body everytime
    const { name, email, password } = req.body;

    try {
      // See if the user exists (send error is user exists)
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          errors: [
            {
              msg: 'User with this email already exists',
            },
          ],
        });
      }
      // Get users gravatar, gravatar.url takes in an email and some optional properties, s is the size of the picture, r is the rating of the avatar, d is the default avatar when one is not present
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      // creates a new instance of the user
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // Encrypt password using BCrypy, first create a salt using genSalt and then use hash to encrypt the password with the salt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // save the user to the database
      await user.save();

      // Return jsonwebtoken
      res.send('User Registered');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// module.exports = router adds the users.js functionaliy to the router so that it can be imported in other files and used by the application
module.exports = router;
