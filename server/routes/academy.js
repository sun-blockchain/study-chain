const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const checkJWT = require('../middlewares/check-jwt');
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
router.put('/course', checkJWT, async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  } else {
    const user = req.decoded.user;
    const networkObj = await network.connectToNetwork(user);

    const { courseId, courseCode, courseName, description } = req.body;

    let course = {
      courseID: courseId,
      courseCode: courseCode,
      courseName: courseName,
      description: description
    };

    if (!courseId || !courseCode || !courseName || !description) {
      return res.status(400).json({
        success: false,
        msg: 'Data can not empty'
      });
    }

    const response = await network.editCourseInfo(networkObj, course);

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
});

// Create new course
router.post('/course', checkJWT, async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  } else {
    const user = req.decoded.user;
    const networkObj = await network.connectToNetwork(user);

    const { courseCode, courseName, description } = req.body;

    if (!courseCode || !courseName || !description) {
      return res.status(400).json({
        success: false,
        msg: 'Data can not empty'
      });
    }

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
});

router.post('/deleteCourse', checkJWT, async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  } else {
    const user = req.decoded.user;
    const networkObj = await network.connectToNetwork(user);

    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        msg: 'Please choose course to delete'
      });
    }

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
});

module.exports = router;
