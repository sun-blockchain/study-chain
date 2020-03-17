const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const { check, body, validationResult } = require('express-validator');
const checkJWT = require('../middlewares/check-jwt');
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
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.decoded.user;

    if (user.role !== USER_ROLES.STUDENT) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }

    let networkObj = await network.connectToNetwork(user);
    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain'
      });
    }

    let course = await network.query(networkObj, 'GetCourse', req.body.courseId);
    let certificates = await network.query(networkObj, 'GetCertificatesOfStudent', user.username);

    if (!certificates.success || !course.success) {
      return res.status(404).json({
        msg: 'Query chaincode failed'
      });
    }

    course = JSON.parse(course.msg);
    if (!course.Subjects || course.Subjects.length < 1) {
      return res.status(400).json({
        msg: 'This course has no subject'
      });
    }

    certificates = JSON.parse(certificates.msg);
    if (certificates) {
      for (let i = 0; i < certificates.length; i++) {
        if (certificates[i].CourseID === req.body.courseId) {
          return res.status(409).json({
            msg: 'Certificate already exists'
          });
        }
      }
    }

    let student = await network.query(networkObj, 'GetStudent', user.username);
    if (!student.success) {
      return res.status(404).json({
        msg: 'Query chaincode failed'
      });
    }

    student = JSON.parse(student.msg);
    if (!student.Courses || !student.Courses.includes(req.body.courseId)) {
      return res.status(400).json({
        msg: 'You have not studied this course yet'
      });
    }

    let issueDate = new Date().toJSON().slice(0, 10);

    let certificate = {
      certificateId: uuidv4(),
      courseId: req.body.courseId,
      studentUsername: user.username,
      issueDate
    };

    networkObj = await network.connectToNetwork(user);
    let response = await network.createCertificate(networkObj, certificate);
    if (!response.success) {
      return res.status(500).json({
        msg: 'Can not create certificate'
      });
    }

    return res.status(201).json({
      msg: 'Create certificate successfully'
    });
  }
);

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

    let cert = await network.query(networkObj, 'GetCertificate', certId);

    if (!cert.success) {
      return res.status(404).json({
        msg: 'Failed to query certificate in chaincode'
      });
    }

    cert = JSON.parse(cert.msg);
    let student = await network.query(networkObj, 'GetStudent', cert.StudentUsername);
    let course = await network.query(networkObj, 'GetCourse', cert.CourseID);

    if (!student.success || !course.success) {
      return res.status(404).json({
        msg: 'Failed to query student or course in chaincode'
      });
    }

    student = JSON.parse(student.msg);
    course = JSON.parse(course.msg);

    delete student.Username;
    delete student.Courses;
    delete student.Info;
    delete student.Classes;
    delete student.Certificates;

    delete course.Students;

    cert.CourseName = course.CourseName;
    cert.Fullname = student.Fullname;

    return res.json({ cert });
  }
);

module.exports = router;
