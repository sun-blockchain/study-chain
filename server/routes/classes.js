const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const { body, validationResult, check } = require('express-validator');
const uuidv4 = require('uuid/v4');
const Status = { Open: 'Open', InProgress: 'InProgress', Completed: 'Completed' };

// Create class
router.post(
  '/',
  [
    body('classCode')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('subjectId')
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
    body('startDate')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('endDate')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('repeat')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('capacity')
      .not()
      .isEmpty()
      .trim()
      .escape()
      .isInt()
  ],
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const admin = req.decoded.user;

    const { subjectId, classCode, room, time, startDate, endDate, repeat, capacity } = req.body;

    if (parseInt(endDate) - parseInt(startDate) < 604800000) {
      return res.status(400).json({
        msg: 'Start date must occur befor end date at least 1 week'
      });
    }

    let newClass = {
      classId: uuidv4(),
      classCode,
      room,
      time,
      startDate,
      endDate,
      repeat,
      subjectId,
      capacity
    };

    let networkObj = await network.connectToNetwork(admin);
    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    const response = await network.createClass(networkObj, newClass);

    if (!response.success) {
      return res.status(500).json({
        msg: 'Create class has failed'
      });
    }

    return res.status(201).json({
      msg: 'Create Successfully'
    });
  }
);

// Edit class
router.put(
  '/:classId',
  [
    check('classId')
      .trim()
      .escape(),
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
    body('startDate')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('endDate')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('repeat')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('subjectId')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('capacity')
      .not()
      .isEmpty()
      .trim()
      .escape()
      .isInt()
  ],
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.decoded.user;
    const networkObj = await network.connectToNetwork(user);
    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    const { classId } = req.params;
    const { classCode, room, time, subjectId, startDate, endDate, repeat, capacity } = req.body;

    let classInfo = {
      classId,
      classCode,
      room,
      time,
      startDate,
      endDate,
      repeat,
      capacity
    };

    const response = await network.updateClassInfo(networkObj, classInfo);

    if (!response.success) {
      return res.status(500).json({
        msg: 'Update info of class has failed'
      });
    }

    const listNewClass = await network.query(networkObj, 'GetClassesOfSubject', subjectId);

    return res.json({
      classes: JSON.parse(listNewClass.msg)
    });
  }
);

// assign class for teacher
router.put(
  '/:classId/teacher',
  [
    body('username')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('classId')
      .trim()
      .escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array() });
    }

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }

    let { classId } = req.params;
    let { username } = req.body;

    let networkObj = await network.connectToNetwork(req.decoded.user);
    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    let classInfo = await network.query(networkObj, 'GetClass', classId);
    if (!classInfo.success) {
      return res.status(404).json({
        msg: 'Query class has failed'
      });
    }

    classInfo = JSON.parse(classInfo.msg);

    if (classInfo.Status !== 'Open') {
      return res.status(500).json({
        msg: 'This class was started'
      });
    }

    let response;

    if (!classInfo.TeacherUsername) {
      networkObj = await network.connectToNetwork(req.decoded.user);
      response = await network.assignTeacherToClass(networkObj, classId, username);
      if (!response.success) {
        return res.status(500).json({
          msg: 'Assign teacher has failed '
        });
      }

      return res.json({
        msg: 'Assign teacher successfully'
      });
    } else {
      networkObj = await network.connectToNetwork(req.decoded.user);
      response = await network.unassignTeacherFromClass(networkObj, classId);
      if (!response.success) {
        return res.status(500).json({
          msg: 'Unassign teacher has failed '
        });
      }

      return res.json({
        msg: 'Unassign teacher successfully'
      });
    }
  }
);

router.put(
  '/:classId/status',
  check('classId')
    .trim()
    .escape(),
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }

    let { classId } = req.params;

    let networkObj = await network.connectToNetwork(req.decoded.user);
    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    const responseQuery = await network.query(networkObj, 'GetClass', classId);

    if (!responseQuery.success) {
      return res.status(404).json({
        msg: 'Query class has failed'
      });
    }

    let classInfo = JSON.parse(responseQuery.msg);
    if (classInfo.Status !== Status.Open) {
      return res.status(400).json({
        msg: 'Can not start this class'
      });
    }

    if (!classInfo.TeacherUsername || classInfo.TeacherUsername === '') {
      return res.status(400).json({
        msg: 'There is no teacher assigned to this class'
      });
    }

    networkObj = await network.connectToNetwork(req.decoded.user);
    const response = await network.startClass(networkObj, classId);

    if (!response.success) {
      return res.status(500).json({
        msg: 'Start class has failed'
      });
    }

    return res.json({
      msg: 'Start Successfully'
    });
  }
);

router.put(
  '/:classId/:username/score',
  [
    check('classId')
      .trim()
      .escape(),
    check('username')
      .trim()
      .escape(),
    body('scoreValue')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.TEACHER) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId, username } = req.params;
    const { scoreValue } = req.body;

    let teacher = req.decoded.user;

    let networkObj = await network.connectToNetwork(teacher);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed to connect blockchain'
      });
    }

    let query = await network.query(networkObj, 'GetClass', classId);
    if (!query.success) {
      return res.status(404).json({
        msg: 'Query class has failed'
      });
    }

    let classInfo = JSON.parse(query.msg);

    if (classInfo.TeacherUsername !== teacher.username) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }

    if (classInfo.Status !== 'InProgress') {
      return res.status(400).json({
        msg: 'Can not entry score now!'
      });
    }

    if (!classInfo.Students || !classInfo.Students.includes(username)) {
      return res.status(400).json({
        msg: 'The student does not study in this class!'
      });
    }

    const score = {
      teacher: teacher.username,
      classId,
      studentUsername: username,
      scoreValue
    };

    networkObj = await network.connectToNetwork(teacher);

    const response = await network.pickScore(networkObj, score);

    if (!response.success) {
      return res.status(500).json({
        msg: 'Pick score for student has failed'
      });
    }

    return res.json({
      msg: 'Pick score successfully'
    });
  }
);

router.get('/no-teacher', async (req, res) => {
  if (
    req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY &&
    req.decoded.user.role !== USER_ROLES.TEACHER
  ) {
    return res.status(403).json({
      msg: 'Permission Denied'
    });
  }

  const networkObj = await network.connectToNetwork(req.decoded.user);
  if (!networkObj) {
    return res.status(500).json({
      msg: 'Failed connect to blockchain!'
    });
  }

  let classes = await network.query(networkObj, 'GetAllClasses');
  if (!classes.success) {
    return res.status(404).json({
      msg: 'Query has failed'
    });
  }

  let classesNoTeacher = JSON.parse(classes.msg)
    ? JSON.parse(classes.msg).filter((c) => c.TeacherUsername === '')
    : [];

  return res.json({
    classesNoTeacher
  });
});

router.get(
  '/:classId',
  check('classId')
    .trim()
    .escape(),
  async (req, res) => {
    const user = req.decoded.user;

    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    const response = await network.query(networkObj, 'GetClass', req.params.classId);

    if (!response.success) {
      return res.status(404).send({
        msg: 'Query Class has failed'
      });
    }

    let classInfo = JSON.parse(response.msg);

    let subjectId = classInfo.SubjectID;

    let subjectInfo = await network.query(networkObj, 'GetSubject', subjectId);

    if (!subjectInfo.success) {
      return res.status(404).send({
        msg: 'Query has failed'
      });
    }

    subjectInfo = JSON.parse(subjectInfo.msg);

    classInfo.SubjectName = subjectInfo.SubjectName;
    if (user.role === USER_ROLES.STUDENT) {
      delete classInfo.Students;
    }

    return res.json({
      class: classInfo
    });
  }
);

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
      students
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
  async (req, res) => {
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
  async (req, res) => {
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
