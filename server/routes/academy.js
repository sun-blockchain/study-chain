const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const checkJWT = require('../middlewares/check-jwt');
const { body, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4');

router.get('/courses', checkJWT, async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  } else {
    const user = req.decoded.user;
    const networkObj = await network.connectToNetwork(user);
    const response = await network.query(networkObj, 'GetAllCourses');

    if (!response.success) {
      res.status(500).send({
        success: false,
        msg: response.msg.toString()
      });
      return;
    }
    return res.json({
      success: true,
      subjects: JSON.parse(response.msg)
    });
  }
});

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

      const { courseId, courseCode, courseName, description } = req.body;

      let course = {
        courseID: courseId,
        courseCode: courseCode,
        courseName: courseName,
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

      const { courseCode, courseName, description } = req.body;

      let course = {
        courseID: uuidv4(),
        courseCode: courseCode,
        courseName: courseName,
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

module.exports = router;
