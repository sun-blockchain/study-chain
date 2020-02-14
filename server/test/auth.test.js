process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const User = require('../models/User');
const sinon = require('sinon');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const app = require('../app');

describe('Route : /auth', () => {
  describe('# POST :/auth/register ', () => {
    let findOneUserStub;
    let saveUserStub;
    let registerStudentStub;

    beforeEach(() => {
      findOneUserStub = sinon.stub(User, 'findOne');
      saveUserStub = sinon.stub(User.prototype, 'save');
      registerStudentStub = sinon.stub(network, 'registerStudentOnBlockchain');
    });

    afterEach(() => {
      findOneUserStub.restore();
      saveUserStub.restore();
      registerStudentStub.restore();
    });

    it('should be invalid if username password and name is empty', (done) => {
      request(app)
        .post('/auth/register')
        .send({
          username: '',
          password: '',
          fullname: ''
        })
        .then((res) => {
          expect(res.status).equal(422);
          expect(res.body.errors[0].msg).equal('Invalid value');
          done();
        });
    });

    it('should register success', (done) => {
      findOneUserStub.returns(null);
      registerStudentStub.returns({
        success: true,
        msg: 'Register success!'
      });

      request(app)
        .post('/auth/register')
        .send({
          username: 'hoangdd123',
          password: '123456',
          fullname: 'Hoang Do'
        })
        .then((res) => {
          console.log(res.body);
          expect(res.status).equal(200);
          done();
        });
    });

    it('shoud fail because the username already exists.', (done) => {
      // found a record username: 'trailang98',
      findOneUserStub.returns({
        username: 'hoangdd',
        password: '1234567'
      });

      request(app)
        .post('/auth/register')
        .send({
          username: 'hoangdd',
          password: '123456',
          fullname: 'Hoang Do'
        })
        .then((res) => {
          expect(res.status).equal(409);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Account already exist');
          done();
        });
    });

    it('shoud fail because findOne error.', (done) => {
      findOneUserStub.returns(null);

      request(app)
        .post('/auth/register')
        .send({
          username: 'hoangdd',
          password: '123456',
          fullname: 'Hoang Do'
        })
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          done();
        });
    });

    it('shoud fail because error when call registerStudentOnBlockChain function.', (done) => {
      findOneUserStub.returns(null);
      registerStudentStub.returns({
        success: false,
        msg: 'cannot call chaincode'
      });

      request(app)
        .post('/auth/register')
        .send({
          username: 'hoangdd',
          password: '123456',
          fullname: 'Hoang Do'
        })
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Network Error');
          done();
        });
    });
  });

  describe('# POST :/auth/login ', () => {
    let findOneUserStub;
    beforeEach(() => {
      findOneUserStub = sinon.stub(User, 'findOne');
    });

    afterEach(() => {
      findOneUserStub.restore();
    });

    it('should be invalid if username password is empty', (done) => {
      request(app)
        .post('/auth/login')
        .send({
          username: '',
          password: ''
        })
        .then((res) => {
          expect(res.status).equal(422);
          expect(res.body.errors[0].msg).equal('Invalid value');
          done();
        });
    });

    it('should be invalid if username is empty', (done) => {
      request(app)
        .post('/auth/login')
        .send({
          username: '',
          password: '123123'
        })
        .then((res) => {
          expect(res.status).equal(422);
          expect(res.body.errors[0].msg).equal('Invalid value');
          done();
        });
    });

    it('should be invalid if password is empty', (done) => {
      request(app)
        .post('/auth/login')
        .send({
          username: 'hoangdd',
          password: ''
        })
        .then((res) => {
          expect(res.status).equal(422);
          expect(res.body.errors[0].msg).equal('Invalid value');
          done();
        });
    });

    it('shoud fail because account is not exist', (done) => {
      findOneUserStub.returns(null);

      request(app)
        .post('/auth/login')
        .send({
          username: 'hoangddhaycuphoc',
          password: '1234567'
        })
        .then((res) => {
          expect(res.status).equal(404);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Account is not exist');
          done();
        });
    });

    it('shoud fail because wrong password', (done) => {
      findOneUserStub.returns({
        username: 'hoangdd',
        password: '654321',
        name: 'hoang'
      });

      request(app)
        .post('/auth/login')
        .send({
          username: 'hoangdd',
          password: '78945612'
        })
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.msg).equal('Username or Password incorrect');
          done();
        });
    });

    it('should login success', (done) => {
      findOneUserStub.returns({
        username: 'hoangdd',
        password: '$2a$10$hqZtIwFcl8SLaUbxkuPOEeKqvTknWFodjVaYVdXoZ0EeIb3SjT/dG',
        name: 'alibaba',
        role: USER_ROLES.ADMIN_STUDENT
      });

      request(app)
        .post('/auth/login')
        .send({
          username: 'hoangdd',
          password: '654321'
        })
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.msg).equal('Login success');
          done();
        });
    });

    it('error server when login', (done) => {
      findOneUserStub.throws();

      request(app)
        .post('/auth/login')
        .send({
          username: 'hoangdd',
          password: '654321'
        })
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.msg).equal('Internal Server Error');
          done();
        });
    });
  });
});
