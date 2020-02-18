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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = req.decoded.user;
    const networkObj = await network.connectToNetwork(user);
    const response = await network.query(networkObj, 'QueryCourse', req.params.courseId);

    if (!response.success) {
      return res.status(500).send({
        success: false,
        msg: response.msg.toString()
      });
    }

    return res.json({
      success: true,
      course: JSON.parse(response.msg)
    });
  }
);

module.exports = router;
