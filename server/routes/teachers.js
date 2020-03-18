const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const { body, validationResult, check } = require('express-validator');
const User = require('../models/User');

router.get('/', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      msg: 'Permission Denied'
    });
  }
  const networkObj = await network.connectToNetwork(req.decoded.user);

  if (!networkObj) {
    return res.status(500).json({
      msg: 'Failed to connect blockchain'
    });
  }

  const response = await network.query(networkObj, 'GetAllTeachers');
  if (!response.success) {
    return res.status(404).json({
      msg: 'Query chaincode has failed'
    });
  }
  return res.json({
    teachers: JSON.parse(response.msg)
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
        msg: 'Failed connect to blockchain!'
      });
    }

    const response = await network.query(networkObj, 'GetTeacher', req.params.username);

    if (!response.success) {
      return res.status(404).send({
        msg: 'Query chaincode has failed'
      });
    }

    let teacher = JSON.parse(response.msg) ? JSON.parse(response.msg) : {};

    return res.json({
      teacher: teacher
    });
  }
);

router.post(
  '/',
  [
    body('username')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('fullname')
      .isLength({ min: 6 })
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }

    try {
      let user = await User.findOne({ username: req.body.username });

      if (user) {
        return res.status(409).json({
          msg: 'Teacher already exists'
        });
      }

      let { username, fullname } = req.body;

      let createdUser = {
        username,
        fullname
      };

      const networkObj = await network.connectToNetwork(req.decoded.user);
      const response = await network.registerTeacherOnBlockchain(networkObj, createdUser);

      if (!response.success) {
        return res.status(500).json({
          msg: response.msg
        });
      }

      return res.status(201).json({
        msg: 'Create successfully'
      });
    } catch (error) {
      return res.status(500).json({
        msg: 'Internal Server Error'
      });
    }
  }
);

router.get('/:username/classes', async (req, res, next) => {
  if (
    req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY &&
    req.decoded.user.role !== USER_ROLES.TEACHER
  ) {
    return res.status(403).json({
      msg: 'Permission Denied'
    });
  }

  let username = req.params.username;

  const networkObj = await network.connectToNetwork(req.decoded.user);
  if (!networkObj) {
    return res.status(500).json({
      msg: 'Failed connect to blockchain'
    });
  }

  let classes = await network.query(networkObj, 'GetClassesByTeacher', username);
  let subjects = await network.query(networkObj, 'GetAllSubjects');

  if (!classes.success || !subjects.success) {
    return res.status(404).json({
      msg: 'Failed to query chaincode'
    });
  }

  classes = JSON.parse(classes.msg) ? JSON.parse(classes.msg) : [];
  subjects = JSON.parse(subjects.msg) ? JSON.parse(subjects.msg) : [];

  for (let i = 0; i < classes.length; i++) {
    for (let k = 0; k < subjects.length; k++) {
      if (classes[i].SubjectID === subjects[k].SubjectID) {
        classes[i].SubjectName = subjects[k].SubjectName;
        break;
      }
    }
  }

  return res.json({
    classes
  });
});

module.exports = router;
