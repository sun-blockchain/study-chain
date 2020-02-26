process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const network = require('../fabric/network');
const User = require('../models/User');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const app = require('../app');

require('dotenv').config();

describe('Routes /subject/create', () => {
  describe('#GET /subject/create', () => {
    let findOneStub;

    beforeEach(() => {
      findOneStub = sinon.stub(User, 'findOne');
    });

    afterEach(() => {
      findOneStub.restore();
    });

    it('do not success query all student with admin student', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });
      request(app)
        .get('/subject/create')
        .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('success query all student with admin academy', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });

      request(app)
        .get('/subject/create')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it('do not success query all student with teacher', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });
      request(app)
        .get('/subject/create')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success query all student with student', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });
      request(app)
        .get('/subject/create')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });
  });
});

describe('#GET /subject/all', () => {
  let connect;
  let query;
  let findOneStub;

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

  it('should return all subjects', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });
    let data = JSON.stringify(
      {
        SubjectID: '00',
        Name: 'Blockchain',
        TeacherUsername: 'GV00',
        Students: ['Tan', 'Nghia']
      },
      {
        SubjectID: '01',
        Name: 'Sawtooth',
        TeacherUsername: 'GV01',
        Students: ['Tan', 'Nghia', 'Quang']
      }
    );

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/subject/all')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .expect(200)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('fail get all subjects because error call chaincode', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });
    let data = JSON.stringify({
      errorMsg: 'Stub error'
    });

    query.returns({
      success: false,
      msg: data
    });

    request(app)
      .get('/subject/all')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('#GET /subject/:id', () => {
  let connect;
  let query;
  let findOneStub;

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

  it('should return subject', (done) => {
    connect.returns({ error: null });
    findOneStub.yields(undefined, { username: 'hoangdd' });
    let data = JSON.stringify({
      SubjectID: '00',
      Name: 'Blockchain',
      TeacherUsername: 'GV00',
      Students: ['Tan', 'Nghia']
    });

    query.returns({
      success: true,
      msg: data
    });
    request(app)
      .get('/subject/00')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('fail query subject because call chaincode error ', (done) => {
    connect.returns({ error: null });
    query.returns({ success: false, msg: 'err' });

    request(app)
      .get('/subject/fabric')
      .then((res) => {
        expect(res.status).equal(500);
        done();
      });
  });
});

describe('#GET /subject/:subjectId/certificates ', () => {
  let connect;
  let query;
  let findOneStub;
  let subjectId = '7';

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

  it('do not success with admin student', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });
    request(app)
      .get(`/subject/${subjectId}/certificates`)
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not success with teacher', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });
    request(app)
      .get(`/subject/${subjectId}/certificates`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not success with student', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });
    request(app)
      .get(`/subject/${subjectId}/certificates`)
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('do not succes create certificate because GetCertificatesBySubject error', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });

    let certBySubject = JSON.stringify([{}]);
    let scoreBySubject = JSON.stringify([{ scoreValue: 8.0, studentUsername: 'tantrinh' }]);
    let studentBySubject = JSON.stringify([{ username: 'tantrinh' }]);

    query.onFirstCall().returns({ success: false, msg: certBySubject });
    query.onSecondCall().returns({ success: true, msg: scoreBySubject });
    query.onThirdCall().returns({ success: true, msg: studentBySubject });

    request(app)
      .get(`/subject/${subjectId}/certificates`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not succes create certificate because GetScoresBySubject error', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });

    let certBySubject = JSON.stringify([{ certId: '1', studentUsername: 'tantrinh' }]);
    let scoreBySubject = JSON.stringify([{}]);
    let studentBySubject = JSON.stringify([{ username: 'tantrinh' }]);

    query.onFirstCall().returns({ success: true, msg: certBySubject });
    query.onSecondCall().returns({ success: false, msg: scoreBySubject });
    query.onThirdCall().returns({ success: true, msg: studentBySubject });

    request(app)
      .get(`/subject/${subjectId}/certificates`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not succes create certificate because GetStudentsBySubject error', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });

    let certBySubject = JSON.stringify([{ certId: '1', studentUsername: 'tantrinh' }]);
    let scoreBySubject = JSON.stringify([{ scoreValue: 8.0, studentUsername: 'tantrinh' }]);
    let studentBySubject = JSON.stringify([{}]);

    query.onFirstCall().returns({ success: true, msg: certBySubject });
    query.onSecondCall().returns({ success: true, msg: scoreBySubject });
    query.onThirdCall().returns({ success: false, msg: studentBySubject });

    request(app)
      .get(`/subject/${subjectId}/certificates`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('succes query', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });

    let certBySubject = JSON.stringify([
      { certId: '1', studentUsername: 'tantrinh', subjectId: '7' }
    ]);
    let scoreBySubject = JSON.stringify([{ scoreValue: 8.0, studentUsername: 'tantrinh' }]);
    let studentBySubject = JSON.stringify([{ username: 'tantrinh' }]);

    query.onFirstCall().returns({ success: true, msg: certBySubject });
    query.onSecondCall().returns({ success: true, msg: scoreBySubject });
    query.onThirdCall().returns({ success: true, msg: studentBySubject });

    request(app)
      .get(`/subject/${subjectId}/certificates`)
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });
});

describe('#GET /subject/all', () => {
  let connect;
  let query;
  let findOneStub;

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

  it('should return all subjects', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });
    let data = JSON.stringify(
      {
        SubjectID: '00',
        Name: 'Blockchain',
        TeacherUsername: 'GV00',
        Students: ['Tan', 'Nghia']
      },
      {
        SubjectID: '01',
        Name: 'Sawtooth',
        TeacherUsername: 'GV01',
        Students: ['Tan', 'Nghia', 'Quang']
      }
    );

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/subject/all')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .expect(200)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('fail get all subjects because error call chaincode', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });
    let data = JSON.stringify({
      errorMsg: 'Stub error'
    });

    query.returns({
      success: false,
      msg: data
    });

    request(app)
      .get('/subject/all')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

// describe('#POST /subject/addsubjectforteacher', () => {
//   let connect;
//   let registerForSubjectStub;
//   let query;
//   let findOneStub;

//   beforeEach(() => {
//     connect = sinon.stub(network, 'connectToNetwork');
//     registerForSubjectStub = sinon.stub(network, 'registerTeacherForSubject');
//     query = sinon.stub(network, 'query');
//     findOneStub = sinon.stub(User, 'findOne');
//   });

//   afterEach(() => {
//     connect.restore();
//     registerForSubjectStub.restore();
//     query.restore();
//     findOneStub.restore();
//   });

//   it('do not create success subject with empty req.body', (done) => {
//     request(app)
//       .post('/subject/addsubjectforteacher')
//       .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
//       .then((res) => {
//         expect(res.status).equal(422);
//         done();
//       });
//   });

//   it('do not add success subject with admin student', (done) => {
//     request(app)
//       .post('/subject/addsubjectforteacher')
//       .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
//       .send({
//         subjectId: '01',
//         teacherusername: 'tan'
//       })
//       .then((res) => {
//         expect(res.status).equal(403);
//         expect(res.body.success).equal(false);
//         expect(res.body.msg).equal('Permission Denied');
//         done();
//       });
//   });

//   it('do not add success subject with teacher', (done) => {
//     request(app)
//       .post('/subject/addsubjectforteacher')
//       .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
//       .send({
//         subjectId: '01',
//         teacherusername: 'tan'
//       })
//       .then((res) => {
//         expect(res.status).equal(403);
//         expect(res.body.success).equal(false);
//         expect(res.body.msg).equal('Permission Denied');
//         done();
//       });
//   });

//   it('do not add success subject with student', (done) => {
//     request(app)
//       .post('/subject/addsubjectforteacher')
//       .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
//       .send({
//         subjectId: '01',
//         teacherusername: 'tan'
//       })
//       .then((res) => {
//         expect(res.status).equal(403);
//         expect(res.body.success).equal(false);
//         expect(res.body.msg).equal('Permission Denied');
//         done();
//       });
//   });

//   it('failed to register subject for teacher', (done) => {
//     findOneStub.returns({ username: 'trinhtan', role: USER_ROLES.TEACHER });
//     registerForSubjectStub.returns({ success: false, msg: 'error' });
//     request(app)
//       .post('/subject/addsubjectforteacher')
//       .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
//       .send({
//         subjectId: '01',
//         teacherusername: 'tan'
//       })
//       .then((res) => {
//         expect(res.status).equal(500);
//         expect(res.body.success).equal(false);

//         done();
//       });
//   });

//   it('success add subject for teacher', (done) => {
//     findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
//     registerForSubjectStub.returns({ success: true, msg: 'success' });

//     let data = JSON.stringify({ SubjectID: '01', TeacherUsername: 'tan' });
//     query.returns({ success: true, msg: data });

//     request(app)
//       .post('/subject/addsubjectforteacher')
//       .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
//       .send({
//         subjectId: '01',
//         teacherusername: 'tan'
//       })
//       .then((res) => {
//         expect(res.status).equal(200);
//         expect(res.body.success).equal(true);
//         done();
//       });
//   });

//   it('do not success add subject for teacher because invoke chaincode error', (done) => {
//     findOneStub.returns({ username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
//     registerForSubjectStub.returns({ success: true, msg: 'success' });

//     query.returns({ success: false, msg: 'error' });

//     request(app)
//       .post('/subject/addsubjectforteacher')
//       .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
//       .send({
//         subjectId: '01',
//         teacherusername: 'tan'
//       })
//       .then((res) => {
//         expect(res.status).equal(500);
//         expect(res.body.success).equal(false);
//         done();
//       });
//   });
// });

describe('#GET /subject/subjecjtsnoteacher', () => {
  let connect;

  let query;
  let findOneStub;

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

  it('do not success with admin student', (done) => {
    request(app)
      .get('/subject/subjecjtsnoteacher')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        expect(res.status).equal(403);
        done();
      });
  });

  it('do not success with teacher', (done) => {
    request(app)
      .get('/subject/subjecjtsnoteacher')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        expect(res.status).equal(403);
        done();
      });
  });

  it('do not success with student', (done) => {
    request(app)
      .get('/subject/subjecjtsnoteacher')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        expect(res.status).equal(403);
        done();
      });
  });

  it('failed to query all subject', (done) => {
    query.returns({ success: false, msg: 'error' });
    request(app)
      .get('/subject/subjecjtsnoteacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('error');
        done();
      });
  });

  it('success query and filter subject', (done) => {
    let data = JSON.stringify([{ subjectId: '01' }, { subjectId: '02' }]);
    query.returns({ success: true, msg: data });
    request(app)
      .get('/subject/subjecjtsnoteacher')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });
});

describe('#GET /subject/:subjectId/students', () => {
  let connect;

  let query;
  let findOneStub;

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

  it('failed to query all subject', (done) => {
    query.returns({ success: false, msg: 'error' });
    request(app)
      .get('/subject/INT2002/students')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('error');
        done();
      });
  });

  it('success query and filter subject', (done) => {
    let data = JSON.stringify({ studentUsername: 'tan' }, { studentUsername: 'nghia' });
    query.returns({ success: true, msg: data });
    request(app)
      .get('/subject/INT2002/students')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });
});

describe('#GET /subject/:subjectId/scores', () => {
  let connect;

  let query;
  let findOneStub;

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

  it('do not success with admin student', (done) => {
    request(app)
      .get('/subject/INT2002/scores')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        expect(res.status).equal(403);
        done();
      });
  });

  it('do not success with teacher', (done) => {
    request(app)
      .get('/subject/INT2002/scores')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        expect(res.status).equal(403);
        done();
      });
  });

  it('do not success with student', (done) => {
    request(app)
      .get('/subject/INT2002/scores')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        expect(res.status).equal(403);
        done();
      });
  });

  it('failed to query all subject', (done) => {
    query.returns({ success: false, msg: 'error' });
    request(app)
      .get('/subject/INT2002/scores')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('error');
        expect(res.status).equal(500);
        done();
      });
  });

  it('success query and filter subject', (done) => {
    let data = JSON.stringify([
      { subjectId: 'INT2002', scoreValue: 9.0, studentUsername: 'tan' },
      { subjectId: 'INT2002', scoreValue: 8.0, studentUsername: 'nghia' }
    ]);
    query.returns({ success: true, msg: data });
    request(app)
      .get('/subject/INT2002/scores')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });
});
