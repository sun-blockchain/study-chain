process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const User = require('../models/User');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const app = require('../app');

describe('#GET /classes/:username/students', () => {
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
      .get(`/classes/${username}/students`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('Failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get(`/classes/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Failed to query all students of class in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let score = JSON.stringify({
      StudentUsername: 'ronaldo',
      ScoreValue: 7
    });

    let classInfo = JSON.stringify({
      ClassID: '75442486-0878-440c-9db1-a7006c25a39f',
      SubjectID: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      Status: 'Open'
    });

    query.onFirstCall().returns({
      success: false,
      msg: 'Query students failed'
    });

    query.onSecondCall().returns({
      success: true,
      msg: score
    });

    query.onThirdCall().returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .get(`/classes/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Failed to query score in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let students = JSON.stringify([
      {
        Username: 'messi',
        Fullname: 'lionel messi'
      },
      {
        Username: 'ronaldo',
        Fullname: 'cristiano ronaldo'
      }
    ]);

    let classInfo = JSON.stringify({
      ClassID: '75442486-0878-440c-9db1-a7006c25a39f',
      SubjectID: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      Status: 'Open'
    });

    query.onFirstCall().returns({
      success: true,
      msg: students
    });

    query.onSecondCall().returns({
      success: false,
      msg: 'Query score failed'
    });

    query.onThirdCall().returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .get(`/classes/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Failed to query classInfo in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let students = JSON.stringify([
      {
        Username: 'messi',
        Fullname: 'lionel messi'
      },
      {
        Username: 'ronaldo',
        Fullname: 'cristiano ronaldo'
      }
    ]);

    let score = JSON.stringify({
      StudentUsername: 'ronaldo',
      ScoreValue: 7
    });

    query.onFirstCall().returns({
      success: true,
      msg: students
    });

    query.onSecondCall().returns({
      success: true,
      msg: score
    });

    query.onThirdCall().returns({
      success: false,
      msg: 'Query class failed'
    });

    request(app)
      .get(`/classes/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Success query students of class with role admin academy', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let students = JSON.stringify([
      {
        Username: 'messi',
        Fullname: 'lionel messi'
      },
      {
        Username: 'ronaldo',
        Fullname: 'cristiano ronaldo'
      }
    ]);

    let score = JSON.stringify({
      StudentUsername: 'ronaldo',
      ScoreValue: 7
    });

    let classInfo = JSON.stringify({
      ClassID: '75442486-0878-440c-9db1-a7006c25a39f',
      SubjectID: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      Status: 'Open'
    });

    query.onFirstCall().returns({
      success: true,
      msg: students
    });

    query.onSecondCall().returns({
      success: true,
      msg: score
    });

    query.onThirdCall().returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .get(`/classes/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('Success query students of class with role teacher', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'teacher01', role: USER_ROLES.TEACHER }
    });

    let students = JSON.stringify([
      {
        Username: 'messi',
        Fullname: 'lionel messi'
      },
      {
        Username: 'ronaldo',
        Fullname: 'cristiano ronaldo'
      }
    ]);

    let score = JSON.stringify({
      StudentUsername: 'ronaldo',
      ScoreValue: 7
    });

    let classInfo = JSON.stringify({
      ClassID: '75442486-0878-440c-9db1-a7006c25a39f',
      SubjectID: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      Status: 'Open'
    });

    query.onFirstCall().returns({
      success: true,
      msg: students
    });

    query.onSecondCall().returns({
      success: true,
      msg: score
    });

    query.onThirdCall().returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .get(`/classes/${username}/students`)
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

    let students = JSON.stringify([
      {
        Username: 'messi',
        Fullname: 'lionel messi'
      },
      {
        Username: 'ronaldo',
        Fullname: 'cristiano ronaldo'
      }
    ]);

    let score = null;

    let classInfo = JSON.stringify({
      ClassID: '75442486-0878-440c-9db1-a7006c25a39f',
      SubjectID: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      Status: 'Open'
    });

    query.onFirstCall().returns({
      success: true,
      msg: students
    });

    query.onSecondCall().returns({
      success: true,
      msg: score
    });

    query.onThirdCall().returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .get(`/classes/${username}/students`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});
