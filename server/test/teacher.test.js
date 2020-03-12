process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const User = require('../models/User');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const sinon = require('sinon');
const network = require('../fabric/network');
const app = require('../app');

require('dotenv').config();

describe('Route /account/teacher', () => {
  describe('#GET /all', () => {
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

    it('do not success query all teacher with admin student', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });

      request(app)
        .get('/account/teacher/all')
        .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          expect(res.status).equal(403);
          done();
        });
    });

    it('success query all teacher with admin academy', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      connect.returns({ error: null });
      let data = JSON.stringify({ username: 'tantv' }, { username: 'nghianv' });

      query.returns({
        success: true,
        msg: data
      });
      request(app)
        .get('/account/teacher/all')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it('do not success query all teacher with teacher', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.TEACHER });
      request(app)
        .get('/account/teacher/all')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          expect(res.status).equal(403);
          done();
        });
    });

    it('do not success query all teacher with student', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.STUDENT });
      request(app)
        .get('/account/teacher/all')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          expect(res.status).equal(403);
          done();
        });
    });
  });

  describe('#GET /account/teacher/:username', () => {
    let findOneStub;
    let query;
    let connect;
    let username = 'tantrinh';

    beforeEach(() => {
      connect = sinon.stub(network, 'connectToNetwork');
      findOneStub = sinon.stub(User, 'findOne');
      query = sinon.stub(network, 'query');
    });

    afterEach(() => {
      connect.restore();
      findOneStub.restore();
      query.restore();
    });

    it('do not success query teacher with admin student', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });
      request(app)
        .get(`/account/teacher/${username}`)
        .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success query teacher with teacher', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.TEACHER });
      request(app)
        .get(`/account/teacher/${username}`)
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success query teacher with student', (done) => {
      findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.STUDENT });
      request(app)
        .get(`/account/teacher/${username}`)
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('error when query teacher', (done) => {
      findOneStub.throws();
      connect.returns({ error: null });
      request(app)
        .get(`/account/teacher/${username}`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          done();
        });
    });

    // it.only('teacher username is not exists', (done) => {
    //   findOneStub.returns(null);

    //   connect.returns({ error: null });

    //   request(app)
    //     .get(`/account/teacher/${username}`)
    //     .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
    //     .then((res) => {
    //       expect(res.status).equal(404);
    //       expect(res.body.success).equal(false);
    //       expect(res.body.msg).equal('teacher is not exists');
    //       done();
    //     });
    // });

    it('error when call function GetTeacher', (done) => {
      findOneStub.onFirstCall().yields(undefined, {
        username: 'hoangdd',
        role: USER_ROLES.ADMIN_ACADEMY
      });

      findOneStub
        .onSecondCall()
        .yields(undefined, { username: 'tantrinh', role: USER_ROLES.TEACHER });

      connect.returns({ error: null });

      query.onFirstCall().returns({
        success: false,
        msg: 'cannot call function GetTeacher'
      });

      let subjectOfTeacher = JSON.stringify({
        SubjectID: '00',
        Name: 'Blockchain',
        TeacherUsername: 'GV00',
        Students: ['Hoang', 'Nghia']
      });

      query.onSecondCall().returns({
        success: true,
        msg: subjectOfTeacher
      });

      request(app)
        .get(`/account/teacher/${username}`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          done();
        });
    });

    it('error when query subject of teacher', (done) => {
      findOneStub.onFirstCall().yields(undefined, {
        username: 'hoangdd',
        role: USER_ROLES.ADMIN_ACADEMY
      });

      findOneStub
        .onSecondCall()
        .yields(undefined, { username: 'tantrinh', role: USER_ROLES.TEACHER });

      connect.returns({ error: null });

      let infoTeacher = JSON.stringify({ username: 'tantrinh', fullname: 'Trinh Van Tan' });

      query.onFirstCall().returns({
        success: true,
        msg: infoTeacher
      });

      query.onSecondCall().returns({
        success: false,
        msg: 'error query subjects of teacher'
      });

      request(app)
        .get(`/account/teacher/${username}`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          done();
        });
    });

    it('success query subject of teacher', (done) => {
      findOneStub.returns({ username: 'tantrinh', role: USER_ROLES.TEACHER });

      connect.returns({ error: null });

      let infoTeacher = JSON.stringify({ username: 'tantrinh', fullname: 'Trinh Van Tan' });
      let subjectOfTeacher = JSON.stringify({
        SubjectID: '00',
        Name: 'Blockchain',
        TeacherUsername: 'GV00',
        Students: ['Hoang', 'Nghia']
      });

      query.onFirstCall().returns({
        success: true,
        msg: infoTeacher
      });

      query.onSecondCall().returns({
        success: true,
        msg: subjectOfTeacher
      });

      request(app)
        .get(`/account/teacher/${username}`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });
  });
});

describe('#GET /account/teacher/classesOfTeacher', () => {
  let connect;
  let query;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('Can not get class of teacher with role studnet', (done) => {
    request(app)
      .get(`/account/teacher/classesOfTeacher`)
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('Can not connect to network', (done) => {
    connect.returns(null);
    request(app)
      .get(`/account/teacher/classesOfTeacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });

  it('Can not query classes in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let subjects = JSON.stringify([
      {
        SubjectID: '123-456-789',
        SubjectName: 'Blockchain101',
        SubjectCode: 'BC101',
        Description: 'Blockchain'
      },
      {
        SubjectID: '123-456-783',
        SubjectName: 'Blockchain102',
        SubjectCode: 'BC102',
        Description: 'Blockchain'
      }
    ]);

    query.onFirstCall().returns({ success: false, msg: 'Can not query chaincode!' });
    query.onSecondCall().returns({ success: true, msg: subjects });

    request(app)
      .get(`/account/teacher/classesOfTeacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Can not query subjects in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let classes = JSON.stringify([
      {
        ClassID: '95839918-c48a-4af9-b3c2-2502cf30640d',
        SubjectID: '4df87e66-00e2-4232-a38c-15d708cd57b0',
        ClassCode: 'a1',
        Room: 'a1',
        Time: '08:11',
        Status: 'InProgress',
        StartDate: '13-03-2020',
        EndDate: '31-03-2020',
        Repeat: 'Weekly',
        Students: null,
        Capacity: 10,
        TeacherUsername: 'tc',
        SubjectName: 'Ethereum'
      },
      {
        ClassID: 'c6704bbb-cc8a-4649-acde-a9bfafadfea4',
        SubjectID: 'd5df9765-f86b-409c-9abb-dced22bf329e',
        ClassCode: 'a2',
        Room: 'a2',
        Time: '08:12',
        Status: 'Open',
        StartDate: '13-03-2020',
        EndDate: '31-03-2020',
        Repeat: 'Weekly',
        Students: null,
        Capacity: 10,
        TeacherUsername: 'tc',
        SubjectName: 'Bitcoin'
      }
    ]);

    query.onFirstCall().returns({ success: true, msg: classes });
    query.onSecondCall().returns({ success: false, msg: 'error' });

    request(app)
      .get(`/account/teacher/classesOfTeacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('success query class with admin', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = [
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590cac68',
        ClassCode: 'Class01',
        Room: 'Room01',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: ''
      },
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590dfc98',
        ClassCode: 'Class02',
        Room: 'Room02',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: 'teacher01'
      }
    ];

    query.returns({ success: true, msg: JSON.stringify([data[1]]) });

    request(app)
      .get(`/account/teacher/classesOfTeacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.classes.length).equal(1);
        done();
      });
  });

  it('success query subject with teacher', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.TEACHER }
    });

    let classes = JSON.stringify([
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590cac68',
        ClassCode: 'Class01',
        Room: 'Room01',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: ''
      },
      {
        ClassID: '4ca7fc39-7523-424d-984e-87ea590dfc98',
        ClassCode: 'Class02',
        Room: 'Room02',
        Time: 'Time',
        Status: 'Register Open',
        ShortDescription: 'aaaa',
        Description: 'bbbb',
        Students: ['student1', 'student2'],
        TeacherUsername: 'teacher01'
      }
    ]);

    let subjects = JSON.stringify([
      {
        SubjectID: '123-456-789',
        SubjectName: 'Blockchain101',
        SubjectCode: 'BC101',
        Description: 'Blockchain'
      },
      {
        SubjectID: '123-456-783',
        SubjectName: 'Blockchain102',
        SubjectCode: 'BC102',
        Description: 'Blockchain'
      }
    ]);

    query.onFirstCall().returns({ success: true, msg: classes });
    query.onSecondCall().returns({ success: true, msg: subjects });

    request(app)
      .get(`/account/teacher/classesOfTeacher`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('success query subject with teacher when response from chaincode is null', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.TEACHER }
    });

    query.onFirstCall().returns({ success: true, msg: null });
    query.onSecondCall().returns({ success: true, msg: null });

    request(app)
      .get(`/account/teacher/classesOfTeacher`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});
