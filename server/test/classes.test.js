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

describe('POST /classes/enroll', () => {
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

  it('Validate body not classId!', (done) => {
    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Validate body not courseId!', (done) => {
    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '465461321',
        courseId: ''
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Permission Denied!', (done) => {
    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('Failed to connect to blockchain!', (done) => {
    connect.returns(null);
    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('query course in chaincode error!', (done) => {
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
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('The course has closed!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    query.returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Closed'
      })
    });

    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(400);
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

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    query.onSecondCall().returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(404);
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

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    query.onSecondCall().returns({
      success: true,
      msg: JSON.stringify({
        Username: 'st01',
        Classes: ['123456']
      })
    });

    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(400);
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

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    query.onSecondCall().returns({
      success: true,
      msg: JSON.stringify({
        Username: 'st01',
        Classes: ['123457']
      })
    });

    query.onThirdCall().returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(404);
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

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    query.onSecondCall().returns({
      success: true,
      msg: JSON.stringify({
        Username: 'st01',
        Classes: ['123457']
      })
    });

    query.onThirdCall().returns({
      success: true,
      msg: JSON.stringify({
        ClassID: '123456',
        SubjectID: 'Subject01'
      })
    });

    query.returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(404);
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

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    let studentInfo = JSON.stringify({
      Username: 'st01',
      Classes: ['123457']
    });

    query.onSecondCall().returns({
      success: true,
      msg: studentInfo
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      SubjectID: 'Subject01'
    });

    query.onThirdCall().returns({
      success: true,
      msg: classInfo
    });

    let classes = JSON.stringify([
      {
        ClassID: '123457',
        SubjectID: 'Subject01'
      }
    ]);

    query.returns({
      success: true,
      msg: classes
    });

    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(400);
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

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    let studentInfo = JSON.stringify({
      Username: 'st01',
      Classes: ['123457']
    });

    query.onSecondCall().returns({
      success: true,
      msg: studentInfo
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      SubjectID: 'Subject01',
      Status: 'InProgress'
    });

    query.onThirdCall().returns({
      success: true,
      msg: classInfo
    });

    let classes = JSON.stringify([
      {
        ClassID: '123457',
        SubjectID: 'Subject02'
      }
    ]);

    query.returns({
      success: true,
      msg: classes
    });

    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(400);
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

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    let studentInfo = JSON.stringify({
      Username: 'st01',
      Classes: ['123457']
    });

    query.onSecondCall().returns({
      success: true,
      msg: studentInfo
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      SubjectID: 'Subject01',
      Status: 'Completed'
    });

    query.onThirdCall().returns({
      success: true,
      msg: classInfo
    });

    let classes = JSON.stringify([
      {
        ClassID: '123457',
        SubjectID: 'Subject02'
      }
    ]);

    query.returns({
      success: true,
      msg: classes
    });

    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
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

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    let studentInfo = JSON.stringify({
      Username: 'st01',
      Classes: ['123457']
    });

    query.onSecondCall().returns({
      success: true,
      msg: studentInfo
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      SubjectID: 'Subject01',
      Status: 'Open'
    });

    query.onThirdCall().returns({
      success: true,
      msg: classInfo
    });

    let classes = JSON.stringify([
      {
        ClassID: '123457',
        SubjectID: 'Subject02'
      }
    ]);

    query.returns({
      success: true,
      msg: classes
    });

    studentRegisterClass.returns({
      success: false,
      msg: 'Can not invoke chaincode!'
    });

    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
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

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    let studentInfo = JSON.stringify({
      Username: 'st01',
      Classes: ['123457']
    });

    query.onSecondCall().returns({
      success: true,
      msg: studentInfo
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      SubjectID: 'Subject01',
      Status: 'Open'
    });

    query.onThirdCall().returns({
      success: true,
      msg: classInfo
    });

    let classes = JSON.stringify([
      {
        ClassID: '123457',
        SubjectID: 'Subject02'
      }
    ]);

    query.returns({
      success: true,
      msg: classes
    });

    studentRegisterClass.returns({
      success: true
    });

    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(201);
        done();
      });
  });
});

describe('POST /classes/unenroll', () => {
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

  it('Validate body not classId!', (done) => {
    request(app)
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Validate body not courseId', (done) => {
    request(app)
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: ''
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Permission Denied!', (done) => {
    request(app)
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('Failed to connect to blockchain!', (done) => {
    connect.returns(null);
    request(app)
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('query course in chaincode error', (done) => {
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
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(404);
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

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    query.onSecondCall().returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(404);
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

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      Students: ['st02']
    });

    query.onSecondCall().returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(400);
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

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      Students: ['hoangdd', 'st02'],
      Status: 'InProgress'
    });

    query.onSecondCall().returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(400);
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

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      Students: ['hoangdd', 'st02'],
      Status: 'Completed'
    });

    query.onSecondCall().returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
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
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      Students: ['hoangdd', 'st02'],
      Status: 'Open'
    });

    query.onSecondCall().returns({
      success: true,
      msg: classInfo
    });

    cancelRegisterClass.returns({
      success: false,
      msg: 'Can not invoke chaincode!'
    });

    request(app)
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Unenroll Successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    query.onFirstCall().returns({
      success: true,
      msg: JSON.stringify({
        CourseID: '1123132465',
        CourseCode: 'BC01',
        CourseName: 'Blockchain',
        ShortDescription: 'Blockchain',
        Description:
          'Blockchain Basic, you will learn about architech of blockchain, consensus,...',
        Subjects: ['0eba3d4b-7dce-4e98-8a17-7de5f49a27af', '965af484-0480-4d20-8f49-31fb288526df'],
        Students: ['st01'],
        Status: 'Open'
      })
    });

    let classInfo = JSON.stringify({
      ClassID: '123456',
      Students: ['hoangdd', 'st02'],
      Status: 'Open'
    });

    query.onSecondCall().returns({
      success: true,
      msg: classInfo
    });

    cancelRegisterClass.returns({
      success: true
    });

    request(app)
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456',
        courseId: '1123132465'
      })
      .then((res) => {
        expect(res.status).equal(201);
        done();
      });
  });
});
