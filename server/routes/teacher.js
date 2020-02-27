const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

router.get('/all', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }
  const networkObj = await network.connectToNetwork(req.decoded.user);
  const response = await network.query(networkObj, 'GetAllTeachers');
  if (!response.success) {
    return res.status(500).json({
      success: false,
      msg: response.msg.toString()
    });
  }
  return res.json({
    success: true,
    teachers: JSON.parse(response.msg)
  });
});

router.get('/:username', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }

  let username = req.params.username;

  try {
    let teacher = await User.findOne({ username: username, role: USER_ROLES.TEACHER });

    if (!teacher) {
      res.status(404).json({
        success: false,
        msg: 'teacher is not exists'
      });
    }

    const networkObj = await network.connectToNetwork(req.decoded.user);
    const response = await network.query(networkObj, 'GetTeacher', username);
    let subjects = await network.query(networkObj, 'GetSubjectsByTeacher', username);

    if (!response.success || !subjects.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg.toString()
      });
    }
    return res.json({
      success: true,
      msg: response.msg.toString(),
      subjects: JSON.parse(subjects.msg)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Internal Server Error'
    });
  }
});

router.get('/:username/subjects', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }

  try {
    let teacher = await User.findOne({ username: req.params.username });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        msg: 'teacher is not exists'
      });
    }

    const networkObj = await network.connectToNetwork(req.decoded.user);
    let subjectsByTeacher = await network.query(
      networkObj,
      'GetSubjectsByTeacher',
      teacher.username
    );
    let subjects = await network.query(networkObj, 'GetAllSubjects');
    let subjectsNoTeacher = JSON.parse(subjects.msg).filter(
      (subject) => subject.TeacherUsername === ''
    );

    if (!subjectsByTeacher.success || !subjects.success) {
      return res.status(500).json({
        success: false,
        msg: subjectsByTeacher.msg.toString()
      });
    }
    return res.json({
      success: true,
      subjects: JSON.parse(subjectsByTeacher.msg),
      subjectsNoTeacher: subjectsNoTeacher
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Internal Server Error'
    });
  }
});

module.exports = router;
