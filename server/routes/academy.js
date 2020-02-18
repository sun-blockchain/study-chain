const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const checkJWT = require('../middlewares/check-jwt');
const { body, validationResult, check } = require('express-validator');
const uuidv4 = require('uuid/v4');

// Edit course info
router.put(
  '/course',
  checkJWT,
  [
    body('courseId')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('courseCode')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('courseName')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('shortDescription')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('description')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    } else {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = req.decoded.user;
      const networkObj = await network.connectToNetwork(user);

      const { courseId, courseCode, courseName, shortDescription, description } = req.body;

      let course = {
        courseID: courseId,
        courseCode: courseCode,
        courseName: courseName,
        shortDescription: shortDescription,
        description: description
      };

      const response = await network.updateCourseInfo(networkObj, course);

      if (!response.success) {
        return res.status(500).json({
          success: false,
          msg: response.msg
        });
      }

      const listNewCourse = await network.query(networkObj, 'GetAllCourses');

      return res.json({
        success: true,
        courses: JSON.parse(listNewCourse.msg)
      });
    }
  }
);

// Create new course
router.post(
  '/course',
  checkJWT,
  [
    body('courseCode')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('courseName')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('shortDescription')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('description')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    } else {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = req.decoded.user;
      const networkObj = await network.connectToNetwork(user);

      const { courseCode, courseName, shortDescription, description } = req.body;

      let course = {
        courseID: uuidv4(),
        courseCode: courseCode,
        courseName: courseName,
        shortDescription: shortDescription,
        description: description
      };

      const response = await network.createCourse(networkObj, course);

      if (!response.success) {
        return res.status(500).json({
          success: false,
          msg: response.msg
        });
      }

      const listNewCourse = await network.query(networkObj, 'GetAllCourses');

      return res.json({
        success: true,
        courses: JSON.parse(listNewCourse.msg)
      });
    }
  }
);

router.post(
  '/deleteCourse',
  checkJWT,
  body('courseId')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    } else {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = req.decoded.user;
      const networkObj = await network.connectToNetwork(user);

      const { courseId } = req.body;

      const response = await network.deleteCourse(networkObj, courseId);
      console.log(response);

      if (!response.success) {
        return res.status(500).json({
          success: false,
          msg: response.msg
        });
      }

      const listNewCourse = await network.query(networkObj, 'GetAllCourses');

      return res.json({
        success: true,
        courses: JSON.parse(listNewCourse.msg)
      });
    }
  }
);

router.get('/classes', checkJWT, async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  } else {
    const user = req.decoded.user;
    const networkObj = await network.connectToNetwork(user);
    const response = await network.query(networkObj, 'GetAllClasses');

    if (!response.success) {
      res.status(500).send({
        success: false,
        msg: response.msg.toString()
      });
      return;
    }
    return res.json({
      success: true,
      class: JSON.parse(response.msg)
    });
  }
});

// Create class
router.post(
  '/class',
  checkJWT,
  [
    body('classCode')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('room')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('time')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('shortDescription')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('description')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    } else {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = req.decoded.user;
      const networkObj = await network.connectToNetwork(user);

      const { classCode, room, time, shortDescription, description } = req.body;

      let _class = {
        classID: uuidv4(),
        classCode: classCode,
        room: room,
        time: time,
        shortDescription: shortDescription,
        description: description
      };

      const response = await network.createClass(networkObj, _class);

      if (!response.success) {
        return res.status(500).json({
          success: false,
          msg: response.msg
        });
      }

      const listNewClasses = await network.query(networkObj, 'GetAllClasses');

      return res.json({
        success: true,
        classes: JSON.parse(listNewClasses.msg)
      });
    }
  }
);
module.exports = router;
