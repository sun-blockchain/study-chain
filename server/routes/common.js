const router = require('express').Router();
const network = require('../fabric/network.js');
const checkJWT = require('../middlewares/check-jwt');
const { validationResult, check } = require('express-validator');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const User = require('../models/User');

router.get('/courses', checkJWT, async (req, res) => {
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
    courses: JSON.parse(response.msg)
  });
});

router.get(
  '/course/:courseId',
  checkJWT,
  check('courseId')
    .trim()
    .escape(),
  async (req, res) => {
    const courseId = req.params.courseId;

    const user = req.decoded.user;
    const networkObj = await network.connectToNetwork(user);
    const response = await network.query(networkObj, 'GetCourse', courseId);
    const listSubjects = await network.query(networkObj, 'GetSubjectsOfCourse', courseId);

    if (!response.success || !listSubjects.success) {
      return res.status(500).send({
        success: false,
        msg: 'Query course failed'
      });
    }

    return res.json({
      success: true,
      course: JSON.parse(response.msg),
      listSubjects: JSON.parse(listSubjects.msg)
    });
  }
);

router.get(
  '/subject/:subjectId',
  check('subjectId')
    .trim()
    .escape(),
  checkJWT,
  async (req, res) => {
    const user = req.decoded.user;
    const networkObj = await network.connectToNetwork(user);
    const response = await network.query(networkObj, 'GetSubject', req.params.subjectId);

    if (!response.success) {
      res.status(500).send({
        success: false,
        msg: response.msg.toString()
      });
      return;
    }

    return res.json({
      success: true,
      subject: JSON.parse(response.msg)
    });
  }
);

router.get('/subject/:subjectId/classes', checkJWT, async (req, res) => {
  const user = req.decoded.user;
  const networkObj = await network.connectToNetwork(user);
  const response = await network.query(networkObj, 'GetClassesOfSubject', req.params.subjectId);
  if (!response.success) {
    res.status(500).send({
      success: false,
      msg: response.msg.toString()
    });
    return;
  }

  let classes = JSON.parse(response.msg);

  if (user.role === USER_ROLES.STUDENT) {
    for (let index = 0; index < classes.length; index++) {
      delete classes[index].Students;
    }

    return res.json({
      success: true,
      class: classes
    });
  }

  return res.json({
    success: true,
    class: classes
  });
});

router.get(
  '/class/:classId',
  check('classId')
    .trim()
    .escape(),
  checkJWT,
  async (req, res) => {
    const user = req.decoded.user;

    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain!'
      });
    }

    const response = await network.query(networkObj, 'GetClass', req.params.classId);

    if (!response.success) {
      return res.status(500).send({
        success: false,
        msg: response.msg.toString()
      });
    }

    let classInfo = JSON.parse(response.msg);

    if (user.role === USER_ROLES.STUDENT) {
      delete classInfo.Students;
    }

    return res.json({
      success: true,
      class: classInfo
    });
  }
);

// -------------------------------- classes of teacher --------------------------------------------
router.get('/:username/classes', async (req, res, next) => {
  if (
    req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY &&
    req.decoded.user.role !== USER_ROLES.TEACHER
  ) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }

  const networkObj = await network.connectToNetwork(req.decoded.user);
  if (!networkObj) {
    return res.status(500).json({
      success: false,
      msg: 'Failed connect to blockchain!'
    });
  }

  let classesByTeacher = await network.query(
    networkObj,
    'GetClassesByTeacher',
    req.params.username
  );
  if (!classesByTeacher.success) {
    return res.status(500).json({
      success: false,
      msg: classesByTeacher.msg.toString()
    });
  }

  return res.json({
    success: true,
    classes: JSON.parse(classesByTeacher.msg)
  });
});

// get unassigned classes
router.get('/classesNoTeacher', async (req, res, next) => {
  if (
    req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY &&
    req.decoded.user.role !== USER_ROLES.TEACHER
  ) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }

  const networkObj = await network.connectToNetwork(req.decoded.user);
  if (!networkObj) {
    return res.status(500).json({
      success: false,
      msg: 'Failed connect to blockchain!'
    });
  }

  let classes = await network.query(networkObj, 'GetAllClasses');
  if (!classes.success) {
    return res.status(500).json({
      success: false,
      msg: classes.msg.toString()
    });
  }

  let classesNoTeacher = JSON.parse(classes.msg)
    ? JSON.parse(classes.msg).filter((c) => c.TeacherUsername === '')
    : [];

  return res.json({
    success: true,
    classesNoTeacher: classesNoTeacher
  });
});

module.exports = router;
