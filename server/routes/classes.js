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

router.post(
  '/enroll',
  [
    body('classId')
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
    let networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    let query = await network.query(networkObj, 'GetStudent', user.username);
    if (!query.success) {
      return res.status(404).json({
        msg: 'Can not query chaincode'
      });
    }

    let classId = req.body.classId;
    let student = JSON.parse(query.msg);

    if (student.Classes && student.Classes.includes(classId)) {
      return res.status(400).json({
        msg: 'You studied this class'
      });
    }

    query = await network.query(networkObj, 'GetClass', classId);
    if (!query.success) {
      return res.status(404).json({
        msg: 'Can not query chaincode'
      });
    }
    let classInfo = JSON.parse(query.msg);

    query = await network.query(networkObj, 'GetClassesOfStudent', user.username);
    if (!query.success) {
      return res.status(404).json({
        msg: 'Can not query chaincode'
      });
    }

    let classes = JSON.parse(query.msg);

    if (classes) {
      for (let i = 0; i < classes.length; i++) {
        if (classes[i].SubjectID === classInfo.SubjectID) {
          return res.status(400).json({
            msg: 'You studied this subject'
          });
        }
      }
    }

    if (classInfo.Status === 'InProgress') {
      return res.status(400).json({
        msg: 'Class register closed'
      });
    }

    if (classInfo.Status === 'Completed') {
      return res.status(400).json({
        msg: 'Class was completed'
      });
    }

    networkObj = await network.connectToNetwork(user);

    let response = await network.studentRegisterClass(networkObj, user.username, classId);
    if (!response.success) {
      return res.status(500).json({
        msg: response.msg
      });
    }

    return res.status(201).json({
      msg: 'Enroll Successfully'
    });
  }
);

router.post(
  '/unenroll',
  [
    body('classId')
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
    let networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    let classId = req.body.classId;
    query = await network.query(networkObj, 'GetClass', classId);
    if (!query.success) {
      return res.status(404).json({
        msg: 'Can not query chaincode'
      });
    }
    let classInfo = JSON.parse(query.msg);

    if (!classInfo.Students || !classInfo.Students.includes(user.username)) {
      return res.status(400).json({
        msg: 'You have not register this class yet'
      });
    }

    if (classInfo.Status !== 'Open') {
      return res.status(400).json({
        msg: `Class is ${classInfo.Status}!`
      });
    }

    networkObj = await network.connectToNetwork(user);

    let response = await network.studentCancelRegisterClass(networkObj, user.username, classId);
    if (!response.success) {
      return res.status(500).json({
        msg: response.msg
      });
    }

    return res.status(201).json({
      msg: 'Unenroll Successfully'
    });
  }
);

module.exports = router;
