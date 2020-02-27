process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const network = require('../fabric/network');
const app = require('../app');
const USER_ROLES = require('../configs/constant').USER_ROLES;

require('dotenv').config();

describe('#GET /common/courses', () => {
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

  it('success query all courses', (done) => {
    let data = JSON.stringify(
      {
        CourseID: '00',
        CourseName: 'Blockchain101',
        CourseCode: 'BC101',
        Description: 'Blockchain'
      },
      {
        CourseID: '01',
        CourseName: 'Blockchain102',
        CourseCode: 'BC102',
        Description: 'Blockchain'
      }
    );

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/common/courses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success query all courses because error query chaincode', (done) => {
    query.returns({
      success: false,
      msg: 'Error query chaincode'
    });

    request(app)
      .get('/common/courses')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('#GET /common/course/:courseId', () => {
  let connect;
  let query;
  let courseId = '4ca7fc39-7523-424d-984e-87ea590cac68';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it('success query course', (done) => {
    let data = JSON.stringify({
      CourseID: '4ca7fc39-7523-424d-984e-87ea590cac68',
      CourseName: 'Blockchain101',
      CourseCode: 'BC101',
      Description: 'Blockchain'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/common/course/${courseId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success query course because error query chaincode', (done) => {
    query.returns({
      success: false,
      msg: 'Error query chaincode'
    });

    request(app)
      .get(`/common/course/${courseId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

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

  it('Can not query chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({
      success: false,
      msg: 'Can not query chaincode!'
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

  it('success query subject with admin', (done) => {
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
      Students: ['student1', 'student2']
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get(`/common/class/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.class.Students.length).equal(2);
        done();
      });
  });

  it('success query class with student', (done) => {
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
      Students: ['student1', 'student2']
    });

    query.returns({
      success: true,
      msg: data
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

  it('Can not query chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({ success: false, msg: 'Can not query chaincode!' });

    request(app)
      .get(`/common/${username}/classes`)
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
