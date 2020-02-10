const jwt = require('jsonwebtoken');
const secretJWT = require('../configs/secret').secret;
const USER_ROLES = require('../configs/constant').USER_ROLES;

exports.signToken = (req, res) => {
  jwt.sign({ user: req.user }, secretJWT, (err, token) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Can not sign'
      });
    }
    res.json({
      success: true,
      msg: 'Login success',
      fullname: req.user.fullname,
      role: USER_ROLES.STUDENT,
      token: token
    });
  });
};
