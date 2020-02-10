const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const STATUS_CERT = require('../configs/constant').STATUS_CERT;
const network = require('../fabric/network');
const { check, validationResult, sanitizeParam } = require('express-validator');
const checkJWT = require('../middlewares/check-jwt');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const uuidv4 = require('uuid/v4');
require('dotenv').config();

router.get('/create', checkJWT, async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  } else {
    res.json({
      hello: 'new teacher'
    });
  }
});

router.post(
  '/create',
  checkJWT,
  [
    check('subjectId')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('studentUsername')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: true, errors: errors.array() });
    }

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }
    let identity = req.body.studentUsername;
    const networkObj = await network.connectToNetwork(req.decoded.user);
    var issueDate = new Date().toString();

    let certificate = {
      certificateID: uuidv4(),
      subjectID: req.body.subjectId,
      studentUsername: identity,
      issueDate: issueDate
    };

    const response = await network.createCertificate(networkObj, certificate);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg
      });
    }
    const queryCertificate = await network.query(
      networkObj,
      'GetCertificatesBySubject',
      req.body.subjectId
    );
    const queryScore = await network.query(networkObj, 'GetScoresBySubject', req.body.subjectId);
    const queryStudent = await network.query(
      networkObj,
      'GetStudentsBySubject',
      req.body.subjectId
    );

    if (!queryCertificate.success || !queryScore.success || !queryStudent.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg.toString()
      });
    }

    let listScore = JSON.parse(queryScore.msg);
    let listCertificates = JSON.parse(queryCertificate.msg);
    let listStudents = JSON.parse(queryStudent.msg);

    listStudents.forEach((student) => {
      student['statusCertificate'] = STATUS_CERT.NO_SCORE;
      student['ScoreValue'] = null;
      if (listScore) {
        listScore.forEach((score) => {
          if (score.StudentUsername === student.Username) {
            student['ScoreValue'] = score.ScoreValue;
            if (score.Certificated) {
              student['statusCertificate'] = STATUS_CERT.CERTIFICATED;
              listCertificates.forEach((cert) => {
                if (student.Username === cert.StudentUsername) {
                  student['certificateId'] = cert.CertificateID;
                }
              });
            } else {
              student['statusCertificate'] = STATUS_CERT.NO_CERT;
            }
          }
        });
      }
    });
    return res.json({
      success: true,
      students: listStudents
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

router.get('/:certId', async (req, res) => {
  var certId = req.params.certId;

  try {
    let ceritificate = await Certificate.findOne({ certificateID: certId });

    if (!ceritificate) {
      return res.status(404).json({
        success: false,
        msg: 'certificate is not exists'
      });
    }

    return res.json({
      success: true,
      msg: ceritificate
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Internal Server Error'
    });
  }
});

router.get('/:certId/verify', checkJWT, async (req, res) => {
  let user = req.decoded.user;
  let certId = req.params.certId;

  try {
    let ceritificate = await Certificate.findOne({ certificateID: certId });

    if (!ceritificate) {
      return res.status(404).json({
        success: false,
        msg: 'ceritificate is not exists'
      });
    }

    const networkObj = await network.connectToNetwork(user);
    const response = await network.verifyCertificate(networkObj, ceritificate);

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
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Internal Server Error'
    });
  }
});

module.exports = router;
