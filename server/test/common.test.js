process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const network = require('../fabric/network');
const app = require('../app');
const USER_ROLES = require('../configs/constant').USER_ROLES;

require('dotenv').config();

describe('#GET /common/subject/:subjectId/classes', () => {
  let connect;
  let query;
  let subjectId = '4ca7fc39-7523-424d-984e-87ea590cac68';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('success query classess of subject with admin', (done) => {
    let data = JSON.stringify({
      classCode: 'CACLC2',
      room: 'Blockchain101',
      time: '12122020',
      shortDescription: 'short',
      description: 'Blockchain'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/common/subject/${subjectId}/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('success query classess of subject with student', (done) => {
    let data = JSON.stringify({
      classCode: 'CACLC2',
      room: 'Blockchain101',
      time: '12122020',
      shortDescription: 'short',
      description: 'Blockchain'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/common/subject/${subjectId}/classes`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success query class because error query chaincode', (done) => {
    query.returns({
      success: false,
      msg: 'Error query chaincode'
    });

    request(app)
      .get(`/common/subject/${subjectId}/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('#GET /common/subject/:subjectId', () => {
  let connect;
  let query;
  let subjectId = '4ca7fc39-7523-424d-984e-87ea590cac68';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('success query subject with admin', (done) => {
    let data = JSON.stringify({
      SubjectID: '4ca7fc39-7523-424d-984e-87ea590cac68',
      SubjectName: 'Blockchain101',
      SubjectCode: 'BC101',
      Description: 'Blockchain',
      ShortDescription: 'BC',
      Classes: []
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/common/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('success query subject with student', (done) => {
    let data = JSON.stringify({
      SubjectID: '4ca7fc39-7523-424d-984e-87ea590cac68',
      SubjectName: 'Blockchain101',
      SubjectCode: 'BC101',
      Description: 'Blockchain',
      ShortDescription: 'BC',
      Classes: []
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/common/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success query course because error query chaincode with admin', (done) => {
    query.returns({
      success: false,
      msg: 'Error query chaincode'
    });

    request(app)
      .get(`/common/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not success query course because error query chaincode with student', (done) => {
    query.returns({
      success: false,
      msg: 'Error query chaincode'
    });

    request(app)
      .get(`/common/subject/${subjectId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('#GET /common/class/:classId', () => {
  let connect;
  let query;
  let classId = '4ca7fc39-7523-424d-984e-87ea590cac68';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('Can not connect to network', (done) => {
    connect.returns(null);

    request(app)
      .get(`/common/class/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });

  it('Can not query class in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({
      success: false
    });

    request(app)
      .get(`/common/class/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
        done();
      });
  });

  it('can not query subject in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      ClassId: '4ca7fc39-7523-424d-984e-87ea590cac68',
      ClassCode: 'Class01',
      Room: 'Room01',
      Time: 'Time',
      Status: 'Register Open',
      ShortDescription: 'aaaa',
      Description: 'bbbb',
      SubjectID: '123456',
      Students: ['student1', 'student2']
    });

    query.onFirstCall().returns({
      success: true,
      msg: data
    });

    query.onSecondCall().returns({
      success: false
    });

    request(app)
      .get(`/common/class/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
        done();
      });
  });

  it('success query class and subject in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      ClassId: '4ca7fc39-7523-424d-984e-87ea590cac68',
      ClassCode: 'Class01',
      Room: 'Room01',
      Time: 'Time',
      Status: 'Register Open',
      ShortDescription: 'aaaa',
      Description: 'bbbb',
      SubjectID: '123456',
      Students: ['student1', 'student2']
    });

    let subject = JSON.stringify({
      SubjectID: '123456',
      SubjectName: 'Ethereum'
    });

    query.onFirstCall().returns({
      success: true,
      msg: data
    });

    query.onSecondCall().returns({
      success: true,
      msg: subject
    });

    request(app)
      .get(`/common/class/${classId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.class.Students).equal(undefined);
        done();
      });
  });
});

// ------------------------------------------------- Class of teacher --------------------------------------------------
describe('#GET /common/classes/:username', () => {
  let connect;
  let query;
  let username = 'teacher01';

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
      .get(`/common/${username}/classes`)
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
      .get(`/common/${username}/classes`)
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
      .get(`/common/${username}/classes`)
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
      .get(`/common/${username}/classes`)
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
      .get(`/common/${username}/classes`)
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
      .get(`/common/${username}/classes`)
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
      .get(`/common/${username}/classes`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

// ------------------------------------------------- Get class no teacher --------------------------------------------------
describe('#GET /common/classesNoTeacher', () => {
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
      .get(`/common/classesNoTeacher`)
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
      .get(`/common/classesNoTeacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });

  it('Can not query chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({ success: false, msg: 'Can not query chaincode!' });

    request(app)
      .get(`/common/classesNoTeacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
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
      .get(`/common/classesNoTeacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.classesNoTeacher.length).equal(1);
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
      .get(`/common/classesNoTeacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.classesNoTeacher.length).equal(1);
        done();
      });
  });
});
