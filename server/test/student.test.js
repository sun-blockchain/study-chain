process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const User = require('../models/User');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const app = require('../app');

require('dotenv').config();

describe('GET /account/student', () => {
  describe('GET /account/student/all', () => {
    let connect;
    let query;
    let findOneStub;

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

    it('do not success query all student with admin student', (done) => {
      request(app)
        .get('/account/student/all')
        .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('success query all student with admin academy', (done) => {
      connect.returns({ error: null });
      let data = JSON.stringify({ username: 'tantv' }, { username: 'nghianv' });

      query.returns({
        success: true,
        msg: data
      });
      request(app)
        .get('/account/student/all')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it('do not success query all student with teacher', (done) => {
      request(app)
        .get('/account/student/all')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success query all student with student', (done) => {
      request(app)
        .get('/account/student/all')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });
  });

  describe('GET /account/student/:username/subject', () => {
    let connect;
    let query;
    let findOneStub;
    let username = 'hoangdd';

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

    it('do not success all subjects of student with admin student', (done) => {
      request(app)
        .get(`/account/student/${username}/subjects`)
        .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('success query all subjects of student with admin academy', (done) => {
      findOneStub.returns({ username: 'hoangdd' });
      connect.returns({ error: null });
      let data = JSON.stringify({ username: 'tantv' }, { username: 'nghianv' });

      query.returns({
        success: true,
        msg: data
      });
      request(app)
        .get(`/account/student/${username}/subjects`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it('do not success query all subjects of student with teacher', (done) => {
      request(app)
        .get(`/account/student/${username}/subjects`)
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success query all subjects of student with student', (done) => {
      request(app)
        .get(`/account/student/${username}/subjects`)
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('success query all subjects of student', (done) => {
      findOneStub.returns({ username: 'hoangdd' });
      connect.returns({ error: null });
      let data = JSON.stringify(
        {
          SubjectID: '00',
          Name: 'Blockchain',
          TeacherUsername: 'GV00',
          Students: ['Tan', 'Nghia']
        },
        {
          SubjectID: '01',
          Name: 'Sawtooth',
          TeacherUsername: 'GV01',
          Students: ['Tan', 'Nghia', 'Quang']
        }
      );

      query.returns({
        success: true,
        msg: data
      });
      request(app)
        .get(`/account/student/${username}/subjects`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it('student username is not exists', (done) => {
      findOneStub.returns(null);

      connect.returns({ error: null });

      request(app)
        .get(`/account/student/${username}/subjects`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(404);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('student is not exists');
          done();
        });
    });

    it('error query student in database', (done) => {
      findOneStub.returns({ username: 'trinhvantan' });

      query.returns({
        success: false,
        msg: 'error chaincode'
      });

      request(app)
        .get(`/account/student/${username}/subjects`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          done();
        });
    });

    it('error because chaincode invoke error', (done) => {
      findOneStub.throws();

      request(app)
        .get(`/account/student/${username}/subjects`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Internal Server Error');
          done();
        });
    });
  });

  describe('GET /account/student/:username/certificates', () => {
    let connect;
    let query;
    let findOneStub;
    let username = 'hoangdd';

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
    it('do not success query all certificates of student with admin student', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });
      request(app)
        .get(`/account/student/${username}/certificates`)
        .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('success query all certificates of student with admin academy', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      connect.returns({ error: null });
      let data = JSON.stringify({ username: 'tantv' }, { username: 'nghianv' });

      query.returns({
        success: true,
        msg: data
      });
      request(app)
        .get(`/account/student/${username}/certificates`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it('do not success query all certificates of student with teacher', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.TEACHER });
      request(app)
        .get(`/account/student/${username}/certificates`)
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success query all certificates of student with student', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.STUDENT });
      request(app)
        .get(`/account/student/${username}/certificates`)
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('success query all certificates of student', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      connect.returns({ error: null });

      let data = JSON.stringify(
        {
          CertificateID: '00',
          SubjectID: 'Blockchain',
          StudentUsername: 'hoangdd',
          IssueDate: '10/10/2018'
        },
        {
          CertificateID: '01',
          SubjectID: 'Blockchain',
          StudentUsername: 'hoangdd',
          IssueDate: '10/10/2018'
        }
      );

      query.returns({
        success: true,
        msg: data
      });

      request(app)
        .get(`/account/student/${username}/certificates`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it('student username is not exists', (done) => {
      findOneStub.returns(null);

      connect.returns({ error: null });

      request(app)
        .get(`/account/student/${username}/certificates`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(404);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('student is not exists');
          done();
        });
    });

    it('error query student in database', (done) => {
      findOneStub.throws();

      request(app)
        .get(`/account/student/${username}/certificates`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Internal Server Error');
          done();
        });
    });
  });

  describe('GET /account/student/:username/scores', () => {
    let connect;
    let query;
    let findOneStub;
    let username = 'hoangdd';

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
    it('do not success query all scores of student with admin student', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });
      request(app)
        .get(`/account/student/${username}/scores`)
        .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('success query all scores of student with admin academy', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      connect.returns({ error: null });
      let data = JSON.stringify({ username: 'tantv' }, { username: 'nghianv' });

      query.returns({
        success: true,
        msg: data
      });
      request(app)
        .get(`/account/student/${username}/scores`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it('do not success query all scores of student with teacher', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.TEACHER });
      request(app)
        .get(`/account/student/${username}/scores`)
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success query all scores of student with student', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });
      request(app)
        .get(`/account/student/${username}/scores`)
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('success query all subjects of student', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      connect.returns({ error: null });

      let data = JSON.stringify(
        {
          SubjectID: '00',
          StudentUsername: 'hoangdd',
          ScoreValue: 8.9,
          Certificated: true
        },
        {
          SubjectID: '01',
          StudentUsername: 'hoangdd',
          ScoreValue: 8.2,
          Certificated: true
        }
      );

      query.returns({
        success: true,
        msg: data
      });

      request(app)
        .get(`/account/student/${username}/scores`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it('student username is not exists', (done) => {
      findOneStub.returns(null);

      connect.returns({ error: null });

      request(app)
        .get(`/account/student/${username}/scores`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(404);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('student is not exists');
          done();
        });
    });

    it('error query student in database', (done) => {
      findOneStub.returns({ error: 'failed to query database' }, null);

      request(app)
        .get(`/account/student/${username}/scores`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Internal Server Error');
          done();
        });
    });
  });
});

describe('GET /student/myClasses', () => {
  let connect;
  let queryClasses;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    queryClasses = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    queryClasses.restore();
  });

  it('permission denied', (done) => {
    request(app)
      .get('/student/myClasses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get('/student/myClasses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('failed to query classes of student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      error: 'Error Network'
    });

    queryClasses.returns({
      success: false,
      msg: data
    });

    request(app)
      .get('/student/myClasses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('success query classes of user student', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify([
      {
        ClassID: '1234-456-789-123a',
        ClassCode: 'ETH101',
        Room: 'F13',
        Time: '7:45',
        Status: 'Open',
        ShortDescription: 'Ethereum',
        Description: 'Ethereum101',
        StartDate: '25-2-2020',
        EndDate: '25-4-2020',
        Repeat: 'Weekly Monday',
        Students: [],
        Capacity: '75'
      }
    ]);

    queryClasses.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/student/myClasses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });
});

describe('GET /student/myCourses', () => {
  let connect;
  let queryCourses;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    queryCourses = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    queryCourses.restore();
  });

  it('permission denied', (done) => {
    request(app)
      .get('/student/myCourses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get('/student/myCourses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('failed to query classes of student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      error: 'Error Network'
    });

    queryCourses.returns({
      success: false,
      msg: data
    });

    request(app)
      .get('/student/myCourses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('success query classes of user student', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify([
      {
        CourseID: '1234-456-789-123a',
        CourseCode: 'ETH101',
        ShortDescription: 'Ethereum',
        Description: 'Ethereum101'
      }
    ]);

    queryCourses.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/student/myCourses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });
});
