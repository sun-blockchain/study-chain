process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
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
        classId: ''
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
        classId: '123456'
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
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
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
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
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

    query.returns({
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
        classId: '123456'
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
        Username: 'st01',
        Classes: ['123457']
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
        classId: '123456'
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
        Username: 'st01',
        Classes: ['123457']
      })
    });

    query.onSecondCall().returns({
      success: true,
      msg: JSON.stringify({
        ClassID: '123456',
        SubjectID: 'Subject01'
      })
    });

    query.onFirstCall().returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
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
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
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
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
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
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
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
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
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
      .post('/classes/enroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
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
        classId: ''
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
        classId: '123456'
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
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
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

    query.returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
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

    let classInfo = JSON.stringify({
      ClassID: '123456',
      Students: ['st02']
    });

    query.returns({
      success: true,
      msg: classInfo
    });

    request(app)
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
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
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Class is Completed!', (done) => {
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
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
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
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
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
      .post('/classes/unenroll')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        classId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(201);
        done();
      });
  });
});

describe('#POST /classes', () => {
  let connect;
  let query;
  let createClass;
  let subjectId = 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    createClass = sinon.stub(network, 'createClass');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    createClass.restore();
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .post(`/classes`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .post(`/classes`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('do not success create class because req.body invalid', (done) => {
    request(app)
      .post(`/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId,
        classCode: '',
        room: 'Blockchain101',
        time: '12122020'
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Start date must occur befor end date at least 1 week!', (done) => {
    connect.returns(null);

    request(app)
      .post(`/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId,
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '604800000',
        endDate: '604800000',
        repeat: 'Weekly Monday',
        capacity: 10
      })
      .then((res) => {
        expect(res.status).equal(400);
        expect(res.body.msg).equal('Start date must occur befor end date at least 1 week');
        done();
      });
  });

  it('Failed connect to blockchain!', (done) => {
    connect.returns(null);

    request(app)
      .post(`/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId,
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '604800000',
        endDate: '1604800000',
        repeat: 'Weekly Monday',
        capacity: 10
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('Can not invoke chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    createClass.returns({
      success: false,
      msg: 'Can not invoke chaincode!'
    });

    request(app)
      .post(`/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId,
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '604800000',
        endDate: '1604800000',
        repeat: 'Weekly Monday',
        capacity: 10
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Create Successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    createClass.returns({
      success: true
    });

    request(app)
      .post(`/classes`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId,
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '604800000',
        endDate: '1604800000',
        repeat: 'Weekly Monday',
        capacity: 10
      })
      .then((res) => {
        expect(res.status).equal(201);
        done();
      });
  });
});

describe('#PUT /classes/:classId', () => {
  let connect;
  let query;
  let updateClassInfo;
  let classId = 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    updateClassInfo = sinon.stub(network, 'updateClassInfo');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    updateClassInfo.restore();
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .put(`/classes/${classId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('failed to connect blockchain', (done) => {
    connect.returns(null);

    request(app)
      .put(`/classes/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '24-02-2020',
        endDate: '29-02-2020',
        repeat: 'Weekly Monday',
        subjectId: '123-456-a12b-1231',
        capacity: 112
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .put(`/classes/${classId}`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('success edit class', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      classId,
      classCode: 'CACLC2',
      room: 'Blockchain101',
      time: '12122020',
      startDate: '24-02-2020',
      endDate: '29-02-2020',
      repeat: 'Weekly Monday',
      subjectId: '123-456-a12b-1231`',
      capacity: 112
    });

    updateClassInfo.returns({
      success: true,
      msg: 'Edit success!'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .put(`/classes/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '24-02-2020',
        endDate: '29-02-2020',
        repeat: 'Weekly Monday',
        subjectId: '123-456-a12b-1231',
        capacity: 112
      })
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });

  it('do not success edit class because req.body invalid', (done) => {
    request(app)
      .put(`/classes/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classCode: '',
        room: 'Blockchain101',
        time: '12122020',
        subjectId: 'sj',
        capacity: ''
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('edit course info fail when call editClassInfo function', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    updateClassInfo.returns({
      success: false,
      msg: 'Error chaincode'
    });

    request(app)
      .put(`/classes/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: '123-123',
        classCode: 'CACLC1',
        room: 'Blockchain101',
        time: '12122020',
        startDate: '24-02-2020',
        endDate: '29-02-2020',
        repeat: 'Weekly Monday',
        subjectId: 'sj',
        capacity: 100
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });
});

describe('#PUT /classes/:classId/status', () => {
  let connect;
  let query;
  let startClass;
  let classId = 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    startClass = sinon.stub(network, 'startClass');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    startClass.restore();
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .put(`/classes/${classId}/status`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .put(`/classes/${classId}/status`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('failed to connect blockchain', (done) => {
    connect.returns(null);

    request(app)
      .put(`/classes/${classId}/status`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
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
      msg: 'Can not query in chaincode!'
    });

    request(app)
      .put(`/classes/${classId}/status`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Can not close register because class status != Open', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      ClassId: classId,
      Status: 'InProgress'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .put(`/classes/${classId}/status`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)

      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('There is not teacher assigned to this class!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      ClassId: classId,
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .put(`/classes/${classId}/status`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(400);
        expect(res.body.msg).equal('There is no teacher assigned to this class');
        done();
      });
  });

  it('Invoke chaincode failed', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      ClassId: classId,
      Status: 'Open',
      TeacherUsername: 'tc01'
    });

    query.returns({
      success: true,
      msg: data
    });

    startClass.returns({
      success: false,
      msg: 'Can not invoke chaincode!'
    });

    request(app)
      .put(`/classes/${classId}/status`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Start Successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let data = JSON.stringify({
      ClassId: 'b2ab2fbd-1053-4848-aac9-2090fee54074',
      Status: 'Open',
      TeacherUsername: 'tc01'
    });

    query.returns({
      success: true,
      msg: data
    });

    startClass.returns({
      success: true
    });

    request(app)
      .put(`/classes/${classId}/status`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        classId: 'b2ab2fbd-1053-4848-aac9-2090fee54074'
      })
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('#PUT /classes/:classId/teacher', () => {
  let connect;
  let query;
  let assignTeacherToClass;
  let unassignTeacherFromClass;
  let classId = 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    assignTeacherToClass = sinon.stub(network, 'assignTeacherToClass');
    unassignTeacherFromClass = sinon.stub(network, 'unassignTeacherFromClass');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    assignTeacherToClass.restore();
    unassignTeacherFromClass.restore();
  });

  it('param username empty', (done) => {
    request(app)
      .put(`/classes/${classId}/teacher`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        username: ''
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('permission denied when access routes with student', (done) => {
    request(app)
      .put(`/classes/${classId}/teacher`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        username: 'teacher01'
      })
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('permission denied when access routes with teacher', (done) => {
    request(app)
      .put(`/classes/${classId}/teacher`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        username: 'teacher01'
      })
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('Can not connect to network', (done) => {
    connect.returns(null);
    request(app)
      .put(`/classes/${classId}/teacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it("Can't query class in chaincode!", (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    query.returns({ success: false, msg: "Can't query class in chaincode!" });

    request(app)
      .put(`/classes/${classId}/teacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01'
      })
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('add class to teacher error!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let classInfo = JSON.stringify({
      ClassID: classId,
      TeacherUsername: '',
      Status: 'Open'
    });

    query.onFirstCall().returns({ success: true, msg: classInfo });

    assignTeacherToClass.returns({
      success: false,
      msg: 'Can not invoke chaincode!'
    });

    request(app)
      .put(`/classes/${classId}/teacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01'
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Successfully assign!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'adminacademy', role: USER_ROLES.ADMIN_ACADEMY }
    });

    let classInfo = JSON.stringify({
      ClassID: classId,
      TeacherUsername: '',
      Status: 'Open'
    });

    query.returns({ success: true, msg: classInfo });

    assignTeacherToClass.returns({
      success: true,
      msg: 'Assign Successfully!'
    });

    request(app)
      .put(`/classes/${classId}/teacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        username: 'teacher01'
      })
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('#PUT /classes/:classId/:username/score', () => {
  let connect;
  let pickScore;
  let query;
  let classId = 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c';
  let username = 'conglt';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    pickScore = sinon.stub(network, 'pickScore');
    query = sinon.stub(network, 'query');
  });

  afterEach(() => {
    connect.restore();
    pickScore.restore();
    query.restore();
  });

  it('Invalid body', (done) => {
    request(app)
      .put(`/classes/${classId}/${username}/score`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        scoreValue: ''
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('permission denied with admin academy', (done) => {
    request(app)
      .put(`/classes/${classId}/${username}/score`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        scoreValue: 9.5
      })
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('permission denied with student', (done) => {
    request(app)
      .put(`/classes/${classId}/${username}/score`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        scoreValue: 9.5
      })
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('failed to connect blockchain', (done) => {
    connect.returns(null);

    request(app)
      .put(`/classes/${classId}/${username}/score`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        scoreValue: 10
      })
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });

  it('Can not query chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    query.returns({
      success: false
    });

    request(app)
      .put(`/classes/${classId}/${username}/score`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        scoreValue: 9.5
      })
      .then((res) => {
        expect(res.status).equal(404);
        done();
      });
  });

  it('Permission Denined!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    let data = JSON.stringify({
      ClassID: classId,
      TeacherUsername: 'abc'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .put(`/classes/${classId}/${username}/score`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        scoreValue: 9.5
      })
      .then((res) => {
        expect(res.status).equal(403);
        done();
      });
  });

  it('Can not entry score now!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    let data = JSON.stringify({
      ClassID: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
      TeacherUsername: 'hoangdd',
      Status: 'Open'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .put(`/classes/${classId}/${username}/score`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        scoreValue: 9.5
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('Can not entry score now!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    let data = JSON.stringify({
      ClassID: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
      TeacherUsername: 'hoangdd',
      Status: 'Completed'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .put(`/classes/${classId}/${username}/score`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        scoreValue: 9.5
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('The student does not study in this class!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    let data = JSON.stringify({
      ClassID: classId,
      TeacherUsername: 'hoangdd',
      Status: 'InProgress',
      Students: []
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .put(`/classes/${classId}/${username}/score`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        scoreValue: 9.5
      })
      .then((res) => {
        expect(res.status).equal(400);
        done();
      });
  });

  it('do not success create score with teacher because error chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    let data = JSON.stringify({
      ClassID: classId,
      TeacherUsername: 'hoangdd',
      Status: 'InProgress',
      Students: ['conglt']
    });

    query.returns({
      success: true,
      msg: data
    });

    pickScore.returns({ success: false, msg: 'err' });

    request(app)
      .put(`/classes/${classId}/${username}/score`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        scoreValue: 9.5
      })
      .then((res) => {
        expect(res.status).equal(500);

        done();
      });
  });

  it('success create score by teacher', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    let data = JSON.stringify({
      ClassID: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
      TeacherUsername: 'hoangdd',
      Status: 'InProgress',
      Students: ['conglt']
    });

    query.returns({
      success: true,
      msg: data
    });

    pickScore.returns({ success: true, msg: 'success' });
    request(app)
      .put(`/classes/${classId}/${username}/score`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        scoreValue: 10
      })
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('#GET /classes/:classId', () => {
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
      .get(`/classes/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.msg).equal('Failed connect to blockchain');
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
      .get(`/classes/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);
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
      .get(`/classes/${classId}`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(404);

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
      .get(`/classes/${classId}`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});

describe('#GET /classes/no-teacher', () => {
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

  it('Can not connect to network', (done) => {
    connect.returns(null);
    request(app)
      .get(`/classes/no-teacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
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
      .get(`/classes/no-teacher`)
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
      .get(`/classes/no-teacher`)
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
      .get(`/classes/no-teacher`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        done();
      });
  });
});
