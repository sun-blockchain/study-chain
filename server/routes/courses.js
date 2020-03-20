const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const { body, validationResult, check } = require('express-validator');
const uuidv4 = require('uuid/v4');
const checkJWT = require('../middlewares/check-jwt');

router.get('/', async (req, res) => {
  const user = req.decoded.user;
  const networkObj = await network.connectToNetwork(user);

  if (!networkObj) {
    return res.status(500).json({
      msg: 'Failed connect to blockchain'
    });
  }

  const response = await network.query(networkObj, 'GetAllCourses');

  if (!response.success) {
    return res.status(404).send({
      msg: 'Query chaincode has failed'
    });
  }

  return res.json({
    courses: JSON.parse(response.msg)
  });
});

router.get(
  '/:courseId',
  check('courseId')
    .trim()
    .escape(),
  async (req, res) => {
    const courseId = req.params.courseId;

    const user = req.decoded.user;
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    const response = await network.query(networkObj, 'GetCourse', courseId);
    const listSubjects = await network.query(networkObj, 'GetSubjectsOfCourse', courseId);

    if (!response.success || !listSubjects.success) {
      return res.status(404).send({
        msg: 'Query chaincode has failed'
      });
    }

    return res.json({
      course: JSON.parse(response.msg),
      listSubjects: JSON.parse(listSubjects.msg)
    });
  }
);

router.put(
  '/:courseId',
  [
    body('courseId')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('courseCode')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('courseName')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('shortDescription')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('description')
      .not()
      .isEmpty()
      .trim()
      .escape()
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

    const { courseId, courseCode, courseName, shortDescription, description } = req.body;

    let course = {
      courseId: courseId,
      courseCode: courseCode,
      courseName: courseName,
      shortDescription: shortDescription,
      description: description
    };

    const response = await network.updateCourseInfo(networkObj, course);

    if (!response.success) {
      return res.status(500).json({
        msg: response.msg
      });
    }

    const listNewCourse = await network.query(networkObj, 'GetAllCourses');

    return res.json({
      courses: JSON.parse(listNewCourse.msg)
    });
  }
);

router.post(
  '/:courseId/subjects',
  [
    check('courseId')
      .trim()
      .escape(),
    body('subjectId')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let admin = req.decoded.user;
    let networkObj = await network.connectToNetwork(admin);
    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    let courseId = req.params.courseId;
    let subjectId = req.body.subjectId;

    let course = await network.query(networkObj, 'GetCourse', courseId);
    if (!course.success) {
      return res.status(404).json({
        msg: 'Can not query chaincode!'
      });
    }

    course = JSON.parse(course.msg);

    if (course.Status === 'Closed') {
      return res.status(400).json({
        msg: 'This course was closed!'
      });
    }

    if (course.Subjects && course.Subjects.includes(subjectId)) {
      return res.status(409).json({
        msg: 'This subject already presents in course!'
      });
    }

    networkObj = await network.connectToNetwork(admin);
    let response = await network.addSubjectToCourse(networkObj, courseId, subjectId);

    if (!response.success) {
      return res.status(500).json({
        msg: 'Can not invoke chaincode'
      });
    }

    return res.status(201).json({
      msg: 'Add Sucessfully'
    });
  }
);

router.delete(
  '/:courseId/subjects/:subjectId',
  checkJWT,
  [
    check('courseId')
      .trim()
      .escape(),
    check('subjectId')
      .trim()
      .escape()
  ],
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
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

    let courseId = req.params.courseId;
    let subjectId = req.params.subjectId;

    let query = await network.query(networkObj, 'GetCourse', courseId);

    if (!query.success) {
      return res.status(404).json({
        msg: 'Can not query chaincode'
      });
    }

    let course = JSON.parse(query.msg);

    if (!course.Subjects || course.Subjects.indexOf(subjectId) === -1) {
      return res.status(400).json({
        msg: 'This subject does not present in course!'
      });
    }

    networkObj = await network.connectToNetwork(user);

    let response = await network.removeSubjectFromCourse(networkObj, courseId, subjectId);
    if (!response.success) {
      return res.status(500).json({
        msg: 'Can not invoke chaincode'
      });
    }

    return res.json({
      msg: 'This subject has been removed from course'
    });
  }
);

router.get(
  '/:courseId/subjects/not-in',
  check('courseId')
    .trim()
    .escape(),
  async (req, res) => {
    const courseId = req.params.courseId;

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }
    let errors = validationResult(req);

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
    const courseQuery = await network.query(networkObj, 'GetCourse', courseId);
    const allSubjecyQuery = await network.query(networkObj, 'GetAllSubjects');

    if (!courseQuery.success || !allSubjecyQuery.success) {
      return res.status(404).send({
        msg: 'Query chaincode failed'
      });
    }

    let listSubjectIn = JSON.parse(courseQuery.msg).Subjects
      ? JSON.parse(courseQuery.msg).Subjects
      : [];
    let listSubjectAll = JSON.parse(allSubjecyQuery.msg);
    let listSubjects = listSubjectAll ? listSubjectAll : [];

    let listSubjectOutside = listSubjects.filter(
      (subject) => !listSubjectIn.includes(subject.SubjectID)
    );

    return res.json({
      subjects: listSubjectOutside
    });
  }
);

router.post(
  '/',
  [
    body('courseCode')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('courseName')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('shortDescription')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('description')
      .not()
      .isEmpty()
      .trim()
      .escape()
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

    const { courseCode, courseName, shortDescription, description } = req.body;

    let course = {
      courseId: uuidv4(),
      courseCode: courseCode,
      courseName: courseName,
      shortDescription: shortDescription,
      description: description
    };

    const response = await network.createCourse(networkObj, course);

    if (!response.success) {
      return res.status(500).json({
        msg: response.msg
      });
    }

    const listNewCourse = await network.query(networkObj, 'GetAllCourses');

    return res.status(201).json({
      courses: JSON.parse(listNewCourse.msg)
    });
  }
);

router.put(
  '/:courseId/status',
  check('courseId')
    .trim()
    .escape(),
  body('status')
    .trim()
    .escape(),
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
    const { courseId } = req.params;
    const { status } = req.body;

    let networkObj = await network.connectToNetwork(user);
    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain!'
      });
    }

    let course = await network.query(networkObj, 'GetCourse', courseId);
    if (!course.success) {
      return res.status(404).json({
        msg: 'Query course has failed'
      });
    }

    course = JSON.parse(course.msg);
    networkObj = await network.connectToNetwork(user);
    let response;

    if (status === course.Status) {
      return res.status(304).end();
    }

    if (status === 'Open') {
      response = await network.openCourse(networkObj, courseId);
    } else if (status === 'Closed') {
      response = await network.closeCourse(networkObj, courseId);
    }

    if (!response || !response.success) {
      return res.status(500).json({
        msg: 'Can not invoke chaincode!'
      });
    }

    return res.json({ msg: 'Change status successfully' });
  }
);

router.get(
  '/students/:username',
  checkJWT,
  check('username')
    .trim()
    .escape(),
  async (req, res) => {
    const user = req.decoded.user;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }

    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Connect to blockchain failed'
      });
    }

    const response = await network.query(networkObj, 'GetCoursesOfStudent', req.params.username);

    if (!response.success) {
      return res.status(404).json({
        msg: 'Query chaincode failed'
      });
    }

    return res.json({
      courses: JSON.parse(response.msg)
    });
  }
);

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
      students: studentList
    });
  }
);

router.post(
  '/enroll',
  checkJWT,
  [
    body('courseId')
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
    let courseId = req.body.courseId;
    let networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    let course = await network.query(networkObj, 'GetCourse', courseId);
    if (!course.success) {
      return res.status(404).json({
        msg: 'Query chain code has failed'
      });
    }

    course = JSON.parse(course.msg);

    if (course.Students && course.Students.includes(user.username)) {
      return res.status(400).json({
        msg: 'You studied this course!'
      });
    }

    if (course.Status !== 'Open') {
      return res.status(400).json({
        msg: 'This course was closed!'
      });
    }

    networkObj = await network.connectToNetwork(user);

    let response = await network.studentRegisterCourse(networkObj, user.username, courseId);
    if (!response.success) {
      return res.status(500).json({
        msg: 'Enroll has failed'
      });
    }

    return res.status(201).json({
      msg: 'Enroll Successfully'
    });
  }
);

module.exports = router;
