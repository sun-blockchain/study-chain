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
