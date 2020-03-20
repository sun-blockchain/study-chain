const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const STATUS_REGISTERED = require('../configs/constant').STATUS_REGISTERED;
const network = require('../fabric/network.js');
const User = require('../models/User');
const { validationResult, body, check } = require('express-validator');
const checkJWT = require('../middlewares/check-jwt');
const cloudinary = require('cloudinary').v2;
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const bcrypt = require('bcryptjs');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

router.get('/', async (req, res) => {
  const user = req.decoded.user;

  if (user.role === USER_ROLES.STUDENT) {
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    let identity = user.username;
    const response = await network.query(networkObj, 'GetStudent', identity);

    if (!response.success) {
      return res.status(404).json({
        msg: 'Query student has failed'
      });
    }

    let student = JSON.parse(response.msg);
    return res.json({
      username: student.Username,
      fullname: student.Fullname,
      phonenumber: student.Info.PhoneNumber,
      email: student.Info.Email,
      address: student.Info.Address,
      sex: student.Info.Sex,
      birthday: student.Info.Birthday,
      avatar: student.Info.Avatar,
      country: student.Info.Country
    });
  } else if (user.role === USER_ROLES.TEACHER) {
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    const response = await network.query(networkObj, 'GetTeacher', user.username);

    if (!response.success) {
      return res.status(404).json({
        msg: 'Query teacher has failed'
      });
    }

    let teacher = JSON.parse(response.msg);

    return res.json({
      username: teacher.Username,
      fullname: teacher.Fullname,
      phonenumber: teacher.Info.PhoneNumber,
      email: teacher.Info.Email,
      address: teacher.Info.Address,
      birthday: teacher.Info.Birthday,
      sex: teacher.Info.Sex,
      avatar: teacher.Info.Avatar,
      country: teacher.Info.Country
    });
  } else if (user.role === USER_ROLES.ADMIN_ACADEMY || user.role === USER_ROLES.ADMIN_STUDENT) {
    return res.json({ username: user.username, role: user.role });
  }
});

router.get('/summary', async (req, res) => {
  const user = req.decoded.user;

  if (user.role === USER_ROLES.STUDENT) {
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    const response = await network.query(networkObj, 'GetStudent', user.username);

    if (!response.success) {
      return res.status(404).json({
        msg: 'Query chaincode has failed'
      });
    }

    let data = JSON.parse(response.msg);

    let courseCount = data.Courses ? data.Courses.length : 0;
    let classCount = data.Classes ? data.Classes.length : 0;
    let certCount = data.Certificates ? data.Certificates.length : 0;

    return res.json({
      courseCount,
      classCount,
      certCount
    });
  } else if (user.role === USER_ROLES.TEACHER) {
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    const response = await network.query(networkObj, 'GetTeacher', user.username);

    if (!response.success) {
      return res.status(404).json({
        msg: 'Query chaincode has failed'
      });
    }

    let data = JSON.parse(response.msg);
    let classCount = data.Classes ? data.Classes.length : 0;

    return res.json({
      success: true,
      classCount
    });
  } else if (user.role === USER_ROLES.ADMIN_ACADEMY) {
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

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
      return res.status(404).json({
        msg: 'Query chaincode has failed'
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
  }
});

router.put(
  '/',
  [
    body('fullName')
      .not()
      .isEmpty()
      .trim()
      .escape()
      .isLength({ min: 6 }),
    body('email').custom((email) => {
      if (email) {
        let emailRGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (emailRGEX.test(email)) {
          return true;
        } else {
          throw new Error('Wrong format email');
        }
      } else {
        return true;
      }
    }),
    body('phoneNumber').custom((phoneNumber) => {
      if (phoneNumber.value) {
        const number = phoneUtil.parseAndKeepRawInput(phoneNumber.value, phoneNumber.country);
        let result = phoneUtil.isValidNumberForRegion(number, phoneNumber.country);
        return result;
      } else {
        return true;
      }
    })
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array().toString() });
    }

    const user = req.decoded.user;

    let networkObj = await network.connectToNetwork(user);
    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    let identity = user.username;
    let response;

    if (user.role === USER_ROLES.STUDENT) {
      response = await network.query(networkObj, 'GetStudent', identity);
    }

    if (user.role === USER_ROLES.TEACHER) {
      response = await network.query(networkObj, 'GetTeacher', identity);
    }

    if (!response.success) {
      return res.status(404).json({
        msg: 'Query chaincode has failed'
      });
    }

    let today = new Date();
    let thisYear = today.getFullYear();
    let thisMonth = today.getMonth();
    let thisDate = today.getDate();

    let userInfo = JSON.parse(response.msg);
    let fullName = req.body.fullName ? req.body.fullName : '';
    let phoneNumber = req.body.phoneNumber.value ? req.body.phoneNumber.value : '';
    let email = req.body.email ? req.body.email : '';
    let address = req.body.address ? req.body.address : '';
    let sex = req.body.sex ? req.body.sex : '';
    let birthday = req.body.birthday ? req.body.birthday : '';

    if (birthday !== '') {
      let birthYear = parseInt(birthday.slice(-4));
      let birthMonth = parseInt(birthday.slice(3, 5));
      let birthDate = parseInt(birthday.slice(0, 2));

      let age = thisYear - birthYear;
      let month = thisMonth + 1 - birthMonth;

      if (month < 0 || (month === 0 && thisDate < birthDate)) {
        age--;
      }

      if (age < 6 && user.role === USER_ROLES.STUDENT) {
        return res.status(400).json({ msg: 'You must be 6 years or older' });
      } else if (age < 18 && user.role === USER_ROLES.TEACHER) {
        return res.status(400).json({ msg: 'You must be 18 years or older' });
      }
    }

    let country = req.body.phoneNumber.country ? req.body.phoneNumber.country : '';

    if (
      fullName === userInfo.Fullname &&
      phoneNumber === userInfo.Info.PhoneNumber &&
      email === userInfo.Info.Email &&
      address === userInfo.Info.Address &&
      sex === userInfo.Info.Sex &&
      birthday === userInfo.Info.Birthday &&
      country === userInfo.Info.Country
    ) {
      return res.status(304).end();
    }

    let updatedUser = {
      username: user.username,
      fullName: fullName,
      phoneNumber: phoneNumber,
      email: email,
      address: address,
      sex: sex,
      birthday: birthday,
      country: country
    };

    networkObj = await network.connectToNetwork(user);
    response = await network.updateUserInfo(networkObj, updatedUser);

    if (!response.success) {
      return res.status(500).json({
        msg: response.msg
      });
    }

    return res.json({
      msg: response.msg
    });
  }
);

router.get('/classes', async (req, res) => {
  const user = req.decoded.user;

  if (user.role !== USER_ROLES.STUDENT && user.role !== USER_ROLES.TEACHER) {
    return res.status(403).json({
      msg: 'Permission Denied'
    });
  }

  const networkObj = await network.connectToNetwork(user);

  if (!networkObj) {
    return res.status(500).json({
      msg: 'Failed to connect blockchain'
    });
  }

  let classes;

  if (user.role === USER_ROLES.STUDENT) {
    classes = await network.query(networkObj, 'GetClassesOfStudent', user.username);
  }

  if (user.role === USER_ROLES.TEACHER) {
    classes = await network.query(networkObj, 'GetClassesByTeacher', user.username);
  }

  if (!classes.success) {
    return res.status(404).json({
      msg: 'Query chaincode has failed'
    });
  }

  classes = JSON.parse(classes.msg) ? JSON.parse(classes.msg) : [];

  return res.status(200).json({
    classes
  });
});

router.get('/certificates', async (req, res) => {
  const user = req.decoded.user;

  if (user.role !== USER_ROLES.STUDENT) {
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

  let certs = await network.query(networkObj, 'GetCertificatesOfStudent', user.username);
  let courses = await network.query(networkObj, 'GetCoursesOfStudent', user.username);

  if (!certs.success || !courses.success) {
    return res.status(404).json({
      msg: 'Query chaincode has failed'
    });
  }

  certs = JSON.parse(certs.msg) ? JSON.parse(certs.msg) : [];
  courses = JSON.parse(courses.msg) ? JSON.parse(courses.msg) : [];

  for (let i = 0; i < certs.length; i++) {
    for (let k = 0; k < courses.length; k++) {
      if (certs[i].CourseID === courses[k].CourseID) {
        certs[i].CourseName = courses[k].CourseName;
        certs[i].Description = courses[k].ShortDescription;
      }
    }
  }

  return res.json({
    certificates: certs
  });
});

router.get(
  '/courses/:courseId/certificate',
  check('courseId')
    .trim()
    .escape(),
  async (req, res) => {
    const user = req.decoded.user;

    if (user.role !== USER_ROLES.STUDENT) {
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

    let courseId = req.params.courseId;
    let certs = await network.query(networkObj, 'GetCertificatesOfStudent', user.username);
    let certificateId;

    if (!certs.success) {
      return res.status(404).json({
        msg: 'Query chaincode has failed'
      });
    }

    certs = JSON.parse(certs.msg) ? JSON.parse(certs.msg) : [];

    for (let i = 0; i < certs.length; i++) {
      if (courseId === certs[i].CourseID && user.username === certs[i].StudentUsername) {
        certificateId = certs[i].CertificateID;
      }
    }

    return res.json({
      certificateId
    });
  }
);

router.put('/avatar', multipartMiddleware, async (req, res) => {
  try {
    const user = req.decoded.user;
    let imageFile = req.files.image.path;
    const image = await cloudinary.uploader.upload(imageFile, { tags: `${user.username}` });
    const networkObj = await network.connectToNetwork(user);
    const response = await network.updateUserAvatar(networkObj, image.secure_url);

    if (!response.success) {
      return res.status(500).json({
        msg: response.msg.toString()
      });
    }

    return res.json({ imageUrl: image.secure_url });
  } catch (error) {
    return res.status(500).json({
      msg: error.message
    });
  }
});

router.put(
  '/password',
  [
    body('oldPass')
      .not()
      .isEmpty()
      .trim()
      .isLength({ min: 6 }),
    body('newPass')
      .not()
      .isEmpty()
      .trim()
      .isLength({ min: 6 }),
    body('confirmPass')
      .not()
      .isEmpty()
      .trim()
      .isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { oldPass, newPass, confirmPass } = req.body;

      if (oldPass === newPass) {
        return res.status(400).json({
          msg: 'Your new password must be different from your previous password'
        });
      } else if (newPass !== confirmPass) {
        return res.status(400).json({
          msg: 'Confirm password does not match'
        });
      }

      let user = await User.findOne({ username: req.decoded.user.username });

      if (!user) {
        return res.status(404).json({
          msg: 'Account does not exist'
        });
      }

      let validPassword = await bcrypt.compare(oldPass, user.password);

      if (!validPassword) {
        return res.status(400).json({
          msg: 'Old Password incorrect'
        });
      }

      const SALTROUNDS = 10;
      const hashVal = await bcrypt.hash(newPass, SALTROUNDS);

      await user.updateOne({ password: hashVal });

      return res.status(200).json({
        msg: 'Change password successfully'
      });
    } catch (error) {
      return res.status(500).json({
        msg: 'Change password failed'
      });
    }
  }
);

router.get('/classes', async (req, res) => {
  const user = req.decoded.user;

  if (user.role !== USER_ROLES.STUDENT && user.role !== USER_ROLES.TEACHER) {
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

  let classes = [];

  if (user.role === USER_ROLES.STUDENT) {
    classes = await network.query(networkObj, 'GetClassesOfStudent', user.username);
  } else if (user.role === USER_ROLES.TEACHER) {
    classes = await network.query(networkObj, 'GetClassesByTeacher', user.username);
  }

  let subjects = await network.query(networkObj, 'GetAllSubjects');

  if (!classes.success || !subjects.success) {
    return res.status(404).json({
      success: false,
      msg: 'Query chaincode failed'
    });
  }

  if (!classes.success || !subjects.success) {
    return res.status(500).json({
      success: false,
      msg: 'Query chaincode failed'
    });
  }

  if (user.role === USER_ROLES.STUDENT) {
    for (let i = 0; i < classes.length; i++) {
      for (let k = 0; k < subjects.length; k++) {
        if (classes[i].SubjectID === subjects[k].SubjectID) {
          classes[i].SubjectName = subjects[k].SubjectName;
          break;
        }
      }
    }
  }

  return res.json({
    success: true,
    classes
  });
});

router.get('/courses', async (req, res) => {
  const user = req.decoded.user;

  if (user.role !== USER_ROLES.STUDENT) {
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

  let courses = await network.query(networkObj, 'GetCoursesOfStudent', user.username);
  let certs = await network.query(networkObj, 'GetCertificatesOfStudent', user.username);

  if (!courses.success || !certs.success) {
    return res.status(404).json({
      msg: 'Query chaincode has failed'
    });
  }

  courses = JSON.parse(courses.msg) ? JSON.parse(courses.msg) : [];
  certs = JSON.parse(certs.msg) ? JSON.parse(certs.msg) : [];

  for (let i = 0; i < courses.length; i++) {
    courses[i].Progressing = 'Learning';
    delete courses[i].Students;
  }

  for (let i = 0; i < courses.length; i++) {
    for (let k = 0; k < certs.length; k++) {
      if (courses[i].CourseID === certs[k].CourseID) {
        courses[i].Progressing = 'Completed';
        break;
      }
    }
  }

  for (let i = 0; i < courses.length; i++) {
    courses[i]['getCert'] = courses[i].Subjects && courses[i].Subjects.length > 0;
  }

  return res.json({
    courses
  });
});

router.get('/courses/not-enroll', async (req, res) => {
  const user = req.decoded.user;

  if (user.role !== USER_ROLES.STUDENT) {
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

  let allCourses = await network.query(networkObj, 'GetOpenCourses');
  let myCourses = await network.query(networkObj, 'GetCoursesOfStudent', user.username);

  if (!allCourses.success || !myCourses.success) {
    return res.status(404).json({
      msg: 'Query chaincode has failed'
    });
  }

  allCourses = JSON.parse(allCourses.msg);
  myCourses = JSON.parse(myCourses.msg);

  if (!myCourses) {
    return res.json({
      courses: allCourses
    });
  }

  let notRegisterCourses = allCourses.filter(
    (elem) => !myCourses.find(({ CourseID }) => elem.CourseID === CourseID)
  );

  return res.json({
    courses: notRegisterCourses
  });
});

router.get(
  '/courses/:courseId/scores',
  check('courseId')
    .trim()
    .escape(),
  async (req, res) => {
    const user = req.decoded.user;
    if (user.role !== USER_ROLES.STUDENT) {
      return res.status(403).json({
        msg: 'Permission Denied'
      });
    }

    let courseId = req.params.courseId;
    let username = user.username;

    const networkObj = await network.connectToNetwork(user);
    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    const resSubjects = await network.query(networkObj, 'GetSubjectsOfCourse', courseId);
    const resScores = await network.query(networkObj, 'GetScoresOfStudent', [username, courseId]);
    if (!resSubjects.success || !resScores.success) {
      return res.status(404).json({
        msg: 'Query chaincode has failed'
      });
    }

    let listSubjects = JSON.parse(resSubjects.msg) ? JSON.parse(resSubjects.msg) : [];
    let listScores = JSON.parse(resScores.msg) ? JSON.parse(resScores.msg) : [];

    for (let i = 0; i < listScores.length; i++) {
      for (let j = 0; j < listSubjects.length; j++) {
        if (listScores[i].SubjectID === listSubjects[j].SubjectID) {
          let subject = listSubjects[j];
          subject['score'] = listScores[i].ScoreValue;
          listSubjects[j] = subject;
        }
      }
    }

    return res.json({
      subjects: listSubjects
    });
  }
);

router.get(
  '/subject/:subjectId',
  check('subjectId')
    .trim()
    .escape(),
  async (req, res) => {
    const user = req.decoded.user;
    if (req.decoded.user.role !== USER_ROLES.STUDENT) {
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
    const querySubject = await network.query(networkObj, 'GetSubject', req.params.subjectId);
    const queryClassesOfSubject = await network.query(
      networkObj,
      'GetClassesOfSubject',
      req.params.subjectId
    );

    if (!querySubject.success || !queryClassesOfSubject.success) {
      res.status(404).json({
        msg: 'Query chaincode has failed'
      });
      return;
    }

    let subject = JSON.parse(querySubject.msg);
    let classes = JSON.parse(queryClassesOfSubject.msg);

    if (classes) {
      for (let i = 0; i < classes.length; i++) {
        const aClass = classes[i];
        if (aClass.Students && aClass.Students.includes(user.username)) {
          subject['classRegistered'] = aClass.ClassID;
          break;
        }
      }
    }
    return res.json({
      subject: subject
    });
  }
);

module.exports = router;
