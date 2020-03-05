const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const checkJWT = require('../middlewares/check-jwt');
const { body, validationResult, check } = require('express-validator');
const uuidv4 = require('uuid/v4');
const Status = { Open: 'Open', Closed: 'Closed', Completed: 'Completed' };
const User = require('../models/User');

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
        courseID: courseId,
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

    let user = req.decoded.user;
    let networkObj = await network.connectToNetwork(user);

    let courseId = req.body.courseId;
    let subjectId = req.body.subjectId;

    let response = await network.addSubjectToCourse(networkObj, courseId, subjectId);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg
      });
    }

    const course = await network.query(networkObj, 'GetCourse', courseId);

    return res.json({
      success: true,
      course: JSON.parse(course.msg)
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
        success: false,
        msg: 'Permission Denied'
      });
    }
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let user = req.decoded.user;
    let networkObj = await network.connectToNetwork(user);

    let courseId = req.body.courseId;
    let subjectId = req.body.subjectId;

    let query = await network.query(networkObj, 'GetCourse', courseId);

    if (!query.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not query chaincode!'
      });
    }

    let course = JSON.parse(query.msg);

    if (course.Subjects.indexOf(subjectId) === -1) {
      return res.status(422).json({
        success: false,
        msg: 'This subject does not present in course!'
      });
    }
    networkObj = await network.connectToNetwork(user);

    let response = await network.removeSubjectFromCourse(networkObj, courseId, subjectId);
    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg
      });
    }

    return res.json({
      success: true,
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
        success: false,
        msg: 'Permission Denied'
      });
    }
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const user = req.decoded.user;
    const networkObj = await network.connectToNetwork(user);
    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain'
      });
    }
    const courseQuery = await network.query(networkObj, 'GetCourse', courseId);
    const allSubjecyQuery = await network.query(networkObj, 'GetAllSubjects');

    if (!courseQuery.success || !allSubjecyQuery.success) {
      return res.status(500).send({
        success: false,
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
      success: true,
      subjects: listSubjectOutside
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
  '/deleteCourse',
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
    } else {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = req.decoded.user;
      const networkObj = await network.connectToNetwork(user);

      const { courseId } = req.body;

      const response = await network.deleteCourse(networkObj, courseId);

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
  '/coursesOfStudent',
  checkJWT,
  body('username')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  async (req, res) => {
    const user = req.decoded.user;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const username = req.body.username;

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

    const response = await network.query(networkObj, 'GetCoursesOfStudent', username);

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

      const user = req.decoded.user;

      const { classCode, room, time, startDate, endDate, repeat, capacity } = req.body;

      const subjectId = req.params.subjectId;

      let _class = {
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
      let networkObj = await network.connectToNetwork(user);

      const response = await network.createClass(networkObj, _class);

      if (!response.success) {
        return res.status(500).json({
          success: false,
          msg: response.msg
        });
      }
      networkObj = await network.connectToNetwork(user);

      const listNewClasses = await network.query(
        networkObj,
        'GetClassesOfSubject',
        req.params.subjectId
      );

      return res.json({
        success: true,
        classes: JSON.parse(listNewClasses.msg)
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
  '/closeRegisterClass',
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
        msg: 'Can not close register!'
      });
    }

    networkObj = await network.connectToNetwork(req.decoded.user);
    const response = await network.closeRegisterClass(networkObj, classId);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg.toString()
      });
    }

    return res.json({
      success: true,
      msg: 'Close Successfully!'
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
        msg: 'Permission Denied'
      });
    }

    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, errors: errors.array() });
      }

      const user = req.decoded.user;
      const { subjectId, classId } = req.body;
      let networkObj = await network.connectToNetwork(user);

      if (!networkObj) {
        return res.status(500).json({
          success: false,
          msg: 'Failed connect to blockchain!'
        });
      }

      const response = await network.deleteClass(networkObj, classId);

      if (!response.success) {
        throw new Error('Chaincode return error');
      }

      return res.json({
        success: true,
        msg: 'Delete Successfully!'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: 'Remove Failed'
      });
    }
  }
);

// ------------------------------------------------------ Teacher Manager --------------------------------------------------------
// create teacher
router.post(
  '/teacher',
  [
    body('username')
      .not()
      .isEmpty()
      .trim()
      .escape(),

    body('fullname')
      .isLength({ min: 6 })
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

    try {
      let user = await User.findOne({ username: req.body.username });

      if (user) {
        return res.status(409).json({
          success: false,
          msg: 'Teacher already exists'
        });
      }

      let createdUser = {
        username: req.body.username,
        fullname: req.body.fullname
      };

      const networkObj = await network.connectToNetwork(req.decoded.user);
      const response = await network.registerTeacherOnBlockchain(networkObj, createdUser);

      if (!response.success) {
        return res.status(500).json({
          success: false,
          msg: response.msg
        });
      }
      const teachers = await network.query(networkObj, 'GetAllTeachers');

      if (!teachers.success) {
        return res.status(500).json({
          success: false,
          msg: response.msg
        });
      }

      return res.json({
        success: true,
        msg: response.msg,
        teachers: JSON.parse(teachers.msg)
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: 'Internal Server Error'
      });
    }
  }
);

// assign class for teacher
router.post(
  '/addClassToTeacher',
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

    let classesQuery = await network.query(networkObj, 'GetClassesByTeacher', username);
    if (!classesQuery.success) {
      return res.status(500).json({
        success: false,
        msg: "Can't query classes by teacher"
      });
    }

    let listClasses = JSON.parse(classesQuery.msg);

    if (listClasses) {
      for (let index = 0; index < listClasses.length; index++) {
        const element = listClasses[index];
        if (element.ClassID === classId) {
          return res.status(500).json({
            success: false,
            msg: 'The class has been added!'
          });
        }
      }
    }

    networkObj = await network.connectToNetwork(req.decoded.user);
    const response = await network.addClassToTeacher(
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

    let classes = await network.query(networkObj, 'GetClassesByTeacher', username);
    if (!classesQuery.success) {
      return res.status(500).json({
        success: false,
        msg: "Can't query classes by teacher"
      });
    }
    return res.json({
      success: true,
      msg: response.msg,
      classes: JSON.parse(classes.msg)
    });
  }
);
// ----------------------------------------------- End -----------------------------------------------------

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
