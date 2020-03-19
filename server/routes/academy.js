const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const checkJWT = require('../middlewares/check-jwt');
const { body, validationResult, check } = require('express-validator');
const uuidv4 = require('uuid/v4');
const Status = { Open: 'Open', InProgress: 'InProgress', Completed: 'Completed' };
const User = require('../models/User');

router.get('/summary', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }

  const user = req.decoded.user;
  const networkObj = await network.connectToNetwork(user);

  let courses = await network.query(networkObj, 'GetAllCourses');
  let subjects = await network.query(networkObj, 'GetAllSubjects');
  let classes = await network.query(networkObj, 'GetAllClasses');
  let teachers = await network.query(networkObj, 'GetAllTeachers');
  let students = await network.query(networkObj, 'GetAllStudents');

  if (
    !courses.success ||
    !subjects.success ||
    !classes.success ||
    !teachers.success ||
    !students.success
  ) {
    return res.status(500).json({
      success: false,
      msg: 'Failed to get info'
    });
  }

  courses = JSON.parse(courses.msg) ? JSON.parse(courses.msg) : [];
  subjects = JSON.parse(subjects.msg) ? JSON.parse(subjects.msg) : [];
  classes = JSON.parse(classes.msg) ? JSON.parse(classes.msg) : [];
  teachers = JSON.parse(teachers.msg) ? JSON.parse(teachers.msg) : [];
  students = JSON.parse(students.msg) ? JSON.parse(students.msg) : [];

  let courseCount = courses.length;
  let subjectCount = subjects.length;
  let classCount = classes.length;
  let teacherCount = teachers.length;
  let studentCount = students.length;

  return res.json({ courseCount, subjectCount, classCount, teacherCount, studentCount });
});

// Edit course info
router.put(
  '/course',
  checkJWT,
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
          success: false,
          msg: response.msg
        });
      }

      const listNewCourse = await network.query(networkObj, 'GetAllCourses');

      return res.json({
        success: true,
        courses: JSON.parse(listNewCourse.msg)
      });
    }
  }
);

// Subject of course
router.post(
  '/addSubjectToCourse',
  checkJWT,
  [
    body('courseId')
      .not()
      .isEmpty()
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
        success: false,
        msg: 'Permission Denied'
      });
    }
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    let admin = req.decoded.user;
    let networkObj = await network.connectToNetwork(admin);
    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain!'
      });
    }

    let courseId = req.body.courseId;
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
        msg: 'Can not invoke chaincode!'
      });
    }

    return res.status(200).json({
      msg: 'Add Sucessfully!'
    });
  }
);
router.post(
  '/removeSubjectFromCourse',
  checkJWT,
  [
    body('courseId')
      .not()
      .isEmpty()
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
      return res.status(422).json({ errors: errors.array() });
    }

    let user = req.decoded.user;
    let networkObj = await network.connectToNetwork(user);
    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain!'
      });
    }

    let courseId = req.body.courseId;
    let subjectId = req.body.subjectId;

    let query = await network.query(networkObj, 'GetCourse', courseId);

    if (!query.success) {
      return res.status(404).json({
        success: false,
        msg: 'Can not query chaincode!'
      });
    }

    let course = JSON.parse(query.msg);

    if (!course.Subjects || course.Subjects.indexOf(subjectId) === -1) {
      return res.status(404).json({
        msg: 'This subject does not present in course!'
      });
    }
    networkObj = await network.connectToNetwork(user);

    let response = await network.removeSubjectFromCourse(networkObj, courseId, subjectId);
    if (!response.success) {
      return res.status(500).json({
        msg: 'Can not invoke chaincode!'
      });
    }

    return res.json({
      msg: 'This subject has been removed from course!'
    });
  }
);

router.get(
  '/subjectNoCourse/:courseId',
  checkJWT,
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

    const subjectsNotInCourse = await network.query(networkObj, 'GetSubjectsNotInCourse', courseId);
    if (!subjectsNotInCourse.success) {
      return res.status(404).send({
        msg: 'Can not query chaincode!'
      });
    }

    return res.status(200).json({
      subjects: JSON.parse(subjectsNotInCourse.msg)
    });
  }
);

// Course Manager

router.post(
  '/course',
  checkJWT,
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
          success: false,
          msg: response.msg
        });
      }

      const listNewCourse = await network.query(networkObj, 'GetAllCourses');

      return res.json({
        success: true,
        courses: JSON.parse(listNewCourse.msg)
      });
    }
  }
);

router.post(
  '/closeCourse',
  checkJWT,
  body('courseId')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array()
      });
    }

    let user = req.decoded.user;
    let networkObj = await network.connectToNetwork(user);
    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain!'
      });
    }

    let { courseId } = req.body;
    let query = await network.query(networkObj, 'GetCourse', courseId);
    if (!query.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not query chaincode!'
      });
    }

    courseInfo = JSON.parse(query.msg);
    if (courseInfo.Status === 'Closed') {
      return res.status(500).json({
        success: false,
        msg: 'This course was closed!'
      });
    }

    networkObj = await network.connectToNetwork(user);

    let response = await network.closeCourse(networkObj, courseId);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not invoke chaincode!'
      });
    }

    return res.status(200).json({
      success: true,
      msg: 'Close Successfully!'
    });
  }
);

router.post(
  '/openCourse',
  checkJWT,
  body('courseId')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array()
      });
    }

    let user = req.decoded.user;
    let networkObj = await network.connectToNetwork(user);
    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain!'
      });
    }

    let { courseId } = req.body;
    let query = await network.query(networkObj, 'GetCourse', courseId);
    if (!query.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not query chaincode!'
      });
    }

    courseInfo = JSON.parse(query.msg);
    if (courseInfo.Status === 'Open') {
      return res.status(500).json({
        success: false,
        msg: 'This course is open!'
      });
    }

    networkObj = await network.connectToNetwork(user);

    let response = await network.openCourse(networkObj, courseId);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not invoke chaincode!'
      });
    }

    return res.status(200).json({
      success: true,
      msg: 'Open Successfully!'
    });
  }
);

router.get(
  '/coursesOfStudent/:username',
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

    const response = await network.query(networkObj, 'GetCoursesOfStudent', req.params.username);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: 'Query chaincode failed'
      });
    }

    return res.json({
      success: true,
      courses: JSON.parse(response.msg)
    });
  }
);
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
// Create subject
router.post(
  '/subject',
  checkJWT,
  [
    body('subjectName')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('subjectCode')
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
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }
    let subject = {
      subjectId: uuidv4(),
      subjectName: req.body.subjectName,
      subjectCode: req.body.subjectCode,
      shortDescription: req.body.shortDescription,
      description: req.body.description
    };
    const networkObj = await network.connectToNetwork(req.decoded.user);
    const response = await network.createSubject(networkObj, subject);
    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg
      });
    }
    const listSubjects = await network.query(networkObj, 'GetAllSubjects');
    return res.json({
      success: true,
      subjects: JSON.parse(listSubjects.msg)
    });
  }
);

// Update subject
router.put(
  '/subject',
  checkJWT,
  [
    body('subject.subjectId')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('subject.subjectName')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('subject.subjectCode')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('subject.shortDescription')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('subject.description')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }
    let { subject } = req.body;
    let networkObj = await network.connectToNetwork(req.decoded.user);
    const responseQuery = await network.query(networkObj, 'GetSubject', subject.subjectId);

    if (!responseQuery.success) {
      return res.status(500).json({
        success: false,
        msg: responseQuery.msg.toString()
      });
    }

    let subjectInfo = JSON.parse(responseQuery.msg);
    if (
      subject.subjectCode === subjectInfo.SubjectCode &&
      subject.subjectName === subjectInfo.SubjectName &&
      subject.shortDescription === subjectInfo.ShortDescription &&
      subject.description === subjectInfo.Description
    ) {
      return res.status(500).json({
        success: false,
        msg: 'No changes!'
      });
    }

    networkObj = await network.connectToNetwork(req.decoded.user);
    const response = await network.updateSubjectInfo(networkObj, subject);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg
      });
    }
    const listSubjects = await network.query(networkObj, 'GetAllSubjects');
    return res.json({
      success: true,
      subjects: JSON.parse(listSubjects.msg)
    });
  }
);

// Delete subject
router.delete(
  '/subject',
  checkJWT,
  [
    body('subjectId')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }
    let { subjectId } = req.body;

    let networkObj = await network.connectToNetwork(req.decoded.user);
    const response = await network.deleteSubject(networkObj, subjectId);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg
      });
    }
    const listSubjects = await network.query(networkObj, 'GetAllSubjects');
    return res.json({
      success: true,
      subjects: JSON.parse(listSubjects.msg)
    });
  }
);

// Update subject
router.put(
  '/startClass',
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

router.post(
  '/deleteClass',
  [
    body('classId')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied!'
      });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const user = req.decoded.user;
    const { classId } = req.body;
    let networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain!'
      });
    }

    let query = await network.query(networkObj, 'GetClass', classId);
    if (!query.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not query chaincode!'
      });
    }

    let classInfo = JSON.parse(query.msg);
    if (classInfo.Status !== 'Open') {
      return res.status(500).json({
        success: false,
        msg: 'Can delete this class now!'
      });
    }

    networkObj = await network.connectToNetwork(user);
    const response = await network.deleteClass(networkObj, classId);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not invoke chaincode!'
      });
    }

    return res.status(200).json({
      success: true,
      msg: 'Delete Successfully!'
    });
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

//get Student by Id
router.get(
  '/student/:username',
  check('username')
    .trim()
    .escape(),
  checkJWT,
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }
    const user = req.decoded.user;

    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain!'
      });
    }

    const response = await network.query(networkObj, 'GetStudent', req.params.username);

    if (!response.success) {
      return res.status(500).send({
        success: false,
        msg: response.msg.toString()
      });
    }

    let student = JSON.parse(response.msg);

    return res.json({
      success: true,
      student: student
    });
  }
);
// get teacher by username
router.get(
  '/teacher/:username',
  check('username')
    .trim()
    .escape(),
  checkJWT,
  async (req, res) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }
    const user = req.decoded.user;

    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain!'
      });
    }

    const response = await network.query(networkObj, 'GetTeacher', req.params.username);

    if (!response.success) {
      return res.status(500).send({
        success: false,
        msg: response.msg.toString()
      });
    }

    let teacher = JSON.parse(response.msg) ? JSON.parse(response.msg) : {};

    return res.json({
      success: true,
      teacher: teacher
    });
  }
);
module.exports = router;
