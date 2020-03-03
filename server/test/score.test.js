process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const network = require('../fabric/network');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const User = require('../models/User');
const app = require('../app');

require('dotenv').config();

describe('Route : /score', () => {
  describe('#POST /score', () => {
    let connect;
    let createScore;

    beforeEach(() => {
      connect = sinon.stub(network, 'connectToNetwork');
      createScore = sinon.stub(network, 'createScore');
    });

    afterEach(() => {
      connect.restore();
      createScore.restore();
    });

    it('permission denied with admin academy', (done) => {
      request(app)
        .post('/score')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .send({
          classId: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
          student: 'tantrinh',
          scoreValue: 9.5
        })
        .then((res) => {
          expect(res.status).equal(403);
          done();
        });
    });

    it('permission denied with student', (done) => {
      request(app)
        .post('/score')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .send({
          classId: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
          student: 'tantrinh',
          scoreValue: 9.5
        })
        .then((res) => {
          expect(res.status).equal(403);
          done();
        });
    });

    it('do not success create score with teacher because error chaincode', (done) => {
      connect.returns({
        contract: 'academy',
        network: 'certificatechannel',
        gateway: 'gateway',
        user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
      });

      createScore.returns({ success: false, msg: 'err' });

      request(app)
        .post('/score')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .send({
          classId: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
          student: 'tantrinh',
          scoreValue: 9.5
        })
        .then((res) => {
          expect(res.status).equal(500);
          done();
        });
    });

    it('invalid req.body', (done) => {
      request(app)
        .post('/score')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .send({
          classId: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
          student: 'tantrinh',
          scoreValue: ''
        })
        .then((res) => {
          expect(res.status).equal(422);
          done();
        });
    });

    it('success create score by teacher', (done) => {
      connect.returns({
        contract: 'academy',
        network: 'certificatechannel',
        gateway: 'gateway',
        user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
      });

      createScore.returns({ success: true, msg: 'success' });
      request(app)
        .post('/score')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .send({
          classId: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
          student: 'tantrinh',
          scoreValue: 10
        })
        .then((res) => {
          expect(res.status).equal(200);
          done();
        });
    });

    it('failed to connect blockchain', (done) => {
      connect.returns(null);

      createScore.returns({ success: true, msg: 'success' });
      request(app)
        .post('/score')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .send({
          classId: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
          student: 'tantrinh',
          scoreValue: 10
        })
        .then((res) => {
          expect(res.status).equal(500);
          done();
        });
    });
  });

  describe('# GET /score/all ', () => {
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

    it('do not success query all score with admin student', (done) => {
      request(app)
        .get('/score/all')
        .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success query score with student', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });
      request(app)
        .get('/score/all')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success query score with teacher', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });
      request(app)
        .get('/score/all')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('get all score faild', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      query.returns({ success: false, msg: 'error' });
      request(app)
        .get('/score/all')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('error');
          done();
        });
    });

    it('get all score success', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      let data = JSON.stringify({
        SubjectId: '00',
        studentUsername: 'tan',
        scoreValue: 10.0,
        Certificate: true
      });
      query.returns({ success: true, msg: data });
      request(app)
        .get('/score/all')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });
  });
});
