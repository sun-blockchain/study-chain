const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const User = require('../models/User');
const checkJWT = require('../middlewares/check-jwt');
const { body, validationResult, check } = require('express-validator');
const uuidv4 = require('uuid/v4');

router.get('/all', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }

  const networkObj = await network.connectToNetwork(req.decoded.user);
  const response = await network.query(networkObj, 'GetAllStudents');

  if (!response.success) {
    return res.status(500).json({
      success: false,
      msg: response.msg.toString()
    });
  }
  return res.json({
    success: true,
    students: JSON.parse(response.msg)
  });
});

router.get('/:username/subjects', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }

  let identity = req.params.username;

  try {
    let student = await User.findOne({ username: identity, role: USER_ROLES.STUDENT });

    if (!student) {
      return res.status(404).json({
        success: false,
        msg: 'student is not exists'
      });
    }

    const networkObj = await network.connectToNetwork(req.decoded.user);
    let subjectsByStudent = await network.query(networkObj, 'GetSubjectsByStudent', identity);

    if (!subjectsByStudent.success) {
      return res.status(500).json({
        success: false,
        msg: subjectsByStudent.msg.toString()
      });
    }
    let subjects = JSON.parse(subjectsByStudent.msg) ? JSON.parse(subjectsByStudent.msg) : [];
    return res.json({
      success: true,
      subjects: subjects
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Internal Server Error'
    });
  }
});

router.get('/:username/scores', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }
  let identity = req.params.username;

  try {
    let student = await User.findOne({ username: identity, role: USER_ROLES.STUDENT });

    if (!student) {
      return res.status(404).json({
        success: false,
        msg: 'student is not exists'
      });
    }

    const networkObj = await network.connectToNetwork(req.decoded.user);
    let scoresByStudent = await network.query(networkObj, 'GetScoresByStudent', identity);

    if (!scoresByStudent.success) {
      return res.status(500).json({
        success: false,
        msg: scoresByStudent.msg.toString()
      });
    }
    return res.json({
      success: true,
      scores: JSON.parse(scoresByStudent.msg)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Internal Server Error'
    });
  }
});

router.get('/:username/certificates', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }
  let identity = req.params.username;

  try {
    let student = await User.findOne({ username: identity, role: USER_ROLES.STUDENT });

    if (!student) {
      return res.status(404).json({
        success: false,
        msg: 'student is not exists'
      });
    }

    const networkObj = await network.connectToNetwork(req.decoded.user);
    let certificatesByStudent = await network.query(
      networkObj,
      'GetCertificatesByStudent',
      identity
    );
    if (!certificatesByStudent.success) {
      return res.status(500).json({
        success: false,
        msg: certificatesByStudent.msg.toString()
      });
    }
    return res.json({
      success: true,
      certificates: JSON.parse(certificatesByStudent.msg)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Internal Server Error'
    });
  }
});
router.get(
  '/:classId',
  check('classId')
    .trim()
    .escape(),

  async (req, res) => {
    const user = req.decoded.user;
    if (req.decoded.user.role === USER_ROLES.STUDENT) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain!'
      });
    }

    const response = await network.query(networkObj, 'GetStudentsOfClass', req.params.classId);

    if (!response.success) {
      return res.status(500).send({
        success: false,
        msg: response.msg.toString()
      });
    }

    let students = JSON.parse(response.msg);

    return res.json({
      success: true,
      students: students
    });
  }
);
router.get(
  '/course/:courseId',
  check('courseId')
    .trim()
    .escape(),

  async (req, res) => {
    const user = req.decoded.user;
    if (
      req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY &&
      req.decoded.user.role !== USER_ROLES.TEACHER
    ) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain!'
      });
    }

    const response = await network.query(networkObj, 'GetStudentsOfCourse', req.params.courseId);

    if (!response.success) {
      return res.status(500).send({
        success: false,
        msg: response.msg.toString()
      });
    }

    let students = JSON.parse(response.msg);
    let studentList = students ? students : [];

    return res.json({
      success: true,
      students: studentList
    });
  }
);
module.exports = router;
