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

describe('POST /courses/enroll', () => {
  let connect;
  let query;
  let studentRegisterCourse;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    studentRegisterCourse = sinon.stub(network, 'studentRegisterCourse');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    studentRegisterCourse.restore();
  });

  it('Validate body fail!', (done) => {
    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: ''
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Permission Denied!', (done) => {
    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('Failed to connect to blockchain', (done) => {
    connect.returns(null);
    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('Can not query chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    query.returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('You studied this course!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      CourseID: '123456',
      Students: ['hoangdd']
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('This course was closed!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      CourseID: '123456',
      Students: null,
      Status: 'Closed'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Can not invoke chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });
    let data = JSON.stringify({
      CourseID: '123456',
      Students: null,
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: data
    });

    studentRegisterCourse.returns({
      success: false,
      msg: 'Can not invoke chaincode!'
    });

    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Register Successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      CourseID: '123456',
      Students: null,
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: data
    });

    studentRegisterCourse.returns({
      success: true
    });

    request(app)
      .post('/courses/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(201);
        done();
      });
  });
});
