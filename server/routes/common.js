const router = require('express').Router();
const network = require('../fabric/network.js');
const checkJWT = require('../middlewares/check-jwt');
const { validationResult, check } = require('express-validator');
const USER_ROLES = require('../configs/constant').USER_ROLES;

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
    const response = await network.query(networkObj, 'QueryCourse', courseId);
    const listSubjects = await network.query(networkObj, 'QuerySubjectsOfCourse', courseId);

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
    const response = await network.query(networkObj, 'QuerySubject', req.params.subjectId);

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
  const response = await network.query(networkObj, 'GetAllClassesOfSubject', req.params.subjectId);
  if (!response.success) {
    res.status(500).send({
      success: false,
      msg: response.msg.toString()
    });
    return;
  }

  if (user.role === USER_ROLES.STUDENT) {
    let classes = JSON.parse(response.msg);

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
    class: JSON.parse(response.msg)
  });
});

module.exports = router;
