const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const STATUS_CERT = require('../configs/constant').STATUS_CERT;
const network = require('../fabric/network');
const { check, body, validationResult } = require('express-validator');
const checkJWT = require('../middlewares/check-jwt');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const uuidv4 = require('uuid/v4');
require('dotenv').config();

router.post(
  '/',
  checkJWT,
  [
    body('courseId')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    let user = req.decoded.user;

    if (user.role !== USER_ROLES.STUDENT) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied!'
      });
    }

    let networkObj = await network.connectToNetwork(user);
    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain!'
      });
    }

    let query = await network.query(networkObj, 'GetCertificatesOfStudent', user.username);
    if (!query.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not query chaincode!'
      });
    }

    let certificates = JSON.parse(query.msg);
    if (certificates) {
      for (let i = 0; i < certificates.length; i++) {
        if (certificates[i].CourseID === req.body.courseId) {
          return res.status(500).json({
            success: false,
            msg: 'Certificate already exists!'
          });
        }
      }
    }

    query = await network.query(networkObj, 'GetStudent', user.username);
    if (!query.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not query chaincode!'
      });
    }

    let studentInfo = JSON.parse(query.msg);
    if (!studentInfo.Courses || !studentInfo.Courses.includes(req.body.courseId)) {
      return res.status(500).json({
        success: false,
        msg: 'You have not studied this course yet!'
      });
    }

    var issueDate = new Date().toString();

    let certificate = {
      certificateId: uuidv4(),
      courseId: req.body.courseId,
      studentUsername: user.username,
      issueDate: issueDate
    };

    networkObj = await network.connectToNetwork(user);
    let response = await network.createCertificate(networkObj, certificate);
    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not invoke chaincode!'
      });
    }

    return res.json({
      success: true,
      msg: 'Create certificate successfully!'
    });
  }
);

router.get('/all', checkJWT, async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }
  await Certificate.find(async (err, ceritificates) => {
    if (err) {
      return res.status(500).json({
        success: false,
        msg: err
      });
    }
    if (!ceritificates) {
      return res.status(404).json({
        success: false,
        msg: 'do not have certificate'
      });
    }

    return res.json({
      success: true,
      ceritificates: ceritificates
    });
  });
});

router.get(
  '/:certId',
  check('certId')
    .trim()
    .escape(),
  async (req, res) => {
    const certId = req.params.certId;
    const adminStudent = { role: USER_ROLES.ADMIN_STUDENT, username: 'adminstudent' };
    const networkObj = await network.connectToNetwork(adminStudent);

    if (!networkObj) {
      return res.status(500).json({ msg: 'Failed to connect blockchain' });
    }

    const response = await network.query(networkObj, 'GetCertificate', certId);

    if (!response.success) {
      return res.status(500).json({ msg: 'Failed to query certificate' });
    }

    return res.json({ certificate: JSON.parse(response.msg) });
  }
);

module.exports = router;
