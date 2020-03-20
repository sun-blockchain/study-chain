const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const checkJWT = require('../middlewares/check-jwt');
const { body, validationResult, check } = require('express-validator');
const uuidv4 = require('uuid/v4');

router.get('/', async (req, res) => {
  const networkObj = await network.connectToNetwork(req.decoded.user);
  if (!networkObj) {
    return res.status(500).json({
      msg: 'Failed connect to blockchain'
    });
  }

  const response = await network.query(networkObj, 'GetAllSubjects');

  if (!response.success) {
    return res.status(404).send({
      msg: 'Query all subjects has failed'
    });
  }

  return res.json({
    subjects: JSON.parse(response.msg)
  });
});

router.get('/:subjectId', async (req, res) => {
  const { subjectId } = req.params;

  const networkObj = await network.connectToNetwork(req.decoded.user);
  if (!networkObj) {
    return res.status(500).json({
      msg: 'Failed connect to blockchain'
    });
  }

  const response = await network.query(networkObj, 'GetSubject', subjectId);

  if (!response.success) {
    return res.status(404).json({
      msg: 'Query chaincode has failed'
    });
  }

  return res.json({
    subject: JSON.parse(response.msg)
  });
});

// Create subject
router.post(
  '/',
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
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
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
    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    const response = await network.createSubject(networkObj, subject);
    if (!response.success) {
      return res.status(500).json({
        success: false,
        msg: response.msg
      });
    }

    return res.status(201).json({ msg: 'Create subject successfully' });
  }
);

// Update subject
router.put(
  '/:subjectId',
  [
    check('subjectId')
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }

    let { subject } = req.body;

    let networkObj = await network.connectToNetwork(req.decoded.user);
    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }
    const responseQuery = await network.query(networkObj, 'GetSubject', req.params.subjectId);

    if (!responseQuery.success) {
      return res.status(404).json({
        msg: 'Query subject has failed'
      });
    }

    let subjectInfo = JSON.parse(responseQuery.msg);
    if (
      subject.subjectCode === subjectInfo.SubjectCode &&
      subject.subjectName === subjectInfo.SubjectName &&
      subject.shortDescription === subjectInfo.ShortDescription &&
      subject.description === subjectInfo.Description
    ) {
      return res.status(400).json({
        msg: 'No changes!'
      });
    }

    networkObj = await network.connectToNetwork(req.decoded.user);
    const response = await network.updateSubjectInfo(networkObj, subject);

    if (!response.success) {
      return res.status(500).json({
        msg: response.msg
      });
    }

    return res.status(200).json({
      msg: 'Update subject successfully'
    });
  }
);

// Delete subject
router.delete(
  '/:subjectId',
  [
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

    let { subjectId } = req.params;
    let admin = req.decoded.user;

    let networkObj = await network.connectToNetwork(admin);
    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    let subject = await network.query(networkObj, 'GetSubject', subjectId);
    if (!subject.success) {
      return res.status(404).json({
        msg: 'Can not query chaincode!'
      });
    }

    subject = JSON.parse(subject.msg);

    if (subject.Classes) {
      return res.status(400).json({
        msg: 'Can not delete this subject now!'
      });
    }

    networkObj = await network.connectToNetwork(admin);
    const response = await network.deleteSubject(networkObj, subjectId);

    if (!response.success) {
      return res.status(500).json({
        msg: 'Can not invoke chaincode!'
      });
    }

    return res.status(200).json({
      msg: 'Delete Successfully!'
    });
  }
);

router.delete(
  '/:subjectId/classes/:classId',
  [
    check('classId')
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

    const user = req.decoded.user;
    const { classId } = req.params;
    let networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    let query = await network.query(networkObj, 'GetClass', classId);
    if (!query.success) {
      return res.status(404).json({
        msg: 'Can not query chaincode!'
      });
    }

    let classInfo = JSON.parse(query.msg);
    if (classInfo.Status !== 'Open') {
      return res.status(400).json({
        msg: 'Can delete this class now'
      });
    }

    networkObj = await network.connectToNetwork(user);
    const response = await network.deleteClass(networkObj, classId);

    if (!response.success) {
      return res.status(500).json({
        msg: 'Remove class of subject has failed'
      });
    }

    return res.status(200).json({
      msg: 'Delete Successfully'
    });
  }
);

router.get(
  '/:subjectId/classes',
  check('subjectId')
    .trim()
    .escape(),
  async (req, res) => {
    const user = req.decoded.user;
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.status(500).json({
        msg: 'Failed connect to blockchain'
      });
    }

    const response = await network.query(networkObj, 'GetClassesOfSubject', req.params.subjectId);
    if (!response.success) {
      return res.status(404).send({
        msg: 'Query chaincode has failed'
      });
    }

    let classes = JSON.parse(response.msg) ? JSON.parse(response.msg) : [];

    if (user.role === USER_ROLES.STUDENT) {
      for (let index = 0; index < classes.length; index++) {
        delete classes[index].Students;
      }

      return res.json({
        class: classes
      });
    }

    return res.json({
      class: classes
    });
  }
);

module.exports = router;
