process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const User = require('../models/User');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const sinon = require('sinon');
const network = require('../fabric/network');
const app = require('../app');

require('dotenv').config();

describe('Route /teachers', () => {
  describe('GET /teachers', () => {
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

    it('Permission Denied with role student ', (done) => {
      request(app)
        .get('/teachers')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.body.msg).equal('Permission Denied');
          expect(res.status).equal(403);
          done();
        });
    });

    it('Permission Denied with role teachers ', (done) => {
      request(app)
        .get('/teachers')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.body.msg).equal('Permission Denied');
          expect(res.status).equal(403);
          done();
        });
    });

    it('Failed to connect blockchain ', (done) => {
      connect.returns(null);
      request(app)
        .get('/teachers')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(500);
          done();
        });
    });

    it('query teachers in chaincode has failed', (done) => {
      connect.returns({
        contract: 'academy',
        network: 'certificatechannel',
        gateway: 'gateway',
        user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
      });

      query.returns({
        success: false,
        msg: 'Query chaincode has failed'
      });

      request(app)
        .get('/teachers')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(404);
          done();
        });
    });

    it('success query all teacher with admin academy', (done) => {
      connect.returns({
        contract: 'academy',
        network: 'certificatechannel',
        gateway: 'gateway',
        user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
      });

      let data = JSON.stringify(
        { Username: 'tantv', Fullname: 'Trinh Van Tan' },
        { Username: 'nghianv', Fullname: 'Ngo Van Nghia' }
      );

      query.returns({
        success: true,
        msg: data
      });

      request(app)
        .get('/teachers')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          done();
        });
    });
  });

  describe('#GET /teachers/:username', () => {
    let query;
    let connect;
    let username = 'tantrinh';

    beforeEach(() => {
      connect = sinon.stub(network, 'connectToNetwork');

      query = sinon.stub(network, 'query');
    });

    afterEach(() => {
      connect.restore();

      query.restore();
    });

    it('Permission Denied with student role', (done) => {
      request(app)
        .get(`/teachers/${username}`)
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('Permission Denied with teacher role', (done) => {
      request(app)
        .get(`/teachers/${username}`)
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('error when call function GetTeacher', (done) => {
      connect.returns({
        contract: 'academy',
        network: 'certificatechannel',
        gateway: 'gateway',
        user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
      });

      query.returns({
        success: false,
        msg: 'query teacher has failed'
      });

      request(app)
        .get(`/teachers/${username}`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(404);
          done();
        });
    });

    it('success query subject of teacher', (done) => {
      connect.returns({
        contract: 'academy',
        network: 'certificatechannel',
        gateway: 'gateway',
        user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
      });

      let infoTeacher = JSON.stringify({ Username: 'tantrinh', Fullname: 'Trinh Van Tan' });

      query.returns({
        success: true,
        msg: infoTeacher
      });

      request(app)
        .get(`/teachers/${username}`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          done();
        });
    });
  });
});

describe('#GET /teachers/:username/classes', () => {
  let connect;
  let query;
  let username = 'st01';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('Permission Denied with student role', (done) => {
    request(app)
      .get(`/teachers/${username}/classes`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('Failed connect to blockchain', (done) => {
    connect.returns(null);
    request(app)
      .get(`/teachers/${username}/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
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
      .get(`/teachers/${username}/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
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
      .get(`/teachers/${username}/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
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

    query.returns({ success: true, msg: JSON.stringify(data) });

    request(app)
      .get(`/teachers/${username}/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
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
      .get(`/teachers/${username}/classes`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
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
      .get(`/teachers/${username}/classes`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('#POST /teachers', () => {
  let findOneStub;

  let registerTeacherStub;
  let connect;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    findOneStub = sinon.stub(User, 'findOne');
    registerTeacherStub = sinon.stub(network, 'registerTeacherOnBlockchain');
  });

  afterEach(() => {
    connect.restore();
    findOneStub.restore();
    registerTeacherStub.restore();
  });

  it('should fail because the username already exists.', (done) => {
    findOneStub.returns({
      username: 'thienthangaycanh',
      fullname: 'Tan Trinh'
    });

    request(app)
      .post('/teachers')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      })
      .then((res) => {
        expect(res.status).equal(409);
        expect(res.body.msg).equal('Teacher already exists');
        done();
      });
  });

  it('Permission Denied with student role', (done) => {
    request(app)
      .post('/teachers')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('Permission Denied with teacher role', (done) => {
    request(app)
      .post('/teachers')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not success becuse req.body empty', (done) => {
    request(app)
      .post('/teachers')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: '',
        fullname: 'Do Duc Hoang'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('success create teacher with admin academy', (done) => {
    findOneStub.returns(null);
    connect.returns({ error: null });

    registerTeacherStub.returns({
      success: true,
      msg: 'Register success!'
    });

    request(app)
      .post('/teachers')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'hoangdd',
        fullname: 'Do Duc Hoang'
      })
      .then((res) => {
        expect(res.status).equal(201);
        done();
      });
  });

  it('error when call function registerTeacherOnBlockchain', (done) => {
    findOneStub.returns(null);

    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    registerTeacherStub.returns({
      success: false,
      msg: 'Register has failed'
    });

    request(app)
      .post('/teachers')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });
});
