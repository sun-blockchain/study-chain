const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const { check } = require('express-validator');

router.get('/', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      msg: 'Permission Denied'
    });
  }

  const networkObj = await network.connectToNetwork(req.decoded.user);

  if (!networkObj) {
    return res.status(500).json({
      msg: 'Failed connect to blockchain'
    });
  }

  const response = await network.query(networkObj, 'GetAllStudents');

  if (!response.success) {
    return res.status(404).json({
      msg: 'Query chaincode has failed'
    });
  }
  return res.json({
    students: JSON.parse(response.msg)
  });
});

router.get(
  '/:username',
  check('username')
    .trim()
    .escape(),
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }
    const user = req.decoded.user;

    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    const response = await network.query(networkObj, 'GetStudent', req.params.username);

    if (!response.success) {
      return res.status(404).json({
        msg: 'Query chaincode has failed'
      });
    }

    let student = JSON.parse(response.msg);

    return res.json({
      student
    });
  }
);

router.get(
  '/:username/courses',
  check('username')
    .trim()
    .escape(),
  async (req, res) => {
    const user = req.decoded.user;

    if (user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }

    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed to connect blockchain'
      });
    }

    const response = await network.query(networkObj, 'GetCoursesOfStudent', req.params.username);

    if (!response.success) {
      return res.status(404).json({
        msg: 'Query chaincode has failed'
      });
    }

    return res.json({
      courses: JSON.parse(response.msg)
    });
  }
);

router.get(
  '/:username/classes',
  check('username')
    .trim()
    .escape(),
  async (req, res) => {
    const user = req.decoded.user;

    if (user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }

    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed to connect blockchain'
      });
    }

    const response = await network.query(networkObj, 'GetClassesOfStudent', req.params.username);

    if (!response.success) {
      return res.status(404).json({
        msg: 'Query chaincode has failed'
      });
    }

    let classes = JSON.parse(response.msg) ? JSON.parse(response.msg) : [];
    return res.json({
      classes
    });
  }
);

module.exports = router;
