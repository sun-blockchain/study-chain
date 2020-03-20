const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const checkJWT = require('../middlewares/check-jwt');
const { body, validationResult, check } = require('express-validator');
const uuidv4 = require('uuid/v4');
const Status = { Open: 'Open', InProgress: 'InProgress', Completed: 'Completed' };

//get class of student
router.get(
  '/classesOfStudent/:username',
  checkJWT,
  check('username')
    .trim()
    .escape(),
  async (req, res) => {
    const user = req.decoded.user;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }

    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Connect to blockchain failed'
      });
    }

    const response = await network.query(networkObj, 'GetClassesOfStudent', req.params.username);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: 'Query chaincode failed'
      });
    }
    let classes = JSON.parse(response.msg) ? JSON.parse(response.msg) : [];
    return res.json({
      success: true,
      classes: classes
    });
  }
);
// Create class
router.post(
  '/subject/:subjectId/class',
  checkJWT,
  [
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
        success: false,
        msg: 'Permission Denied'
      });
    } else {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const admin = req.decoded.user;

      const { classCode, room, time, startDate, endDate, repeat, capacity } = req.body;

      if (parseInt(endDate) - parseInt(startDate) < 604800000) {
        return res.status(500).json({
          success: false,
          msg: 'Start date must occur befor end date at least 1 week!'
        });
      }
      const subjectId = req.params.subjectId;

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
          success: false,
          msg: 'Failed connect to blockchain!'
        });
      }

      const response = await network.createClass(networkObj, newClass);

      if (!response.success) {
        return res.status(500).json({
          success: false,
          msg: response.msg
        });
      }

      return res.status(200).json({
        success: true,
        msg: 'Create Successdfully!'
      });
    }
  }
);
// Edit class
router.put(
  '/class',
  checkJWT,
  [
    body('classId')
      .not()
      .isEmpty()
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

      const {
        classId,
        classCode,
        room,
        time,
        subjectId,
        startDate,
        endDate,
        repeat,
        capacity
      } = req.body;

      let _class = {
        classId,
        classCode,
        room,
        time,
        startDate,
        endDate,
        repeat,
        capacity
      };

      const response = await network.updateClassInfo(networkObj, _class);

      if (!response.success) {
        return res.status(500).json({
          success: false,
          msg: response.msg
        });
      }

      const listNewClass = await network.query(networkObj, 'GetClassesOfSubject', subjectId);

      return res.json({
        success: true,
        classes: JSON.parse(listNewClass.msg)
      });
    }
  }
);

// assign class for teacher
router.post(
  '/assignTeacherToClass',
  checkJWT,
  [
    body('username')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('classId')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, msg: errors.array() });
    }
    let classId = req.body.classId;
    let username = req.body.username;

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }

    let networkObj = await network.connectToNetwork(req.decoded.user);
    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain!'
      });
    }

    let classInfo = await network.query(networkObj, 'GetClass', classId);
    if (!classInfo.success) {
      return res.status(500).json({
        success: false,
        msg: "Can't query class in chaincode!"
      });
    }

    classInfo = JSON.parse(classInfo.msg);

    if (classInfo.TeacherUsername !== '') {
      if (classInfo.TeacherUsername === username) {
        return res.status(500).json({
          success: false,
          msg: 'The class was added for this teacher!'
        });
      }

      return res.status(500).json({
        success: false,
        msg: `The class was added for teacher - ${classInfo.TeacherUsername}!`
      });
    }

    if (classInfo.Status !== 'Open') {
      return res.status(500).json({
        success: false,
        msg: 'The class was started!'
      });
    }

    networkObj = await network.connectToNetwork(req.decoded.user);
    const response = await network.assignTeacherToClass(
      networkObj,
      req.body.classId,
      req.body.username
    );
    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg
      });
    }

    return res.status(200).json({
      success: true,
      msg: 'Assign Successfully!'
    });
  }
);

router.post(
  '/unassignTeacherFromClass',
  checkJWT,
  [
    body('classId')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res, next) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied!'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, msg: errors.array() });
    }

    let classId = req.body.classId;
    let admin = req.decoded.user;

    let networkObj = await network.connectToNetwork(admin);
    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain!'
      });
    }

    let classInfo = await network.query(networkObj, 'GetClass', classId);
    if (!classInfo.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not query chaincode!'
      });
    }

    classInfo = JSON.parse(classInfo.msg);

    if (classInfo.TeacherUsername === '') {
      return res.status(500).json({
        success: false,
        msg: 'This class does not belong to any teacher!'
      });
    }

    if (classInfo.Status !== 'Open') {
      return res.status(500).json({
        success: false,
        msg: 'This class was started!'
      });
    }

    networkObj = await network.connectToNetwork(admin);
    let response = await network.unassignTeacherFromClass(networkObj, classId);
    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not invoke chaincode!'
      });
    }
    return res.status(200).json({
      success: true,
      msg: 'Unassign Successfully!'
    });
  }
);

router.put(
  '/startClass',
  [
    body('classId')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],

  async (req, res, next) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    let classId = req.body.classId;

    let networkObj = await network.connectToNetwork(req.decoded.user);
    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain!'
      });
    }
    const responseQuery = await network.query(networkObj, 'GetClass', classId);

    if (!responseQuery.success) {
      return res.status(500).json({
        success: false,
        msg: responseQuery.msg.toString()
      });
    }

    let classInfo = JSON.parse(responseQuery.msg);
    if (classInfo.Status !== Status.Open) {
      return res.status(500).json({
        success: false,
        msg: 'Can not start this class!'
      });
    }

    if (!classInfo.TeacherUsername || classInfo.TeacherUsername === '') {
      return res.status(500).json({
        success: false,
        msg: 'There is no teacher assigned to this class!'
      });
    }

    networkObj = await network.connectToNetwork(req.decoded.user);
    const response = await network.startClass(networkObj, classId);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg.toString()
      });
    }

    return res.json({
      success: true,
      msg: 'Start Successfully!'
    });
  }
);

module.exports = router;
