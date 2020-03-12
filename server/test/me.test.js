process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const User = require('../models/User');
const network = require('../fabric/network');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const bcrypt = require('bcryptjs');
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

describe('GET /account/me/summary', () => {
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

  it('failed connect to blockchain with student', (done) => {
    connect.returns(null);

    request(app)
      .get('/account/me/summary')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('failed connect to blockchain with teacher', (done) => {
    connect.returns(null);

    request(app)
      .get('/account/me/summary')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('failed to query summary info teacher in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .get('/account/me/summary')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Error');
        done();
      });
  });

  it('failed to query summary info student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .get('/account/me/summary')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('success query summary info of user student', (done) => {
    connect.returns({ error: null });

    let data = JSON.stringify({
      Courses: ['123', '456'],
      Classes: ['4563']
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/account/me/summary')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('success query summary info of user teacher', (done) => {
    connect.returns({ error: null });

    let data = JSON.stringify({
      Classes: ['4563', '1234']
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/account/me/summary')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('response 404 with admin academy', (done) => {
    connect.returns({ error: null });

    request(app)
      .get('/account/me/summary')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });
});

describe('PUT /account/me/info', () => {
  let connect;
  let query;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    updateUserInfo = sinon.stub(network, 'updateUserInfo');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    updateUserInfo.restore();
  });

  it('failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .put('/account/me/info')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        fullName: 'Trinh Van Tan',
        phoneNumber: { value: '+84 973241005', country: 'VN' },
        email: 'abc@gmail.com',
        address: 'KG',
        sex: 'Male',
        birthday: 'ABC'
      })
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
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .put('/account/me/info')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        fullName: 'Trinh Van Tan',
        phoneNumber: { value: '+84 973241005', country: 'VN' },
        email: 'abc@gmail.com',
        address: 'KG',
        sex: 'Male',
        birthday: 'ABC'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Error');
        done();
      });
  });

  it('failed to query info teacher in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.TEACHER }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .put('/account/me/info')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        fullName: 'Trinh Van Tan',
        phoneNumber: { value: '+84 973241005', country: 'VN' },
        email: 'abc@gmail.com',
        address: 'KG',
        sex: 'Male',
        birthday: 'ABC'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Error');
        done();
      });
  });

  it('No changes', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      Username: 'hoangdd',
      Fullname: 'Trinh Van Tan',
      Info: {
        Sex: 'Male',
        PhoneNumber: '+84 973241005',
        Email: 'abc@gmail.com',
        Address: 'KG',
        Birthday: 'ABC',
        Country: 'VN'
      }
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .put('/account/me/info')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        fullName: 'Trinh Van Tan',
        phoneNumber: { value: '+84 973241005', country: 'VN' },
        email: 'abc@gmail.com',
        address: 'KG',
        sex: 'Male',
        birthday: 'ABC'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('No changes!');
        done();
      });
  });

  it('Success', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      Username: 'hoangdd',
      Fullname: 'Trinh Van Tan',
      Info: {
        Sex: 'Male',
        PhoneNumber: '123456789',
        Email: 'abc',
        Address: 'KG',
        Birthday: 'ABC',
        Country: 'VN'
      }
    });

    query.returns({
      success: true,
      msg: data
    });

    updateUserInfo.returns({
      success: true,
      msg: 'Update success!'
    });

    request(app)
      .put('/account/me/info')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        username: 'hoangdd',
        fullName: 'Trinh Van Tan',
        phoneNumber: { value: '+84 973241005', country: 'VN' },
        email: 'bcd@gmail.com',
        address: 'KG',
        sex: 'Male',
        birthday: 'ABC'
      })
      .then((res) => {
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('Update success!');
        done();
      });
  });
});

describe('GET /account/me/classes', () => {
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
      .get('/account/me/classes')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get('/account/me/classes')
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
      .get('/account/me/classes')
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
      .get('/account/me/classes')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });
});

describe('GET /account/me/courses', () => {
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
      .get('/account/me/courses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get('/account/me/courses')
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
      .get('/account/me/courses')
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
      .get('/account/me/courses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
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

describe('GET /account/me/certificate/:courseId', () => {
  let connect;
  let query;
  const courseId = '3611523c-876c-48f6-8c2a-d7685881d914';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('success query certificate', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      CertificateID: 'A354',
      CourseID: 'INT-2019',
      StudentUsername: 'hoangdd',
      IssueDate: '10-10-2019'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/account/me/certificate/${courseId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('Failed to connect blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get(`/account/me/certificate/${courseId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('query chaincode error', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.returns({
      success: false,
      msg: 'err'
    });

    request(app)
      .get(`/account/me/certificate/${courseId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('permission denied', (done) => {
    request(app)
      .get(`/account/me/certificate/${courseId}`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
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

describe('POST /account/me/changePassword', () => {
  let findOneUserStub;
  let hashPass;
  let compareHash;

  beforeEach(() => {
    findOneUserStub = sinon.stub(User, 'findOne');
    hashPass = sinon.stub(bcrypt, 'hash');
    compareHash = sinon.stub(bcrypt, 'compare');
  });

  afterEach(() => {
    findOneUserStub.restore();
    hashPass.restore();
    compareHash.restore();
  });

  it('do not success change password because length < 6', (done) => {
    request(app)
      .post('/account/me/changePassword')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '123123',
        newPass: '12345',
        confirmPass: '12345'
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('do not success change password empty', (done) => {
    request(app)
      .post('/account/me/changePassword')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '',
        newPass: '12345',
        confirmPass: '12345'
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('do not success change password because oldPass like newPass', (done) => {
    findOneUserStub.resolves({ username: 'tantrinh' });

    request(app)
      .post('/account/me/changePassword')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '123123',
        newPass: '123123',
        confirmPass: '123123'
      })
      .then((res) => {
        expect(res.status).equal(400);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not success change password because confirmPass do not like newPass', (done) => {
    findOneUserStub.resolves({ username: 'tantrinh' });

    request(app)
      .post('/account/me/changePassword')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '123123',
        newPass: '123456',
        confirmPass: '123457'
      })
      .then((res) => {
        expect(res.status).equal(400);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not success because account is not exist', (done) => {
    findOneUserStub.resolves(null);

    request(app)
      .post('/account/me/changePassword')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '123123',
        newPass: '123456',
        confirmPass: '123456'
      })
      .then((res) => {
        expect(res.status).equal(404);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('POST /account/me/registerCourse', () => {
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
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('Permission Denied!', (done) => {
    request(app)
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied!');
        done();
      });
  });

  it('Failed to connect to blockchain!', (done) => {
    connect.returns(null);
    request(app)
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
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
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
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
      Username: 'st01',
      Courses: ['123456']
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('You studied this course!');
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
      Username: 'st01',
      Courses: ['aaaaa']
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
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not invoke chaincode!');
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
      Username: 'st01',
      Courses: ['aaaaa']
    });

    query.returns({
      success: true,
      msg: data
    });

    studentRegisterCourse.returns({
      success: true
    });

    request(app)
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('Register Successfully!');
        done();
      });
  });
});

describe('POST /account/me/registerClass', () => {
  let connect;
  let query;
  let studentRegisterClass;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    studentRegisterClass = sinon.stub(network, 'studentRegisterClass');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    studentRegisterClass.restore();
  });

  it('Validate body fail!', (done) => {
    request(app)
      .post('/account/me/registerClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('Permission Denied!', (done) => {
    request(app)
      .post('/account/me/registerClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied!');
        done();
      });
  });

  it('Failed to connect to blockchain!', (done) => {
    connect.returns(null);
    request(app)
      .post('/account/me/registerClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });

  it('Can not query student in chaincode!', (done) => {
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
      .post('/account/me/registerClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
        done();
      });
  });

  it('You studied this class!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let studentInfo = JSON.stringify({
      Username: 'st01',
      Classes: ['123456']
    });

    query.returns({
      success: true,
      msg: studentInfo
    });

    request(app)
      .post('/account/me/registerClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('You studied this class!');
        done();
      });
  });

  it('Can not query class in chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let studentInfo = JSON.stringify({
      Username: 'st01',
      Classes: ['123457']
    });

    query.onFirstCall().returns({
      success: true,
      msg: studentInfo
    });

    query.onSecondCall().returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/account/me/registerClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
        done();
      });
  });

  it('Can not query classes of student in chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let studentInfo = JSON.stringify({
      Username: 'st01',
      Classes: ['123457']
    });

    query.onFirstCall().returns({
      success: true,
      msg: studentInfo
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      SubjectID: 'Subject01'
    });

    query.onSecondCall().returns({
      success: true,
      msg: classInfo
    });

    query.onThirdCall().returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/account/me/registerClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
        done();
      });
  });

  it('You studied this subject!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let studentInfo = JSON.stringify({
      Username: 'st01',
      Classes: ['123457']
    });

    query.onFirstCall().returns({
      success: true,
      msg: studentInfo
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      SubjectID: 'Subject01'
    });

    query.onSecondCall().returns({
      success: true,
      msg: classInfo
    });

    let classes = JSON.stringify([
      {
        ClassID: '123457',
        SubjectID: 'Subject01'
      }
    ]);

    query.onThirdCall().returns({
      success: true,
      msg: classes
    });

    request(app)
      .post('/account/me/registerClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(400);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('You studied this subject!');
        done();
      });
  });

  it('Class register closed!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let studentInfo = JSON.stringify({
      Username: 'st01',
      Classes: ['123457']
    });

    query.onFirstCall().returns({
      success: true,
      msg: studentInfo
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      SubjectID: 'Subject01',
      Status: 'InProgress'
    });

    query.onSecondCall().returns({
      success: true,
      msg: classInfo
    });

    let classes = JSON.stringify([
      {
        ClassID: '123457',
        SubjectID: 'Subject02'
      }
    ]);

    query.onThirdCall().returns({
      success: true,
      msg: classes
    });

    request(app)
      .post('/account/me/registerClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Class register closed!');
        done();
      });
  });

  it('Class register completed', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let studentInfo = JSON.stringify({
      Username: 'st01',
      Classes: ['123457']
    });

    query.onFirstCall().returns({
      success: true,
      msg: studentInfo
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      SubjectID: 'Subject01',
      Status: 'Completed'
    });

    query.onSecondCall().returns({
      success: true,
      msg: classInfo
    });

    let classes = JSON.stringify([
      {
        ClassID: '123457',
        SubjectID: 'Subject02'
      }
    ]);

    query.onThirdCall().returns({
      success: true,
      msg: classes
    });

    request(app)
      .post('/account/me/registerClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Class was completed!');
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

    let studentInfo = JSON.stringify({
      Username: 'st01',
      Classes: ['123457']
    });

    query.onFirstCall().returns({
      success: true,
      msg: studentInfo
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      SubjectID: 'Subject01',
      Status: 'Open'
    });

    query.onSecondCall().returns({
      success: true,
      msg: classInfo
    });

    let classes = JSON.stringify([
      {
        ClassID: '123457',
        SubjectID: 'Subject02'
      }
    ]);

    query.onThirdCall().returns({
      success: true,
      msg: classes
    });

    studentRegisterClass.returns({
      success: false,
      msg: 'Can not invoke chaincode!'
    });

    request(app)
      .post('/account/me/registerClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not invoke chaincode!');
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

    let studentInfo = JSON.stringify({
      Username: 'st01',
      Classes: ['123457']
    });

    query.onFirstCall().returns({
      success: true,
      msg: studentInfo
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      SubjectID: 'Subject01',
      Status: 'Open'
    });

    query.onSecondCall().returns({
      success: true,
      msg: classInfo
    });

    let classes = JSON.stringify([
      {
        ClassID: '123457',
        SubjectID: 'Subject02'
      }
    ]);

    query.onThirdCall().returns({
      success: true,
      msg: classes
    });

    studentRegisterClass.returns({
      success: true
    });

    request(app)
      .post('/account/me/registerClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('Register Successfully!');
        done();
      });
  });
});

describe('POST /account/me/cancelRegisteredClass', () => {
  let connect;
  let query;
  let cancelRegisterClass;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    cancelRegisterClass = sinon.stub(network, 'studentCancelRegisterClass');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    cancelRegisterClass.restore();
  });

  it('Validate body fail!', (done) => {
    request(app)
      .post('/account/me/cancelRegisteredClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('Permission Denied!', (done) => {
    request(app)
      .post('/account/me/cancelRegisteredClass')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied!');
        done();
      });
  });

  it('Failed to connect to blockchain!', (done) => {
    connect.returns(null);
    request(app)
      .post('/account/me/cancelRegisteredClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });

  it('Can not query class in chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/account/me/cancelRegisteredClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
        done();
      });
  });

  it('You have not register this class yet!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      Students: ['st02']
    });

    query.returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .post('/account/me/cancelRegisteredClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('You have not register this class yet!');
        done();
      });
  });

  it('Class is InProgress!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      Students: ['hoangdd', 'st02'],
      Status: 'InProgress'
    });

    query.returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .post('/account/me/cancelRegisteredClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Class is InProgress!');
        done();
      });
  });

  it('Class is InProgress!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      Students: ['hoangdd', 'st02'],
      Status: 'Completed'
    });

    query.returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .post('/account/me/cancelRegisteredClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Class is Completed!');
        done();
      });
  });

  it('Can not invoke chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      Students: ['hoangdd', 'st02'],
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: classInfo
    });

    cancelRegisterClass.returns({
      success: false,
      msg: 'Can not invoke chaincode!'
    });

    request(app)
      .post('/account/me/cancelRegisteredClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not invoke chaincode!');
        done();
      });
  });

  it('Cancel Successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      Students: ['hoangdd', 'st02'],
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: classInfo
    });

    cancelRegisterClass.returns({
      success: true
    });

    request(app)
      .post('/account/me/cancelRegisteredClass')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('Cancel Successfully!');
        done();
      });
  });
});

describe('GET /account/me/notRegisterCourses', () => {
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

  it('Permission Denied!', (done) => {
    request(app)
      .get('/account/me/notRegisterCourses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);

        done();
      });
  });

  it('Failed to connect to blockchain!', (done) => {
    connect.returns(null);
    request(app)
      .get('/account/me/notRegisterCourses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });

  it('Can not query courses in chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify([
      {
        CourseID: '123457',
        CourseCode: 'BTC101'
      }
    ]);

    query.onFirstCall().returns({
      success: false,
      msg: 'Error'
    });

    query.onSecondCall().returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/account/me/notRegisterCourses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('query success', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let allCourses = JSON.stringify([
      {
        CourseID: '123457',
        CourseCode: 'BTC101'
      },
      {
        CourseID: '123456',
        CourseCode: 'ETH101'
      }
    ]);

    let myCourses = JSON.stringify([
      {
        CourseID: '123457',
        CourseCode: 'BTC101'
      }
    ]);

    query.onFirstCall().returns({
      success: true,
      msg: allCourses
    });

    query.onSecondCall().returns({
      success: true,
      msg: myCourses
    });

    request(app)
      .get('/account/me/notRegisterCourses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('#GET /account/me/scores/:courseId', () => {
  let connect;
  let query;
  let courseId = 'db7e8bd0-df7d-40c7-928b-ca3bfe8e5574';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('not get subjects with role other student', (done) => {
    request(app)
      .get(`/account/me/scores/${courseId}`)
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
      .get(`/account/me/scores/${courseId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('query subjects of course error', (done) => {
    connect.returns({
      contract: 'student',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    query.onFirstCall().returns({ success: false, msg: 'query subjects error' });

    request(app)
      .get(`/account/me/scores/${courseId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('query chaincode error!');
        done();
      });
  });

  it('query get scores of student error', (done) => {
    connect.returns({
      contract: 'student',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let listSubjects = [
      {
        SubjectID: '4e3efb82-8bdb-4f73-8efb-94520ba7c804',
        SubjectCode: 'ET01',
        SubjectName: 'Ethereum',
        ShortDescription: 'Ethereum',
        Description:
          'Ethereum basic: you will be learnt about solidity, EVM and architech of Ethereum Blockchain',
        Classes: ['6cd59291-fbb5-47ad-9db2-eb026e2d2b57', '2d285a2c-5f81-4656-8a2d-5f4fb21248e3']
      },
      {
        SubjectID: '45294c64-2beb-47dd-9478-13eb4db7fc70',
        SubjectCode: 'Tomo',
        SubjectName: 'TomoChain',
        ShortDescription: 'Tomo',
        Description: 'Tomo',
        Classes: ['0ef3aa77-c9c5-4733-997a-f88d11772c9b', '9b3d5a62-76bd-4c67-8c9b-53f72e23320b']
      }
    ];

    query.onFirstCall().returns({ success: true, msg: JSON.stringify(listSubjects) });
    query.onSecondCall().returns({ success: false, msg: 'query score error' });

    request(app)
      .get(`/account/me/scores/${courseId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('query chaincode error!');
        done();
      });
  });

  it('get scores of subject success', (done) => {
    connect.returns({
      contract: 'student',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let listSubjects = [
      {
        SubjectID: '4e3efb82-8bdb-4f73-8efb-94520ba7c804',
        SubjectCode: 'ET01',
        SubjectName: 'Ethereum',
        ShortDescription: 'Ethereum',
        Description:
          'Ethereum basic: you will be learnt about solidity, EVM and architech of Ethereum Blockchain',
        Classes: ['6cd59291-fbb5-47ad-9db2-eb026e2d2b57', '2d285a2c-5f81-4656-8a2d-5f4fb21248e3']
      },
      {
        SubjectID: '45294c64-2beb-47dd-9478-13eb4db7fc70',
        SubjectCode: 'Tomo',
        SubjectName: 'TomoChain',
        ShortDescription: 'Tomo',
        Description: 'Tomo',
        Classes: ['0ef3aa77-c9c5-4733-997a-f88d11772c9b', '9b3d5a62-76bd-4c67-8c9b-53f72e23320b']
      }
    ];
    let listScores = [
      {
        SubjectID: '4e3efb82-8bdb-4f73-8efb-94520ba7c804',
        StudentUsername: 'st01',
        ScoreValue: 10
      }
    ];

    query.onFirstCall().returns({ success: true, msg: JSON.stringify(listSubjects) });
    query.onSecondCall().returns({ success: true, msg: JSON.stringify(listScores) });

    request(app)
      .get(`/account/me/scores/${courseId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.subjects.length).equal(2);
        done();
      });
  });
});

describe('#GET /account/me/subject/:subjectId', () => {
  let connect;
  let query;
  let subjectId = '0defc52c-6ebb-4373-8971-a36cf789e5d9';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('permission denied when access routes with role admin', (done) => {
    request(app)
      .get(`/account/me/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });
  it('failed connect to blockchain', (done) => {
    connect.returns(null);
    request(app)
      .get(`/account/me/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });
  it('Query subject chain code error', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'nghianv', role: USER_ROLES.STUDENT }
    });

    query.onFirstCall().returns({ success: false, msg: 'query subject error' });

    request(app)
      .get(`/account/me/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Query chaincode error!');
        done();
      });
  });

  it('Query classes chain code error', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'nghianv', role: USER_ROLES.STUDENT }
    });

    let subject = {
      SubjectID: '0defc52c-6ebb-4373-8971-a36cf789e5d9',
      SubjectCode: 'ET01',
      SubjectName: 'Ethereum',
      ShortDescription: 'Ethereum',
      Description:
        'Ethereum basic: you will be learnt about solidity, EVM and architech of Ethereum Blockchain',
      Classes: ['e61bf835-7df3-4448-a488-2e44f872823a', '82db1096-7c46-485f-ad1e-664b3da2949e']
    };

    query.onFirstCall().returns({ success: true, msg: JSON.stringify(subject) });
    query.onSecondCall().returns({ success: false, msg: 'Query classes error' });

    request(app)
      .get(`/account/me/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Query chaincode error!');
        done();
      });
  });

  it('get subject success', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let subject = {
      SubjectID: '0defc52c-6ebb-4373-8971-a36cf789e5d9',
      SubjectCode: 'ET01',
      SubjectName: 'Ethereum',
      ShortDescription: 'Ethereum',
      Description:
        'Ethereum basic: you will be learnt about solidity, EVM and architech of Ethereum Blockchain',
      Classes: ['e61bf835-7df3-4448-a488-2e44f872823a', '82db1096-7c46-485f-ad1e-664b3da2949e']
    };

    let classes = [
      {
        ClassID: 'e61bf835-7df3-4448-a488-2e44f872823a',
        SubjectID: '0defc52c-6ebb-4373-8971-a36cf789e5d9',
        ClassCode: 'ETH01',
        Room: 'room 1',
        Time: '10:24',
        Status: 'Open',
        StartDate: '10-03-2020',
        EndDate: '31-03-2020',
        Repeat: 'Weekly',
        Students: ['hoangdd'],
        Capacity: 10,
        TeacherUsername: ''
      },
      {
        ClassID: '82db1096-7c46-485f-ad1e-664b3da2949e',
        SubjectID: '0defc52c-6ebb-4373-8971-a36cf789e5d9',
        ClassCode: 'ETH02',
        Room: 'room 2',
        Time: '10:25',
        Status: 'Open',
        StartDate: '10-03-2020',
        EndDate: '31-03-2020',
        Repeat: 'Weekly',
        Students: [],
        Capacity: 10,
        TeacherUsername: ''
      }
    ];
    query.onFirstCall().returns({ success: true, msg: JSON.stringify(subject) });
    query.onSecondCall().returns({ success: true, msg: JSON.stringify(classes) });

    request(app)
      .get(`/account/me/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.subject.classRegistered).equal('e61bf835-7df3-4448-a488-2e44f872823a');
        done();
      });
  });
});
