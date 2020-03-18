process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const app = require('../app');

describe('#GET /courses/:username/students', () => {
  let query;
  let connect;
  let username = 'quangnt';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('Permission denied with student', (done) => {
    request(app)
      .get(`/courses/${username}/students`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('Failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get(`/courses/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Failed to query all students of course in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({
      success: false,
      msg: 'Query students failed'
    });

    request(app)
      .get(`/courses/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Success query students of course with role admin academy', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify([
      {
        Username: 'messi',
        Fullname: 'lionel messi'
      },
      {
        Username: 'ronaldo',
        Fullname: 'cristiano ronaldo'
      }
    ]);

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/courses/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('Success query students of course with role teacher', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'teacher01', role: USER_ROLES.TEACHER }
    });

    let data = JSON.stringify([
      {
        Username: 'messi',
        Fullname: 'lionel messi'
      },
      {
        Username: 'ronaldo',
        Fullname: 'cristiano ronaldo'
      }
    ]);

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/courses/${username}/students`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('Response from chaincode is null', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({
      success: true,
      msg: null
    });

    request(app)
      .get(`/courses/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});
