const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const { body, validationResult, check } = require('express-validator');
const uuidv4 = require('uuid/v4');

router.get(
  '/:classId/students',
  check('classId')
    .trim()
    .escape(),
  async (req, res) => {
    const user = req.decoded.user;
    if (req.decoded.user.role === USER_ROLES.STUDENT) {
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

    let students = await network.query(networkObj, 'GetStudentsOfClass', req.params.classId);
    let scores = await network.query(networkObj, 'GetScoresOfClass', req.params.classId);
    let classInfo = await network.query(networkObj, 'GetClass', req.params.classId);

    if (!students.success || !scores.success || !classInfo.success) {
      return res.status(404).json({
        msg: 'Query chaincode has failed'
      });
    }

    students = JSON.parse(students.msg) ? JSON.parse(students.msg) : [];
    scores = JSON.parse(scores.msg) ? JSON.parse(scores.msg) : [];
    classInfo = JSON.parse(classInfo.msg);

    for (let i = 0; i < students.length; i++) {
      students[i].StatusClass = classInfo.Status;
      for (let k = 0; k < scores.length; k++) {
        if (students[i].Username === scores[k].StudentUsername) {
          students[i].Score = scores[k].ScoreValue;
          break;
        }
      }
    }

    return res.json({
      students: students
    });
  }
);

module.exports = router;
