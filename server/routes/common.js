const router = require('express').Router();
const network = require('../fabric/network.js');
const checkJWT = require('../middlewares/check-jwt');
const { validationResult, check } = require('express-validator');

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

module.exports = router;
