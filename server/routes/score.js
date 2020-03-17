const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const checkJWT = require('../middlewares/check-jwt');

router.post(
  '/',
  [
    body('classId')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('student')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('scoreValue')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { classId, student, scoreValue } = req.body;

    if (req.decoded.user.role !== USER_ROLES.TEACHER) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }

    let teacher = req.decoded.user;

    let networkObj = await network.connectToNetwork(teacher);

    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed to connect blockchain'
      });
    }

    let query = await network.query(networkObj, 'GetClass', classId);
    if (!query.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not query chaincode!'
      });
    }
    let classInfo = JSON.parse(query.msg);

    if (classInfo.TeacherUsername !== teacher.username) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }

    if (classInfo.Status != 'InProgress') {
      return res.status(403).json({
        success: false,
        msg: 'Can not entry score now!'
      });
    }

    if (!classInfo.Students || !classInfo.Students.includes(student)) {
      return res.status(403).json({
        success: false,
        msg: 'The student does not study in this class!'
      });
    }

    const score = {
      teacher: teacher.username,
      classId,
      studentUsername: student,
      scoreValue
    };

    networkObj = await network.connectToNetwork(teacher);

    const response = await network.pickScore(networkObj, score);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg
      });
    }

    return res.json({
      success: true,
      msg: 'Create score successfully!'
    });
  }
);

router.get('/all', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }

  const networkObj = await network.connectToNetwork(req.decoded.user);
  const response = await network.query(networkObj, 'GetAllScores');

  if (!response.success) {
    return res.status(500).json({
      success: false,
      msg: response.msg.toString()
    });
  }
  return res.json({
    success: true,
    scores: JSON.parse(response.msg)
  });
});

module.exports = router;
