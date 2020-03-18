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

module.exports = router;
