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

describe('GET /me', () => {
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

  it('Failed connect to blockchain with student', (done) => {
    connect.returns(null);

    request(app)
      .get('/me')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('Failed connect to blockchain with teacher', (done) => {
    connect.returns(null);

    request(app)
      .get('/me')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('Failed to query info teacher in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .get('/me')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Failed to query info student in chaincode', (done) => {
    connect.returns(null);

    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .get('/me')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('success query info of user student', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

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
      .get('/me')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('success query info of user teacher', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

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
      .get('/me')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('success query info of admin academy', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    request(app)
      .get('/me')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.username).equal('hoangdd');
        expect(res.body.role).equal(1);
        done();
      });
  });
});

describe('GET /me/summary', () => {
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

  it('Failed connect to blockchain with student', (done) => {
    connect.returns(null);

    request(app)
      .get('/me/summary')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('Failed connect to blockchain with teacher', (done) => {
    connect.returns(null);

    request(app)
      .get('/me/summary')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('Failed connect to blockchain with admin academy', (done) => {
    connect.returns(null);

    request(app)
      .get('/me/summary')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('Failed to query summary info teacher in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .get('/me/summary')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Failed to query summary info student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .get('/me/summary')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Failed to query summary info admin academy in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .get('/me/summary')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
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
      .get('/me/summary')
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
      .get('/me/summary')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('success query summary info of admin academy', (done) => {
    connect.returns({ error: null });

    let data = JSON.stringify({
      Classes: ['4563', '1234']
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/me/summary')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('chaincode returns null data for admin academy', (done) => {
    connect.returns({ error: null });

    query.returns({
      success: true,
      msg: null
    });

    request(app)
      .get('/me/summary')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('PUT /me', () => {
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

  it('Failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .put('/me')
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
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('Failed to query info student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .put('/me')
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
        expect(res.status).equal(404);
        done();
      });
  });

  it('Failed to query info teacher in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.TEACHER }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .put('/me')
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
        expect(res.status).equal(404);
        done();
      });
  });

  it('Request body is invalid', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.TEACHER }
    });

    request(app)
      .put('/me')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        fullName: '',
        phoneNumber: { value: '+84 973241005', country: 'VN' },
        email: 'abc@gmail.com',
        address: 'KG',
        sex: 'Male',
        birthday: '01-01-2000'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Birhday of teacher is invalid', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.TEACHER }
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

    request(app)
      .put('/me')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        fullName: 'trinh van tan',
        phoneNumber: { value: '+84 973241005', country: 'VN' },
        email: 'abc@gmail.com',
        address: 'SG',
        sex: 'Male',
        birthday: '01-01-2010'
      })
      .then((res) => {
        expect(res.status).equal(400);
        expect(res.body.msg).equal('You must be 18 years or older');
        done();
      });
  });

  it('Birhday of student is invalid', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
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

    request(app)
      .put('/me')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        fullName: 'trinh van tan',
        phoneNumber: { value: '+84 973241005', country: 'VN' },
        email: 'abc@gmail.com',
        address: 'HN',
        sex: 'Male',
        birthday: '01-01-2020'
      })
      .then((res) => {
        expect(res.status).equal(400);
        expect(res.body.msg).equal('You must be 6 years or older');
        done();
      });
  });

  it('Not Modified', (done) => {
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
      .put('/me')
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
        expect(res.status).equal(304);
        done();
      });
  });

  it('Success update info with student', (done) => {
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
      .put('/me')
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
        expect(res.status).equal(200);
        done();
      });
  });

  it('Success update info with teacher', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
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
      .put('/me')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
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
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('GET /me/classes', () => {
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

  it('Permission denied', (done) => {
    request(app)
      .get('/me/classes')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('Failed connect to blockchain with student', (done) => {
    connect.returns(null);

    request(app)
      .get('/me/classes')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Failed connect to blockchain with teacher', (done) => {
    connect.returns(null);

    request(app)
      .get('/me/classes')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Failed to query classes of student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.returns({
      success: false,
      msg: 'Query chaincode has failed'
    });

    request(app)
      .get('/me/classes')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Failed to query classes of teacher in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'conglt', role: USER_ROLES.TEACHER }
    });

    query.returns({
      success: false,
      msg: 'Query chaincode has failed'
    });

    request(app)
      .get('/me/classes')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
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

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/me/classes')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('success query classes of teacher', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
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

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/me/classes')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('GET /me/courses', () => {
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
      .get('/me/courses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get('/me/courses')
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

    queryCourses.returns({
      success: false,
      msg: 'Query chaincode has failed'
    });

    request(app)
      .get('/me/courses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
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
      .get('/me/courses')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('GET /me/certificates', () => {
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

  it('success query certificates of user student', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let cert = JSON.stringify({
      CertificateID: 'A354',
      SubjectID: 'INT-2019',
      StudentUsername: 'tanbongcuoi',
      IssueDate: '10-10-2019'
    });

    let courses = JSON.stringify({
      CourseID: 'INT-2019',
      SubjectID: 'INT-2019-1'
    });

    query.onFirstCall().returns({
      success: true,
      msg: cert
    });

    query.onSecondCall().returns({
      success: true,
      msg: courses
    });

    request(app)
      .get('/me/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('Query course has failed', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let cert = JSON.stringify({
      CertificateID: 'A354',
      SubjectID: 'INT-2019',
      StudentUsername: 'tanbongcuoi',
      IssueDate: '10-10-2019'
    });

    query.onFirstCall().returns({
      success: true,
      msg: cert
    });

    query.onSecondCall().returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .get('/me/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Query certificate has failed', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let courses = JSON.stringify({
      CourseID: 'INT-2019',
      SubjectID: 'INT-2019-1'
    });

    query.onFirstCall().returns({
      success: false,
      msg: 'Error'
    });

    query.onSecondCall().returns({
      success: true,
      msg: courses
    });

    request(app)
      .get('/me/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Permission Denied with teacher', (done) => {
    request(app)
      .get('/me/certificates')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('Permission Denied with admin academy', (done) => {
    request(app)
      .get('/me/certificates')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });
});

describe('GET /me/courses/:courseId/certificate', () => {
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
      .get(`/me/courses/${courseId}/certificate`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('Failed to connect blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get(`/me/courses/${courseId}/certificate`)
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
      .get(`/me/courses/${courseId}/certificate`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('permission denied', (done) => {
    request(app)
      .get(`/me/courses/${courseId}/certificate`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });
});

describe('PUT /me/password', () => {
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
      .put('/me/password')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '123123',
        newPass: '12345',
        confirmPass: '12345'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not success change password empty', (done) => {
    request(app)
      .put('/me/password')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '',
        newPass: '12345',
        confirmPass: '12345'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not success change password because oldPass like newPass', (done) => {
    findOneUserStub.resolves({ username: 'tantrinh' });

    request(app)
      .put('/me/password')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '123123',
        newPass: '123123',
        confirmPass: '123123'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not success change password because confirmPass do not like newPass', (done) => {
    findOneUserStub.resolves({ username: 'tantrinh' });

    request(app)
      .put('/me/password')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '123123',
        newPass: '123456',
        confirmPass: '123457'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not success because account is not exist', (done) => {
    findOneUserStub.resolves(null);

    request(app)
      .put('/me/password')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '123123',
        newPass: '123456',
        confirmPass: '123456'
      })
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });
});

describe('GET /me/courses/not-enroll', () => {
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
      .get('/me/courses/not-enroll')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('Failed to connect to blockchain!', (done) => {
    connect.returns(null);
    request(app)
      .get('/me/courses/not-enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
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
      .get('/me/courses/not-enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
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
      .get('/me/courses/not-enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('#GET /me/courses/:courseId/scores', () => {
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
      .get(`/me/courses/${courseId}/scores`)
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('Can not connect to network', (done) => {
    connect.returns(null);

    request(app)
      .get(`/me/courses/${courseId}/scores`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
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
      .get(`/me/courses/${courseId}/scores`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
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
      .get(`/me/courses/${courseId}/scores`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
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
      .get(`/me/courses/${courseId}/scores`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('#GET /me/subject/:subjectId', () => {
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
      .get(`/me/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });
  it('failed connect to blockchain', (done) => {
    connect.returns(null);
    request(app)
      .get(`/me/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
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
      .get(`/me/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
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
      .get(`/me/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
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
      .get(`/me/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.subject.classRegistered).equal('e61bf835-7df3-4448-a488-2e44f872823a');
        done();
      });
  });
});
