const express = require('express');
const router = express.Router();

// @route  GET api/profile
// @desc   Test route; returns the string "Profile route"
// @access Public (Public access routes do not require access tokens)
router.get('/', (req, res) => res.send('Profile route'));

// module.exports = router adds the users.js functionaliy to the router so that it can be imported in other files and used by the application
module.exports = router;
