process.env.NODE_DEV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const User = require('../models/User');
const network = require('../fabric/network');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const app = require('../app');

require('dotenv').config();

describe('GET /account/me/', () => {
  let connect;
  let query;
  let findOneUserStub;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    findOneUserStub = sinon.stub(User, 'findOne');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    findOneUserStub.restore();
  });

  it('failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('failed to query info student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Error');
        done();
      });
  });

  it('failed to query info student in chaincode', (done) => {
    connect.returns(null);

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('success query info of user student', (done) => {
    connect.returns({ error: null });

    let data = JSON.stringify({
      Username: 'hoangdd',
      Fullname: 'Do Hoang',
      Info: { Avatar: 'https://google.com', Sex: 'Male', Phone: '123456789' },
      Courses: 'Blockchain101'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('success query info of user teacher', (done) => {
    query.withArgs('QueryTeacher');
    connect.returns({ error: null });

    query.returns({
      success: true,
      msg: {
        Username: 'hoangdd',
        Fullname: 'Do Hoang',
        Subjects: ['1', '2']
      }
    });
    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('success query info of admin academy', (done) => {
    connect.returns({ error: null });

    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.username).equal('hoangdd');
        expect(res.body.role).equal(1);
        done();
      });
  });

  it('success query info of admin student', (done) => {
    connect.returns({ error: null });

    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.username).equal('hoangdd');
        expect(res.body.role).equal(3);
        done();
      });
  });
});

describe('GET /account/me/mysubjects', () => {
  let connect;
  let getMySubjectStub;
  let findOneUserStub;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    getMySubjectStub = sinon.stub(network, 'query');
    findOneUserStub = sinon.stub(User, 'findOne');
  });

  afterEach(() => {
    connect.restore();
    getMySubjectStub.restore();
    findOneUserStub.restore();
  });

  it('failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('failed to query subject of user student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      error: 'Error Network'
    });

    getMySubjectStub.returns({
      success: false,
      msg: data
    });

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('failed to query subject of user student in chaincode with role teacher', (done) => {
    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.TEACHER
    });

    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    let data = JSON.stringify({
      error: 'Error Network'
    });

    getMySubjectStub.returns({
      success: false,
      msg: data
    });

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('notify user has not subject', (done) => {
    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.ADMIN_ACADEMY
    });

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('You do not have subject');
        done();
      });
  });

  it('success query subjects of user student', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      SubjectID: 'INT2002',
      Name: 'C++',
      TeacherUsername: 'tantrinh',
      Students: ['1', '2']
    });

    getMySubjectStub.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('success query subjects of user teacher', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.TEACHER
    });

    let data = JSON.stringify(
      {
        SubjectID: 'INT2002',
        Name: 'C++',
        TeacherUsername: 'tantrinh',
        Students: ['1', '2']
      },
      {
        SubjectID: 'INT2020',
        Name: 'Golang',
        TeacherUsername: 'tantrinh',
        Students: ['1', '2']
      }
    );

    getMySubjectStub.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('teacher cannot connect to blockchain', (done) => {
    connect.returns(null);

    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.TEACHER
    });

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });
});

describe('POST /account/me/createscore', () => {
  let connect;
  let createScoreStub;
  let findOneUserStub;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    createScoreStub = sinon.stub(network, 'createScore');
    findOneUserStub = sinon.stub(User, 'findOne');
  });

  afterEach(() => {
    connect.restore();
    createScoreStub.restore();
    findOneUserStub.restore();
  });

  it('success create score', (done) => {
    findOneUserStub.yields(undefined, { username: 'tantrinh' });
    createScoreStub.returns({
      success: true,
      msg: 'create score success'
    });

    request(app)
      .post('/account/me/createscore')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        subjectId: '123',
        studentUsername: 'tantrinh',
        scoreValue: '9.0'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success create score', (done) => {
    findOneUserStub.yields(undefined, { username: 'tantrinh' });

    request(app)
      .post('/account/me/createscore')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        subjectId: '123',
        studentUsername: 'tantrinh',
        scoreValue: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied create score with role student ', (done) => {
    findOneUserStub.yields(undefined, { username: 'tantrinh' });

    request(app)
      .post('/account/me/createscore')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        subjectId: '123',
        studentUsername: 'tantrinh',
        scoreValue: '9.0'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied create score with role admin academy ', (done) => {
    findOneUserStub.yields(undefined, { username: 'tantrinh' });

    request(app)
      .post('/account/me/createscore')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId: '123',
        studentUsername: 'tantrinh',
        scoreValue: '9.0'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied create score with role admin student ', (done) => {
    findOneUserStub.yields(undefined, { username: 'tantrinh' });

    request(app)
      .post('/account/me/createscore')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectId: '123',
        studentUsername: 'tantrinh',
        scoreValue: '9.0'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('GET /account/me/certificates', () => {
  let connect;
  let query;
  let findOneUserStub;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    findOneUserStub = sinon.stub(User, 'findOne');
    query.withArgs('GetMyCerts');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    findOneUserStub.restore();
  });

  it('success query certificates of user student', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      CertificateID: 'A354',
      SubjectID: 'INT-2019',
      StudentUsername: 'tanbongcuoi',
      IssueDate: '10-10-2019'
    });

    query.returns({
      success: true,
      msg: data
    });
    request(app)
      .get('/account/me/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('alert are not student when user teacher query', (done) => {
    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.TEACHER
    });

    request(app)
      .get('/account/me/certificates')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        // expect(res.status).equal(200);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('alert are not student when user admin student', (done) => {
    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.ADMIN_STUDENT
    });
    request(app)
      .get('/account/me/certificates')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .then((res) => {
        // expect(res.status).equal(200);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('alert are not student when user admin academy', (done) => {
    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.ADMIN_ACADEMY
    });
    request(app)
      .get('/account/me/certificates')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        // expect(res.status).equal(200);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });
});

describe('POST /account/me/registersubject', () => {
  let connect;
  let registerSubjectStub;
  let findOneUserStub;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    registerSubjectStub = sinon.stub(network, 'registerStudentForSubject');
    findOneUserStub = sinon.stub(User, 'findOne');
  });

  afterEach(() => {
    connect.restore();
    registerSubjectStub.restore();
    findOneUserStub.restore();
  });

  it('do not succes with rep.body.subjectId is null', (done) => {
    findOneUserStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });

    request(app)
      .post('/account/me/registersubject')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        subjectId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('do not success with teacher user', (done) => {
    findOneUserStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });

    request(app)
      .post('/account/me/registersubject')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        subjectId: '12'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not success with admin academy user', (done) => {
    findOneUserStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });

    request(app)
      .post('/account/me/registersubject')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId: '12'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not success with admin student user', (done) => {
    findOneUserStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });

    request(app)
      .post('/account/me/registersubject')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectId: '12'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not success when call registerSubjectForStudent', (done) => {
    findOneUserStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });

    registerSubjectStub.returns({
      success: false,
      msg: 'error call chaincode'
    });

    request(app)
      .post('/account/me/registersubject')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        subjectId: '12'
      })
      .then((res) => {
        expect(res.body.msg).equal('error call chaincode');
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('success register Subject For Student', (done) => {
    findOneUserStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });

    registerSubjectStub.returns({
      success: true,
      msg: 'Create success!'
    });

    request(app)
      .post('/account/me/registersubject')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        subjectId: '12'
      })
      .then((res) => {
        expect(res.body.msg).equal('Create success!');
        expect(res.body.success).equal(true);
        done();
      });
  });
});

describe('GET /account/me/:subjectId/students', () => {
  let connect;
  let query;
  let findOneStub;
  let subjectID = '7';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    findOneStub = sinon.stub(User, 'findOne');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    findOneStub.restore();
  });

  it('success query students of subject', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });
    connect.returns({ error: null });
    let students = JSON.stringify([{ username: 'tantrinh' }, { username: 'nghianv' }]);
    let scores = JSON.stringify([
      {
        SubjectID: '7',
        StudentUsername: 'tantrinh',
        scoreValue: 10.0
      }
    ]);
    query.onFirstCall().returns({ success: true, msg: students });
    query.onSecondCall().returns({ success: true, msg: scores });
    request(app)
      .get(`/account/me/${subjectID}/students`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success because failed to call GetStudentsBySubject function', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });
    connect.returns({ error: null });
    let scores = JSON.stringify([
      {
        SubjectID: '7',
        StudentUsername: 'tantrinh',
        scoreValue: 10.0
      }
    ]);
    query.onFirstCall().returns({ success: false, msg: [] });
    query.onSecondCall().returns({ success: true, msg: scores });
    request(app)
      .get(`/account/me/${subjectID}/students`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Error when call chaincode');
        done();
      });
  });

  it('do not succes because failed to call GetScoresBySubject function', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });

    let students = JSON.stringify([{ username: 'tantrinh' }, { username: 'nghianv' }]);
    query.onFirstCall().returns({ success: true, msg: students });
    query.onSecondCall().returns({ success: false, msg: [] });
    request(app)
      .get(`/account/me/${subjectID}/students`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Error when call chaincode');
        done();
      });
  });

  it('list students return null', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });

    let students = JSON.stringify([{ username: 'tantrinh' }, { username: 'nghianv' }]);
    let scores = JSON.stringify(null);

    query.onFirstCall().returns({ success: true, msg: students });
    query.onSecondCall().returns({ success: true, msg: scores });
    request(app)
      .get(`/account/me/${subjectID}/students`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);

        done();
      });
  });
});
