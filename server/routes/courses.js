const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const { body, validationResult, check } = require('express-validator');
const uuidv4 = require('uuid/v4');

router.get(
  '/:courseId/students',
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
        msg: 'Permission Denied'
      });
    }
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    const response = await network.query(networkObj, 'GetStudentsOfCourse', req.params.courseId);

    if (!response.success) {
      return res.status(404).json({
        msg: 'Query chaincode has failed'
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

router.post(
  '/enroll',
  [
    body('courseId')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.decoded.user.role !== USER_ROLES.STUDENT) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }

    let user = req.decoded.user;
    let courseId = req.body.courseId;
    let networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    let course = await network.query(networkObj, 'GetCourse', courseId);
    if (!course.success) {
      return res.status(404).json({
        msg: 'Query chain code has failed'
      });
    }

    course = JSON.parse(course.msg);

    if (course.Students && course.Students.includes(user.username)) {
      return res.status(400).json({
        msg: 'You studied this course!'
      });
    }

    if (course.Status !== 'Open') {
      return res.status(400).json({
        msg: 'This course was closed!'
      });
    }

    networkObj = await network.connectToNetwork(user);

    let response = await network.studentRegisterCourse(networkObj, user.username, courseId);
    if (!response.success) {
      return res.status(500).json({
        msg: 'Enroll has failed'
      });
    }

    return res.status(201).json({
      msg: 'Enroll Successfully'
    });
  }
);

module.exports = router;
