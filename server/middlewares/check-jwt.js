const jwt = require('jsonwebtoken');
let secretJWT = require('../configs/secret').secret;

module.exports = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'No token provided'
    });
  }

  jwt.verify(token, secretJWT, (err, decoded) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to authentication token'
      });
    }

    req.decoded = decoded;
    next();
  });
};
