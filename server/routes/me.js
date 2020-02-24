const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const STATUS_REGISTERED = require('../configs/constant').STATUS_REGISTERED;
const network = require('../fabric/network.js');
const User = require('../models/User');
const { validationResult, body } = require('express-validator');
const checkJWT = require('../middlewares/check-jwt');
const cloudinary = require('cloudinary').v2;
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const bcrypt = require('bcryptjs');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const phone = require('phone');

router.get('/', async (req, res) => {
  const user = req.decoded.user;

  if (user.role === USER_ROLES.STUDENT) {
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain'
      });
    }
    let identity = user.username;
    const response = await network.query(networkObj, 'QueryStudent', identity);
    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg.toString()
      });
    }
    let student = JSON.parse(response.msg);
    return res.json({
      success: true,
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
        success: false,
        msg: 'Failed connect to blockchain'
      });
    }

    const response = await network.query(networkObj, 'QueryTeacher', user.username);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg.toString()
      });
    }
    let teacher = JSON.parse(response.msg);
    return res.json({
      success: true,
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
    return res.json({ success: true, username: user.username, role: user.role });
  }
});

router.put(
  '/info',
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
      return res.status(422).json({ success: false, msg: errors.array().toString() });
    }
    const user = req.decoded.user;
    let networkObj = await network.connectToNetwork(user);
    if (!networkObj) {
      return res.status(500).json({
        success: false,
        msg: 'Failed connect to blockchain'
      });
    }
    let identity = user.username;
    let response;
    if (user.role === USER_ROLES.STUDENT) {
      response = await network.query(networkObj, 'QueryStudent', identity);
    }
    if (user.role === USER_ROLES.TEACHER) {
      response = await network.query(networkObj, 'QueryTeacher', identity);
    }
    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg.toString()
      });
    }
    let userInfo = JSON.parse(response.msg);
    let fullName = req.body.fullName ? req.body.fullName : '';
    let phoneNumber = req.body.phoneNumber.value ? req.body.phoneNumber.value : '';
    let email = req.body.email ? req.body.email : '';
    let address = req.body.address ? req.body.address : '';
    let sex = req.body.sex ? req.body.sex : '';
    let birthday = req.body.birthday ? req.body.birthday : '';
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
      return res.status(500).json({
        success: false,
        msg: 'No changes!'
      });
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
        success: false,
        msg: response.msg
      });
    }

    return res.json({
      success: true,
      msg: response.msg
    });
  }
);

router.get('/myClasses', async (req, res) => {
  const user = req.decoded.user;

  if (user.role !== USER_ROLES.STUDENT) {
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

  const response = await network.query(networkObj, 'QueryClassesOfStudent', user.username);

  if (!response.success) {
    return res.status(500).json({
      success: false,
      msg: 'Query chaincode failed'
    });
  }

  return res.json({
    success: true,
    classes: JSON.parse(response.msg)
  });
});

router.get('/subjects', async (req, res) => {
  const user = req.decoded.user;

  const networkObj = await network.connectToNetwork(user);

  if (!networkObj) {
    return res.status(500).json({
      success: false,
      msg: 'Failed connect to blockchain'
    });
  }

  const response = await network.query(networkObj, 'GetAllSubjects');
  const certs = await network.query(networkObj, 'GetMyCerts');

  if (!response.success || !certs.success) {
    return res.status(500).json({
      success: false,
      msg: response.msg.toString()
    });
  }
  let subjectStatus = JSON.parse(response.msg);
  let listCertificates = JSON.parse(certs.msg);
  subjectStatus.forEach((subject) => {
    subject['statusConfirm'] = STATUS_REGISTERED.UNREGISTERED;
    if (subject.Students) {
      if (subject.Students.includes(user.username)) {
        subject['statusConfirm'] = STATUS_REGISTERED.REGISTERED;
      }
      if (listCertificates && listCertificates.length !== 0) {
        listCertificates.forEach((cert) => {
          if (
            cert.SubjectID === subject.SubjectID &&
            cert.StudentUsername === req.decoded.user.username
          ) {
            subject['statusConfirm'] = STATUS_REGISTERED.CERTIFICATED;
          }
        });
      }
    }
  });
  return res.json({
    success: true,
    subjects: subjectStatus
  });
});

router.get('/subjects/:subjectId/scores', async (req, res) => {
  const user = req.decoded.user;
  if (user.role !== USER_ROLES.TEACHER) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }

  const networkObj = await network.connectToNetwork(user);
  var subjectID = req.params.subjectId;

  if (!networkObj) {
    return res.status(500).json({
      success: false,
      msg: 'Failed connect to blockchain'
    });
  }

  const response = await network.query(networkObj, 'GetScoresBySubjectOfTeacher', subjectID);

  if (!response.success) {
    return res.status(500).json({
      success: false,
      subjects: response.msg.toString()
    });
  }
  return res.json({
    success: true,
    scores: JSON.parse(response.msg)
  });
});

router.get('/certificates', async (req, res) => {
  const user = req.decoded.user;

  if (user.role !== USER_ROLES.STUDENT) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }
  const networkObj = await network.connectToNetwork(user);

  if (!networkObj) {
    return res.status(500).json({
      success: false,
      msg: 'Failed connect to blockchain'
    });
  }

  const response = await network.query(networkObj, 'GetMyCerts');

  if (!response.success) {
    return res.status(500).json({
      success: false,
      msg: response.msg.toString()
    });
  }
  return res.json({
    success: true,
    certificates: JSON.parse(response.msg)
  });
});

router.get('/scores', async (req, res) => {
  const user = req.decoded.user;
  if (user.role !== USER_ROLES.STUDENT) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }
  const networkObj = await network.connectToNetwork(user);

  if (!networkObj) {
    return res.status(500).json({
      success: false,
      msg: 'Failed connect to blockchain'
    });
  }

  const response = await network.query(networkObj, 'GetMyScores');

  if (!response.success) {
    return res.status(500).json({
      success: false,
      msg: response.msg
    });
  }
  return res.json({
    success: true,
    scores: JSON.parse(response.msg)
  });
});

router.post(
  '/registerCourse',
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
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    if (req.decoded.user.role !== USER_ROLES.STUDENT) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied!'
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

    let query = await network.query(networkObj, 'QueryStudent', user.username);
    if (!query.success) {
      return res.status(500).json({
        success: false,
        msg: 'Can not query chaincode!'
      });
    }

    let courseId = req.body.courseId;
    let student = JSON.parse(query.msg);

    if (student.Courses.includes(courseId)) {
      return res.status(500).json({
        success: false,
        msg: 'You studied this course!'
      });
    }

    networkObj = await network.connectToNetwork(user);

    let response = await network.studentRegisterCourse(networkObj, user.username, courseId);
    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg
      });
    }

    return res.json({
      success: true,
      msg: 'Register Successfully!'
    });
  }
);

router.get('/createscore', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.TEACHER) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }
  return res.json({
    success: true
  });
});

router.post(
  '/createscore',
  [
    body('subjectId')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('studentUsername')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('scoreValue')
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

    if (req.decoded.user.role !== USER_ROLES.TEACHER) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }

    let identity = req.body.studentUsername;

    User.findOne({ username: identity, role: USER_ROLES.STUDENT }, async (err, student) => {
      if (err) {
        res.status(500).json({
          success: false,
          msg: err
        });
      }
      if (student) {
        let score = {
          subjectID: req.body.subjectId,
          studentUsername: identity,
          scoreValue: req.body.scoreValue
        };
        const networkObj = await network.connectToNetwork(req.decoded.user);
        const response = await network.createScore(networkObj, score);

        if (!response.success) {
          return res.status(500).json({
            success: false,
            msg: response.msg.toString()
          });
        }
        return res.json({
          success: true,
          msg: response.msg.toString()
        });
      }
    });
  }
);

router.get('/:subjectId/students', checkJWT, async (req, res, next) => {
  if (
    req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY &&
    req.decoded.user.role !== USER_ROLES.TEACHER
  ) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }

  const subjectId = req.params.subjectId;
  const networkObj = await network.connectToNetwork(req.decoded.user);
  const queryStudents = await network.query(networkObj, 'GetStudentsBySubject', subjectId);
  const queryScore = await network.query(networkObj, 'GetScoresBySubject', subjectId);

  if (!queryStudents.success || !queryScore.success) {
    return res.status(500).json({
      success: false,
      msg: 'Error when call chaincode'
    });
  }

  let listScore = JSON.parse(queryScore.msg);
  let listStudents = JSON.parse(queryStudents.msg);

  listStudents.forEach((student) => {
    if (listScore) {
      listScore.forEach((score) => {
        if (score.StudentUsername === student.Username) {
          student['ScoreValue'] = score.ScoreValue;
        }
      });
    } else {
      student['ScoreValue'] = null;
    }
  });
  return res.json({
    success: true,
    students: listStudents
  });
});

router.post('/avatar', checkJWT, multipartMiddleware, async (req, res) => {
  try {
    const user = req.decoded.user;
    let imageFile = req.files.image.path;
    const image = await cloudinary.uploader.upload(imageFile, { tags: `${user.username}` });
    const networkObj = await network.connectToNetwork(user);
    const response = await network.updateUserAvatar(networkObj, image.secure_url);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg.toString()
      });
    }

    return res.json({ success: true, imageUrl: image.secure_url });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
});

router.post(
  '/changePassword',
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
  checkJWT,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const { oldPass, newPass, confirmPass } = req.body;

      if (oldPass === newPass) {
        return res.status(400).json({
          success: false,
          msg: 'Your new password must be different from your previous password'
        });
      } else if (newPass !== confirmPass) {
        return res.status(400).json({
          success: false,
          msg: 'Confirm password does not match'
        });
      }

      let user = await User.findOne({ username: req.decoded.user.username });

      if (!user) {
        return res.status(404).json({
          success: false,
          msg: 'Account does not exist'
        });
      }

      let validPassword = await bcrypt.compare(oldPass, user.password);

      if (!validPassword) {
        return res.status(400).json({
          success: false,
          msg: 'Old Password incorrect'
        });
      }

      const SALTROUNDS = 10;
      const hashVal = await bcrypt.hash(newPass, SALTROUNDS);

      await user.updateOne({ password: hashVal });

      return res.status(200).json({
        success: true,
        msg: 'Change password successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: 'Change password failed'
      });
    }
  }
);

module.exports = router;
